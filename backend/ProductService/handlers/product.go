package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    //"os"

    "github.com/gorilla/mux"
    "github.com/jackc/pgx/v4/pgxpool"
)

var dbPool *pgxpool.Pool

// InitDB initializes the PostgreSQL connection pool
func InitDB() {
    // Replace with your PostgreSQL connection string
    databaseURL := "postgres://postgres:password@localhost:5432/productdb"

    config, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        log.Fatalf("Unable to parse database URL: %v\n", err)
    }
    
    // Force all queries to use simple protocol
    config.ConnConfig.PreferSimpleProtocol = true
    
    dbPool, err = pgxpool.ConnectConfig(context.Background(), config)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    log.Println("Database connection established")
}

// GetProducts fetches all products from the "products" table
func GetProducts(w http.ResponseWriter, r *http.Request) {
    if dbPool == nil {
        http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
        return
    }

    // Query the "products" table
    query := "SELECT id, name, description, image, base_price FROM products"
    rows, err := dbPool.Query(context.Background(), query)
    if err != nil {
        log.Printf("Error fetching products: %v\n", err)
        http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var products []map[string]interface{}
    for rows.Next() {
        var id int
        var name, description, image string
        var base_price float64

        if err := rows.Scan(&id, &name, &description, &image, &base_price); err != nil {
            log.Printf("Error scanning row: %v\n", err)
            http.Error(w, "Failed to read products", http.StatusInternalServerError)
            return
        }

        // Append each product as a map
        product := map[string]interface{}{
            "id":          id,
            "name":        name,
            "description": description,
            "base_price":       base_price,
            "image":        image,
        }
        products = append(products, product)
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(products); err != nil {
        log.Printf("Error encoding products to JSON: %v\n", err)
        http.Error(w, "Failed to encode products to JSON", http.StatusInternalServerError)
    }
}

// GetProduct fetches a single product by its ID from the "products" table
func GetProduct(w http.ResponseWriter, r *http.Request) {
    if dbPool == nil {
        http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
        return
    }

    // Extract the product ID from the URL path
    vars := mux.Vars(r)
    productID := vars["id"]
    if productID == "" {
        http.Error(w, "Product ID is required", http.StatusBadRequest)
        return
    }

    // Query the "products" table for the specific product ID
    query := "SELECT id, name, description, image, base_price FROM products WHERE id = $1"
    var id int
    var name, description, image string
    var base_price float64

    err := dbPool.QueryRow(context.Background(), query, productID).Scan(&id, &name, &description, &image, &base_price)
    if err != nil {
        log.Printf("Error fetching product with ID %s: %v\n", productID, err)
        http.Error(w, fmt.Sprintf("Failed to fetch product: %v", err), http.StatusInternalServerError)
        return
    }

    // Create a map to represent the product
    product := map[string]interface{}{
        "id":          id,
        "name":        name,
        "description": description,
        "base_price":       base_price,
        "image":       image,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(product); err != nil {
        log.Printf("Error encoding product to JSON: %v\n", err)
        http.Error(w, "Failed to encode product to JSON", http.StatusInternalServerError)
    }
}

// GetProductVariants fetches all variants for a specific product ID
func GetProductVariants(w http.ResponseWriter, r *http.Request) {
    if dbPool == nil {
        http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
        return
    }

    // Extract the product ID from the URL path
    vars := mux.Vars(r)
    productID := vars["id"]
    if productID == "" {
        http.Error(w, "Product ID is required", http.StatusBadRequest)
        return
    }

    // Query the "product_variants" table for the specific product ID
    query := "SELECT id, product_id, size, variant_name, color, price, stock_quantity FROM product_variants WHERE product_id = $1"
    rows, err := dbPool.Query(context.Background(), query, productID)
    if err != nil {
        log.Printf("Error fetching product variants for product ID %s: %v\n", productID, err)
        http.Error(w, "Failed to fetch product variants", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var variants []map[string]interface{}
    for rows.Next() {
        var id, product_id, stock_quantity int
        var variant_name, size, color string
        var price float64

        if err := rows.Scan(&id, &product_id, &size, &variant_name, &color, &price, &stock_quantity); err != nil {
            log.Printf("Error scanning row: %v\n", err)
            http.Error(w, "Failed to read product variants", http.StatusInternalServerError)
            return
        }

        // Append each variant as a map
        variant := map[string]interface{}{
            "id":           id,
            "product_id":   product_id,
            "size":         size,
            "variant_name": variant_name,
            "color":        color,
            "stock_quantity": stock_quantity,
            "price":        price,
        }
        variants = append(variants, variant)
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(variants); err != nil {
        log.Printf("Error encoding product variants to JSON: %v\n", err)
        http.Error(w, "Failed to encode product variants to JSON", http.StatusInternalServerError)
    }
}

// GetProductVariant fetches a single variant by its ID
func GetProductVariant(w http.ResponseWriter, r *http.Request) {
    if dbPool == nil {
        http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
        return
    }

    // Extract the variant ID from the URL path
    vars := mux.Vars(r)
    variantID := vars["variant_id"]
    if variantID == "" {
        http.Error(w, "Variant ID is required", http.StatusBadRequest)
        return
    }

    // Query the "product_variants" table for the specific variant ID
    query := "SELECT pv.*, p.name AS product_name, p.description AS product_description FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = $1;"
    var id, product_id, stock_quantity int
    var variant_name, size, color string
    var price float64

    err := dbPool.QueryRow(context.Background(), query, variantID).Scan(&id, &product_id, &variant_name, &price)
    if err != nil {
        log.Printf("Error fetching product variant with ID %s: %v\n", variantID, err)
        http.Error(w, fmt.Sprintf("Failed to fetch product variant: %v", err), http.StatusInternalServerError)
        return
    }

    // Create a map to represent the variant
    variant := map[string]interface{}{
        "id":           id,
        "product_id":   product_id,
        "variant_name": variant_name,
        "price":        price,
        "size":         size,
        "color":        color,
        "stock_quantity": stock_quantity,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(variant); err != nil {
        log.Printf("Error encoding product variant to JSON: %v\n", err)
        http.Error(w, "Failed to encode product variant to JSON", http.StatusInternalServerError)
    }
}