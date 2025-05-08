package main

import (
    "encoding/json"
    "log"

    "github.com/streadway/amqp"
)

type OrderMadeEvent struct {
    OrderID   string `json:"order_id"`
    ProductID int    `json:"product_id"`
    VariantID int    `json:"variant_id"`
    Quantity  int    `json:"quantity"`
}

func main() {
    conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
    if err != nil {
        log.Fatalf("Failed to connect to RabbitMQ: %v", err)
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        log.Fatalf("Failed to open a channel: %v", err)
    }
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "order_made_queue", // same name as your InventoryService consumer
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        log.Fatalf("Failed to declare queue: %v", err)
    }

    event := OrderMadeEvent{
        OrderID:   "order-test-001",
        ProductID: 45,   // replace with a real product_id
        VariantID: 26,   // replace with a real variant_id
        Quantity:  3,   // test quantity
    }

    body, err := json.Marshal(event)
    if err != nil {
        log.Fatalf("Failed to marshal event: %v", err)
    }

    err = ch.Publish(
        "",         // exchange
        q.Name,     // routing key
        false,
        false,
        amqp.Publishing{
            ContentType: "application/json",
            Body:        body,
        },
    )
    if err != nil {
        log.Fatalf("Failed to publish message: %v", err)
    }

    log.Println("✅ Test OrderMade event published successfully!")
}
