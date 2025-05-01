package handlers

import (
    "database/sql"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "doma-order-go/models"
)

type OrderHandler struct {
    DB *sql.DB
}

func NewOrderHandler(db *sql.DB) *OrderHandler {
    return &OrderHandler{DB: db}
}

// CreateOrder - POST /orders
func (h *OrderHandler) CreateOrder(c *gin.Context) {
    var order models.Order
    if err := c.ShouldBindJSON(&order); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Default status
    order.Status = "pending"
    now := time.Now()
    order.CreatedAt = now
    order.UpdatedAt = now

    // Insert order
    query := `
        INSERT INTO orders (user_id, status, total_price, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING order_id
    `
    var newOrderID int
    err := h.DB.QueryRow(query, order.UserID, order.Status, order.TotalPrice, order.CreatedAt, order.UpdatedAt).
        Scan(&newOrderID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order: " + err.Error()})
        return
    }

    order.OrderID = newOrderID
    c.JSON(http.StatusCreated, gin.H{"message": "Order created successfully", "order": order})
}

// GetOrder - GET /orders/:id
func (h *OrderHandler) GetOrder(c *gin.Context) {
    orderID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
        return
    }

    var order models.Order
    query := `
        SELECT order_id, user_id, status, total_price, created_at, updated_at
        FROM orders
        WHERE order_id = $1
    `
    row := h.DB.QueryRow(query, orderID)
    if err := row.Scan(&order.OrderID, &order.UserID, &order.Status, &order.TotalPrice, &order.CreatedAt, &order.UpdatedAt); err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        }
        return
    }

    c.JSON(http.StatusOK, order)
}

// UpdateOrder - PUT /orders/:id
func (h *OrderHandler) UpdateOrder(c *gin.Context) {
    orderID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
        return
    }

    var updateData struct {
        Status     string  `json:"status"`
        TotalPrice float64 `json:"total_price"`
    }
    if err := c.ShouldBindJSON(&updateData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    now := time.Now()
    query := `
        UPDATE orders
        SET status = $1, total_price = $2, updated_at = $3
        WHERE order_id = $4
        RETURNING order_id
    `
    var returnedID int
    if err := h.DB.QueryRow(query, updateData.Status, updateData.TotalPrice, now, orderID).Scan(&returnedID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Order updated successfully", "order_id": returnedID})
}

// DeleteOrder - DELETE /orders/:id
func (h *OrderHandler) DeleteOrder(c *gin.Context) {
    orderID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
        return
    }

    // Example: permanent delete. Alternatively, you might do a "soft delete" by setting status = "canceled".
    query := `
        DELETE FROM orders
        WHERE order_id = $1
        RETURNING order_id
    `
    var returnedID int
    if err := h.DB.QueryRow(query, orderID).Scan(&returnedID); err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete order: " + err.Error()})
        }
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully", "order_id": returnedID})
}
