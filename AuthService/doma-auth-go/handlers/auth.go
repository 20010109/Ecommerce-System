// handlers/auth.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"doma-auth-go/db"
	"doma-auth-go/models"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

// JWT secret key (for production, read from env variables)
var jwtSecret = []byte("YOUR_SUPER_SECRET_JWT_KEY")

// Response is a generic response struct.
type Response struct {
	Message string      `json:"message"`
	User    interface{} `json:"user,omitempty"`
	Token   string      `json:"token,omitempty"`
}

// Register handles user registration.
func Register(w http.ResponseWriter, r *http.Request) {
	// Ensure response is always JSON.
	w.Header().Set("Content-Type", "application/json")

	var u models.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Message: "Invalid request payload"})
		return
	}

	// Check if username or email already exists.
	var exists bool
	err := db.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE username=$1 OR email=$2)", u.Username, u.Email).Scan(&exists)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Message: "Database error"})
		return
	}
	if exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Message: "Username or Email already in use"})
		return
	}

	// Hash the password.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Message: "Error hashing password"})
		return
	}

	// Insert the new user into the database.
	var newUser models.User
	err = db.DB.QueryRow(
		`INSERT INTO users (username, email, password) VALUES ($1, $2, $3)
         RETURNING id, username, email, is_seller, date_created`,
		u.Username, u.Email, string(hashedPassword),
	).Scan(&newUser.ID, &newUser.Username, &newUser.Email, &newUser.IsSeller, &newUser.DateCreated)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Insert error:", err)
		json.NewEncoder(w).Encode(Response{Message: "Error inserting user"})
		return
	}

	json.NewEncoder(w).Encode(Response{Message: "User registered successfully", User: newUser})
}
