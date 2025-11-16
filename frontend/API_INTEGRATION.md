# Frontend-Backend API Integration

## Overview

The frontend is now fully integrated with the backend API to shorten URLs and display results.

## API Service

**Location:** `src/services/api.js`

### Functions

#### `shortenURL(url, shortCode)`
- **Purpose:** Shorten a URL via the backend API
- **Parameters:**
  - `url` (string, required): The original URL to shorten
  - `shortCode` (string, optional): Custom short code
- **Returns:** Promise with `{ success, data, error }`
- **Endpoint:** `POST /api/shorten`

#### `getStats(shortCode)`
- **Purpose:** Get statistics for a short URL
- **Parameters:**
  - `shortCode` (string, required): The short code
- **Returns:** Promise with `{ success, data, error }`
- **Endpoint:** `GET /api/stats/:shortCode`

## Features Implemented

### ✅ URL Shortening
- Form input for URL
- Validation (required field)
- Loading state during API call
- Error handling with toast notifications
- Success feedback

### ✅ Result Display
- Shows short URL in a readable format
- Displays original URL
- Shows short code
- Shows creation timestamp
- Copy to clipboard functionality
- Open link in new tab

### ✅ User Experience
- Toast notifications for success/error
- Loading indicators
- Disabled states during operations
- Visual feedback for copy action
- Responsive design

## API Configuration

The API base URL is configured in `src/services/api.js`:
- Default: `http://localhost:8080`
- Can be overridden with `VITE_API_URL` environment variable

## Usage Example

```jsx
import { shortenURL } from '@/services/api'

const result = await shortenURL('https://example.com/very/long/url')

if (result.success) {
  console.log('Short URL:', result.data.short_url)
  console.log('Short Code:', result.data.short_code)
} else {
  console.error('Error:', result.error)
}
```

## Response Format

### Success Response
```json
{
  "short_code": "abc123",
  "short_url": "http://localhost:8080/abc123",
  "original_url": "https://example.com/very/long/url",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": null
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Testing

1. Start the backend:
   ```bash
   make run-backend
   ```

2. Start the frontend:
   ```bash
   make run-frontend
   ```

3. Open `http://localhost:5173` and test URL shortening!

## Components Used

- **Card** - Container for the form
- **Input** - URL input field
- **Button** - Submit and action buttons
- **Label** - Form labels
- **Toast** - Notifications
- **Icons** - Copy, Check, ExternalLink from lucide-react

