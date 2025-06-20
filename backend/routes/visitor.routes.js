// routes/visitor.routes.js (updated with optional CSRF protection)
import express from 'express';
import { getVisitorCount, recordVisit, getOnlineUserCount } from '../controllers/visitor.controller.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Get total visitor count
router.get('/count', getVisitorCount);

// Get current online user count
router.get('/online', getOnlineUserCount);

// Create a middleware to make CSRF optional based on environment
const optionalCsrf = (req, res, next) => {
  // Skip CSRF in development mode for easier testing
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_CSRF === 'true') {
    console.log('CSRF protection skipped for visitor tracking in development mode');
    return next();
  }

  // Apply CSRF protection in production
  return csrfProtection(req, res, next);
};

// Record a new visit - with optional CSRF protection
router.post('/record', optionalCsrf, recordVisit);

export default router;