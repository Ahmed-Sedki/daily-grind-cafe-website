// routes/announcement.routes.js (updated with CSRF protection)
import express from 'express';
import {
  getAnnouncements,
  getAnnouncementBySlug,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getFeaturedAnnouncements,
  hardDeleteAnnouncement
} from '../controllers/announcement.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAnnouncements);
router.get('/featured', getFeaturedAnnouncements);
router.get('/:slug', getAnnouncementBySlug);

// Protected routes (authentication and CSRF required)
router.post('/', [authMiddleware, csrfProtection], createAnnouncement);
router.put('/:id', [authMiddleware, csrfProtection], updateAnnouncement);
router.delete('/:id', [authMiddleware, csrfProtection], deleteAnnouncement);

// Admin-only routes
router.delete('/:id/permanent', [authMiddleware, roleMiddleware(['admin']), csrfProtection], hardDeleteAnnouncement);

export default router;