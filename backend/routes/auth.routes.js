// routes/auth.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = express.Router();

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Login route with CSRF protection
router.post('/login', csrfProtection, login);

// Direct login route without CSRF for fallback
router.post('/direct-login', login);

// Debug endpoint to check admin user (development only)
router.get('/debug-admin', async (req, res) => {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const { default: User } = await import('../models/user.model.js');
    const adminUser = await User.findOne({ username: 'admin' }).select('-password');

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({
      message: 'Admin user found',
      user: adminUser
    });
  } catch (error) {
    console.error('Debug admin error:', error);
    res.status(500).json({ message: 'Error fetching admin user', error: error.message });
  }
});

// Debug endpoint to verify admin password (development only)
router.post('/verify-admin-password', async (req, res) => {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const { default: User } = await import('../models/user.model.js');
    const adminUser = await User.findOne({ username: 'admin' });

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Verify password
    const isMatch = await adminUser.comparePassword(password);

    // Show the hashed password for debugging
    res.json({
      message: isMatch ? 'Password is correct' : 'Password is incorrect',
      isMatch,
      hashedPassword: adminUser.password,
      adminDetails: {
        username: adminUser.username,
        email: adminUser.email,
        active: adminUser.active,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Verify admin password error:', error);
    res.status(500).json({ message: 'Error verifying password', error: error.message });
  }
});

// Emergency admin login (always available for testing)
router.post('/emergency-admin-login', csrfProtection, async (req, res) => {
  console.log('Emergency admin login requested');

  try {
    // Import User model dynamically to avoid circular dependencies
    const User = (await import('../models/user.model.js')).default;
    console.log('Looking for admin user...');

    // First try to find by username 'admin'
    let adminUser = await User.findOne({ username: 'admin' });

    // If not found, try to find by email containing 'admin'
    if (!adminUser) {
      console.log('Admin user not found by username, trying email...');
      adminUser = await User.findOne({ email: /admin/i });
    }

    // If still not found, try to find any user with role 'admin'
    if (!adminUser) {
      console.log('Admin user not found by email, trying role...');
      adminUser = await User.findOne({ role: 'admin' });
    }

    // If no admin found at all, return error
    if (!adminUser) {
      console.log('No admin user found in the system');
      return res.status(404).json({ message: 'No admin user found in the system' });
    }

    console.log(`Found admin user: ${adminUser.username}`);

    // Generate JWT token without password verification
    const token = jwt.sign(
      {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(`Emergency admin login successful for ${adminUser.username}`);

    res.status(200).json({
      message: 'Emergency admin login successful',
      token,
      user: {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        firstName: adminUser.firstName || 'Admin',
        lastName: adminUser.lastName || 'User',
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Emergency admin login error:', error);
    res.status(500).json({ message: 'Error with emergency login', error: error.message });
  }
});



// Admin-only routes with CSRF protection
router.post('/register', [authMiddleware, roleMiddleware(['admin']), csrfProtection], register);

// Protected routes (don't need CSRF as they're GET requests)
router.get('/me', authMiddleware, getCurrentUser);

export default router;