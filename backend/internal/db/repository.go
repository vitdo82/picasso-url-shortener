package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"url-shortener/backend/internal/models"

	"github.com/jackc/pgx/v5"
)

// URLRepository handles database operations for URLs
type URLRepository struct {
	db *DB
}

// NewURLRepository creates a new URL repository
func NewURLRepository(db *DB) *URLRepository {
	return &URLRepository{db: db}
}

// CreateShortURL creates a new short URL entry
func (r *URLRepository) CreateShortURL(ctx context.Context, originalURL, shortCode string, expiresAt *time.Time) (*models.URL, error) {
	query := `
		INSERT INTO urls (original_url, short_code, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, original_url, short_code, click_count, created_at, expires_at
	`

	var url models.URL
	err := r.db.Pool.QueryRow(ctx, query, originalURL, shortCode, expiresAt).Scan(
		&url.ID,
		&url.OriginalURL,
		&url.ShortCode,
		&url.ClickCount,
		&url.CreatedAt,
		&url.ExpiresAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create short URL: %w", err)
	}

	return &url, nil
}

// GetURLByShortCode retrieves a URL by its short code
func (r *URLRepository) GetURLByShortCode(ctx context.Context, shortCode string) (*models.URL, error) {
	query := `
		SELECT id, original_url, short_code, click_count, created_at, expires_at
		FROM urls
		WHERE short_code = $1
	`

	var url models.URL
	err := r.db.Pool.QueryRow(ctx, query, shortCode).Scan(
		&url.ID,
		&url.OriginalURL,
		&url.ShortCode,
		&url.ClickCount,
		&url.CreatedAt,
		&url.ExpiresAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("short code not found: %s", shortCode)
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}

	// Check if URL has expired
	if url.ExpiresAt != nil && url.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("short URL has expired")
	}

	return &url, nil
}

// IncrementClickCount increments the click count for a URL
func (r *URLRepository) IncrementClickCount(ctx context.Context, shortCode string) error {
	query := `
		UPDATE urls
		SET click_count = click_count + 1
		WHERE short_code = $1
	`

	result, err := r.db.Pool.Exec(ctx, query, shortCode)
	if err != nil {
		return fmt.Errorf("failed to increment click count: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("short code not found: %s", shortCode)
	}

	return nil
}

// ShortCodeExists checks if a short code already exists
func (r *URLRepository) ShortCodeExists(ctx context.Context, shortCode string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM urls WHERE short_code = $1)`

	var exists bool
	err := r.db.Pool.QueryRow(ctx, query, shortCode).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check short code existence: %w", err)
	}

	return exists, nil
}

// GetStats retrieves statistics for a short URL
func (r *URLRepository) GetStats(ctx context.Context, shortCode string) (*models.URL, error) {
	return r.GetURLByShortCode(ctx, shortCode)
}

