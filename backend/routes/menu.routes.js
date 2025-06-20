// routes/menu.routes.js
import express from 'express';
import {
  getMenuItems,
  getMenuCategories,
  getMenuItemsByCategory,
  getMenuItemBySlug,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  hardDeleteMenuItem,
  getFeaturedMenuItems,
  getSeasonalMenuItems
} from '../controllers/menu.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getMenuItems);
router.get('/categories', getMenuCategories);
router.get('/category/:category', getMenuItemsByCategory);
router.get('/featured', getFeaturedMenuItems);
router.get('/seasonal', getSeasonalMenuItems);
router.get('/:slug', getMenuItemBySlug);

// Protected routes (authentication and CSRF required)
router.post('/', [authMiddleware, csrfProtection], createMenuItem);
router.put('/:id', [authMiddleware, csrfProtection], updateMenuItem);
router.delete('/:id', [authMiddleware, csrfProtection], deleteMenuItem);

// Admin-only routes
router.delete('/:id/permanent', [authMiddleware, roleMiddleware(['admin']), csrfProtection], hardDeleteMenuItem);

export default router;