// controllers/menu.controller.js
import MenuItem from '../models/menu.model.js';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { autoUpdateSitemap } from './sitemap.controller.js';

// Get all menu items with pagination and filtering
export const getMenuItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, seasonal, active = 'true' } = req.query;
    
    // Build filter object
    const filter = { active: active === 'true' };
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (seasonal !== undefined) filter.seasonal = seasonal === 'true';
    
    // Calculate how many documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get menu items with pagination
    const menuItems = await MenuItem.find(filter)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await MenuItem.countDocuments(filter);
    
    res.status(200).json({
      menuItems,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
};

// Get menu categories
export const getMenuCategories = async (req, res) => {
  try {
    // Get existing categories from database
    const existingCategories = await MenuItem.distinct('category');

    // Define all possible categories from the schema
    const allCategories = ['coffee', 'tea', 'food', 'dessert', 'seasonal'];

    // If no categories exist in database, return all possible categories
    // Otherwise, return existing categories but ensure they're in the correct order
    const categories = existingCategories.length > 0
      ? allCategories.filter(cat => existingCategories.includes(cat))
      : allCategories;

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching menu categories',
      error: error.message
    });
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate how many documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get menu items with pagination
    const menuItems = await MenuItem.find({ category, active: true })
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await MenuItem.countDocuments({ category, active: true });
    
    res.status(200).json({
      menuItems,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching menu items by category', 
      error: error.message 
    });
  }
};

// Get menu item by slug
export const getMenuItemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const menuItem = await MenuItem.findOne({ 
      slug, 
      active: true 
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching menu item', 
      error: error.message 
    });
  }
};

// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const { 
      name, description, category, price, 
      image, dietaryInfo, featured, seasonal 
    } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    // Create slug from name
    let slug = slugify(name, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
    
    // Check if slug exists
    const slugExists = await MenuItem.findOne({ slug });
    
    // If slug exists, append a random string
    if (slugExists) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Create new menu item
    const menuItem = new MenuItem({
      name,
      slug,
      description,
      category: category || 'coffee',
      price: parseFloat(price),
      image,
      dietaryInfo: dietaryInfo || {
        vegan: false,
        glutenFree: false,
        vegetarian: false
      },
      featured: featured === 'true',
      seasonal: seasonal === 'true',
      active: true
    });
    
    // Save to database
    await menuItem.save();

    // Auto-update sitemap
    await autoUpdateSitemap('menu', 'create', {
      id: menuItem._id,
      name: menuItem.name
    });

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating menu item', 
      error: error.message 
    });
  }
};

// Update an existing menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, category, price, 
      image, dietaryInfo, featured, seasonal, active 
    } = req.body;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    
    // Find menu item
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Update slug if name changes
    let slug = menuItem.slug;
    if (name && name !== menuItem.name) {
      slug = slugify(name, {
        lower: true,
        strict: true,
        locale: 'tr'
      });
      
      // Check if slug exists
      const slugExists = await MenuItem.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      
      // If slug exists, append a random string
      if (slugExists) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }
    
    // Update menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id,
      {
        name: name || menuItem.name,
        slug,
        description: description !== undefined ? description : menuItem.description,
        category: category || menuItem.category,
        price: price ? parseFloat(price) : menuItem.price,
        image: image !== undefined ? image : menuItem.image,
        dietaryInfo: dietaryInfo || menuItem.dietaryInfo,
        featured: featured !== undefined ? featured === 'true' : menuItem.featured,
        seasonal: seasonal !== undefined ? seasonal === 'true' : menuItem.seasonal,
        active: active !== undefined ? active === 'true' : menuItem.active,
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Auto-update sitemap
    await autoUpdateSitemap('menu', 'update', {
      id: updatedMenuItem._id,
      name: updatedMenuItem.name
    });

    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating menu item', 
      error: error.message 
    });
  }
};

// Delete a menu item (soft delete)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    
    // Soft delete (set active to false)
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { active: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Auto-update sitemap
    await autoUpdateSitemap('menu', 'delete', {
      id: menuItem._id
    });

    res.status(200).json({
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting menu item', 
      error: error.message 
    });
  }
};

// Hard delete a menu item (admin only)
export const hardDeleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    
    // Permanently remove from database
    const result = await MenuItem.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.status(200).json({
      message: 'Menu item permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting menu item', 
      error: error.message 
    });
  }
};

// Get featured menu items
export const getFeaturedMenuItems = async (req, res) => {
  try {
    const featuredItems = await MenuItem.find({ 
      featured: true, 
      active: true 
    }).sort({ category: 1, name: 1 });
    
    res.status(200).json(featuredItems);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching featured menu items', 
      error: error.message 
    });
  }
};

// Get seasonal menu items
export const getSeasonalMenuItems = async (req, res) => {
  try {
    const seasonalItems = await MenuItem.find({ 
      seasonal: true, 
      active: true 
    }).sort({ category: 1, name: 1 });
    
    res.status(200).json(seasonalItems);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching seasonal menu items', 
      error: error.message 
    });
  }
};