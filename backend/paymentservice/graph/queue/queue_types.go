package queue

import "time"

type NewPayment struct {
	OrderID         int        `json:"order_id"`
	UserID          int        `json:"user_id"`
	Amount          float64    `json:"amount"`
	Currency        string     `json:"currency"`
	PaymentMethod   string     `json:"payment_method"`
	PaymentStatus   string     `json:"payment_status"`
	PaidAt          *time.Time `json:"paid_at"`           
	PaymentProvider *string    `json:"payment_provider"`  
}
