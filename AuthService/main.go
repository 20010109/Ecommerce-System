package main

import (
    "log"
    "net/http"

    "AuthService/handlers"
	
)

func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Set CORS headers
        w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // Handle preflight OPTIONS request
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }

        // Pass the request to the next handler
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Create a new ServeMux
    mux := http.NewServeMux()

    // Register routes (handlers can be defined in other files like auth.go)
    mux.HandleFunc("/register", handlers.RegisterHandler)
    mux.HandleFunc("/login", handlers.LoginHandler)

    // Wrap the ServeMux with the CORS middleware
    handlerWithCORS := enableCORS(mux)

    // Start the server
	log.Println("AuthService is running on port 8000...")
    http.ListenAndServe(":8000", handlerWithCORS)
}