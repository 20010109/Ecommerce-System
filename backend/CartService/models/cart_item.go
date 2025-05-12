package models

type CartItem struct {
    ID           int     `json:"id"`
    UserID       int     `json:"user_id"`
    ProductID    int     `json:"product_id"`
    VariantID    int     `json:"variant_id"`
    SellerID       int    `json:"seller_id"`
    SellerUsername string `json:"seller_username"`
    ProductName  string  `json:"product_name"`
    VariantName  string  `json:"variant_name"`
    Size         string  `json:"size"`
    Color        string  `json:"color"`
    Price        float64 `json:"price"`
    Quantity     int     `json:"quantity"`
    Subtotal     float64 `json:"subtotal"`
    ImageURL     string  `json:"image_url"`
}
