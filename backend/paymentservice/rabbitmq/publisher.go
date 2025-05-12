package rabbitmq

import (
    "encoding/json"
    "log"

    "github.com/streadway/amqp"
)

func PublishOrderCreated(msg OrderCreatedMessage) error {
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

    body, err := json.Marshal(msg)
    if err != nil {
        return err
    }

    err = ch.Publish(
        "",               // default exchange
        "order_created",  // queue name
        false,
        false,
        amqp.Publishing{
            ContentType: "application/json",
            Body:        body,
        },
    )
    if err != nil {
        return err
    }

    log.Printf("✅ Message published to order_created: %+v", msg)
    return nil
}
