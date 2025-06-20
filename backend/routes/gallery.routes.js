// routes/gallery.routes.js
import express from 'express';
import {
  getGalleryItems,
  getGalleryCategories,
  getGalleryItemsByCategory,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  hardDeleteGalleryItem,
  getFeaturedGalleryItems
} from '../controllers/gallery.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import galleryUpload from '../middleware/upload.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getGalleryItems);
router.get('/categories', getGalleryCategories);
router.get('/category/:category', getGalleryItemsByCategory);
router.get('/featured', getFeaturedGalleryItems);
router.get('/:id', getGalleryItemById);

// Protected routes (authentication and CSRF required)
router.post('/', [authMiddleware, csrfProtection, galleryUpload], createGalleryItem);
router.put('/:id', [authMiddleware, csrfProtection, galleryUpload], updateGalleryItem);
router.delete('/:id', [authMiddleware, csrfProtection], deleteGalleryItem);

// Admin-only routes
router.delete('/:id/permanent', [authMiddleware, roleMiddleware(['admin']), csrfProtection], hardDeleteGalleryItem);

export default router;