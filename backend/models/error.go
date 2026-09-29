package models

// APIError represents the standard error response format.
type APIError struct {
	Error ErrorDetail `json:"error"`
}

// ErrorDetail holds the specific error information.
type ErrorDetail struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

const (
	ErrInvalidRequest   = "INVALID_REQUEST"
	ErrInvalidCategory  = "INVALID_CATEGORY"
	ErrInvalidPrice     = "INVALID_PRICE"
	ErrNoImage          = "NO_IMAGE"
	ErrTooManyImages    = "TOO_MANY_IMAGES"
	ErrImageTooLarge    = "IMAGE_TOO_LARGE"
	ErrInvalidImageType = "INVALID_IMAGE_TYPE"
	ErrCorruptedImage   = "CORRUPTED_IMAGE"
	ErrInvalidDocType   = "INVALID_DOCUMENT_TYPE"
	ErrDocTooLarge      = "DOCUMENT_TOO_LARGE"
	ErrStorageError     = "STORAGE_ERROR"
	ErrDatabaseError    = "DATABASE_ERROR"
	ErrPreprocessingErr = "PREPROCESSING_ERROR"
)
