package routes

import (
    "database/sql"

    "github.com/gin-gonic/gin"
    "doma-order-go/handlers"
)

// SetupRoutesWithRouter configures the routes on an existing router instance.
func SetupRoutesWithRouter(router *gin.Engine, db *sql.DB) *gin.Engine {
    orderHandler := handlers.NewOrderHandler(db)

    // Order endpoints
    router.POST("/orders", orderHandler.CreateOrder)
    router.GET("/orders/:id", orderHandler.GetOrder)
    router.PUT("/orders/:id", orderHandler.UpdateOrder)
    router.DELETE("/orders/:id", orderHandler.DeleteOrder)

    // Optional: add a catch-all route for undefined endpoints
    router.NoRoute(func(c *gin.Context) {
        c.JSON(404, gin.H{"error": "Route not found"})
    })

    return router
}
