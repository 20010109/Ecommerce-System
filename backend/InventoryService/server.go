package main

import (
    "InventoryService/db"
    "InventoryService/graph"
    "InventoryService/middleware"
    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/playground"
    "log"
    "net/http"
)

func main() {
    db.Initialize()
    defer db.Close()

    srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

    http.Handle("/", playground.Handler("GraphQL playground", "/query"))
    http.Handle("/query", middleware.IsSellerMiddleware(srv))

    log.Println("Server running at http://localhost:8080/")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
