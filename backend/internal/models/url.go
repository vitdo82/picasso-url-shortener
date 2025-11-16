package models

import "time"

// URL represents a shortened URL entry in the database
type URL struct {
	ID          int64     `json:"id" db:"id"`
	OriginalURL string    `json:"original_url" db:"original_url"`
	ShortCode   string    `json:"short_code" db:"short_code"`
	ClickCount  int64     `json:"click_count" db:"click_count"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

// ShortenRequest represents the request body for creating a short URL
type ShortenRequest struct {
	URL      string     `json:"url" binding:"required,url"`
	ShortCode *string   `json:"short_code,omitempty" binding:"omitempty,alphanum,min=3,max=20"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// ShortenResponse represents the response after creating a short URL
type ShortenResponse struct {
	ShortCode   string    `json:"short_code"`
	ShortURL    string    `json:"short_url"`
	OriginalURL string    `json:"original_url"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

// StatsResponse represents statistics for a short URL
type StatsResponse struct {
	ShortCode   string    `json:"short_code"`
	OriginalURL string    `json:"original_url"`
	ClickCount  int64     `json:"click_count"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

