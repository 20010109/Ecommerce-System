package handlers

import (
    "CartService/db"
    "CartService/models"
    "context"
    "encoding/json"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

func AddToCart(w http.ResponseWriter, r *http.Request) {
    var item models.CartItem
    if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    item.Subtotal = float64(item.Quantity) * item.Price

    query := `
        INSERT INTO cart_items (
            user_id, product_id, variant_id, product_name, variant_name, 
            size, color, price, quantity, subtotal, image_url,
            seller_id, seller_username
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id;
    `

    err := db.Pool.QueryRow(context.Background(), query,
        item.UserID, item.ProductID, item.VariantID, item.ProductName,
        item.VariantName, item.Size, item.Color, item.Price,
        item.Quantity, item.Subtotal, item.ImageURL,
        item.SellerID, item.SellerUsername,
    ).Scan(&item.ID)

    if err != nil {
        http.Error(w, "Failed to add to cart", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(item)
}

func GetCart(w http.ResponseWriter, r *http.Request) {
    userIdStr := chi.URLParam(r, "userId")
    userId, err := strconv.Atoi(userIdStr)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    query := `
        SELECT 
            id, user_id, product_id, variant_id, product_name, variant_name,
            size, color, price, quantity, subtotal, image_url,
            seller_id, seller_username
        FROM cart_items
        WHERE user_id = $1;
    `

    rows, err := db.Pool.Query(context.Background(), query, userId)
    if err != nil {
        http.Error(w, "Failed to fetch cart", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var cartItems []models.CartItem
    for rows.Next() {
        var item models.CartItem
        err := rows.Scan(
            &item.ID, &item.UserID, &item.ProductID, &item.VariantID,
            &item.ProductName, &item.VariantName, &item.Size, &item.Color,
            &item.Price, &item.Quantity, &item.Subtotal, &item.ImageURL,
            &item.SellerID, &item.SellerUsername,
        )
        if err != nil {
            http.Error(w, "Failed to parse cart item", http.StatusInternalServerError)
            return
        }
        cartItems = append(cartItems, item)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(cartItems)
}

func UpdateCartItem(w http.ResponseWriter, r *http.Request) {
    var item models.CartItem
    if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    item.Subtotal = float64(item.Quantity) * item.Price

    query := `
        UPDATE cart_items
        SET quantity = $1, subtotal = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3;
    `

    _, err := db.Pool.Exec(context.Background(), query, item.Quantity, item.Subtotal, item.ID)
    if err != nil {
        http.Error(w, "Failed to update cart item", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}

func RemoveCartItem(w http.ResponseWriter, r *http.Request) {
    itemIdStr := chi.URLParam(r, "itemId")
    itemId, err := strconv.Atoi(itemIdStr)
    if err != nil {
        http.Error(w, "Invalid item ID", http.StatusBadRequest)
        return
    }

    query := `DELETE FROM cart_items WHERE id = $1;`

    _, err = db.Pool.Exec(context.Background(), query, itemId)
    if err != nil {
        http.Error(w, "Failed to remove cart item", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}
