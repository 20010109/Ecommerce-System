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
        BirthDate       string                 `json:"birth_date,omitempty"`  // YYYY-MM-DD
        ProfileImageURL string                 `json:"profile_image_url,omitempty"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    if req.Username == "" || req.Email == "" || req.Password == "" {
        http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
        return
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
        (username, email, password, role, first_name, last_name, phone_number, address, birth_date, profile_image_url, created_at)
        VALUES ($1, $2, $3, 'buyer', $4, $5, $6, $7, $8, $9, NOW())`,
        req.Username,
        req.Email,
        string(hashedPassword),
        req.FirstName,
        req.LastName,
        req.PhoneNumber,
        addressJSON,
        birthDate,
        req.ProfileImageURL,
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
		Username        string `json:"username"`
		FirstName       string `json:"first_name"`
		Email           string `json:"email"`
		PhoneNumber     string `json:"phone_number"`
		ShopName        string `json:"shop_name"`
		Gender          string `json:"gender"`
		BirthDate       string `json:"birth_date"`
		ProfileImageURL string `json:"profile_image_url"`
	}

	err = db.QueryRow(context.Background(), `
        SELECT username, first_name, email, phone_number, shop_name, gender, birth_date, profile_image_url
        FROM users WHERE id = $1
    `, userID).Scan(&user.Username, &user.FirstName, &user.Email, &user.PhoneNumber,
		&user.ShopName, &user.Gender, &user.BirthDate, &user.ProfileImageURL)

	if err != nil {
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

    var req struct {
        FirstName       string `json:"first_name"`
        PhoneNumber     string `json:"phone_number"`
        ShopName        string `json:"shop_name"`
        Gender          string `json:"gender"`
        BirthDate       string `json:"birth_date"` // format: YYYY-MM-DD
        ProfileImageURL string `json:"profile_image_url"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid body", http.StatusBadRequest)
        return
    }

    _, err = db.Exec(context.Background(), `
        UPDATE users
        SET first_name=$1, phone_number=$2, shop_name=$3, gender=$4, birth_date=$5, profile_image_url=$6, updated_at=NOW()
        WHERE id=$7
    `, req.FirstName, req.PhoneNumber, req.ShopName, req.Gender, req.BirthDate, req.ProfileImageURL, userID)

    if err != nil {
        http.Error(w, "Failed to update profile", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
}


