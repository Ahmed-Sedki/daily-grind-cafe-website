// models/contact.model.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 255
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  replied: {
    type: Boolean,
    default: false
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: 1000
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

// Indexes for performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

// Pre-save hook to update timestamp
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
