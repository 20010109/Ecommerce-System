package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
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
        Username      string `json:"username"`
        Email         string `json:"email"`
        Password      string `json:"password"`
        IsSeller      bool   `json:"is_seller"`
        ContactNumber string `json:"contact_number"`
        Address       string `json:"address"`
    }

    log.Printf("Register request: %+v\n", req)

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Basic validation
    if req.Username == "" || req.Email == "" || req.Password == "" {
        http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
        return
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }

    _, err = db.Exec(
        context.Background(),
        `INSERT INTO users (username, email, password, is_seller, contact_number, address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        req.Username, req.Email, string(hashedPassword), req.IsSeller, req.ContactNumber, req.Address,
    )
    if err != nil {
        http.Error(w, "Error registering user", http.StatusInternalServerError)
        return
    }

    

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte("User registered successfully"))
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
    var isSeller bool
    var contactNumber string
    var address string

    err := db.QueryRow(
        context.Background(),
        `SELECT id, username, password, is_seller, contact_number, address FROM users WHERE email = $1`,
        req.Email,
    ).Scan(&userID, &username, &hashedPassword, &isSeller, &contactNumber, &address)

    if err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    token, err := GenerateJWT(userID, username, req.Email, isSeller, contactNumber, address)
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// ==================== JWT GENERATOR ====================

func GenerateJWT(userID int, username string, email string, isSeller bool, contactNumber string, address string) (string, error) {
    role := "buyer"
    if isSeller {
        role = "seller"
    }

    claims := jwt.MapClaims{
        "user_id":        userID,
        "username":       username,
        "email":          email,
        "is_seller":      isSeller,
        "contact_number": contactNumber,
        "address":        address,
        "exp":            time.Now().Add(time.Hour * 24).Unix(),
        "https://hasura.io/jwt/claims": map[string]interface{}{
            "x-hasura-default-role":  role,
            "x-hasura-allowed-roles": []string{"seller", "buyer"},
            "x-hasura-user-id":       fmt.Sprintf("%d", userID),
            "x-hasura-user-name":     username,
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}
