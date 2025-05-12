package hasura_client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

// ReduceStockViaHasura sends a GraphQL mutation to reduce stock quantity by variant ID.
func ReduceStockViaHasura(variantID, quantity int) error {
	endpoint := os.Getenv("HASURA_ENDPOINT")
	secret := os.Getenv("HASURA_SECRET")

	if endpoint == "" || secret == "" {
		return fmt.Errorf("missing HASURA_ENDPOINT or HASURA_SECRET in environment variables")
	}

	query := `
	mutation ReduceStock($id: Int!, $amount: Int!) {
		update_product_variants_by_pk(
			pk_columns: { id: $id },
			_inc: { stock_quantity: $amount }
		) {
			id
		}
	}`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"id":     variantID,
			"amount": -quantity, // Reduce stock
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal GraphQL payload: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", secret)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("hasura request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("📦 Hasura response: %s", string(respBody))

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("hasura responded with status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}
