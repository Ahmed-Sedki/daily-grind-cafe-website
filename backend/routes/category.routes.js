// routes/category.routes.js
import express from 'express';
import {
  getCategoriesByType,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  hardDeleteCategory
} from '../controllers/category.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/type/:type', getCategoriesByType);

// Protected routes (authentication required)
router.get('/', [authMiddleware], getAllCategories);
router.post('/', [authMiddleware, csrfProtection], createCategory);
router.put('/:id', [authMiddleware, csrfProtection], updateCategory);
router.delete('/:id', [authMiddleware, csrfProtection], deleteCategory);

// Admin-only routes
router.delete('/:id/permanent', [authMiddleware, roleMiddleware(['admin']), csrfProtection], hardDeleteCategory);

export default router;
