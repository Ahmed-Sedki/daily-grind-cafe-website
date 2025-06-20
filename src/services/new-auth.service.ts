import apiClient from './api-client';
import axios from 'axios';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}



// Create a simple auth service
const newAuthService = {
  /**
   * Get CSRF token for secure requests
   */
  getCsrfToken: async (): Promise<string | null> => {
    try {
      console.log('Fetching CSRF token');
      const response = await axios.get('http://localhost:5000/api/auth/csrf-token', {
        withCredentials: true
      });

      if (response.data && response.data.csrfToken) {
        const token = response.data.csrfToken;
        console.log('CSRF token received:', token);
        localStorage.setItem('csrfToken', token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  },
  /**
   * Simple login function that tries multiple approaches
   */
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    console.log('Attempting login with credentials:', { username: credentials.username });

    // Get CSRF token first
    try {
      await newAuthService.getCsrfToken();
    } catch (csrfError) {
      console.warn('Failed to get CSRF token, continuing with login:', csrfError);
    }

    // Try standard login first
    try {
      console.log('Trying standard login at /auth/login');
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', response);

      if (response && response.token) {
        // Store auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('Login successful');
        return response;
      }

      console.warn('Invalid response from server:', response);
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Standard login failed, trying direct login:', error);

      // If standard login fails, try direct login
      try {
        console.log('Trying direct login at /auth/direct-login');
        const directResponse = await apiClient.post('/auth/direct-login', credentials);
        console.log('Direct login response:', directResponse);

        if (directResponse && directResponse.token) {
          // Store auth data
          localStorage.setItem('token', directResponse.token);
          localStorage.setItem('user', JSON.stringify(directResponse.user));

          console.log('Direct login successful');
          return directResponse;
        }

        console.warn('Invalid response from direct login:', directResponse);
        throw new Error('Invalid response from direct login');
      } catch (directError) {
        console.error('All login attempts failed:', directError);
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    }
  },

  /**
   * Emergency admin login (development only)
   */
  emergencyAdminLogin: async (): Promise<{ user: User; token: string }> => {
    try {
      // Get CSRF token first
      try {
        await newAuthService.getCsrfToken();
      } catch (csrfError) {
        console.warn('Failed to get CSRF token for emergency login, continuing anyway:', csrfError);
      }

      console.log('Attempting emergency admin login...');
      const response = await apiClient.post('/auth/emergency-admin-login');
      console.log('Emergency login response:', response);

      if (response && response.token) {
        // Store auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return response;
      }

      throw new Error('Invalid response from emergency login');
    } catch (error) {
      console.error('Emergency login failed:', error);
      throw new Error('Emergency login failed');
    }
  },

  /**
   * Logout function
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('csrfToken');
  },

  /**
   * Get the current user from localStorage
   */
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    }
    return null;
  },

  /**
   * Get the auth token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Check if the user is an admin
   */
  isAdmin: (): boolean => {
    const user = newAuthService.getUser();
    return user?.role === 'admin';
  }
};

export default newAuthService;
