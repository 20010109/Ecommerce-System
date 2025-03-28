package models

import "time"

// Product represents a product in your system.
type Product struct {
	Product_ID  int              `json:"id"`          // Internal field; JSON tag remains "id"
	ProductName string           `json:"name"`        // Stored product name
	Description string           `json:"description"` // Description of the product
	BasePrice   float64          `json:"basePrice"`   // Base price
	Image       string           `json:"image"`       // Image URL
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
	Variants    []ProductVariant `json:"variants"`    // Associated variants
}

// ProductVariant represents a variant of a product.
type ProductVariant struct {
	Variant_ID    int       `json:"id"`         // Internal field; JSON tag remains "id"
	Product_ID    int       `json:"productId"`  // Foreign key to Product
	Size          string    `json:"size"`       // Size (e.g., S, M, L)
	Color         string    `json:"color"`      // Color (e.g., red, blue)
	Price         float64   `json:"price"`      // Variant-specific price (if needed)
	StockQuantity int       `json:"stockQuantity"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
