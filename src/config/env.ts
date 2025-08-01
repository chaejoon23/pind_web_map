/**
 * Environment configuration
 * Centralized place for all environment variables
 */

export const env = {
  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  // Backend Server Configuration
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:9001',
} as const;

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // YouTube processing endpoints
  YOUTUBE: {
    PROCESS_WITH_LOGIN: `${env.BACKEND_URL}/api/v1/youtube/process`,
    PROCESS_WITHOUT_LOGIN: `${env.BACKEND_URL}/api/v1/youtube/without-login/process`,
    HISTORY: `${env.BACKEND_URL}/api/v1/youtube/history`,
    PLACES: (videoId: string) => `${env.BACKEND_URL}/api/v1/youtube/places/${videoId}`,
  },
  
  // Authentication endpoints
  AUTH: {
    REGISTER: `${env.BACKEND_URL}/auth/register`,
    LOGIN: `${env.BACKEND_URL}/auth/login`,
    REQUEST_PASSWORD_RESET: `${env.BACKEND_URL}/auth/request-password-reset`,
    RESET_PASSWORD: `${env.BACKEND_URL}/auth/reset-password`,
  },
} as const;