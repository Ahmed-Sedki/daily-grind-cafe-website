
import api from './api';

const visitorService = {
  getVisitorCount: async () => {
    return api.get('/stats/visitors/count');
  },

  getOnlineUserCount: async () => {
    return api.get('/stats/visitors/online');
  },

  recordVisit: async () => {
    try {
      // Get CSRF token first
      try {
        const csrfResponse = await api.get('/auth/csrf-token');
        if (csrfResponse.data && csrfResponse.data.csrfToken) {
          localStorage.setItem('csrfToken', csrfResponse.data.csrfToken);
        }
      } catch (csrfError) {
        console.warn('Failed to get CSRF token for visitor tracking:', csrfError);
      }

      // Attempt to record the visit
      return await api.post('/stats/visitors/record');
    } catch (error) {
      // If the request is blocked or fails, log it but don't throw
      // This prevents the app from breaking if visitor tracking is blocked
      console.warn('Visitor tracking unavailable:', error);
      return { data: { success: false, blocked: true } };
    }
  }
};

export default visitorService;
