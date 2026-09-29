package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/youval/ai-listing-assistant/backend/handlers"
)

// SetupListingRoutes registers listing endpoints.
func SetupListingRoutes(router *gin.Engine, listingHandler *handlers.ListingHandler, analysisHandler *handlers.AnalysisHandler, reviewHandler *handlers.ReviewHandler, staticDir string) {
	v1 := router.Group("/api/v1")
	{
		v1.POST("/listings", listingHandler.CreateListing)
		v1.GET("/listings/:id", listingHandler.GetListing)
		
		v1.POST("/listings/:id/analyze", analysisHandler.AnalyzeListing)
		v1.GET("/listings/:id/analysis", analysisHandler.GetAnalysis)
		
		// Admin Review Routes
		v1.GET("/admin/reviews", reviewHandler.GetReviewQueue)
		v1.GET("/admin/reviews/:listingId", reviewHandler.GetReviewDetails)
		v1.POST("/admin/reviews/:listingId/decision", reviewHandler.SubmitDecision)
		
		// Audit Log
		v1.GET("/listings/:listingId/audit-log", reviewHandler.GetAuditLog)
	}

	// Serve uploaded files statically for the MVP
	router.Static("/api/v1/media", staticDir)
}
