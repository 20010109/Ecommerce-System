package main

import (
    "log"

    "github.com/streadway/amqp"
)

// Connects to RabbitMQ
func connectRabbitMQ() (*amqp.Connection, *amqp.Channel, error) {
    conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
    if err != nil {
        return nil, nil, err
    }

    ch, err := conn.Channel()
    if err != nil {
        return nil, nil, err
    }

    return conn, ch, nil
}

// Listens to the order_made_queue
func listenForOrderMade(ch *amqp.Channel) {
    q, err := ch.QueueDeclare(
        "order_made_queue", // queue name
        true,               // durable
        false,              // delete when unused
        false,              // exclusive
        false,              // no-wait
        nil,                // arguments
    )
    if err != nil {
        log.Fatalf("Failed to declare queue: %v", err)
    }

    msgs, err := ch.Consume(
        q.Name,
        "",    // consumer tag
        true,  // auto-ack
        false, // exclusive
        false, // no-local
        false, // no-wait
        nil,   // args
    )
    if err != nil {
        log.Fatalf("Failed to register consumer: %v", err)
    }

    go func() {
        for d := range msgs {
            log.Printf("Received a message: %s", d.Body)
            handleOrderMade(d.Body)
        }
    }()
}
