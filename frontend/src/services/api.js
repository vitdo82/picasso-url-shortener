import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Shorten a URL
 * @param {string} url - The original URL to shorten
 * @param {string} [shortCode] - Optional custom short code
 * @returns {Promise<Object>} Response with short URL details
 */
export const shortenURL = async (url, shortCode = null) => {
  try {
    const payload = { url }
    if (shortCode) {
      payload.short_code = shortCode
    }

    const response = await api.post('/api/shorten', payload)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to shorten URL',
      details: error.response?.data?.details,
    }
  }
}

/**
 * Get statistics for a short URL
 * @param {string} shortCode - The short code
 * @returns {Promise<Object>} Statistics for the short URL
 */
export const getStats = async (shortCode) => {
  try {
    const response = await api.get(`/api/stats/${shortCode}`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get statistics',
    }
  }
}

export default api

