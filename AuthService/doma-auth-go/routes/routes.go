// routes/routes.go
package routes

import (
	"net/http"

	"doma-auth-go/handlers"

	"github.com/gorilla/mux"
)

// RegisterRoutes sets up the routes for the application.
func RegisterRoutes() *mux.Router {
	r := mux.NewRouter()
	authRouter := r.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/register", handlers.Register).Methods("POST")
	authRouter.HandleFunc("/login", handlers.Login).Methods("POST")
	
	// You can add more routes here.
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to DOMA Auth Service"))
	})
	
	return r
}
