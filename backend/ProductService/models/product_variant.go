package models

// ProductVariant represents a product variant in the database.
type ProductVariant struct {
    ID            int     `json:"id"`
    Product_ID    int     `json:"product_id"`
    Size          string  `json:"size"`
    Color         string  `json:"color"`
    Price         float64 `json:"price"`
    StockQuantity int     `json:"stock_quantity"`
}