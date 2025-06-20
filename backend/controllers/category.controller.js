// controllers/category.controller.js
import Category from '../models/category.model.js';
import mongoose from 'mongoose';

// Get categories by type
export const getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { active = 'true' } = req.query;
    
    // Validate type
    const validTypes = ['menu', 'gallery', 'qa', 'announcement'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid category type' });
    }
    
    const categories = await Category.getByType(type, active === 'true');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// Get all categories (admin only)
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, active } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === 'true';
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get categories with pagination
    const categories = await Category.find(filter)
      .sort({ type: 1, sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');
    
    // Get total count
    const total = await Category.countDocuments(filter);
    
    res.status(200).json({
      categories,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, type, description, color, icon, sortOrder, isDefault } = req.body;
    
    // Validation
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    const validTypes = ['menu', 'gallery', 'qa', 'announcement'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid category type' });
    }
    
    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if slug already exists for this type
    const existingCategory = await Category.findOne({ type, slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this name already exists for this type' });
    }
    
    // If this is set as default, unset other defaults for this type
    if (isDefault) {
      await Category.updateMany(
        { type, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Create new category
    const category = new Category({
      name,
      slug,
      type,
      description,
      color: color || '#6B7280',
      icon,
      sortOrder: sortOrder || 0,
      isDefault: isDefault || false,
      createdBy: req.user.id,
      active: true
    });
    
    await category.save();
    
    // Populate createdBy for response
    await category.populate('createdBy', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating category', 
      error: error.message 
    });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, sortOrder, isDefault, active } = req.body;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // If setting as default, unset other defaults for this type
    if (isDefault && !category.isDefault) {
      await Category.updateMany(
        { type: category.type, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }
    
    // Generate new slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Check if new slug already exists
      const existingCategory = await Category.findOne({ 
        type: category.type, 
        slug, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this name already exists for this type' });
      }
    }
    
    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name || category.name,
        slug,
        description: description !== undefined ? description : category.description,
        color: color || category.color,
        icon: icon !== undefined ? icon : category.icon,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        isDefault: isDefault !== undefined ? isDefault : category.isDefault,
        active: active !== undefined ? active : category.active,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('createdBy', 'username firstName lastName');
    
    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating category', 
      error: error.message 
    });
  }
};

// Delete a category (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category can be deleted
    if (!category.canDelete()) {
      return res.status(400).json({ message: 'Default categories cannot be deleted' });
    }
    
    // Soft delete
    category.active = false;
    category.updatedAt = Date.now();
    await category.save();
    
    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: error.message 
    });
  }
};

// Hard delete a category (admin only)
export const hardDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category can be deleted
    if (!category.canDelete()) {
      return res.status(400).json({ message: 'Default categories cannot be deleted' });
    }
    
    // TODO: Check if category is being used by any items
    // This would require checking menu items, gallery items, etc.
    
    // Hard delete
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Category permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: error.message 
    });
  }
};
