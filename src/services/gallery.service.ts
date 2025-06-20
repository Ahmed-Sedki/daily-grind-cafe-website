
import api from './api';
import authService from './auth.service';

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imagePath: string;
  thumbnail?: string;
  featured: boolean;
  sortOrder?: number;
  uploadedBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

const galleryService = {
  getGalleryItems: async (page = 1, limit = 10) => {
    return api.get(`/gallery?page=${page}&limit=${limit}`);
  },

  getGalleryCategories: async () => {
    return api.get('/gallery/categories');
  },

  getGalleryItemsByCategory: async (category: string, page = 1, limit = 10) => {
    return api.get(`/gallery/category/${category}?page=${page}&limit=${limit}`);
  },

  getFeaturedGalleryItems: async () => {
    return api.get('/gallery/featured');
  },

  getGalleryItemById: async (id: string) => {
    return api.get(`/gallery/${id}`);
  },
  
  // CRUD operations for admin with improved CSRF handling
  createGalleryItem: async (formData: FormData) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Creating gallery item');
      
      return api.post('/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error in createGalleryItem service:', error);
      throw error;
    }
  },

  updateGalleryItem: async (id: string, formData: FormData) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Updating gallery item with id:', id);
      
      return api.put(`/gallery/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error in updateGalleryItem service:', error);
      throw error;
    }
  },

  deleteGalleryItem: async (id: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Deleting gallery item with id:', id);
      
      return api.delete(`/gallery/${id}`);
    } catch (error) {
      console.error('Error in deleteGalleryItem service:', error);
      throw error;
    }
  }
};

export default galleryService;
