package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/services"
)

// ListingHandler processes HTTP requests for listings.
type ListingHandler struct {
	listingService services.ListingService
}

// NewListingHandler creates a new ListingHandler.
func NewListingHandler(ls services.ListingService) *ListingHandler {
	return &ListingHandler{listingService: ls}
}

// CreateListing handles POST /api/v1/listings
func (h *ListingHandler) CreateListing(c *gin.Context) {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(50 << 20); err != nil { // 50MB max memory
		c.JSON(http.StatusBadRequest, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrInvalidRequest,
				Message: "Failed to parse multipart form",
			},
		})
		return
	}

	var req models.CreateListingRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrInvalidRequest,
				Message: "Validation failed for request fields",
				Details: map[string]any{"error": err.Error()},
			},
		})
		return
	}

	form, _ := c.MultipartForm()
	images := form.File["images[]"]
	docs := form.File["supporting_documents[]"]
	docTypes := form.Value["document_types[]"]

	if len(images) == 0 {
		c.JSON(http.StatusBadRequest, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrNoImage,
				Message: "At least one product image is required.",
			},
		})
		return
	}

	if len(images) > 5 {
		c.JSON(http.StatusBadRequest, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrTooManyImages,
				Message: "Maximum 5 product images allowed.",
			},
		})
		return
	}

	resp, err := h.listingService.CreateListing(&req, images, docs, docTypes)
	if err != nil {
		log.Printf("CreateListing error: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrStorageError,
				Message: "Failed to create listing",
				Details: map[string]any{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// GetListing handles GET /api/v1/listings/:id
func (h *ListingHandler) GetListing(c *gin.Context) {
	id := c.Param("id")

	resp, err := h.listingService.GetListing(id)
	if err != nil {
		log.Printf("GetListing error: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.APIError{
			Error: models.ErrorDetail{
				Code:    models.ErrDatabaseError,
				Message: "Failed to retrieve listing",
			},
		})
		return
	}

	if resp == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	c.JSON(http.StatusOK, resp)
}
