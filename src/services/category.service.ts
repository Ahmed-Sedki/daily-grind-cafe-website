import api from './api';
import authService from './auth.service';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'menu' | 'gallery' | 'qa' | 'announcement';
  description?: string;
  color: string;
  icon?: string;
  sortOrder: number;
  isDefault: boolean;
  active: boolean;
  createdBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  type: 'menu' | 'gallery' | 'qa' | 'announcement';
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
  isDefault?: boolean;
}

const categoryService = {
  // Get categories by type (public)
  getCategoriesByType: async (type: string, activeOnly = true) => {
    return api.get(`/categories/type/${type}?active=${activeOnly}`);
  },

  // Get all categories (admin)
  getAllCategories: async (page = 1, limit = 20, type?: string, active?: boolean) => {
    let url = `/categories?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (active !== undefined) url += `&active=${active}`;
    return api.get(url);
  },

  // Create a new category
  createCategory: async (data: CreateCategoryData) => {
    try {
      await authService.getCsrfToken();
      return await api.post('/categories', data);
    } catch (error) {
      console.error('Error in createCategory service:', error);
      throw error;
    }
  },

  // Update a category
  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    try {
      await authService.getCsrfToken();
      return await api.put(`/categories/${id}`, data);
    } catch (error) {
      console.error('Error in updateCategory service:', error);
      throw error;
    }
  },

  // Delete a category (soft delete)
  deleteCategory: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Error in deleteCategory service:', error);
      throw error;
    }
  },

  // Hard delete a category (admin only)
  hardDeleteCategory: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return await api.delete(`/categories/${id}/permanent`);
    } catch (error) {
      console.error('Error in hardDeleteCategory service:', error);
      throw error;
    }
  }
};

export default categoryService;
