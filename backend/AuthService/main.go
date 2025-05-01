package main

import (
    "log"
    "net/http"
    "os"

    "AuthService/handlers"
)

func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s %s", r.Method, r.URL.Path, r.RemoteAddr)
        next.ServeHTTP(w, r)
    })
}

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8000" // Default port
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/register", handlers.RegisterHandler)
    mux.HandleFunc("/login", handlers.LoginHandler)

    handlerWithCORS := enableCORS(loggingMiddleware(mux))

    log.Printf("AuthService is running on port %s...", port)
    if err := http.ListenAndServe(":"+port, handlerWithCORS); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}