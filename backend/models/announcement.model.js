// models/announcement.model.js
import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  summary: { 
    type: String 
  },
  category: { 
    type: String, 
    enum: ['event', 'menu', 'general', 'promotion'],
    default: 'general'
  },
  image: { 
    type: String 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  publishDate: { 
    type: Date, 
    default: Date.now 
  },
  expiryDate: { 
    type: Date 
  },
  author: { 
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
announcementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;