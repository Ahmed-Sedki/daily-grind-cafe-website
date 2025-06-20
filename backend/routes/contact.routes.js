// routes/contact.routes.js
import express from 'express';
import {
  getContactMessages,
  getContactMessage,
  submitContactForm,
  updateContactStatus,
  deleteContactMessage,
  getContactStats
} from '../controllers/contact.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// Public routes
router.post('/submit', csrfProtection, submitContactForm);

// Admin-only routes (require authentication and admin role)
router.get('/', [authMiddleware, roleMiddleware(['admin'])], getContactMessages);
router.get('/stats', [authMiddleware, roleMiddleware(['admin'])], getContactStats);
router.get('/:id', [authMiddleware, roleMiddleware(['admin'])], getContactMessage);
router.put('/:id/status', [authMiddleware, roleMiddleware(['admin']), csrfProtection], updateContactStatus);
router.delete('/:id', [authMiddleware, roleMiddleware(['admin']), csrfProtection], deleteContactMessage);

export default router;
