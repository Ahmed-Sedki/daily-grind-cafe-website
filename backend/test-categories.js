// test-categories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model.js';
import User from './models/user.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for testing...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test categories
const testCategories = async () => {
  try {
    console.log('🧪 Starting Category System Test...\n');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeding first.');
      return;
    }
    console.log('✅ Admin user found:', adminUser.username);

    // Clear existing categories for clean test
    await Category.deleteMany({});
    console.log('🧹 Cleared existing categories');

    // Create test categories
    const testCats = [
      {
        name: 'Coffee',
        slug: 'coffee',
        type: 'menu',
        description: 'Coffee beverages and espresso drinks',
        color: '#8B4513',
        icon: '☕',
        sortOrder: 1,
        isDefault: true,
        createdBy: adminUser._id
      },
      {
        name: 'Tea',
        slug: 'tea',
        type: 'menu',
        description: 'Tea varieties and herbal infusions',
        color: '#228B22',
        icon: '🍵',
        sortOrder: 2,
        isDefault: false,
        createdBy: adminUser._id
      },
      {
        name: 'Interior',
        slug: 'interior',
        type: 'gallery',
        description: 'Café interior and ambiance photos',
        color: '#8B4513',
        icon: '🏠',
        sortOrder: 1,
        isDefault: true,
        createdBy: adminUser._id
      }
    ];

    console.log('\n📝 Creating test categories...');
    for (const catData of testCats) {
      const category = new Category(catData);
      await category.save();
      console.log(`   ✅ Created: ${catData.name} (${catData.type})`);
    }

    // Test queries
    console.log('\n🔍 Testing category queries...');
    
    const menuCategories = await Category.getByType('menu');
    console.log(`   Menu categories: ${menuCategories.length}`);
    menuCategories.forEach(cat => console.log(`     - ${cat.name} (${cat.slug})`));

    const galleryCategories = await Category.getByType('gallery');
    console.log(`   Gallery categories: ${galleryCategories.length}`);
    galleryCategories.forEach(cat => console.log(`     - ${cat.name} (${cat.slug})`));

    const defaultMenu = await Category.getDefault('menu');
    console.log(`   Default menu category: ${defaultMenu?.name || 'None'}`);

    const defaultGallery = await Category.getDefault('gallery');
    console.log(`   Default gallery category: ${defaultGallery?.name || 'None'}`);

    // Test API-like queries
    console.log('\n🌐 Testing API-style queries...');
    const allCategories = await Category.find({}).populate('createdBy', 'username');
    console.log(`   Total categories: ${allCategories.length}`);

    const activeMenuCategories = await Category.find({ type: 'menu', active: true })
      .sort({ sortOrder: 1, name: 1 });
    console.log(`   Active menu categories: ${activeMenuCategories.length}`);

    console.log('\n✅ Category system test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the API endpoints');
    console.log('2. Check the admin interface');
    console.log('3. Verify dropdowns are populated');

  } catch (error) {
    console.error('❌ Error testing categories:', error);
    throw error;
  }
};

// Main function
const runTest = async () => {
  try {
    await connectDB();
    await testCategories();
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the test
runTest();
