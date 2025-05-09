package main

import (
    "context"
    "log"
    "time"

    "github.com/machinebox/graphql"
)

var client *graphql.Client
const maxRetries = 3

// Initializes the Hasura GraphQL client
func initHasuraClient() {
    client = graphql.NewClient("http://localhost:8002/v1/graphql") // Change URL if needed
}

// Updates stock_quantity using Hasura GraphQL
func updateInventoryStock(variantID int, quantity int) error {
    req := graphql.NewRequest(`
        mutation UpdateStock($variant_id: Int!, $quantity: Int!) {
            update_product_variants(
                where: {id: {_eq: $variant_id}},
                _inc: {stock_quantity: $quantity}
            ) {
                affected_rows
            }
        }
    `)

    req.Var("variant_id", variantID)
    req.Var("quantity", quantity)

    // Optional: add admin secret if required
    req.Header.Set("x-hasura-admin-secret", "password")

    ctx := context.Background()
    var respData map[string]interface{}

    var err error
    for attempt := 1; attempt <= maxRetries; attempt++ {
        err = client.Run(ctx, req, &respData)
        if err == nil {
            log.Printf("Inventory updated via Hasura (attempt %d): %+v", attempt, respData)
            return nil
        }
        log.Printf("Attempt %d: Failed to update inventory: %v", attempt, err)
        time.Sleep(time.Duration(attempt) * time.Second)
    }

    return err
}
