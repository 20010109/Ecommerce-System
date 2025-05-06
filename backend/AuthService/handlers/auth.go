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

    jwtSecretEnv := os.Getenv("JWT_SECRET")
    if jwtSecretEnv == "" {
        log.Fatal("JWT_SECRET is not set in environment variables")
    }
    jwtSecret = []byte(jwtSecretEnv)
}

// ==================== REGISTER HANDLER ====================

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Username    string                 `json:"username"`
        Email       string                 `json:"email"`
        Password    string                 `json:"password"`
        Role        string                 `json:"role"`
        FirstName   string                 `json:"first_name,omitempty"`
        LastName    string                 `json:"last_name,omitempty"`
        PhoneNumber string                 `json:"phone_number,omitempty"`
        Address     map[string]interface{} `json:"address,omitempty"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    if req.Username == "" || req.Email == "" || req.Password == "" || req.Role == "" {
        http.Error(w, "Username, email, password, and role are required", http.StatusBadRequest)
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

    _, err = db.Exec(
        context.Background(),
        `INSERT INTO users 
        (username, email, password, role, first_name, last_name, phone_number, address, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        req.Username,
        req.Email,
        string(hashedPassword),
        req.Role,
        req.FirstName,
        req.LastName,
        req.PhoneNumber,
        addressJSON,
    )
    if err != nil {
        log.Println("DB Exec error:", err)
        if strings.Contains(err.Error(), "duplicate key") {
            http.Error(w, "Username or email already exists", http.StatusConflict)
        } else {
            http.Error(w, "Error registering user", http.StatusInternalServerError)
        }
        return
    }

    // ✅ Final JSON response
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

    // 🔑 Fetch user
    err := db.QueryRow(
        context.Background(),
        `SELECT id, username, password, role, phone_number, address
         FROM users
         WHERE email = $1`,
        req.Email,
    ).Scan(&userID, &username, &hashedPassword, &role, &phoneNumber, &addressJSON)

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

    token, err := GenerateJWT(userID, username, req.Email, role, phoneNumber, address)
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// ==================== JWT GENERATOR ====================

func GenerateJWT(userID int, username string, email string, role string, phoneNumber string, address interface{}) (string, error) {
    claims := jwt.MapClaims{
        "user_id":      userID,
        "username":     username,
        "email":        email,
        "role":         role,
        "phone_number": phoneNumber,
        "address":      address,
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
