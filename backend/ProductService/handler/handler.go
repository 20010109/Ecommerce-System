package handler

import (
    "bytes"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "ProductService/graphql"
)

const inventoryURL = "http://localhost:8080/inventory/graphql"
// Use localhost:8080 if testing outside Docker

func GetAllProducts(w http.ResponseWriter, r *http.Request) {
    query := graphql.GetAllProductsQuery()
    payload := map[string]string{
        "query": query,
    }
    body, _ := json.Marshal(payload)

    req, err := http.NewRequest("POST", inventoryURL, bytes.NewBuffer(body))
    if err != nil {
        log.Printf("Error creating request: %v", err)
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }
    req.Header.Set("Content-Type", "application/json")

    // Inject service JWT (optional)
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	} else {
		log.Println("No Authorization header found!")
	}
	
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Printf("Error making request: %v", err)
        http.Error(w, "Failed to fetch products", http.StatusServiceUnavailable)
        return
    }
    defer resp.Body.Close()

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(resp.StatusCode)
    _, err = io.Copy(w, resp.Body)
    if err != nil {
        log.Printf("Error streaming response: %v", err)
    }
}
