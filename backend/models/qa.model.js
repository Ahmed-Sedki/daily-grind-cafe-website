// models/qa.model.js
import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  answer: { 
    type: String,
    default: ''
    // required: true 
  },
  category: { 
    type: String, 
    enum: ['coffee-basics', 'products', 'events', 'dietary', 'general'],
    default: 'general'
  },
  submittedBy: { 
    type: String // Email or name if submitted by customer
  },
  isUserSubmitted: { 
    type: Boolean, 
    default: false 
  },
  approved: { 
    type: Boolean, 
    default: false 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
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
qaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const QA = mongoose.model('QA', qaSchema);

export default QA;