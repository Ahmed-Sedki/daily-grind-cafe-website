// routes/subscriber.routes.js
import express from 'express';
import {
  getSubscribers,
  subscribe,
  unsubscribe,
  updateSubscriberStatus,
  deleteSubscriber,
  getSubscriberStats
} from '../controllers/subscriber.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', csrfProtection, subscribe);
router.post('/unsubscribe', csrfProtection, unsubscribe);

// Admin-only routes (require authentication and admin role)
router.get('/', [authMiddleware, roleMiddleware(['admin'])], getSubscribers);
router.get('/stats', [authMiddleware, roleMiddleware(['admin'])], getSubscriberStats);
router.put('/:id/status', [authMiddleware, roleMiddleware(['admin']), csrfProtection], updateSubscriberStatus);
router.delete('/:id', [authMiddleware, roleMiddleware(['admin']), csrfProtection], deleteSubscriber);

export default router;
