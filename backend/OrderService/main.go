package main

import (
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "orderservice/graphql"
    "orderservice/handlers"
)

func main() {
    // Initialize the GraphQL client (adjust port if needed)
    graphql.InitClient("http://localhost:8003/v1/graphql") 

    r := chi.NewRouter()

    // Register routes
    r.Post("/create-order", handlers.CreateOrderHandler)
    r.Patch("/update-order-status", handlers.UpdateOrderStatusHandler)
    r.Delete("/delete-order", handlers.DeleteOrderHandler)
    r.Get("/orders", handlers.GetOrdersHandler)

    log.Println("OrderService is running on :8082")
    http.ListenAndServe(":8082", r)
}
