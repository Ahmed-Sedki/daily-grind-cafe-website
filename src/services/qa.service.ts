
import api from './api';
import authService from './auth.service';

export interface QAItem {
  _id: string;
  question: string;
  answer?: string;
  category?: string;
  submittedBy?: string;
  approved: boolean;
  isUserSubmitted?: boolean;
  sortOrder?: number;
}

interface QAResponse {
  qaItems: QAItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const qaService = {
  getQAItems: async (page = 1, limit = 10, approved = 'true') => {
    return api.get<QAResponse>(`/qa?page=${page}&limit=${limit}&approved=${approved}`);
  },

  getQAItemById: async (id: string) => {
    return api.get<QAItem>(`/qa/${id}`);
  },

  getQACategories: async () => {
    return api.get<string[]>('/qa/categories');
  },

  getQAItemsByCategory: async (category: string, page = 1, limit = 10) => {
    return api.get<QAResponse>(`/qa/category/${category}?page=${page}&limit=${limit}`);
  },

  submitQuestion: async (question: string, submittedBy?: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();

      return api.post('/qa/submit', { question, submittedBy });
    } catch (error) {
      console.error('Error in submitQuestion service:', error);
      throw error;
    }
  },

  createQAItem: async (data: Partial<QAItem>) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Creating QA item with data:', data);

      return api.post('/qa', data);
    } catch (error) {
      console.error('Error in createQAItem service:', error);
      throw error;
    }
  },

  updateQAItem: async (id: string, data: Partial<QAItem>) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Updating QA item with id:', id);

      return api.put(`/qa/${id}`, data);
    } catch (error) {
      console.error('Error in updateQAItem service:', error);
      throw error;
    }
  },

  deleteQAItem: async (id: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Deleting QA item with id:', id);

      return api.delete(`/qa/${id}`);
    } catch (error) {
      console.error('Error in deleteQAItem service:', error);
      throw error;
    }
  },

  approveQAItem: async (id: string, answer: string) => {
    try {
      // Ensure CSRF token is available
      await authService.getCsrfToken();
      console.log('Approving QA item with id:', id);

      return api.post(`/qa/${id}/approve`, { answer });
    } catch (error) {
      console.error('Error in approveQAItem service:', error);
      throw error;
    }
  }
};

export default qaService;
