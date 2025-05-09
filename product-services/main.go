package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/lance/product-services/handlers"
	"github.com/lance/product-services/redis"
)

func main() {
	r := chi.NewRouter()

	r.Get("/products", handlers.GetProducts)

	go redis.SubscribeToInventoryEvents()

	log.Println("ProductService running on :8081")
	http.ListenAndServe(":8081", r)
}
