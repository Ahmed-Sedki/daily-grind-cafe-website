// controllers/gallery.controller.js
import GalleryItem from '../models/gallery.model.js';
import Category from '../models/category.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all gallery items with pagination and filtering
export const getGalleryItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, active = 'true' } = req.query;
    
    // Build filter object
    const filter = { active: active === 'true' };
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Calculate how many documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get gallery items with pagination
    const galleryItems = await GalleryItem.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 }) // Sort by sortOrder, then by date
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'username firstName lastName');
    
    // Get total count for pagination
    const total = await GalleryItem.countDocuments(filter);
    
    res.status(200).json({
      galleryItems,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching gallery items', 
      error: error.message 
    });
  }
};

// Get gallery categories
export const getGalleryCategories = async (req, res) => {
  try {
    const categories = await GalleryItem.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching gallery categories', 
      error: error.message 
    });
  }
};

// Get gallery items by category
export const getGalleryItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate how many documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get gallery items with pagination
    const galleryItems = await GalleryItem.find({ category, active: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'username firstName lastName');
    
    // Get total count for pagination
    const total = await GalleryItem.countDocuments({ category, active: true });
    
    res.status(200).json({
      galleryItems,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching gallery items by category', 
      error: error.message 
    });
  }
};

// Get a single gallery item by ID
export const getGalleryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid gallery item ID' });
    }
    
    const galleryItem = await GalleryItem.findOne({ 
      _id: id, 
      active: true 
    }).populate('uploadedBy', 'username firstName lastName');
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    res.status(200).json(galleryItem);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching gallery item', 
      error: error.message 
    });
  }
};

// Create a new gallery item
export const createGalleryItem = async (req, res) => {
    try {
      const { title, description, category, featured, sortOrder } = req.body;

      // Validation
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      if (!category) {
        return res.status(400).json({ message: 'Category is required' });
      }

      // Validate category exists and is a gallery category
      const categoryDoc = await Category.findOne({
        slug: category,
        type: 'gallery',
        active: true
      });

      if (!categoryDoc) {
        return res.status(400).json({ message: 'Invalid gallery category' });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }
      
      // Get image path
      const imagePath = `/uploads/gallery/${req.file.filename}`;
      
      // Create thumbnail path if available
      let thumbnail = null;
      if (req.thumbnail) {
        thumbnail = `/uploads/gallery/thumbnails/${req.thumbnail.filename}`;
      }
      
      // Create new gallery item
      const galleryItem = new GalleryItem({
        title,
        description,
        category,
        imagePath,
        thumbnail,
        featured: featured === 'true',
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        uploadedBy: req.user.id, // From auth middleware
        active: true
      });
      
      // Save to database
      await galleryItem.save();
      
      res.status(201).json({
        message: 'Gallery item created successfully',
        galleryItem
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating gallery item', 
        error: error.message 
      });
    }
  };
  
  // Update an existing gallery item
  export const updateGalleryItem = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, featured, sortOrder, active } = req.body;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid gallery item ID' });
      }
      
      // Find gallery item
      const galleryItem = await GalleryItem.findById(id);
      
      if (!galleryItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }

      // Validate category if provided
      if (category && category !== galleryItem.category) {
        const categoryDoc = await Category.findOne({
          slug: category,
          type: 'gallery',
          active: true
        });

        if (!categoryDoc) {
          return res.status(400).json({ message: 'Invalid gallery category' });
        }
      }

      // Prepare update object
      const updateData = {
        title: title || galleryItem.title,
        description: description !== undefined ? description : galleryItem.description,
        category: category || galleryItem.category,
        featured: featured !== undefined ? featured === 'true' : galleryItem.featured,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : galleryItem.sortOrder,
        active: active !== undefined ? active === 'true' : galleryItem.active,
        updatedAt: Date.now()
      };
      
      // If a new image was uploaded, update the image path
      if (req.file) {
        // Delete old image file
        const oldImagePath = path.join(__dirname, '..', 'public', galleryItem.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        
        // Set new image path
        updateData.imagePath = `/uploads/gallery/${req.file.filename}`;
      }
      
      // If a new thumbnail was created, update the thumbnail path
      if (req.thumbnail) {
        // Delete old thumbnail file if it exists
        if (galleryItem.thumbnail) {
          const oldThumbnailPath = path.join(__dirname, '..', 'public', galleryItem.thumbnail);
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        }
        
        // Set new thumbnail path
        updateData.thumbnail = `/uploads/gallery/thumbnails/${req.thumbnail.filename}`;
      }
      
      // Update gallery item
      const updatedGalleryItem = await GalleryItem.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // Return updated document
      ).populate('uploadedBy', 'username firstName lastName');
      
      res.status(200).json({
        message: 'Gallery item updated successfully',
        galleryItem: updatedGalleryItem
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating gallery item', 
        error: error.message 
      });
    }
  };
  
  // Delete a gallery item (soft delete)
  export const deleteGalleryItem = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid gallery item ID' });
      }
      
      // Soft delete (set active to false)
      const galleryItem = await GalleryItem.findByIdAndUpdate(
        id,
        { active: false, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!galleryItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      res.status(200).json({
        message: 'Gallery item deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting gallery item', 
        error: error.message 
      });
    }
  };
  
  // Hard delete a gallery item (admin only)
  export const hardDeleteGalleryItem = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate object ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid gallery item ID' });
      }
      
      // Get gallery item to access file paths
      const galleryItem = await GalleryItem.findById(id);
      
      if (!galleryItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      // Delete image file from filesystem
      if (galleryItem.imagePath) {
        const imagePath = path.join(__dirname, '..', 'public', galleryItem.imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete thumbnail file if it exists
      if (galleryItem.thumbnail) {
        const thumbnailPath = path.join(__dirname, '..', 'public', galleryItem.thumbnail);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      
      // Remove from database
      await GalleryItem.findByIdAndDelete(id);
      
      res.status(200).json({
        message: 'Gallery item permanently deleted'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting gallery item', 
        error: error.message 
      });
    }
  };
  
  // Get featured gallery items
  export const getFeaturedGalleryItems = async (req, res) => {
    try {
      const featuredItems = await GalleryItem.find({ featured: true, active: true })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(10)
        .populate('uploadedBy', 'username firstName lastName');
      
      res.status(200).json(featuredItems);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching featured gallery items', 
        error: error.message 
      });
    }
  };