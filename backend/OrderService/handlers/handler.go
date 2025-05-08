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
    var req CreateOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }

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
        "seller_id":        req.SellerID,                 // NEW
        "seller_username":  req.SellerUsername,     // NEW
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

