package hasura

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
	"io"
	"log"
)

type OrderUpdateInput struct {
	OrderID    int
	Status     string
	VerifiedAt time.Time
}

func UpdateOrderPaymentStatus(input OrderUpdateInput) error {
	endpoint := os.Getenv("HASURA_GRAPHQL_ENDPOINT")
	secret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")

	if endpoint == "" || secret == "" {
		return fmt.Errorf("missing HASURA env vars")
	}

	query := `
	mutation UpdateOrderStatus($id: Int!, $status: String!, $verifiedAt: timestamp!) {
		update_orders_by_pk(
		  pk_columns: { id: $id },
		  _set: {
			payment_status: $status,
			payment_verified_at: $verifiedAt
		  }
		) {
		  id
		  payment_status
		  payment_verified_at
		}
	  }`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"id":         input.OrderID,
			"status":     input.Status,
			"verifiedAt": input.VerifiedAt.Format(time.RFC3339),
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal error: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("request build error: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", secret)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("hasura request failed: %w", err)
	}
	defer resp.Body.Close()
	
	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("📦 Hasura mutation response: %s", string(respBody))
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("hasura returned status %d: %s", resp.StatusCode, string(respBody))
	}	


	return nil
}
