
import api from './api';
import authService from './auth.service';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  featured: boolean;
  seasonal: boolean;
  dietaryInfo: {
    vegan: boolean;
    glutenFree: boolean;
    vegetarian: boolean;
  };
}

export interface CreateMenuItemData {
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  featured?: boolean;
  seasonal?: boolean;
  dietaryInfo?: {
    vegan: boolean;
    glutenFree: boolean;
    vegetarian: boolean;
  };
}

const menuService = {
  getAllItems: async (page = 1, limit = 10) => {
    return api.get(`/menu?page=${page}&limit=${limit}`);
  },

  getItemsByCategory: async (category: string, page = 1, limit = 10) => {
    return api.get(`/menu/category/${category}?page=${page}&limit=${limit}`);
  },

  getCategories: async () => {
    return api.get('/menu/categories');
  },

  getFeaturedItems: async () => {
    return api.get('/menu/featured');
  },

  getSeasonalItems: async () => {
    return api.get('/menu/seasonal');
  },

  getItemBySlug: async (slug: string) => {
    return api.get(`/menu/${slug}`);
  },

  // New CRUD operations for admin with improved CSRF handling
  createMenuItem: async (menuItemData: CreateMenuItemData) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Creating menu item with data:', menuItemData);
      
      return api.post('/menu', menuItemData);
    } catch (error) {
      console.error('Error in createMenuItem service:', error);
      throw error;
    }
  },

  updateMenuItem: async (id: string, menuItemData: Partial<CreateMenuItemData>) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Updating menu item with data:', menuItemData);
      
      return api.put(`/menu/${id}`, menuItemData);
    } catch (error) {
      console.error('Error in updateMenuItem service:', error);
      throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Deleting menu item with id:', id);
      
      return api.delete(`/menu/${id}`);
    } catch (error) {
      console.error('Error in deleteMenuItem service:', error);
      throw error;
    }
  }
};

export default menuService;
