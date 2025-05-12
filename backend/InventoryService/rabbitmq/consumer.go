package rabbitmq

import (
	"InventoryService/hasura_client"
	"encoding/json"
	"log"

	"github.com/streadway/amqp"
)

type OrderItem struct {
	VariantID int `json:"variant_id"`
	Quantity  int `json:"quantity"`
}

type OrderStockPayload struct {
	OrderID int         `json:"order_id"`
	Items   []OrderItem `json:"items"`
}

func StartInventoryConsumer() {
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Fatalf("❌ Failed to connect to RabbitMQ: %v", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Failed to open a channel: %v", err)
	}

	_, err = ch.QueueDeclare(
		"order_made_queue", true, false, false, false, nil,
	)
	if err != nil {
		log.Fatalf("❌ Failed to declare queue: %v", err)
	}

	msgs, err := ch.Consume("order_made_queue", "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Failed to register consumer: %v", err)
	}

	log.Println("📦 InventoryService is listening to order_made_queue...")

	go func() {
		for d := range msgs {
            log.Printf("📨 Received raw message: %s", d.Body) // ✅ Log the raw body
        
            // Parse JSON
            var payload OrderStockPayload
            if err := json.Unmarshal(d.Body, &payload); err != nil {
                log.Printf("❌ Failed to unmarshal payload: %v", err)
                continue
            }
        
            log.Printf("🛒 Order %d has %d items", payload.OrderID, len(payload.Items))
        
            // Loop through items and reduce stock
            for _, item := range payload.Items {
                log.Printf("🔄 Reducing variant %d by %d", item.VariantID, item.Quantity)
        
                // Call Hasura mutation
                err := hasura_client.ReduceStockViaHasura(item.VariantID, item.Quantity)
                if err != nil {
                    log.Printf("❌ Hasura stock update failed: %v", err)
                } else {
                    log.Printf("✅ Stock reduced for variant %d", item.VariantID)
                }
            }
        }
        
	}()
}
