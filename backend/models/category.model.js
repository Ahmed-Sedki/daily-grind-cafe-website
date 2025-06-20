// models/category.model.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['menu', 'gallery', 'qa', 'announcement'],
    index: true
  },
  description: { 
    type: String,
    maxlength: 200
  },
  color: { 
    type: String,
    default: '#6B7280' // Default gray color
  },
  icon: { 
    type: String // For storing icon class names or emoji
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for type and slug
categorySchema.index({ type: 1, slug: 1 }, { unique: true });

// Index for active categories by type
categorySchema.index({ type: 1, active: 1, sortOrder: 1 });

// Pre-save middleware to generate slug and update timestamp
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to get categories by type
categorySchema.statics.getByType = function(type, activeOnly = true) {
  const filter = { type };
  if (activeOnly) filter.active = true;
  
  return this.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select('name slug description color icon sortOrder isDefault');
};

// Static method to get default category for a type
categorySchema.statics.getDefault = function(type) {
  return this.findOne({ type, isDefault: true, active: true });
};

// Instance method to check if category can be deleted
categorySchema.methods.canDelete = function() {
  return !this.isDefault;
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
