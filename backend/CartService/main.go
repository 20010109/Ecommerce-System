package main

import (
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/cors"
    "CartService/db"
    "CartService/handlers"
)

func main() {
    r := chi.NewRouter()

    // CORS setup (allow from your frontend)
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"}, // Frontend URL
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
        ExposedHeaders:   []string{"Link"},
        AllowCredentials: true,
        MaxAge:           300,
    }))

    // Initialize DB
    db.Init()

    // Routes
    r.Post("/cart/add", handlers.AddToCart)
    r.Get("/cart/{userId}", handlers.GetCart)
    r.Post("/cart/update", handlers.UpdateCartItem)
    r.Delete("/cart/remove/{itemId}", handlers.RemoveCartItem)

    log.Println("CartService running on :8006")
    log.Fatal(http.ListenAndServe(":8006", r))
}
