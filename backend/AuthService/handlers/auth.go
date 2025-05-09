package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "strings"
    "time"

    "github.com/dgrijalva/jwt-go"
    "github.com/jackc/pgx/v4/pgxpool"
    "golang.org/x/crypto/bcrypt"
)

var db *pgxpool.Pool
var jwtSecret = []byte("doma-ecommerce-system-jwt-secret-key")

func init() {
    connStr := os.Getenv("DB_URL")
    var err error
    db, err = pgxpool.Connect(context.Background(), connStr)
    if err != nil {
        log.Fatal("Error connecting to the database:", err)
    }
    log.Printf("✅ Connected to DB: %s", connStr)

    jwtSecretEnv := os.Getenv("JWT_SECRET")
    if jwtSecretEnv == "" {
        log.Fatal("JWT_SECRET is not set in environment variables")
    }
    jwtSecret = []byte(jwtSecretEnv)
}


// ==================== REGISTER HANDLER ====================

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Username        string                 `json:"username"`
        Email           string                 `json:"email"`
        Password        string                 `json:"password"`
        Role            string                 `json:"role"`
        FirstName       string                 `json:"first_name,omitempty"`
        LastName        string                 `json:"last_name,omitempty"`
        PhoneNumber     string                 `json:"phone_number,omitempty"`
        Address         map[string]interface{} `json:"address,omitempty"`
        BirthDate       string                 `json:"birth_date,omitempty"`
        ProfileImageURL string                 `json:"profile_image_url,omitempty"`
        Metadata        map[string]interface{} `json:"metadata,omitempty"` // optional metadata
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    if req.Username == "" || req.Email == "" || req.Password == "" {
        http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
        return
    }

    // Set role: fallback to buyer if empty
    role := req.Role
    if role == "" || (role != "buyer" && role != "seller" && role != "admin") {
        role = "buyer"
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }

    var addressJSON []byte
    if req.Address != nil {
        addressJSON, err = json.Marshal(req.Address)
        if err != nil {
            http.Error(w, "Invalid address format", http.StatusBadRequest)
            return
        }
    }

    var metadataJSON []byte
    if req.Metadata != nil {
        metadataJSON, err = json.Marshal(req.Metadata)
        if err != nil {
            http.Error(w, "Invalid metadata format", http.StatusBadRequest)
            return
        }
    } else {
        metadataJSON = []byte(`{}`)
    }

    var birthDate *time.Time
    if req.BirthDate != "" {
        parsedDate, err := time.Parse("2006-01-02", req.BirthDate)
        if err != nil {
            http.Error(w, "Invalid birth_date format. Use YYYY-MM-DD.", http.StatusBadRequest)
            return
        }
        birthDate = &parsedDate
    }

    _, err = db.Exec(
        context.Background(),
        `INSERT INTO users 
        (username, email, password, role, first_name, last_name, phone_number, address, birth_date, profile_image_url, metadata, shop_name, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'none', 'active', NOW())`,
        req.Username,
        req.Email,
        string(hashedPassword),
        role,
        req.FirstName,
        req.LastName,
        req.PhoneNumber,
        addressJSON,
        birthDate,
        req.ProfileImageURL,
        metadataJSON,
    )

    if err != nil {
        log.Println("DB Exec error:", err)
        if strings.Contains(err.Error(), "duplicate key") {
            http.Error(w, "Username, email, or phone number already exists", http.StatusConflict)
        } else {
            http.Error(w, "Error registering user", http.StatusInternalServerError)
        }
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "User registered successfully. You can now log in.",
    })
}




// ==================== LOGIN HANDLER ====================

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    var userID int
    var username string
    var hashedPassword string
    var role string
    var phoneNumber string
    var addressJSON []byte
    var shopName string
    var profileImageURL string
    
    err := db.QueryRow(
        context.Background(),
        `SELECT id, username, password, role, phone_number, address, shop_name, profile_image_url
         FROM users
         WHERE LOWER(email) = LOWER($1)`,
        req.Email,
    ).Scan(&userID, &username, &hashedPassword, &role, &phoneNumber, &addressJSON, &shopName, &profileImageURL)
    
    if err != nil {
        log.Println("DB error (login):", err)
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }
    
    // ✅ Check password
    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }
    
    // ✅ Decode address JSON
    var address interface{}
    if len(addressJSON) > 0 {
        if err := json.Unmarshal(addressJSON, &address); err != nil {
            address = nil // fallback
        }
    }
    
    token, err := GenerateJWT(userID, username, req.Email, role, phoneNumber, address, shopName, profileImageURL)
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": token})
    
}

// ==================== JWT GENERATOR ====================

func GenerateJWT(
    userID int,
    username string,
    email string,
    role string,
    phoneNumber string,
    address interface{},
    shopName string,           // new
    profileImageURL string,    // new
) (string, error) {
    claims := jwt.MapClaims{
        "user_id":      userID,
        "username":     username,
        "email":        email,
        "role":         role,
        "phone_number": phoneNumber,
        "address":      address,
        "shop_name":    shopName,            // added
        "profile_image_url": profileImageURL, // added
        "exp":          time.Now().Add(time.Hour * 24).Unix(),
        "https://hasura.io/jwt/claims": map[string]interface{}{
            "x-hasura-default-role":  role,
            "x-hasura-allowed-roles": []string{"seller", "buyer", "admin"},
            "x-hasura-user-id":       fmt.Sprintf("%d", userID),
            "x-hasura-user-name":     username,
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}


// ==================== APPLY SELLER ====================

func ApplySellerHandler(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Parse request body (shop_name is optional)
    var req struct {
        ShopName        string `json:"shop_name,omitempty"`
        ProfileImageURL string `json:"profile_image_url,omitempty"`  // optional
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Update role to 'seller' + optional shop_name
    result, err := db.Exec(context.Background(), `
        UPDATE users 
        SET role = 'seller',
            shop_name = COALESCE(NULLIF($1, ''), shop_name),
            profile_image_url = COALESCE(NULLIF($2, ''), profile_image_url),
            updated_at = NOW()
        WHERE id = $3
        AND role != 'seller'
    `, req.ShopName, req.ProfileImageURL, userID)

    if err != nil {
        log.Println("DB error (apply seller):", err)
        http.Error(w, "Failed to apply as seller", http.StatusInternalServerError)
        return
    }

    rowsAffected := result.RowsAffected()
    if rowsAffected == 0 {
        http.Error(w, "You are already registered as a seller.", http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "You have successfully applied as a seller. Please log in again to refresh your access.",
    })
}










// ==============FOR PROFILE HANDLING======================


// Extract user ID from JWT token
func extractUserIDFromToken(authHeader string) (int, error) {
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, fmt.Errorf("missing or invalid token")
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("user_id missing in claims")
	}

	return int(userIDFloat), nil
}

// ==================== GET PROFILE ====================
func MeHandler(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    fmt.Printf("🔍 Extracted user ID from token: %d\n", userID)

    var user struct {
        ID              int             `json:"id"`
        Username        string          `json:"username"`
        Email           string          `json:"email"`
        FirstName       string          `json:"first_name"`
        LastName        string          `json:"last_name"`
        PhoneNumber     string          `json:"phone_number"`
        ShopName        string          `json:"shop_name"`
        Role            string          `json:"role"`
        ProfileImageURL string          `json:"profile_image_url"`
        Address         json.RawMessage `json:"address"` // as JSONB
        CreatedAt       time.Time       `json:"created_at"`
    }

    query := `
        SELECT id, username, email, first_name, last_name, phone_number, shop_name, role, profile_image_url, address, created_at
        FROM users
        WHERE id = $1
    `

    err = db.QueryRow(context.Background(), query, userID).Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.FirstName,
        &user.LastName,
        &user.PhoneNumber,
        &user.ShopName,
        &user.Role,
        &user.ProfileImageURL,
        &user.Address,
        &user.CreatedAt,
    )

    if err != nil {
        log.Println("DB error fetching user:", err)
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}


// ==================== UPDATE PROFILE ====================
func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // First, fetch the user's current role (to check if seller)
    var currentRole string
    err = db.QueryRow(context.Background(), `
        SELECT role FROM users WHERE id = $1
    `, userID).Scan(&currentRole)
    if err != nil {
        log.Println("DB error (fetch role):", err)
        http.Error(w, "Failed to fetch user role", http.StatusInternalServerError)
        return
    }

    // Parse the request body
    var req struct {
        Username        string                 `json:"username"`
        FirstName       string                 `json:"first_name"`
        LastName        string                 `json:"last_name"`
        PhoneNumber     string                 `json:"phone_number"`
        ProfileImageURL string                 `json:"profile_image_url"`
        ShopName        string                 `json:"shop_name,omitempty"`
        Address         map[string]interface{} `json:"address"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Convert address map to JSONB
    var addressJSON []byte
    if req.Address != nil {
        addressJSON, err = json.Marshal(req.Address)
        if err != nil {
            http.Error(w, "Invalid address format", http.StatusBadRequest)
            return
        }
    }

    // Build dynamic query
    query := `UPDATE users SET `
    args := []interface{}{}
    setParts := []string{}
    i := 1

    if req.Username != "" {
        setParts = append(setParts, fmt.Sprintf("username=$%d", i))
        args = append(args, req.Username)
        i++
    }
    if req.FirstName != "" {
        setParts = append(setParts, fmt.Sprintf("first_name=$%d", i))
        args = append(args, req.FirstName)
        i++
    }
    if req.LastName != "" {
        setParts = append(setParts, fmt.Sprintf("last_name=$%d", i))
        args = append(args, req.LastName)
        i++
    }
    if req.PhoneNumber != "" {
        setParts = append(setParts, fmt.Sprintf("phone_number=$%d", i))
        args = append(args, req.PhoneNumber)
        i++
    }
    if req.ProfileImageURL != "" {
        setParts = append(setParts, fmt.Sprintf("profile_image_url=$%d", i))
        args = append(args, req.ProfileImageURL)
        i++
    }
    // Only update shop_name if user is seller
    if currentRole == "seller" && req.ShopName != "" {
        setParts = append(setParts, fmt.Sprintf("shop_name=$%d", i))
        args = append(args, req.ShopName)
        i++
    }
    // Always allow address update if provided
    if req.Address != nil {
        setParts = append(setParts, fmt.Sprintf("address=$%d", i))
        args = append(args, addressJSON)
        i++
    }

    // Always update updated_at
    setParts = append(setParts, fmt.Sprintf("updated_at=NOW()"))

    // Finalize query
    query += strings.Join(setParts, ", ")
    query += fmt.Sprintf(" WHERE id=$%d", i)
    args = append(args, userID)

    // Execute
    _, err = db.Exec(context.Background(), query, args...)
    if err != nil {
        log.Println("DB error (update):", err)
        http.Error(w, "Failed to update profile", http.StatusInternalServerError)
        return
    }

    // ✅ Response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
}




