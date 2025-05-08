package main

import (
    "database/sql"
    "log"
    "net/http"
    "paymentservice/graph"

    _ "github.com/lib/pq"
    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

func main() {
    port := defaultPort

    db, err := sql.Open("postgres", "postgres://postgres:password@localhost:5432/paymentdb?sslmode=disable")
    if err != nil {
        log.Fatalf("Failed to connect to DB: %v", err)
    }
    defer db.Close()

    srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
        Resolvers: &graph.Resolver{
            DB: db,
        },
    }))

    // Enable CORS middleware for the frontend to communicate
    corsHandler := func(h http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return
            }
            h.ServeHTTP(w, r)
        })
    }

    http.Handle("/", corsHandler(playground.Handler("GraphQL playground", "/query")))
    http.Handle("/query", corsHandler(srv))

    log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
