package models

// Product represents a product in the database.
type Product struct {
    ID          int              `json:"id"`
    ProductName string           `json:"name"`
    Description string           `json:"description"`
    BasePrice   float64          `json:"baseprice"`
    Image       string           `json:"image"`
    Variants    []ProductVariant `json:"variants,omitempty"` // Variants are optional
}