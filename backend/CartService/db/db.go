package db

import (
    "context"
    "log"
    "os"

    "github.com/jackc/pgx/v4/pgxpool"
)

var Pool *pgxpool.Pool

func Init() {
    dbUrl := os.Getenv("DB_URL")
    if dbUrl == "" {
        dbUrl = "postgres://postgres:password@localhost:5432/cartdb"
    }

    var err error
    Pool, err = pgxpool.Connect(context.Background(), dbUrl)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }

    log.Println("Connected to database successfully!")
}
