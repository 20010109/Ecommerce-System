package models

import "time"

// Order reflects the orders table
type Order struct {
    OrderID    int       `json:"order_id" db:"order_id"`
    UserID     int       `json:"user_id" db:"user_id"`
    Status     string    `json:"status" db:"status"`
    TotalPrice float64   `json:"total_price" db:"total_price"`
    CreatedAt  time.Time `json:"created_at" db:"created_at"`
    UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

// OrderItem reflects the order_items table
type OrderItem struct {
    OrderItemID     int       `json:"order_item_id" db:"order_item_id"`
    OrderID         int       `json:"order_id" db:"order_id"`
    ProductID       int       `json:"product_id" db:"product_id"`
    VariantID       int       `json:"variant_id" db:"variant_id"`
    Quantity        int       `json:"quantity" db:"quantity"`
    PriceAtPurchase float64   `json:"price_at_purchase" db:"price_at_purchase"`
    CreatedAt       time.Time `json:"created_at" db:"created_at"`
    UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}
