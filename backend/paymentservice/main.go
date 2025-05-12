package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
    "os"
    "github.com/joho/godotenv"

	"PaymentService/graph"
	"PaymentService/rabbitmq"
    "PaymentService/cod"

	_ "github.com/lib/pq"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8004"

func main() {
    err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ No .env file found or failed to load")
	}

	port := defaultPort

    dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("❌ DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("❌ Failed to connect to DB: %v", err)
	}
	defer db.Close()

	resolver := &graph.Resolver{DB: db}
	rabbitmq.StartConsumer(resolver)

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: resolver,
	}))

	corsHandler := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	http.Handle("/", corsHandler(playground.Handler("GraphQL playground", "/query")))
	http.Handle("/query", corsHandler(srv))
    http.HandleFunc("/cod-paid", cod.CODPaidHandler(db))

	// Webhook endpoint from Hasura
	http.HandleFunc("/publish-order-created", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
    
        // Decode Hasura event JSON
        var input struct {
            Event struct {
                Data struct {
                    New struct {
                        ID              int     `json:"id"`
                        BuyerID         int     `json:"buyer_id"`
                        TotalAmount     float64 `json:"total_amount"`
                        PaymentMethod   string  `json:"payment_method"`
                        PaymentProvider string  `json:"payment_provider"`
                    } `json:"new"`
                } `json:"data"`
            } `json:"event"`
        }
    
        if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
            http.Error(w, "Invalid JSON", http.StatusBadRequest)
            return
        }
    
        msg := rabbitmq.OrderCreatedMessage{
            OrderID:         input.Event.Data.New.ID,
            UserID:          input.Event.Data.New.BuyerID,
            Amount:          input.Event.Data.New.TotalAmount,
            Currency:        "PHP",
            PaymentMethod:   input.Event.Data.New.PaymentMethod,
            PaymentProvider: input.Event.Data.New.PaymentProvider,
        }
    
        log.Printf("📨 Received and forwarded order_created: %+v", msg)
    
        if err := rabbitmq.PublishOrderCreated(msg); err != nil {
            log.Printf("❌ Failed to publish order_created: %v", err)
            http.Error(w, "Failed to publish message", http.StatusInternalServerError)
            return
        }
    
        log.Printf("✅ Message published to order_created: %+v", msg)
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("Message published"))
    })

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
