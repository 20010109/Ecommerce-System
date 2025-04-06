// routes/routes.go
package routes

import (
	"net/http"

	"doma-auth-go/handlers"

	"github.com/gorilla/mux"
)

// RegisterRoutes sets up the HTTP routes.
func RegisterRoutes() *mux.Router {
	r := mux.NewRouter()

	// Registration endpoint
	r.HandleFunc("/auth/register", handlers.Register).Methods("POST")

	// Login endpoint
	r.HandleFunc("/auth/login", handlers.Login).Methods("POST")

	// Optional: a simple test endpoint
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Auth Service is running!"))
	}).Methods("GET")

	return r
}
