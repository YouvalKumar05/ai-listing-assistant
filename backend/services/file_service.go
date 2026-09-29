package services

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// FileService handles file operations like saving, validating, and hashing.
type FileService interface {
	ProcessUploadedFile(fileHeader *multipart.FileHeader, listingID string, isImage bool) (*ProcessedFile, error)
	GetBaseStorageDir() string
}

type fileService struct {
	baseStorageDir string
}

// ProcessedFile contains metadata extracted during file processing.
type ProcessedFile struct {
	OriginalFilename string
	SafeFilename     string
	StoragePath      string
	MimeType         string
	FileSize         int64
	Sha256Hash       string
}

// NewFileService creates a new FileService.
func NewFileService(baseStorageDir string) FileService {
	return &fileService{
		baseStorageDir: baseStorageDir,
	}
}

func (s *fileService) GetBaseStorageDir() string {
	return s.baseStorageDir
}

// ProcessUploadedFile validates, hashes, and saves the file to disk.
func (s *fileService) ProcessUploadedFile(fileHeader *multipart.FileHeader, listingID string, isImage bool) (*ProcessedFile, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	// 1. Validate File Size & MIME type (by reading first 512 bytes)
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("failed to read file for MIME detection: %w", err)
	}
	
	// Reset file pointer
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("failed to seek file: %w", err)
	}

	mimeType := http.DetectContentType(buffer[:n])
	
	if isImage {
		if !strings.HasPrefix(mimeType, "image/") {
			return nil, fmt.Errorf("invalid file type: expected image, got %s", mimeType)
		}
	} else {
		// Documents allow images or pdfs
		if !strings.HasPrefix(mimeType, "image/") && mimeType != "application/pdf" {
			return nil, fmt.Errorf("invalid document type: expected image or pdf, got %s", mimeType)
		}
	}

	// 2. Generate SHA-256 Hash
	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return nil, fmt.Errorf("failed to hash file: %w", err)
	}
	hashString := hex.EncodeToString(hasher.Sum(nil))

	// Reset file pointer again for saving
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("failed to seek file: %w", err)
	}

	// 3. Prepare storage path
	ext := filepath.Ext(fileHeader.Filename)
	safeFilename := uuid.New().String() + ext
	
	// Directory structure: storage/listings/{listingID}/
	dirPath := filepath.Join(s.baseStorageDir, "listings", listingID)
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return nil, fmt.Errorf("failed to create directory: %w", err)
	}
	
	storagePath := filepath.Join(dirPath, safeFilename)

	// 4. Save file to disk
	dst, err := os.Create(storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	return &ProcessedFile{
		OriginalFilename: fileHeader.Filename,
		SafeFilename:     safeFilename,
		StoragePath:      storagePath,
		MimeType:         mimeType,
		FileSize:         fileHeader.Size,
		Sha256Hash:       hashString,
	}, nil
}
