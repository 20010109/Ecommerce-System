package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt"
	gql "github.com/machinebox/graphql"

	"orderservice/graphql"
	"orderservice/rabbitmq"
)

// Request payload for creating an order
type CreateOrderRequest struct {
	BuyerID         int              `json:"buyer_id"`
	BuyerName       string           `json:"buyer_name"`
	SellerID        int              `json:"seller_id"`
	SellerUsername  string           `json:"seller_username"`
	ShippingMethod  string           `json:"shipping_method"`
	ShippingAddress string           `json:"shipping_address"`
	ContactNumber   string           `json:"contact_number"`
	PaymentMethod   string           `json:"payment_method"`
	OrderItems      []OrderItemInput `json:"order_items"`
}

type OrderItemInput struct {
	ProductID   int     `json:"product_id"`
	VariantID   int     `json:"variant_id"`
	ProductName string  `json:"product_name"`
	VariantName string  `json:"variant_name"`
	Size        string  `json:"size"`
	Color       string  `json:"color"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
	ImageURL    string  `json:"image_url"`
}

// Handles order creation and RabbitMQ stock message publishing
func CreateOrderHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("📨 /create-order endpoint hit")

	userID, err := extractUserIDFromToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if len(req.OrderItems) == 0 {
		http.Error(w, "Order must contain at least one item", http.StatusBadRequest)
		return
	}

	req.BuyerID = userID

	// GraphQL mutation to insert the order via Hasura
	mutation := `
	mutation CreateOrder($order: orders_insert_input!) {
		insert_orders_one(object: $order) {
			id
		}
	}`

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

	reqBody := gql.NewRequest(mutation)
	reqBody.Var("order", orderData)
	reqBody.Header.Set("x-hasura-admin-secret", "password")

	var resp struct {
		InsertOrdersOne struct {
			ID int `json:"id"`
		} `json:"insert_orders_one"`
	}

	if err := graphql.GetClient().Run(context.Background(), reqBody, &resp); err != nil {
		log.Printf("❌ Failed to insert order: %v", err)
		http.Error(w, "Order creation failed", http.StatusInternalServerError)
		return
	}

	// Publish to RabbitMQ for inventory stock update
	var items []rabbitmq.Item
	for _, i := range req.OrderItems {
		items = append(items, rabbitmq.Item{
			VariantID: i.VariantID,
			Quantity:  i.Quantity,
		})
	}

	message := rabbitmq.OrderStockMessage{
		OrderID: resp.InsertOrdersOne.ID,
		Items:   items,
	}

	if err := rabbitmq.PublishOrderToInventoryQueue(message); err != nil {
		log.Printf("❌ Failed to publish to inventory queue: %v", err)
	} else {
		log.Printf("✅ Order %d with %d items published to inventory queue", message.OrderID, len(items))
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "order created",
		"id":     resp.InsertOrdersOne.ID,
	})
}

// Extracts user ID from a Hasura JWT token
func extractUserIDFromToken(authHeader string) (int, error) {
	if authHeader == "" {
		return 0, fmt.Errorf("missing token")
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte("doma-ecommerce-system-jwt-secret-key"), nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid claims")
	}

	hasuraClaims, ok := claims["https://hasura.io/jwt/claims"].(map[string]interface{})
	if !ok {
		return 0, fmt.Errorf("missing hasura claims")
	}

	userIDStr, ok := hasuraClaims["x-hasura-user-id"].(string)
	if !ok {
		return 0, fmt.Errorf("missing user ID")
	}

	id, err := strconv.Atoi(userIDStr)
	if err != nil {
		return 0, fmt.Errorf("invalid user ID format")
	}

	return id, nil
}

// Calculates the total order amount
func calculateTotal(items []OrderItemInput) float64 {
	total := 0.0
	for _, item := range items {
		total += item.Subtotal
	}
	return total
}
