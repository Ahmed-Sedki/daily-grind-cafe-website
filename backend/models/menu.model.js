// models/menu.model.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const menuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String 
  },
  category: { 
    type: String, 
    enum: ['coffee', 'tea', 'food', 'dessert', 'seasonal'],
    default: 'coffee'
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String 
  },
  dietaryInfo: {
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false }
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  seasonal: { 
    type: Boolean, 
    default: false 
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

// Create slug from name before saving
menuItemSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    // Generate slug from name
    let slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
    
    // Check if the slug already exists
    const slugExists = await this.constructor.findOne({ 
      slug, 
      _id: { $ne: this._id } 
    });
    
    // If slug exists, append a random string
    if (slugExists) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }
    
    this.slug = slug;
  }
  
  this.updatedAt = Date.now();
  next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;