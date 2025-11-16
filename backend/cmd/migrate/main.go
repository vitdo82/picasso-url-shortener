package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"url-shortener/backend/internal/db"

	"github.com/jackc/pgx/v5"
)

func main() {
	// Initialize database connection
	database, err := db.NewDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Read migration file
	// Try multiple possible paths (works from different execution contexts)
	possiblePaths := []string{
		"migrations/001_create_urls_table.sql",                    // From backend/
		filepath.Join("..", "migrations", "001_create_urls_table.sql"), // From backend/cmd/
		filepath.Join("..", "..", "migrations", "001_create_urls_table.sql"), // From backend/cmd/migrate/
		filepath.Join("backend", "migrations", "001_create_urls_table.sql"), // From project root
	}

	var migrationSQL []byte
	var migrationErr error
	for _, path := range possiblePaths {
		migrationSQL, migrationErr = os.ReadFile(path)
		if migrationErr == nil {
			break
		}
	}

	if migrationErr != nil {
		log.Fatalf("Failed to read migration file. Tried paths: %v. Error: %v", possiblePaths, migrationErr)
	}

	// Execute migration
	ctx := context.Background()
	_, err = database.Pool.Exec(ctx, string(migrationSQL))
	if err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	log.Println("Migration completed successfully!")

	// Verify table exists
	var tableName string
	err = database.Pool.QueryRow(ctx, 
		"SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urls'",
	).Scan(&tableName)
	
	if err != nil {
		if err == pgx.ErrNoRows {
			log.Fatal("Migration verification failed: urls table not found")
		}
		log.Fatalf("Failed to verify migration: %v", err)
	}

	fmt.Printf("✓ Verified: %s table exists\n", tableName)
}

