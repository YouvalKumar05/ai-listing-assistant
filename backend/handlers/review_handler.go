package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/repository"
	"github.com/youval/ai-listing-assistant/backend/services"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
	reviewRepo    *repository.ReviewRepository
	auditRepo     *repository.AuditRepository
	// We might need others for FullReviewData
}

func NewReviewHandler(
	reviewService *services.ReviewService,
	reviewRepo *repository.ReviewRepository,
	auditRepo *repository.AuditRepository,
) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
		reviewRepo:    reviewRepo,
		auditRepo:     auditRepo,
	}
}

// GetReviewQueue handles GET /api/v1/admin/reviews
func (h *ReviewHandler) GetReviewQueue(c *gin.Context) {
	queue, err := h.reviewRepo.GetReviewQueue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch review queue"})
		return
	}

	c.JSON(http.StatusOK, queue)
}

// GetReviewDetails handles GET /api/v1/admin/reviews/:listingId
// For MVP, we can return just the audit history or stub the rest.
func (h *ReviewHandler) GetReviewDetails(c *gin.Context) {
	listingID := c.Param("listingId")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "listingId is required"})
		return
	}

	// MVP: you would aggregate Listing, AI Analysis, Risk Analysis, and Audit Logs here.
	// For now, let's just return what we have or a mock structure if they aren't fully implemented.
	
	auditLogs, err := h.auditRepo.GetAuditLogsByListingID(listingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	// Return a stubbed FullReviewData for now.
	data := models.FullReviewData{
		ReviewHistory: auditLogs,
	}

	c.JSON(http.StatusOK, data)
}

// SubmitDecision handles POST /api/v1/admin/reviews/:listingId/decision
func (h *ReviewHandler) SubmitDecision(c *gin.Context) {
	listingID := c.Param("listingId")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "listingId is required"})
		return
	}

	var req models.DecisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Assuming we extract ReviewerID from JWT token, for MVP we'll pass nil
	resp, err := h.reviewService.ProcessDecision(c.Request.Context(), listingID, nil, req)
	if err != nil {
		// Log the error
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REVIEW_ACTION",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetAuditLog handles GET /api/v1/listings/:listingId/audit-log
func (h *ReviewHandler) GetAuditLog(c *gin.Context) {
	listingID := c.Param("listingId")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "listingId is required"})
		return
	}

	logs, err := h.auditRepo.GetAuditLogsByListingID(listingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}
