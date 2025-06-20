// controllers/announcement.controller.js
import Announcement from '../models/announcement.model.js';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { autoUpdateSitemap } from './sitemap.controller.js';

// Helper function to create a unique slug
const createUniqueSlug = async (title) => {
  // Create basic slug
  let slug = slugify(title, {
    lower: true,      // Convert to lowercase
    strict: true,     // Remove special characters
    locale: 'tr'      // Support for Turkish characters
  });
  
  // Check if slug exists
  let exists = await Announcement.findOne({ slug });
  
  // If exists, append a number
  if (exists) {
    let count = 1;
    let newSlug = slug;
    
    while (exists) {
      newSlug = `${slug}-${count}`;
      exists = await Announcement.findOne({ slug: newSlug });
      count++;
    }
    
    slug = newSlug;
  }
  
  return slug;
};

// Get all announcements with pagination and filtering
export const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, active = true } = req.query;
    
    // Build filter object
    const filter = { active };
    
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';
    
    // Calculate how many documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get announcements with pagination
    const announcements = await Announcement.find(filter)
      .sort({ publishDate: -1 }) // Sort by publishDate in descending order
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName'); // Get author details
    
    // Get total count for pagination
    const total = await Announcement.countDocuments(filter);
    
    res.status(200).json({
      announcements,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching announcements', 
      error: error.message 
    });
  }
};

// Get a single announcement by slug
export const getAnnouncementBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const announcement = await Announcement.findOne({ 
      slug, 
      active: true 
    }).populate('author', 'username firstName lastName');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching announcement', 
      error: error.message 
    });
  }
};

// Create a new announcement
export const createAnnouncement = async (req, res) => {
    try {
      const { title, content, summary, category, image, featured, publishDate, expiryDate } = req.body;
      
      // Validation
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
      
      // Generate slug from title
      const slug = await createUniqueSlug(title);
      
      // Create new announcement
      const announcement = new Announcement({
        title,
        slug,
        content,
        summary,
        category,
        image,
        featured,
        publishDate: publishDate || Date.now(),
        expiryDate,
        author: req.user.id, // From auth middleware
        active: true
      });
      
      // Save to database
      await announcement.save();

      // Auto-update sitemap
      await autoUpdateSitemap('announcement', 'create', {
        id: announcement._id,
        title: announcement.title,
        slug: announcement.slug
      });

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating announcement', 
        error: error.message 
      });
    }
  };
  
  // Update an existing announcement
  export const updateAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, summary, category, image, featured, publishDate, expiryDate, active } = req.body;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid announcement ID' });
      }
      
      // Find announcement
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
      
      // Check if title is changed, then update slug
      let slug = announcement.slug;
      if (title && title !== announcement.title) {
        slug = await createUniqueSlug(title);
      }
      
      // Update announcement
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        id,
        {
          title: title || announcement.title,
          slug,
          content: content || announcement.content,
          summary: summary !== undefined ? summary : announcement.summary,
          category: category || announcement.category,
          image: image !== undefined ? image : announcement.image,
          featured: featured !== undefined ? featured : announcement.featured,
          publishDate: publishDate || announcement.publishDate,
          expiryDate: expiryDate !== undefined ? expiryDate : announcement.expiryDate,
          active: active !== undefined ? active : announcement.active,
          updatedAt: Date.now()
        },
        { new: true } // Return updated document
      ).populate('author', 'username firstName lastName');

      // Auto-update sitemap
      await autoUpdateSitemap('announcement', 'update', {
        id: updatedAnnouncement._id,
        title: updatedAnnouncement.title,
        slug: updatedAnnouncement.slug
      });

      res.status(200).json({
        message: 'Announcement updated successfully',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating announcement', 
        error: error.message 
      });
    }
  };
  
  // Delete an announcement (soft delete)
  export const deleteAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid announcement ID' });
      }
      
      // Soft delete (set active to false)
      const announcement = await Announcement.findByIdAndUpdate(
        id,
        { active: false, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Auto-update sitemap
      await autoUpdateSitemap('announcement', 'delete', {
        id: announcement._id
      });

      res.status(200).json({
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting announcement', 
        error: error.message 
      });
    }
  };
  
  // Get featured announcements
  export const getFeaturedAnnouncements = async (req, res) => {
    try {
      const announcements = await Announcement.find({ featured: true, active: true })
        .sort({ publishDate: -1 })
        .limit(5)
        .populate('author', 'username firstName lastName');
      
      res.status(200).json(announcements);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching featured announcements', 
        error: error.message 
      });
    }
  };
  
  // Hard delete an announcement (admin only)
  export const hardDeleteAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid announcement ID' });
      }
      
      // Permanently remove from database
      const result = await Announcement.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Auto-update sitemap
      await autoUpdateSitemap('announcement', 'delete', {
        id: result._id
      });

      res.status(200).json({
        message: 'Announcement permanently deleted'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting announcement', 
        error: error.message 
      });
    }
  };