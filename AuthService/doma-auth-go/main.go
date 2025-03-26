// main.go
package main

import (
	"log"
	"net/http"
	"os"

	"doma-auth-go/db"
	"doma-auth-go/routes"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables from .env file.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Make sure your environment variables are set.")
	}

	// Initialize the database.
	db.Init()
	defer db.DB.Close()

	// Set up routes.
	router := routes.RegisterRoutes()

	// Wrap router with CORS middleware.
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow requests from your frontend domain.
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(router)

	// Determine the port from environment or default to 4000.
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
