package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"doma-product-go/db"
	customHandlers "doma-product-go/handlers"

	"github.com/gorilla/mux"
	cors "github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file.
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found; using environment variables.")
	}

	// Initialize the database connection.
	if err := db.InitDB(); err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	// Create a new router.
	r := mux.NewRouter()

	// Define REST endpoints.
	r.HandleFunc("/products", customHandlers.GetProducts).Methods("GET")
	r.HandleFunc("/products/{id}", customHandlers.GetProduct).Methods("GET")
	r.HandleFunc("/products", customHandlers.CreateProduct).Methods("POST")
	r.HandleFunc("/products/{id}/variants", customHandlers.CreateProductVariant).Methods("POST")

	// Set up CORS using Gorilla's handlers package.
	allowedOrigins := cors.AllowedOrigins([]string{"http://localhost:3000"})
	allowedMethods := cors.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := cors.AllowedHeaders([]string{"Content-Type", "Authorization"})

	// Get the port from the environment.
	port := os.Getenv("PORT")
	if port == "" {
		port = "4002"
	}
	fmt.Printf("ProductService REST API running on port %s\n", port)

	// Wrap the router with CORS middleware.
	log.Fatal(http.ListenAndServe(":"+port, cors.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r)))
}
