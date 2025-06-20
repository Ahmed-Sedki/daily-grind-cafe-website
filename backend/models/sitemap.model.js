// models/sitemap.model.js
import mongoose from 'mongoose';

const sitemapItemSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true, 
    unique: true 
  },
  title: {
    type: String,
    required: true
  },
  priority: { 
    type: Number, 
    default: 0.5 
  },
  changeFrequency: { 
    type: String, 
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'], 
    default: 'monthly' 
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SitemapItem',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for improved query performance
sitemapItemSchema.index({ url: 1 });
sitemapItemSchema.index({ parent: 1 });

const SitemapItem = mongoose.model('SitemapItem', sitemapItemSchema);

export default SitemapItem;