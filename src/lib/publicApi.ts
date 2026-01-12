import axios from 'axios';

/**
 * Public API Instance
 * 
 * This API instance is used for public endpoints that don't require authentication.
 * It does NOT include the Authorization header, making it suitable for:
 * - Intake form submission
 * - Intake status checking
 * - Other public endpoints
 * 
 * For authenticated endpoints, use the default `api` from `api.ts`
 */
const DEFAULT_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle response errors globally (but don't redirect to login for public endpoints)
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // For public endpoints, we don't want to redirect on 401
    // Just return the error as-is
    return Promise.reject(error);
  }
);

export default publicApi;

