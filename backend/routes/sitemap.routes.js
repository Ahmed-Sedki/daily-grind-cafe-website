// routes/sitemap.routes.js
import express from 'express';
import {
  getAllSitemapItems,
  getHierarchicalSitemap,
  createSitemapItem,
  updateSitemapItem,
  deleteSitemapItem,
  generateXmlSitemap
} from '../controllers/sitemap.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/hierarchy', getHierarchicalSitemap);
router.get('/xml', generateXmlSitemap);

// Admin routes (protected with authentication, CSRF, and role-based access)
router.get('/', [authMiddleware], getAllSitemapItems);
router.post('/', [authMiddleware, roleMiddleware(['admin', 'editor']), csrfProtection], createSitemapItem);
router.put('/:id', [authMiddleware, roleMiddleware(['admin', 'editor']), csrfProtection], updateSitemapItem);
router.delete('/:id', [authMiddleware, roleMiddleware(['admin', 'editor']), csrfProtection], deleteSitemapItem);

export default router;