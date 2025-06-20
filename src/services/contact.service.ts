// services/contact.service.ts
import api from './api';
import authService from './auth.service';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  replied: boolean;
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactStats {
  total: number;
  today: number;
  byStatus: {
    new?: number;
    read?: number;
    replied?: number;
    archived?: number;
  };
}

const contactService = {
  // Public: Submit contact form
  submitContactForm: async (formData: ContactFormData) => {
    try {
      await authService.getCsrfToken();
      return api.post('/contact/submit', formData);
    } catch (error) {
      console.error('Error in submitContactForm service:', error);
      throw error;
    }
  },

  // Admin: Get all contact messages
  getContactMessages: async (page = 1, limit = 10, status?: string, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      if (search) {
        params.append('search', search);
      }

      return api.get(`/contact?${params.toString()}`);
    } catch (error) {
      console.error('Error in getContactMessages service:', error);
      throw error;
    }
  },

  // Admin: Get single contact message
  getContactMessage: async (id: string) => {
    try {
      return api.get(`/contact/${id}`);
    } catch (error) {
      console.error('Error in getContactMessage service:', error);
      throw error;
    }
  },

  // Admin: Update contact message status
  updateContactStatus: async (id: string, status: string, notes?: string) => {
    try {
      await authService.getCsrfToken();
      return api.put(`/contact/${id}/status`, { status, notes });
    } catch (error) {
      console.error('Error in updateContactStatus service:', error);
      throw error;
    }
  },

  // Admin: Delete contact message
  deleteContactMessage: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return api.delete(`/contact/${id}`);
    } catch (error) {
      console.error('Error in deleteContactMessage service:', error);
      throw error;
    }
  },

  // Admin: Get contact statistics
  getContactStats: async () => {
    try {
      return api.get('/contact/stats');
    } catch (error) {
      console.error('Error in getContactStats service:', error);
      throw error;
    }
  },
};

export default contactService;
