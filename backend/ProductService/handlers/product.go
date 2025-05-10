package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type Product struct {
	ID             int              `json:"id"`
	Name           string           `json:"name"`
	Description    string           `json:"description"`
	BasePrice      float64          `json:"base_price"`
	Image          string           `json:"image"`
	Category       string           `json:"category"`
	SKU            string           `json:"sku"`
	Listed         bool             `json:"listed"`
	SellerID       int              `json:"seller_id"`
	SellerUsername string           `json:"seller_username"`
	CreatedAt      string           `json:"created_at"`
	UpdatedAt      string           `json:"updated_at"`
	ProductVariants []ProductVariant `json:"product_variants,omitempty"` // Only used for Product Details
}

type ProductVariant struct {
	ID            int     `json:"id"`
	ProductID     int     `json:"product_id"`
	VariantName   string  `json:"variant_name"`
	Size          string  `json:"size"`
	Color         string  `json:"color"`
	SKU           string  `json:"sku"`
	StockQuantity int     `json:"stock_quantity"`
	Image         string  `json:"image"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming /products request with query params:", r.URL.RawQuery)

	// ✅ Updated to fetch from the correct Hasura Inventory service (catalog: no variants)
	req, err := http.NewRequest("GET", "http://hasura-inventory:8080/api/rest/products", nil)
	if err != nil {
		log.Println("Failed to create request:", err)
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("x-hasura-admin-secret", "password")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to fetch from InventoryService:", err)
		http.Error(w, "Failed to fetch from InventoryService", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Println("InventoryService (catalog) response body:", string(bodyBytes))

	var result struct {
		Products []Product `json:"products"`
	}
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Println("Failed to decode InventoryService response:", err)
		http.Error(w, "Failed to decode InventoryService response", http.StatusInternalServerError)
		return
	}

	// Apply query filters
	queryName := strings.ToLower(r.URL.Query().Get("name"))
	queryCategory := strings.ToLower(r.URL.Query().Get("category"))
	queryListed := r.URL.Query().Get("listed")
	querySKU := strings.ToLower(r.URL.Query().Get("sku"))
	querySellerUsername := strings.ToLower(r.URL.Query().Get("seller_username"))

	priceMinStr := r.URL.Query().Get("price_min")
	priceMaxStr := r.URL.Query().Get("price_max")
	priceMin, _ := strconv.ParseFloat(priceMinStr, 64)
	priceMax, _ := strconv.ParseFloat(priceMaxStr, 64)

	var filtered []Product
	for _, p := range result.Products {
		match := true

		if queryName != "" && !strings.Contains(strings.ToLower(p.Name), queryName) {
			match = false
		}
		if queryCategory != "" && strings.ToLower(p.Category) != queryCategory {
			match = false
		}
		if queryListed != "" {
			if (queryListed == "true" && !p.Listed) || (queryListed == "false" && p.Listed) {
				match = false
			}
		}
		if querySKU != "" && strings.ToLower(p.SKU) != querySKU {
			match = false
		}
		if querySellerUsername != "" && strings.ToLower(p.SellerUsername) != querySellerUsername {
			match = false
		}
		if priceMinStr != "" && p.BasePrice < priceMin {
			match = false
		}
		if priceMaxStr != "" && p.BasePrice > priceMax {
			match = false
		}

		if match {
			filtered = append(filtered, p)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filtered)
}

func GetProductByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	url := "http://hasura-inventory:8080/api/rest/products/" + strconv.Itoa(id) + "?id=" + strconv.Itoa(id)
	log.Println("Fetching product details from:", url)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println("Failed to create request:", err)
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("x-hasura-admin-secret", "password")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to fetch from InventoryService:", err)
		http.Error(w, "Failed to fetch from InventoryService", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Println("InventoryService (details) response body:", string(bodyBytes))

	if resp.StatusCode == http.StatusNotFound {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// ✅ Decode full product details (includes product_variants)
	var product struct {
		Product Product `json:"products_by_pk"`
	}
	if err := json.Unmarshal(bodyBytes, &product); err != nil {
		log.Println("Failed to decode InventoryService response:", err)
		http.Error(w, "Failed to decode InventoryService response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product.Product)
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	log.Println("Fetching categories...")

	req, err := http.NewRequest("GET", "http://hasura-inventory:8080/api/rest/categories", nil)
	if err != nil {
		log.Println("Failed to create request:", err)
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("x-hasura-admin-secret", "password")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to fetch from InventoryService:", err)
		http.Error(w, "Failed to fetch from InventoryService", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Println("Categories response body:", string(bodyBytes))

	var result struct {
		Products []struct {
			Category string `json:"category"`
		} `json:"products"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Println("Failed to decode InventoryService response:", err)
		http.Error(w, "Failed to decode InventoryService response", http.StatusInternalServerError)
		return
	}

	uniqueCategories := []string{}
	seen := make(map[string]bool)
	for _, item := range result.Products {
		if item.Category != "" && !seen[item.Category] {
			seen[item.Category] = true
			uniqueCategories = append(uniqueCategories, item.Category)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"categories": uniqueCategories,
	})
}
