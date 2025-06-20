
import api from './api';
import authService from './auth.service';

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'staff';
  profileImage?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'editor' | 'staff';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'editor' | 'staff';
  active?: boolean;
}

const userService = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10, active?: boolean) => {
    try {
      // Ensure we have a CSRF token before making admin requests
      await authService.getCsrfToken();
      
      let url = `/users?page=${page}&limit=${limit}`;
      if (active !== undefined) {
        url += `&active=${active}`;
      }
      return api.get(url);
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return api.get(`/users/${id}`);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: CreateUserData) => {
    try {
      const csrfToken = await authService.getCsrfToken();
      return api.post('/auth/register', userData);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserData) => {
    try {
      await authService.getCsrfToken();
      return api.put(`/users/${id}`, userData);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },

  // Change user password (admin function)
  changeUserPassword: async (id: string, newPassword: string) => {
    try {
      await authService.getCsrfToken();
      return api.put(`/users/${id}/password`, { newPassword });
    } catch (error) {
      console.error('Error in changeUserPassword:', error);
      throw error;
    }
  }
};

export default userService;
