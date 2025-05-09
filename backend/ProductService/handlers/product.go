package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

type Product struct {
	ID             int     `json:"id"`
	Name           string  `json:"name"`
	Description    string  `json:"description"`
	BasePrice      float64 `json:"base_price"`
	Image          string  `json:"image"`
	Category       string  `json:"category"`
	SKU            string  `json:"sku"`
	Listed         bool    `json:"listed"`
	SellerID       int     `json:"seller_id"`
	SellerUsername string  `json:"seller_username"`
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", "http://hasura-inventory:8080/api/rest/products", nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("x-hasura-admin-secret", "password")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to fetch from InventoryService", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var result struct {
		Products []Product `json:"products"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to decode InventoryService response", http.StatusInternalServerError)
		return
	}

	// Filters from query params
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

func GetCategories(w http.ResponseWriter, r *http.Request) {
    // Update the link to your Hasura REST API for categories
    req, err := http.NewRequest("GET", "http://hasura-inventory:8080/api/rest/categories", nil)
    if err != nil {
        http.Error(w, "Failed to create request", http.StatusInternalServerError)
        return
    }
    req.Header.Set("x-hasura-admin-secret", "password")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        http.Error(w, "Failed to fetch from InventoryService", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    // This struct assumes Hasura returns:
    // { "products": [ { "category": "Shoes" }, { "category": "Clothes" } ... ] }
    var result struct {
        Products []struct {
            Category string `json:"category"`
        } `json:"products"`
    }

    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        http.Error(w, "Failed to decode InventoryService response", http.StatusInternalServerError)
        return
    }

    // Extract unique categories from the result
    uniqueCategories := []string{}
    seen := make(map[string]bool)
    for _, item := range result.Products {
        if item.Category != "" && !seen[item.Category] {
            seen[item.Category] = true
            uniqueCategories = append(uniqueCategories, item.Category)
        }
    }

    // Return as { "categories": [ ... ] }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "categories": uniqueCategories,
    })
}

