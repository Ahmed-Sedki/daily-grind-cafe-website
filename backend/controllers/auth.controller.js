// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with that email or username'
      });
    }

    // Create new user (password will be hashed via the pre-save hook)
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'staff' // Default to staff if role not provided
    });

    await user.save();

    // Don't include password in response
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username } // Allow login with email in username field
      ]
    });

    if (!user) {
      console.log(`Login failed: User not found - ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User found: ${user.username}, ID: ${user._id}`);

    // Check if user is active
    if (!user.active) {
      console.log(`Login failed: Account deactivated - ${username}`);
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    console.log('Verifying password...');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`Login failed: Invalid password for ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Password verified for ${username}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(`Login successful for ${username}`);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user information
export const getCurrentUser = async (req, res) => {
  try {
    // User information is attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message
    });
  }
};