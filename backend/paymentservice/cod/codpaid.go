package cod

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

type CODPayload struct {
	OrderID int `json:"order_id"`
}

func CODPaidHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payload CODPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		now := time.Now()
		_, err := db.Exec(`UPDATE payments SET payment_status = 'paid', payment_provider = 'COD', paid_at = $1, updated_at = $1 WHERE order_id = $2`, now, payload.OrderID)
		if err != nil {
			http.Error(w, "Update failed", http.StatusInternalServerError)
			return
		}

		var paymentID int
		err = db.QueryRow(`SELECT id FROM payments WHERE order_id = $1`, payload.OrderID).Scan(&paymentID)
		if err == nil {
			db.Exec(`INSERT INTO payment_logs (payment_id, status, message) VALUES ($1, 'paid', 'COD payment verified')`, paymentID)
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("COD payment verified"))
	}
}
