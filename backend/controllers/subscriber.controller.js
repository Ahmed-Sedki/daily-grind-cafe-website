// controllers/subscriber.controller.js
import Subscriber from '../models/subscriber.model.js';
import mongoose from 'mongoose';

// Get all subscribers (admin only)
export const getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const source = req.query.source;

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (source && source !== 'all') {
      query.source = source;
    }
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Get total count
    const total = await Subscriber.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get subscribers with pagination
    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      subscribers,
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
      message: 'Error fetching subscribers', 
      error: error.message 
    });
  }
};

// Subscribe to newsletter (public)
export const subscribe = async (req, res) => {
  try {
    const { email, source = 'footer' } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        message: 'Email address is required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(400).json({ 
          message: 'This email is already subscribed to our newsletter' 
        });
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate subscription
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = Date.now();
        existingSubscriber.unsubscribedAt = undefined;
        existingSubscriber.source = source;
        existingSubscriber.ipAddress = req.ip || req.connection.remoteAddress;
        existingSubscriber.userAgent = req.get('User-Agent');
        
        await existingSubscriber.save();

        return res.status(200).json({
          message: 'Welcome back! Your subscription has been reactivated.',
          subscriber: {
            email: existingSubscriber.email,
            status: existingSubscriber.status,
            subscribedAt: existingSubscriber.subscribedAt
          }
        });
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: cleanEmail,
      status: 'active',
      source,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await subscriber.save();

    res.status(201).json({
      message: 'Thank you for subscribing! You\'ll receive updates about our latest news and promotions.',
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'This email is already subscribed' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error subscribing to newsletter', 
      error: error.message 
    });
  }
};

// Unsubscribe from newsletter (public)
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email address is required' 
      });
    }

    const subscriber = await Subscriber.findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!subscriber) {
      return res.status(404).json({ 
        message: 'Email address not found in our subscription list' 
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(400).json({ 
        message: 'This email is already unsubscribed' 
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({
      message: 'You have been successfully unsubscribed from our newsletter.'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error unsubscribing from newsletter', 
      error: error.message 
    });
  }
};

// Update subscriber status (admin only)
export const updateSubscriberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subscriber ID' });
    }

    const validStatuses = ['active', 'unsubscribed', 'bounced'];
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

    if (status === 'unsubscribed') {
      updateData.unsubscribedAt = Date.now();
    } else if (status === 'active') {
      updateData.unsubscribedAt = undefined;
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.status(200).json({
      message: 'Subscriber updated successfully',
      subscriber
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating subscriber', 
      error: error.message 
    });
  }
};

// Delete subscriber (admin only)
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subscriber ID' });
    }

    const subscriber = await Subscriber.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.status(200).json({
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting subscriber', 
      error: error.message 
    });
  }
};

// Get subscriber statistics (admin only)
export const getSubscriberStats = async (req, res) => {
  try {
    const stats = await Subscriber.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = await Subscriber.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubscribers = await Subscriber.countDocuments();
    const activeSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const todaySubscribers = await Subscriber.countDocuments({
      subscribedAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    });

    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    const sourceStatsObj = {};
    sourceStats.forEach(stat => {
      sourceStatsObj[stat._id] = stat.count;
    });

    res.status(200).json({
      total: totalSubscribers,
      active: activeSubscribers,
      today: todaySubscribers,
      byStatus: statusStats,
      bySource: sourceStatsObj
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching subscriber statistics', 
      error: error.message 
    });
  }
};
