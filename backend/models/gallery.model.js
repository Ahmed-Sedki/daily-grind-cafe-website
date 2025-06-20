// models/gallery.model.js
import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  category: {
    type: String,
    required: true
  },
  imagePath: { 
    type: String, 
    required: true 
  },
  thumbnail: { 
    type: String 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  active: { 
    type: Boolean, 
    default: true 
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

// Update the 'updatedAt' field on save
galleryItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

export default GalleryItem;