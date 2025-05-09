package main

import (
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/cors"
    "ProductService/handlers"
    "ProductService/redis"
)

func main() {
    r := chi.NewRouter()

    // ✅ Add CORS middleware
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"}, // Or use []string{"*"} for all origins (dev only)
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
        ExposedHeaders:   []string{"Link"},
        AllowCredentials: true,
        MaxAge:           300, // Maximum value not ignored by any of major browsers
    }))

    r.Get("/products", handlers.GetProducts)
	r.Get("/categories", handlers.GetCategories)


    go redis.SubscribeToInventoryEvents()

    log.Println("ProductService running on :8001")
    log.Fatal(http.ListenAndServe(":8001", r))
}
