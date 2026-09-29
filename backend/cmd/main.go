package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/youval/ai-listing-assistant/backend/handlers"
	"github.com/youval/ai-listing-assistant/backend/repository"
	"github.com/youval/ai-listing-assistant/backend/routes"
	"github.com/youval/ai-listing-assistant/backend/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://youvalkumar@localhost:5432/ai_listing_assistant?sslmode=disable" // default for local testing
	}
	
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./storage"
	}

	apiPort := os.Getenv("API_PORT")
	if apiPort == "" {
		apiPort = "8080"
	}

	// Initialize Database
	if err := repository.InitDB(dbURL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer repository.CloseDB()

	// Initialize Repositories
	listingRepo := repository.NewListingRepository(repository.DB)
	imageRepo := repository.NewImageRepository(repository.DB)
	docRepo := repository.NewDocumentRepository(repository.DB)
	analysisRepo := repository.NewAnalysisRepository(repository.DB)
	reviewRepo := repository.NewReviewRepository(repository.DB)
	auditRepo := repository.NewAuditRepository(repository.DB)

	// Initialize Services
	fileService := services.NewFileService(uploadDir)
	prepService := services.NewPreprocessingService()
	listingService := services.NewListingService(repository.DB, listingRepo, imageRepo, docRepo, fileService, prepService)
	analysisService := services.NewAnalysisService(repository.DB, listingRepo, imageRepo, docRepo, analysisRepo)
	reviewService := services.NewReviewService(repository.DB, listingRepo, reviewRepo, auditRepo)

	// Initialize Handlers
	listingHandler := handlers.NewListingHandler(listingService)
	analysisHandler := handlers.NewAnalysisHandler(analysisService)
	reviewHandler := handlers.NewReviewHandler(reviewService, reviewRepo, auditRepo)

	// Setup Router
	router := gin.Default()

	// CORS Middleware (simple for local dev)
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health Check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Setup Routes
	routes.SetupListingRoutes(router, listingHandler, analysisHandler, reviewHandler, uploadDir)

	// Start Server
	log.Printf("Starting server on port %s...\n", apiPort)
	if err := router.Run(":" + apiPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
