// controllers/user.controller.js
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, active } = req.query;
        
        // Build filter object
        const filter = {};
        if (active !== undefined) {
            filter.active = active === 'true';
        }
        
        // Calculate how many documents to skip
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get users with pagination, excluding password field
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const total = await User.countDocuments(filter);
        
        res.status(200).json({
            users,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user', 
            error: error.message 
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, firstName, lastName, role, active } = req.body;
        
        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        // Find user
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check for unique username and email if being changed
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }
        
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                username: username || user.username,
                email: email || user.email,
                firstName: firstName !== undefined ? firstName : user.firstName,
                lastName: lastName !== undefined ? lastName : user.lastName,
                role: role || user.role,
                active: active !== undefined ? active : user.active,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');
        
        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user', 
            error: error.message 
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        // Prevent deleting the last admin
        if (req.user.id === id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        
        // Check if it's the last admin
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin user' });
            }
        }
        
        // Delete the user
        await User.findByIdAndDelete(id);
        
        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting user', 
            error: error.message 
        });
    }
};

// Change user password (admin only)
export const changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        
        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        // Validate password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Find user
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update password (will be hashed via pre-save hook)
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating password', 
            error: error.message 
        });
    }
};