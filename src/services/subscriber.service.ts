// services/subscriber.service.ts
import api from './api';
import authService from './auth.service';

export interface Subscriber {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: 'footer' | 'contact-page' | 'popup' | 'manual';
  ipAddress?: string;
  userAgent?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  lastEmailSent?: string;
  emailsSent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeData {
  email: string;
  source?: 'footer' | 'contact-page' | 'popup' | 'manual';
}

export interface SubscriberStats {
  total: number;
  active: number;
  today: number;
  byStatus: {
    active?: number;
    unsubscribed?: number;
    bounced?: number;
  };
  bySource: {
    footer?: number;
    'contact-page'?: number;
    popup?: number;
    manual?: number;
  };
}

const subscriberService = {
  // Public: Subscribe to newsletter
  subscribe: async (subscribeData: SubscribeData) => {
    try {
      await authService.getCsrfToken();
      return api.post('/subscribers/subscribe', subscribeData);
    } catch (error) {
      console.error('Error in subscribe service:', error);
      throw error;
    }
  },

  // Public: Unsubscribe from newsletter
  unsubscribe: async (email: string) => {
    try {
      await authService.getCsrfToken();
      return api.post('/subscribers/unsubscribe', { email });
    } catch (error) {
      console.error('Error in unsubscribe service:', error);
      throw error;
    }
  },

  // Admin: Get all subscribers
  getSubscribers: async (page = 1, limit = 10, status?: string, search?: string, source?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      if (source && source !== 'all') {
        params.append('source', source);
      }

      if (search) {
        params.append('search', search);
      }

      return api.get(`/subscribers?${params.toString()}`);
    } catch (error) {
      console.error('Error in getSubscribers service:', error);
      throw error;
    }
  },

  // Admin: Update subscriber status
  updateSubscriberStatus: async (id: string, status: string, notes?: string) => {
    try {
      await authService.getCsrfToken();
      return api.put(`/subscribers/${id}/status`, { status, notes });
    } catch (error) {
      console.error('Error in updateSubscriberStatus service:', error);
      throw error;
    }
  },

  // Admin: Delete subscriber
  deleteSubscriber: async (id: string) => {
    try {
      await authService.getCsrfToken();
      return api.delete(`/subscribers/${id}`);
    } catch (error) {
      console.error('Error in deleteSubscriber service:', error);
      throw error;
    }
  },

  // Admin: Get subscriber statistics
  getSubscriberStats: async () => {
    try {
      return api.get('/subscribers/stats');
    } catch (error) {
      console.error('Error in getSubscriberStats service:', error);
      throw error;
    }
  },
};

export default subscriberService;
