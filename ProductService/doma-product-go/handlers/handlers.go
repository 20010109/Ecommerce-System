package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"doma-product-go/db"
	"doma-product-go/models"
)

// GetProducts handles GET /products.
func GetProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query("SELECT id, name, description, baseprice, image, created_at, updated_at FROM products")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.Product_ID, &p.ProductName, &p.Description, &p.BasePrice, &p.Image, &p.CreatedAt, &p.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get variants for this product.
		variantRows, err := db.DB.Query("SELECT id, product_id, size, color, price, stock_quantity, created_at, updated_at FROM product_variants WHERE product_id = $1", p.Product_ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer variantRows.Close()

		var variants []models.ProductVariant
		for variantRows.Next() {
			var v models.ProductVariant
			if err := variantRows.Scan(&v.Variant_ID, &v.Product_ID, &v.Size, &v.Color, &v.Price, &v.StockQuantity, &v.CreatedAt, &v.UpdatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			variants = append(variants, v)
		}
		p.Variants = variants
		products = append(products, p)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

// GetProduct handles GET /products/{id}.
func GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid product id", http.StatusBadRequest)
		return
	}

	var p models.Product
	err = db.DB.QueryRow("SELECT id, name, description, baseprice, image, created_at, updated_at FROM products WHERE id = $1", id).
		Scan(&p.Product_ID, &p.ProductName, &p.Description, &p.BasePrice, &p.Image, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get variants for this product.
	rows, err := db.DB.Query("SELECT id, product_id, size, color, price, stock_quantity, created_at, updated_at FROM product_variants WHERE product_id = $1", p.Product_ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var variants []models.ProductVariant
	for rows.Next() {
		var v models.ProductVariant
		if err := rows.Scan(&v.Variant_ID, &v.Product_ID, &v.Size, &v.Color, &v.Price, &v.StockQuantity, &v.CreatedAt, &v.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		variants = append(variants, v)
	}
	p.Variants = variants

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// CreateProduct handles POST /products.
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := "INSERT INTO products (name, description, baseprice, image, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, created_at, updated_at"
	err := db.DB.QueryRow(query, p.ProductName, p.Description, p.BasePrice, p.Image).Scan(&p.Product_ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// CreateProductVariant handles POST /products/{id}/variants.
func CreateProductVariant(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productIDStr := vars["id"]
	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		http.Error(w, "Invalid product id", http.StatusBadRequest)
		return
	}

	var v models.ProductVariant
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := "INSERT INTO product_variants (product_id, size, color, price, stock_quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, created_at, updated_at"
	err = db.DB.QueryRow(query, productID, v.Size, v.Color, v.Price, v.StockQuantity).Scan(&v.Variant_ID, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	v.Product_ID = productID

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
