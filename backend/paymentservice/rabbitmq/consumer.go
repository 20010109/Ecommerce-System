package rabbitmq

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"PaymentService/graph"
	"PaymentService/graph/queue"
    "PaymentService/hasura"
    
	"github.com/streadway/amqp"
)

type OrderCreatedMessage struct {
	OrderID         int     `json:"order_id"`
	UserID          int     `json:"user_id"`
	Amount          float64 `json:"amount"`
	Currency        string  `json:"currency"`
	PaymentMethod   string  `json:"payment_method"`
	PaymentProvider string  `json:"payment_provider"` // may be empty
}

func StartConsumer(resolver *graph.Resolver) {
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Fatalf("❌ Failed to connect to RabbitMQ: %v", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Failed to open a channel: %v", err)
	}

	_, err = ch.QueueDeclare("order_created", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Failed to declare queue: %v", err)
	}

	msgs, err := ch.Consume("order_created", "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Failed to register a consumer: %v", err)
	}

	go func() {
		for d := range msgs {
			var msg OrderCreatedMessage
			if err := json.Unmarshal(d.Body, &msg); err != nil {
				log.Printf("❌ Failed to unmarshal message: %v", err)
				continue
			}

			log.Printf("📩 Received order_created: %+v", msg)

			// Prepare payment data
			now := time.Now()
			status := "pending"
			var paidAt *time.Time = nil

            if msg.PaymentMethod == "online" {
                err := hasura.UpdateOrderPaymentStatus(hasura.OrderUpdateInput{
                    OrderID:    msg.OrderID,
                    Status:     "paid",
                    VerifiedAt: now,
                })
                if err != nil {
                    log.Printf("⚠️ Failed to update Hasura orders table: %v", err)
                }
            }
                       

			var provider *string
			if msg.PaymentProvider != "" {
				provider = &msg.PaymentProvider
			}

			// Use internal struct for queue-based logic
			payment := queue.NewPayment{
				OrderID:         msg.OrderID,
				UserID:          msg.UserID,
				Amount:          msg.Amount,
				Currency:        msg.Currency,
				PaymentMethod:   msg.PaymentMethod,
				PaymentStatus:   status,
				PaidAt:          paidAt,
				PaymentProvider: provider,
			}

			// Save payment record
			if err := resolver.CreatePaymentFromQueue(context.Background(), payment); err != nil {
				log.Printf("❌ Payment creation failed: %v", err)
			} else {
				log.Printf("✅ Payment recorded for order ID %d", msg.OrderID)
			}
		}
	}()
}
