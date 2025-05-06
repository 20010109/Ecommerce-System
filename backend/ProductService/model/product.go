package model

type Product struct {
    ID             int     `json:"id"`
    Name           string  `json:"name"`
    Description    string  `json:"description"`
    BasePrice      float64 `json:"basePrice"`
    Image          string  `json:"image"`
    Category       string  `json:"category"`
    Listed         bool    `json:"listed"`
    SellerID       int     `json:"sellerId"`
    SellerUsername string  `json:"sellerUsername"`
    CreatedAt      string  `json:"createdAt"`
    UpdatedAt      string  `json:"updatedAt"`
    Variants       []struct {
        ID            int    `json:"id"`
        VariantName   string `json:"variantName"`
        Size          string `json:"size"`
        Color         string `json:"color"`
        StockQuantity int    `json:"stockQuantity"`
        Image         string `json:"image"`
    } `json:"variants"`
}
