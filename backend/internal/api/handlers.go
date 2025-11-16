package api

import (
	"net/http"

	"url-shortener/backend/internal/models"
	"url-shortener/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// Handler holds the service dependencies
type Handler struct {
	urlService *service.URLService
}

// NewHandler creates a new API handler
func NewHandler(urlService *service.URLService) *Handler {
	return &Handler{
		urlService: urlService,
	}
}

// ShortenURL handles POST /api/shorten
func (h *Handler) ShortenURL(c *gin.Context) {
	var req models.ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
			"details": err.Error(),
		})
		return
	}

	response, err := h.urlService.ShortenURL(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "short code already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create short URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// RedirectURL handles GET /:shortCode
func (h *Handler) RedirectURL(c *gin.Context) {
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Short code is required",
		})
		return
	}

	originalURL, err := h.urlService.GetOriginalURL(c.Request.Context(), shortCode)
	if err != nil {
		if err.Error() == "short code not found: "+shortCode || 
		   err.Error() == "short URL has expired" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve URL",
			"details": err.Error(),
		})
		return
	}

	c.Redirect(http.StatusMovedPermanently, originalURL)
}

// GetStats handles GET /api/stats/:shortCode
func (h *Handler) GetStats(c *gin.Context) {
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Short code is required",
		})
		return
	}

	stats, err := h.urlService.GetStats(c.Request.Context(), shortCode)
	if err != nil {
		if err.Error() == "short code not found: "+shortCode || 
		   err.Error() == "short URL has expired" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve statistics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}

