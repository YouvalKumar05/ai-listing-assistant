package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/services"
)

type AnalysisHandler struct {
	analysisService services.AnalysisService
}

func NewAnalysisHandler(as services.AnalysisService) *AnalysisHandler {
	return &AnalysisHandler{analysisService: as}
}

// AnalyzeListing POST /api/v1/listings/:id/analyze
func (h *AnalysisHandler) AnalyzeListing(c *gin.Context) {
	listingID := c.Param("id")

	resp, err := h.analysisService.AnalyzeListing(listingID)
	if err != nil {
		log.Printf("AnalyzeListing error: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.APIError{
			Error: models.ErrorDetail{
				Code:    "AI_SERVICE_ERROR",
				Message: "Failed to run AI analysis",
				Details: map[string]any{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// GetAnalysis GET /api/v1/listings/:id/analysis
func (h *AnalysisHandler) GetAnalysis(c *gin.Context) {
	listingID := c.Param("id")

	resp, err := h.analysisService.GetAnalysis(listingID)
	if err != nil {
		log.Printf("GetAnalysis error: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrDatabaseError,
				Message: "Failed to retrieve analysis",
			},
		})
		return
	}

	if resp == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Analysis not found"})
		return
	}

	c.JSON(http.StatusOK, resp) // Match angular expectation
}
