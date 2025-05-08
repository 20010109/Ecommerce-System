package main

import (
    "encoding/json"
    "log"
)

// Define the OrderMade event structure
type OrderMadeEvent struct {
    OrderID   string `json:"order_id"`
    ProductID int    `json:"product_id"`
    VariantID int    `json:"variant_id"`
    Quantity  int    `json:"quantity"`
}

// Handles an incoming OrderMade event
func handleOrderMade(body []byte) {
    var event OrderMadeEvent
    err := json.Unmarshal(body, &event)
    if err != nil {
        log.Printf("Error decoding message: %v", err)
        return
    }

    log.Printf("Processing OrderMade Event: %+v", event)

    if event.Quantity <= 0 {
        log.Printf("Invalid quantity (%d), skipping.", event.Quantity)
        return
    }

    err = updateInventoryStock(event.VariantID, -event.Quantity)
    if err != nil {
        log.Printf("Failed to update inventory: %v", err)
    } else {
        log.Printf("✅ Inventory successfully updated for VariantID: %d", event.VariantID)
    }
}
