package handlers

import (
    "encoding/json"
    "log"
    "net/http"
    "os"

    "github.com/joho/godotenv"
    "github.com/supabase-community/gotrue-go"
    "github.com/supabase-community/gotrue-go/types"
)

var supabaseClient gotrue.Client // Change to the interface type

func init() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    // Initialize the Supabase client
    supabaseURL := os.Getenv("SUPABASE_URL")
    supabaseKey := os.Getenv("SUPABASE_KEY")
    if supabaseURL == "" || supabaseKey == "" {
        log.Fatal("Supabase URL or Key is not set in environment variables")
    }

    supabaseClient = gotrue.New(supabaseURL, supabaseKey) // No need for a pointer
}

// RegisterHandler handles user registration requests.
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    signupReq := types.SignupRequest{
        Email:    req.Email,
        Password: req.Password,
    }

    user, err := supabaseClient.Signup(signupReq)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// LoginHandler handles user login requests.
func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    tokenReq := types.TokenRequest{
        GrantType: "password",
        Email:     req.Email,
        Password:  req.Password,
    }

    token, err := supabaseClient.Token(tokenReq)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(token)
}