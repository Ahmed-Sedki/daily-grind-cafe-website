
import axios from 'axios';

// Determine the API base URL based on environment
const getBaseUrl = () => {
  // In production, use relative URL to avoid CORS issues
  if (import.meta.env.PROD) {
    return '/api';
  }

  // In development, use the environment variable if available
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Default fallback
  return 'http://localhost:5000/api';
};

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CSRF cookies
});

// Request interceptor to add token and CSRF token to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add token to headers if available
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Debug logging
    console.log('Request to:', config.url);
    console.log('Request headers:', config.headers);
    console.log('Request withCredentials setting:', config.withCredentials);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network errors might be due to ad blockers or CORS issues
    if (error.message === 'Network Error') {
      console.warn('Network error occurred. This might be due to CORS, ad blockers, or connectivity issues.');
      // Don't redirect or clear tokens for network errors
      return Promise.reject(error);
    }

    // If we get a 401 error, clear the token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('csrfToken');
      window.location.href = '/login';
    }

    // Handle 403 errors
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
