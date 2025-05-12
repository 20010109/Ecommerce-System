package rabbitmq

import (
	"encoding/json"
	"github.com/streadway/amqp"
)

type Item struct {
	VariantID int `json:"variant_id"`
	Quantity  int `json:"quantity"`
}

type OrderStockMessage struct {
	OrderID int    `json:"order_id"`
	Items   []Item `json:"items"`
}

func PublishOrderToInventoryQueue(message OrderStockMessage) error {
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	_, err = ch.QueueDeclare("order_made_queue", true, false, false, false, nil)
	if err != nil {
		return err
	}

	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return ch.Publish("", "order_made_queue", false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        body,
	})
}
