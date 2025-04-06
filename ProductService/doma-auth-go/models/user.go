// models/user.go
package models

import "time"

// User represents the user stored in the database.
type User struct {
	ID          int       `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password 	string	  `json:"password,omitempty"`
	DateCreated time.Time `json:"date_created"`
}
