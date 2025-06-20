import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Get the API base URL
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return '/api';
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return 'http://localhost:5000/api';
};

// Create a simple API client
const apiClient = {
  /**
   * Make a GET request
   */
  get: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${getApiUrl()}${endpoint}`, {
      ...config,
      withCredentials: true,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    return response.data;
  },

  /**
   * Make a POST request
   */
  post: async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrfToken');

    const response = await axios.post(`${getApiUrl()}${endpoint}`, data, {
      ...config,
      withCredentials: true,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      }
    });

    return response.data;
  },

  /**
   * Make a PUT request
   */
  put: async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrfToken');

    const response = await axios.put(`${getApiUrl()}${endpoint}`, data, {
      ...config,
      withCredentials: true,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      }
    });

    return response.data;
  },

  /**
   * Make a DELETE request
   */
  delete: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrfToken');

    const response = await axios.delete(`${getApiUrl()}${endpoint}`, {
      ...config,
      withCredentials: true,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      }
    });

    return response.data;
  }
};

export default apiClient;
