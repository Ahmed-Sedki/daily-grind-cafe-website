// routes/qa.routes.js
import express from 'express';
import {
  getQAItems,
  getQACategories,
  getQAItemsByCategory,
  getQAItemBySlug,
  submitQAItem,
  createQAItem,
  updateQAItem,
  deleteQAItem,
  hardDeleteQAItem,
  approveQAItem
} from '../controllers/qa.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getQAItems);
router.get('/categories', getQACategories);
router.get('/category/:category', getQAItemsByCategory);
router.get('/:slug', getQAItemBySlug);
router.post('/submit', csrfProtection, submitQAItem); // Public submission with CSRF protection

// Protected routes (authentication and CSRF required)
router.post('/', [authMiddleware, csrfProtection], createQAItem);
router.put('/:id', [authMiddleware, csrfProtection], updateQAItem);
router.delete('/:id', [authMiddleware, csrfProtection], deleteQAItem);
router.post('/:id/approve', [authMiddleware, csrfProtection], approveQAItem);

// Admin-only routes
router.delete('/:id/permanent', [authMiddleware, roleMiddleware(['admin']), csrfProtection], hardDeleteQAItem);

export default router;