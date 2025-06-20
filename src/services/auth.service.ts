import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Keep track of CSRF token requests to avoid multiple simultaneous requests
let csrfTokenPromise: Promise<string> | null = null;

const authService = {
  login: async (credentials: LoginCredentials) => {
    console.log('Login Request Credentials:', credentials);

    try {
      // Get CSRF token first
      const csrfToken = await authService.getCsrfToken();

      console.log('Current Headers State:', {
        'Authorization': localStorage.getItem('token') || 'none',
        'X-CSRF-Token': csrfToken
      });

      // Make login request with explicit CSRF token
      const response = await api.post('/auth/login', credentials, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });

      console.log('Login response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Also store user ID for referencing
        localStorage.setItem('userId', response.data.user._id);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);

      // Try direct login as fallback
      console.log('Attempting fallback login method...');
      return authService.directLogin(credentials);
    }
  },

  // Direct login without CSRF for troubleshooting
  directLogin: async (credentials: LoginCredentials) => {
    console.log('Attempting direct login without CSRF...');
    try {
      // Use the special direct-login endpoint that bypasses CSRF
      const response = await api.post('/auth/direct-login', credentials, {
        headers: {
          'Content-Type': 'application/json',
          // No CSRF token
        }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user._id);
      }
      return response.data;
    } catch (directError) {
      console.error('Direct login also failed:', directError);
      throw directError;
    }
  },

  // Emergency admin login without password
  emergencyAdminLogin: async () => {
    console.log('Attempting emergency admin login...');
    try {
      const response = await fetch('http://localhost:5000/api/auth/emergency-admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to perform emergency login');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user._id);
      }

      return data;
    } catch (error) {
      console.error('Emergency admin login failed:', error);
      throw error;
    }
  },

  // Verify admin credentials
  verifyAdminCredentials: async (password: string = 'Admin123!') => {
    console.log('Verifying admin credentials...');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-admin-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify credentials');
      }

      return data;
    } catch (error) {
      console.error('Credential verification failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('userId');
  },

  register: async (credentials: RegisterCredentials) => {
    // Ensure CSRF token is available
    await authService.getCsrfToken();
    return api.post('/auth/register', credentials);
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Improved CSRF token handling with caching and fallback
  getCsrfToken: async (): Promise<string> => {
    // If there's already a CSRF token in localStorage, return it
    const existingToken = localStorage.getItem('csrfToken');
    if (existingToken) {
      console.log('Using existing CSRF token from localStorage:', existingToken);
      return existingToken;
    }

    // If there's already a request in progress, return that promise
    if (csrfTokenPromise) {
      console.log('Using existing CSRF token request promise');
      return csrfTokenPromise;
    }

    console.log('Requesting new CSRF Token');

    // Create a new promise for the token request
    csrfTokenPromise = new Promise(async (resolve, reject) => {
      try {
        // Use fetch directly to avoid circular dependencies with api.ts
        const response = await fetch('http://localhost:5000/api/auth/csrf-token', {
          method: 'GET',
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('CSRF Token Response:', data);

        if (!data || !data.csrfToken) {
          throw new Error("Invalid CSRF token response");
        }

        // Store token in localStorage
        localStorage.setItem('csrfToken', data.csrfToken);
        resolve(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);

        // Use a fallback token in development
        if (process.env.NODE_ENV === 'development') {
          const fallbackToken = 'csrf-fallback-token-' + Date.now();
          console.log('Using fallback CSRF token:', fallbackToken);
          localStorage.setItem('csrfToken', fallbackToken);
          resolve(fallbackToken);
        } else {
          reject(error);
        }
      } finally {
        // Clear the promise so future requests can make a new one
        setTimeout(() => {
          csrfTokenPromise = null;
        }, 100);
      }
    });

    return csrfTokenPromise;
  }
};

export default authService;
