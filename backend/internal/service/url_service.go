package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"url-shortener/backend/internal/db"
	"url-shortener/backend/internal/models"
)

// URLService handles business logic for URL shortening
type URLService struct {
	repo   *db.URLRepository
	baseURL string
}

// NewURLService creates a new URL service
func NewURLService(repo *db.URLRepository) *URLService {
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	return &URLService{
		repo:    repo,
		baseURL: baseURL,
	}
}

// ShortenURL creates a short URL from an original URL
func (s *URLService) ShortenURL(ctx context.Context, req *models.ShortenRequest) (*models.ShortenResponse, error) {
	// Validate and normalize the URL
	originalURL := strings.TrimSpace(req.URL)
	if !strings.HasPrefix(originalURL, "http://") && !strings.HasPrefix(originalURL, "https://") {
		originalURL = "https://" + originalURL
	}

	// Generate or use provided short code
	var shortCode string
	if req.ShortCode != nil && *req.ShortCode != "" {
		shortCode = strings.ToLower(strings.TrimSpace(*req.ShortCode))
		
		// Check if short code already exists
		exists, err := s.repo.ShortCodeExists(ctx, shortCode)
		if err != nil {
			return nil, fmt.Errorf("failed to check short code: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("short code already exists: %s", shortCode)
		}
	} else {
		// Generate a random short code
		var err error
		shortCode, err = s.generateShortCode(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to generate short code: %w", err)
		}
	}

	// Create the short URL in the database
	url, err := s.repo.CreateShortURL(ctx, originalURL, shortCode, req.ExpiresAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create short URL: %w", err)
	}

	// Build the response
	response := &models.ShortenResponse{
		ShortCode:   url.ShortCode,
		ShortURL:    fmt.Sprintf("%s/%s", s.baseURL, url.ShortCode),
		OriginalURL: url.OriginalURL,
		CreatedAt:   url.CreatedAt,
		ExpiresAt:   url.ExpiresAt,
	}

	return response, nil
}

// GetOriginalURL retrieves the original URL for a short code
func (s *URLService) GetOriginalURL(ctx context.Context, shortCode string) (string, error) {
	url, err := s.repo.GetURLByShortCode(ctx, shortCode)
	if err != nil {
		return "", err
	}

	// Increment click count asynchronously (fire and forget)
	go func() {
		_ = s.repo.IncrementClickCount(context.Background(), shortCode)
	}()

	return url.OriginalURL, nil
}

// GetStats retrieves statistics for a short URL
func (s *URLService) GetStats(ctx context.Context, shortCode string) (*models.StatsResponse, error) {
	url, err := s.repo.GetStats(ctx, shortCode)
	if err != nil {
		return nil, err
	}

	return &models.StatsResponse{
		ShortCode:   url.ShortCode,
		OriginalURL: url.OriginalURL,
		ClickCount:  url.ClickCount,
		CreatedAt:   url.CreatedAt,
		ExpiresAt:   url.ExpiresAt,
	}, nil
}

// generateShortCode generates a unique random short code
func (s *URLService) generateShortCode(ctx context.Context) (string, error) {
	length := 6
	if envLength := os.Getenv("SHORT_CODE_LENGTH"); envLength != "" {
		if _, err := fmt.Sscanf(envLength, "%d", &length); err != nil {
			length = 6 // default to 6 if parsing fails
		}
	}

	maxAttempts := 10
	for i := 0; i < maxAttempts; i++ {
		code := s.randomString(length)
		
		exists, err := s.repo.ShortCodeExists(ctx, code)
		if err != nil {
			return "", err
		}
		
		if !exists {
			return code, nil
		}
	}

	return "", fmt.Errorf("failed to generate unique short code after %d attempts", maxAttempts)
}

// randomString generates a random alphanumeric string
func (s *URLService) randomString(length int) string {
	bytes := make([]byte, length)
	rand.Read(bytes)
	
	// Use URL-safe base64 encoding and remove special characters
	encoded := base64.URLEncoding.EncodeToString(bytes)
	encoded = strings.ReplaceAll(encoded, "+", "")
	encoded = strings.ReplaceAll(encoded, "/", "")
	encoded = strings.ReplaceAll(encoded, "=", "")
	
	// Take only the required length
	if len(encoded) > length {
		return encoded[:length]
	}
	
	return encoded
}

