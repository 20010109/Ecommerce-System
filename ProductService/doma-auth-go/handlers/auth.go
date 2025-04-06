// handlers/auth.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"doma-auth-go/db"
	"doma-auth-go/models"

	"golang.org/x/crypto/bcrypt"
)

// Response is used for sending JSON responses.
type Response struct {
	Message string      `json:"message"`
	User    interface{} `json:"user,omitempty"`
	// Token   string      `json:"token,omitempty"` // Uncomment when adding JWT support
}

// Register handles user registration.
func Register(w http.ResponseWriter, r *http.Request) {
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
	query := `
		INSERT INTO users (username, email, password)
		VALUES ($1, $2, $3)
		RETURNING id, username, email, date_created
	`
	err = db.DB.QueryRow(query, u.Username, u.Email, string(hashedPassword)).
		Scan(&newUser.ID, &newUser.Username, &newUser.Email, &newUser.DateCreated)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Insert error:", err)
		json.NewEncoder(w).Encode(Response{Message: "Error inserting user"})
		return
	}

	json.NewEncoder(w).Encode(Response{Message: "User registered successfully", User: newUser})
}

// LoginRequest defines the expected login payload.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Login handles user login.
func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var creds LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Message: "Invalid request payload"})
		return
	}

	// Retrieve user by username.
	var u models.User
	var hashedPassword string
	err := db.DB.QueryRow("SELECT id, username, email, password, date_created FROM users WHERE username=$1", creds.Username).
		Scan(&u.ID, &u.Username, &u.Email, &hashedPassword, &u.DateCreated)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Message: "Invalid credentials"})
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Message: "Database error"})
		return
	}

	// Compare passwords.
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Password)); err != nil {
		log.Printf("Password mismatch for user %s: storedHash=%s, provided=%s, error=%v",
			creds.Username, hashedPassword, creds.Password, err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Message: "Invalid credentials"})
		return
	}
	

	// Successful login – return user info (and later, you can generate a JWT token)
	json.NewEncoder(w).Encode(Response{
		Message: "Logged in successfully",
		User:    u,
	})
}
