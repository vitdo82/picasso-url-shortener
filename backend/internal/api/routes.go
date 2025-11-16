package api

import "github.com/gin-gonic/gin"

// SetupRoutes configures all API routes
func (h *Handler) SetupRoutes(router *gin.Engine) {
	// API routes
	api := router.Group("/api")
	{
		api.POST("/shorten", h.ShortenURL)
		api.GET("/stats/:shortCode", h.GetStats)
	}

	// Redirect route (no /api prefix)
	router.GET("/:shortCode", h.RedirectURL)
}

