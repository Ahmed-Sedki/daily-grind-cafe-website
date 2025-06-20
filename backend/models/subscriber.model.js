// models/subscriber.model.js
import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 255
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['footer', 'contact-page', 'popup', 'manual'],
    default: 'footer'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  lastEmailSent: {
    type: Date
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
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
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ status: 1, subscribedAt: -1 });
subscriberSchema.index({ createdAt: -1 });

// Pre-save hook to update timestamp
subscriberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;
