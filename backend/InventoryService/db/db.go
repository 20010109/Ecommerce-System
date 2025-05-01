package db

import (
    "context"
    "log"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
)

var Pool *pgxpool.Pool

func Initialize() {
    databaseURL := "postgres://postgres:password@localhost:5432/inventorydb"
    config, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        log.Fatalf("Unable to parse database URL: %v", err)
    }

    config.MaxConns = 10
    config.MinConns = 2
    config.MaxConnLifetime = time.Hour

    Pool, err = pgxpool.ConnectConfig(context.Background(), config)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v", err)
    }

    log.Println("Database connected.")
}

func Close() {
    if Pool != nil {
        Pool.Close()
        log.Println("Database closed.")
    }
}
