package handlers

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/dgrijalva/jwt-go"
    "github.com/joho/godotenv"
    "github.com/jackc/pgx/v4/pgxpool"
    "golang.org/x/crypto/bcrypt"
)

var db *pgxpool.Pool
var jwtSecret []byte

func init() {
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    connStr := os.Getenv("POSTGRES_CONN")
    var err error
    db, err = pgxpool.Connect(context.Background(), connStr)
    if err != nil {
        log.Fatal("Error connecting to the database:", err)
    }

    jwtSecret = []byte(os.Getenv("JWT_SECRET"))
    if len(jwtSecret) == 0 {
        log.Fatal("JWT_SECRET is not set in environment variables")
    }
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
        IsSeller bool   `json:"is_seller"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }

    _, err = db.Exec(context.Background(), "INSERT INTO users (email, password, is_seller) VALUES ($1, $2, $3)", req.Email, string(hashedPassword), req.IsSeller)
    if err != nil {
        http.Error(w, "Error registering user", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    var hashedPassword string
    var isSeller bool
    err := db.QueryRow(context.Background(), "SELECT password, is_seller FROM users WHERE email = $1", req.Email).Scan(&hashedPassword, &isSeller)
    if err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    token, err := GenerateJWT(req.Email, isSeller)
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func GenerateJWT(email string, isSeller bool) (string, error) {
    claims := jwt.MapClaims{
        "email":     email,
        "is_seller": isSeller,
        "exp":       time.Now().Add(time.Hour * 24).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}