-- Create URLs table
CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    click_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

-- Create index on short_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Create index on created_at for potential cleanup queries
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);

