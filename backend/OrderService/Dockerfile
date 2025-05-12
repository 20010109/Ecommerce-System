# ---------- Stage 1: Build the OrderService ----------
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Install git (needed if you're fetching private/public Go modules)
RUN apk add --no-cache git

# Copy go.mod and go.sum first to leverage caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of your code
COPY . .

# Build the OrderService binary
RUN go build -o OrderService .

# ---------- Stage 2: Run the OrderService ----------
FROM alpine:latest

# Set working directory
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/OrderService .

# Optionally copy .env if you want it baked in (usually better to use env vars)
# COPY .env .

# Expose the port your OrderService listens on
EXPOSE 8100

# Command to run the OrderService binary
CMD ["./OrderService"]
