package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"orderservice/graphql"
	"orderservice/handlers"
)

func main() {
	// Initialize GraphQL client for Hasura
	graphql.InitClient("http://hasura-order:8080/v1/graphql")

	r := chi.NewRouter()

	// Enable CORS for frontend
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// POST /create-order endpoint
	r.Post("/create-order", handlers.CreateOrderHandler)

	log.Println("✅ OrderService is running on port :8100")
	log.Fatal(http.ListenAndServe(":8100", r))
}
