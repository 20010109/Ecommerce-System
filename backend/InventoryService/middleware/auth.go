package middleware

import (
    "context"
    "net/http"
)

type contextKey string

const isSellerKey = contextKey("is_seller")

// Dummy middleware for simulation
func IsSellerMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ctx := context.WithValue(r.Context(), isSellerKey, true) // Set to `true` for testing
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func IsSeller(ctx context.Context) bool {
    val := ctx.Value(isSellerKey)
    if isSeller, ok := val.(bool); ok {
        return isSeller
    }
    return false
}
