package db

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
    // Load environment variables from .env
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found or couldn't be loaded. Proceeding with system env variables.")
    }

    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")

    connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
        user, password, host, port, dbName,
    )

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, fmt.Errorf("error opening db: %w", err)
    }

    if pingErr := db.Ping(); pingErr != nil {
        return nil, fmt.Errorf("error connecting to db: %w", pingErr)
    }

    log.Println("Connected to PostgreSQL successfully.")
    return db, nil
}
