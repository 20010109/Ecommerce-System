package handlers

import (
    "context"
    "encoding/json"
	"log"
    "net/http"
    "orderservice/graphql"

    gql "github.com/machinebox/graphql"
)

type CreateOrderRequest struct {
    BuyerID         int               `json:"buyer_id"`
    BuyerName       string            `json:"buyer_name"`
    SellerID         int              `json:"seller_id"`
    SellerUsername   string           `json:"seller_username"`
    ShippingMethod  string            `json:"shipping_method"`
    ShippingAddress string            `json:"shipping_address"`
    ContactNumber   string            `json:"contact_number"`
    PaymentMethod   string            `json:"payment_method"`
    OrderItems      []OrderItemInput  `json:"order_items"`
}

type OrderItemInput struct {
    ProductID    int     `json:"product_id"`
    VariantID    int     `json:"variant_id"`
    ProductName  string  `json:"product_name"`
    VariantName  string  `json:"variant_name"`
    Size         string  `json:"size"`
    Color        string  `json:"color"`
    Price        float64 `json:"price"`
    Quantity     int     `json:"quantity"`
    Subtotal     float64 `json:"subtotal"`
    ImageURL     string  `json:"image_url"`
}

func CreateOrderHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("/create-order endpoint was hit!")

    // Extract user ID from the token
    userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    var req CreateOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }

    // Use the extracted user ID as the buyer_id
    req.BuyerID = userID

    // Build GraphQL mutation
    mutation := `
    mutation CreateOrder($order: orders_insert_input!) {
      insert_orders_one(object: $order) {
        id
      }
    }`

    // Prepare order data
    orderData := map[string]interface{}{
        "buyer_id":         req.BuyerID,
        "buyer_name":       req.BuyerName,
        "seller_id":        req.SellerID,
        "seller_username":  req.SellerUsername,
        "status":           "pending",
        "total_amount":     calculateTotal(req.OrderItems),
        "payment_method":   req.PaymentMethod,
        "payment_status":   "pending",
        "shipping_method":  req.ShippingMethod,
        "shipping_address": req.ShippingAddress,
        "contact_number":   req.ContactNumber,
        "order_items": map[string]interface{}{
            "data": req.OrderItems,
        },
    }

    // Create GraphQL request
    reqBody := gql.NewRequest(mutation)
    reqBody.Var("order", orderData)
    reqBody.Header.Set("x-hasura-admin-secret", "password")

    // Run the mutation
    if err := graphql.GetClient().Run(context.Background(), reqBody, nil); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte(`{"status":"order created"}`))
}

func extractUserIDFromToken(authHeader string) (int, error) {
    if authHeader == "" {
        return 0, errors.New("missing authorization header")
    }

    // Decode the token (use a library like jwt-go)
    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        // Validate the signing method and return the secret key
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte("your-secret-key"), nil
    })

    if err != nil || !token.Valid {
        return 0, errors.New("invalid token")
    }

    // Extract user ID from token claims
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, errors.New("invalid token claims")
    }

    userID, ok := claims["id"].(float64) // Assuming "id" is the key in the token
    if !ok {
        return 0, errors.New("user ID not found in token")
    }

    return int(userID), nil
}

// Helper function to calculate total
func calculateTotal(items []OrderItemInput) float64 {
    total := 0.0
    for _, item := range items {
        total += item.Subtotal
    }
    return total
}

// UpdateOrderStatusRequest represents the expected JSON payload
type UpdateOrderStatusRequest struct {
    OrderID   int    `json:"order_id"`
    NewStatus string `json:"new_status"`
}

func UpdateOrderStatusHandler(w http.ResponseWriter, r *http.Request) {
    var req UpdateOrderStatusRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }

    // Build GraphQL mutation
    mutation := `
    mutation UpdateOrderStatus($order_id: Int!, $new_status: String!) {
      update_orders_by_pk(pk_columns: {id: $order_id}, _set: {status: $new_status}) {
        id
        status
      }
    }`

    // Prepare GraphQL request
    gqlReq := gql.NewRequest(mutation)
    gqlReq.Var("order_id", req.OrderID)
    gqlReq.Var("new_status", req.NewStatus)
	gqlReq.Header.Set("x-hasura-admin-secret", "password")

    // Run the mutation
    var respData map[string]interface{}
    if err := graphql.GetClient().Run(context.Background(), gqlReq, &respData); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Respond success
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"order updated successfully"}`))
}

// DeleteOrderRequest represents the expected JSON payload
type DeleteOrderRequest struct {
    OrderID int `json:"order_id"`
}

func DeleteOrderHandler(w http.ResponseWriter, r *http.Request) {
    var req DeleteOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }

    // Build GraphQL mutation
    mutation := `
    mutation DeleteOrder($order_id: Int!) {
      delete_orders_by_pk(id: $order_id) {
        id
      }
    }`

    // Prepare GraphQL request
    gqlReq := gql.NewRequest(mutation)
    gqlReq.Var("order_id", req.OrderID)
    gqlReq.Header.Set("x-hasura-admin-secret", "password")

    // Run the mutation
    var respData map[string]interface{}
    if err := graphql.GetClient().Run(context.Background(), gqlReq, &respData); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Respond success
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"order deleted successfully"}`))
}

func GetOrdersHandler(w http.ResponseWriter, r *http.Request) {
    // GraphQL query
    query := `
    query GetOrders {
      orders {
        id
        buyer_id
        buyer_name
        seller_id
        seller_username
        status
        total_amount
        payment_method
        payment_status
        shipping_method
        shipping_address
        contact_number
        created_at
        order_items {
          id
          product_id
          variant_id
          product_name
          variant_name
          size
          color
          price
          quantity
          subtotal
          image_url
        }
      }
    }`

    gqlReq := gql.NewRequest(query)
    gqlReq.Header.Set("x-hasura-admin-secret", "password")

    // Prepare a variable to decode GraphQL response
    var respData map[string]interface{}

    if err := graphql.GetClient().Run(context.Background(), gqlReq, &respData); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respData)
}

func GetOrdersByBuyerHandler(w http.ResponseWriter, r *http.Request) {
    // Extract user ID from the token
    userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // GraphQL query to fetch orders by buyer_id
    query := `
    query GetOrdersByBuyer($buyer_id: Int!) {
      orders(where: { buyer_id: { _eq: $buyer_id } }, order_by: { created_at: desc }) {
        id
        status
        total_amount
      }
    }`

    // Prepare GraphQL request
    gqlReq := gql.NewRequest(query)
    gqlReq.Var("buyer_id", userID)
    gqlReq.Header.Set("x-hasura-admin-secret", "password")

    // Prepare a variable to decode the GraphQL response
    var respData map[string]interface{}

    // Execute the GraphQL query
    if err := graphql.GetClient().Run(context.Background(), gqlReq, &respData); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Respond with the filtered orders
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respData)
}

