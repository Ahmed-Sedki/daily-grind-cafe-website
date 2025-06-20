// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer'
  },
  firstName: { type: String },
  lastName: { type: String },
  profileImage: { type: String },
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

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
   //we use a regular function (not arrow function) to maintain the proper this context.
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
userSchema.index({ role: 1, active: 1 });

const User = mongoose.model('User', userSchema);

export default User;