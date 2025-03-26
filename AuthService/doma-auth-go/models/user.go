// models/user.go
package models

import "time"

// User represents the user model.
type User struct {
	ID          int       `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password    string    `json:"-"` // do not expose the password
	IsSeller    bool      `json:"is_seller"`
	DateCreated time.Time `json:"date_created"`
}
