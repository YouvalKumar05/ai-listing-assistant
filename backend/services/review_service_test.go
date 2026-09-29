package services_test

import (
	"context"
	"testing"

	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/services"
)

func TestProcessDecision_ReasonValidation(t *testing.T) {
	// Directly test that actions requiring reasons fail early when reason is missing
	svc := services.NewReviewService(nil, nil, nil, nil)
	ctx := context.Background()

	actionsRequiringReason := []models.ReviewAction{
		models.ActionRequestInformation,
		models.ActionHold,
		models.ActionEscalateAuthentication,
		models.ActionRestrict,
	}

	for _, action := range actionsRequiringReason {
		req := models.DecisionRequest{
			Action: action,
			Reason: "",
		}
		_, err := svc.ProcessDecision(ctx, "listing-test-01", nil, req)
		if err == nil {
			t.Errorf("Expected error when reason is empty for action %s, got nil", action)
		}
		if err != nil && err.Error() != "reason is required for this action" {
			t.Errorf("Expected 'reason is required for this action', got %v", err)
		}
	}
}
