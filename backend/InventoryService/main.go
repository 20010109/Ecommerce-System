package main

import (
	"InventoryService/rabbitmq"
)

func main() {
	go rabbitmq.StartInventoryConsumer()

	select {} // keep service running
}
