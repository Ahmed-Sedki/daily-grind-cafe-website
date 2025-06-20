import mongoose from 'mongoose';
import Category from './models/category.model.js';

mongoose.connect('mongodb://localhost:27017/daily-grind')
  .then(async () => {
    console.log('Connected to MongoDB');
    const galleryCategories = await Category.find({ type: 'gallery' }).select('name slug');
    console.log('Gallery categories in database:');
    galleryCategories.forEach(cat => console.log(`- ${cat.name}: ${cat.slug}`));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
