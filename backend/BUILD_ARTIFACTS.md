# Build Artifacts Explained

## What are `migrate` and `server` files?

The `migrate` and `server` files in the `backend/` directory are **compiled Go binaries** (executables), not source code files.

### How They Were Created

When you run:
```bash
go build ./cmd/migrate
go build ./cmd/server
```

Go compiles the source code and creates executable binaries:
- `backend/migrate` - Compiled migration tool
- `backend/server` - Compiled server application

### Source Code Location

The actual source code is in:
- `backend/cmd/migrate/main.go` - Source code for migration tool
- `backend/cmd/server/main.go` - Source code for server application

### What They Do

**`migrate` binary:**
- Runs database migrations
- Connects to PostgreSQL
- Executes SQL files from `backend/migrations/`
- Equivalent to: `go run cmd/migrate/main.go`

**`server` binary:**
- Starts the HTTP API server
- Handles URL shortening requests
- Equivalent to: `go run cmd/server/main.go`

### Running the Applications

You have two options:

**Option 1: Run from source (recommended for development)**
```bash
# Run migration tool
go run cmd/migrate/main.go

# Run server
go run cmd/server/main.go
```

**Option 2: Build and run binaries**
```bash
# Build binaries
go build ./cmd/migrate
go build ./cmd/server

# Run binaries
./migrate
./server
```

### Should You Commit These Files?

**No!** These are build artifacts and should be in `.gitignore` because:
- They're platform-specific (different for macOS, Linux, Windows)
- They can be regenerated from source code
- They bloat the repository
- They're not needed for other developers

### File Types

- **Source files**: `.go` files (text files, human-readable)
- **Binary files**: `migrate`, `server` (compiled executables, machine code)

You can verify they're binaries:
```bash
file migrate server
# Output: Mach-O 64-bit executable arm64 (on macOS)
```

### Cleaning Up

To remove compiled binaries:
```bash
rm backend/migrate backend/server
```

Or use Go's clean command:
```bash
go clean ./cmd/migrate ./cmd/server
```

### Summary

- `migrate` and `server` = Compiled executables (binaries)
- `cmd/migrate/main.go` and `cmd/server/main.go` = Source code
- Binaries are created by `go build`
- Don't commit binaries to git
- Use `go run` for development, `go build` for production

