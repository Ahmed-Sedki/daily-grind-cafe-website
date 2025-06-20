// controllers/contact.controller.js
import Contact from '../models/contact.model.js';
import mongoose from 'mongoose';

// Get all contact messages (admin only)
export const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Contact.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get messages with pagination
    const messages = await Contact.find(query)
      .populate('repliedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contact messages', 
      error: error.message 
    });
  }
};

// Get single contact message (admin only)
export const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid contact message ID' });
    }

    const message = await Contact.findById(id)
      .populate('repliedBy', 'username firstName lastName');

    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contact message', 
      error: error.message 
    });
  }
};

// Submit contact form (public)
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Name, email, and message are required' 
      });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ 
        message: 'Name must be between 2 and 100 characters' 
      });
    }

    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({ 
        message: 'Message must be between 10 and 2000 characters' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Create contact message
    const contactMessage = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: 'new',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await contactMessage.save();

    res.status(201).json({
      message: 'Thank you for your message! We\'ll get back to you soon.',
      id: contactMessage._id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error submitting contact form', 
      error: error.message 
    });
  }
};

// Update contact message status (admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid contact message ID' });
    }

    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === 'replied') {
      updateData.replied = true;
      updateData.repliedAt = Date.now();
      updateData.repliedBy = req.user.id;
    }

    const message = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('repliedBy', 'username firstName lastName');

    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.status(200).json({
      message: 'Contact message updated successfully',
      contact: message
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating contact message', 
      error: error.message 
    });
  }
};

// Delete contact message (admin only)
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid contact message ID' });
    }

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.status(200).json({
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting contact message', 
      error: error.message 
    });
  }
};

// Get contact statistics (admin only)
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMessages = await Contact.countDocuments();
    const todayMessages = await Contact.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    });

    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      total: totalMessages,
      today: todayMessages,
      byStatus: statusStats
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contact statistics', 
      error: error.message 
    });
  }
};
