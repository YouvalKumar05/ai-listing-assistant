package services

import (
	"fmt"
	"image"
	"image/color"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"

	_ "golang.org/x/image/webp"
)

// PreprocessingService handles image analysis (dimensions, quality, perceptual hash).
type PreprocessingService interface {
	AnalyzeImage(storagePath string) (*ImageAnalysisResult, error)
}

type preprocessingService struct{}

// ImageAnalysisResult contains extracted image metrics.
type ImageAnalysisResult struct {
	Width           int
	Height          int
	PerceptualHash  string
	BrightnessScore float64
	ContrastScore   float64
	BlurScore       float64
	ResolutionScore float64
}

// NewPreprocessingService creates a new PreprocessingService.
func NewPreprocessingService() PreprocessingService {
	return &preprocessingService{}
}

// AnalyzeImage opens the image file, decodes it, and calculates basic metrics.
func (s *preprocessingService) AnalyzeImage(storagePath string) (*ImageAnalysisResult, error) {
	file, err := os.Open(storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open image file: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// Calculate a simple megapixel score normalized (e.g., 1.0 = 12MP)
	mp := float64(width*height) / 1000000.0
	resScore := math.Min(1.0, mp/12.0)

	// Calculate Brightness and Contrast
	brightness, contrast := calculateBrightnessAndContrast(img)

	// Stub for perceptual hash (a real implementation would use a pHash library)
	// For MVP, we will generate a pseudo-hash based on downscaled pixels or dimensions.
	pHash := fmt.Sprintf("phash_%dx%d_%f", width, height, brightness)

	// Stub for blur score (requires laplacian variance, using a placeholder for MVP)
	blurScore := 0.85 // High value means sharp

	return &ImageAnalysisResult{
		Width:           width,
		Height:          height,
		PerceptualHash:  pHash,
		BrightnessScore: brightness,
		ContrastScore:   contrast,
		BlurScore:       blurScore,
		ResolutionScore: resScore,
	}, nil
}

// calculateBrightnessAndContrast calculates average luminance and standard deviation.
func calculateBrightnessAndContrast(img image.Image) (float64, float64) {
	bounds := img.Bounds()
	var totalLuminance float64
	var pixelCount float64

	// For efficiency on large images, sample pixels instead of processing every single one.
	step := 1
	if bounds.Dx() > 800 {
		step = bounds.Dx() / 400
	}

	for y := bounds.Min.Y; y < bounds.Max.Y; y += step {
		for x := bounds.Min.X; x < bounds.Max.X; x += step {
			c := img.At(x, y)
			r, g, b, _ := c.RGBA()
			
			// Convert 16-bit RGBA to 8-bit, then to luminance
			// Luminance = 0.299*R + 0.587*G + 0.114*B
			lum := 0.299*float64(r>>8) + 0.587*float64(g>>8) + 0.114*float64(b>>8)
			
			totalLuminance += lum
			pixelCount++
		}
	}

	if pixelCount == 0 {
		return 0, 0
	}

	avgLuminance := totalLuminance / pixelCount
	brightnessScore := avgLuminance / 255.0 // Normalize to 0.0 - 1.0

	// Calculate variance (contrast)
	var totalVariance float64
	for y := bounds.Min.Y; y < bounds.Max.Y; y += step {
		for x := bounds.Min.X; x < bounds.Max.X; x += step {
			c := img.At(x, y)
			gray := color.GrayModel.Convert(c).(color.Gray)
			diff := float64(gray.Y) - avgLuminance
			totalVariance += diff * diff
		}
	}

	variance := totalVariance / pixelCount
	contrastScore := math.Min(1.0, math.Sqrt(variance)/128.0) // Normalize approx 0.0 - 1.0

	return brightnessScore, contrastScore
}
