// routes/user.routes.js
import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserPassword
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Get all users - GET /api/users
router.get('/', getAllUsers);

// Get user by ID - GET /api/users/:id
router.get('/:id', getUserById);

// Update user - PUT /api/users/:id (with CSRF protection)
router.put('/:id', csrfProtection, updateUser);

// Delete user - DELETE /api/users/:id (with CSRF protection)
router.delete('/:id', csrfProtection, deleteUser);

// Change user password - PUT /api/users/:id/password (with CSRF protection)
router.put('/:id/password', csrfProtection, changeUserPassword);

export default router;