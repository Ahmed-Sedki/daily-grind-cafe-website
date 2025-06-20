
import api from './api';
import authService from './auth.service';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  slug: string;
  image?: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  publishDate: string;
  expiryDate?: string;
  featured: boolean;
}

const announcementService = {
  getAnnouncements: async (page = 1, limit = 10) => {
    return api.get(`/announcements?page=${page}&limit=${limit}`);
  },

  getAnnouncementBySlug: async (slug: string) => {
    return api.get(`/announcements/${slug}`);
  },

  getFeaturedAnnouncements: async () => {
    return api.get('/announcements/featured');
  },

  // Updated method for creating announcement with CSRF token handling
  createAnnouncement: async (data: Omit<Announcement, '_id' | 'author' | 'slug'>) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Creating announcement with data:', data);
      
      return await api.post('/announcements', data);
    } catch (error) {
      console.error('Error in createAnnouncement service:', error);
      throw error;
    }
  },

  // Improved method for updating announcement
  updateAnnouncement: async (id: string, data: Partial<Announcement>) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Updating announcement with data:', data);
      
      return await api.put(`/announcements/${id}`, data);
    } catch (error) {
      console.error('Error in updateAnnouncement service:', error);
      throw error;
    }
  },

  // Improved method for deleting announcement
  deleteAnnouncement: async (id: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Deleting announcement with id:', id);
      
      return await api.delete(`/announcements/${id}`);
    } catch (error) {
      console.error('Error in deleteAnnouncement service:', error);
      throw error;
    }
  }
};

export default announcementService;
