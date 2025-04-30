package main

import (
    "fmt"
    "log"
    "net/http"
    "os"

    "doma-product-go/handlers"

    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
)

func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found; using environment variables.")
    }

    // Initialize the Supabase client
    handlers.InitDB()

    // Create a new router
    router := mux.NewRouter()

    // Define REST endpoints
    router.HandleFunc("/getproducts", handlers.GetProducts).Methods("GET")
    router.HandleFunc("/getproducts/{id}", handlers.GetProduct).Methods("GET")
	router.HandleFunc("/getproducts/{id}/variants", handlers.GetProductVariants).Methods("GET")
	router.HandleFunc("/getproducts/{id}/variants/{variant_id}", handlers.GetProductVariant).Methods("GET")

    // Wrap the router with the CORS middleware
    handlerWithCORS := enableCORS(router)

    // Get the port from the environment or use the default
    port := os.Getenv("PORT")
    if port == "" {
        port = "8001"
    }
    fmt.Printf("ProductService REST API running on port %s\n", port)

    // Start the server
    log.Fatal(http.ListenAndServe(":"+port, handlerWithCORS))
}