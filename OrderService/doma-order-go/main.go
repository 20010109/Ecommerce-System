package main

import (
    "log"
    "os"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "doma-order-go/db"
    "doma-order-go/routes"
    "time"
)

func main() {
    database, err := db.ConnectDB()
    if err != nil {
        log.Fatalf("Could not connect to DB: %v", err)
    }
    defer database.Close()

    router := gin.Default()

    // Use Gin's CORS middleware with default settings (adjust as needed)
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"*"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    router = routes.SetupRoutesWithRouter(router, database)

    port := os.Getenv("SERVER_PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("DOMA Order Service running on port %s", port)
    router.Run(":" + port)
}
