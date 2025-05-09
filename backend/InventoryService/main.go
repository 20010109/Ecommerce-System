package main

import "log"

func main() {
    // Initialize the Hasura GraphQL client
    initHasuraClient()

    // Connect to RabbitMQ
    conn, ch, err := connectRabbitMQ()
    if err != nil {
        log.Fatalf("Failed to connect to RabbitMQ: %v", err)
    }
    defer conn.Close()
    defer ch.Close()

    // Start listening for OrderMade events
    listenForOrderMade(ch)

    log.Println("✅ Inventory Service is running with RabbitMQ & Hasura integration...")
    select {} // Keep the service running
}
