package main

import (
    "log"
    "net/http"
    "ProductService/handler"
    "github.com/gorilla/mux"
    "github.com/rs/cors"
)

func main() {
    router := mux.NewRouter()
    router.HandleFunc("/products", handler.GetAllProducts).Methods("GET")

    log.Println("✅ ProductService running on :8081 (with CORS enabled)")

    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
    })

    handler := c.Handler(router)
    log.Fatal(http.ListenAndServe(":8081", handler))
}
