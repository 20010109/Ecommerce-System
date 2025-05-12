package graph

import (
	"database/sql"
)

// Resolver serves as dependency injection container.
type Resolver struct {
	DB *sql.DB
}


