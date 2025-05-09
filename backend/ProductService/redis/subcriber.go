package redis

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

func SubscribeToInventoryEvents() {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379", // change if using Docker
	})

	pubsub := rdb.Subscribe(ctx, "product_created", "product_updated")
	ch := pubsub.Channel()

	for msg := range ch {
		log.Printf("Received event: %s", msg.Payload)
		// You could broadcast this via WebSocket or store in cache
	}
}
