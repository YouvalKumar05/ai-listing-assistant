# ---- Build Stage ----
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

# ---- Runtime Stage ----
FROM alpine:3.20

WORKDIR /app

# Copy the binary and create storage dir
COPY --from=builder /app/server .
RUN mkdir -p ./storage

EXPOSE 8080

CMD ["./server"]
