// clear-and-seed-categories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model.js';
import User from './models/user.model.js';

// Load environment variables
dotenv.config();

// All default categories
const allCategories = [
  // Menu categories
  { name: 'Coffee', slug: 'coffee', type: 'menu', description: 'Coffee beverages and espresso drinks', color: '#8B4513', icon: '☕', sortOrder: 1, isDefault: true },
  { name: 'Tea', slug: 'tea', type: 'menu', description: 'Tea varieties and herbal infusions', color: '#228B22', icon: '🍵', sortOrder: 2 },
  { name: 'Food', slug: 'food', type: 'menu', description: 'Main dishes and light meals', color: '#FF6347', icon: '🍽️', sortOrder: 3 },
  { name: 'Dessert', slug: 'dessert', type: 'menu', description: 'Sweet treats and desserts', color: '#FFB6C1', icon: '🧁', sortOrder: 4 },
  { name: 'Seasonal', slug: 'seasonal', type: 'menu', description: 'Limited time seasonal offerings', color: '#FFA500', icon: '🍂', sortOrder: 5 },

  // Gallery categories
  { name: 'Interior', slug: 'interior', type: 'gallery', description: 'Café interior and ambiance photos', color: '#8B4513', icon: '🏠', sortOrder: 1, isDefault: true },
  { name: 'Food Photos', slug: 'food-photos', type: 'gallery', description: 'Food and beverage photography', color: '#FF6347', icon: '📸', sortOrder: 2 },
  { name: 'Drinks', slug: 'drinks', type: 'gallery', description: 'Coffee and beverage photos', color: '#4682B4', icon: '🥤', sortOrder: 3 },
  { name: 'Events', slug: 'events-gallery', type: 'gallery', description: 'Special events and gatherings', color: '#9370DB', icon: '🎉', sortOrder: 4 },
  { name: 'Team', slug: 'team', type: 'gallery', description: 'Staff and team photos', color: '#32CD32', icon: '👥', sortOrder: 5 },

  // Q&A categories
  { name: 'Coffee Basics', slug: 'coffee-basics', type: 'qa', description: 'Questions about coffee and brewing', color: '#8B4513', icon: '☕', sortOrder: 1, isDefault: true },
  { name: 'Products', slug: 'products', type: 'qa', description: 'Questions about our menu items', color: '#FF6347', icon: '🛍️', sortOrder: 2 },
  { name: 'Events', slug: 'events-qa', type: 'qa', description: 'Questions about events and bookings', color: '#9370DB', icon: '📅', sortOrder: 3 },
  { name: 'Dietary', slug: 'dietary', type: 'qa', description: 'Dietary restrictions and allergen info', color: '#32CD32', icon: '🥗', sortOrder: 4 },
  { name: 'General', slug: 'general-qa', type: 'qa', description: 'General questions and inquiries', color: '#6B7280', icon: '❓', sortOrder: 5 },

  // Announcement categories
  { name: 'General', slug: 'general-announcement', type: 'announcement', description: 'General announcements and news', color: '#6B7280', icon: '📢', sortOrder: 1, isDefault: true },
  { name: 'Event', slug: 'event', type: 'announcement', description: 'Event announcements and invitations', color: '#9370DB', icon: '🎉', sortOrder: 2 },
  { name: 'Menu Updates', slug: 'menu-updates', type: 'announcement', description: 'New menu items and updates', color: '#FF6347', icon: '📋', sortOrder: 3 },
  { name: 'Promotion', slug: 'promotion', type: 'announcement', description: 'Special offers and promotions', color: '#FFD700', icon: '🏷️', sortOrder: 4 }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for category seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear and seed categories
const clearAndSeedCategories = async () => {
  try {
    console.log('🏷️ Starting Fresh Category Seeding...\n');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeding first.');
      return;
    }
    console.log('✅ Admin user found:', adminUser.username);

    // Clear existing categories
    const deleteResult = await Category.deleteMany({});
    console.log(`🧹 Cleared ${deleteResult.deletedCount} existing categories`);

    let created = 0;

    console.log('\n📝 Creating categories...');
    for (const categoryData of allCategories) {
      // Create new category
      const category = new Category({
        ...categoryData,
        createdBy: adminUser._id
      });

      await category.save();
      console.log(`   ✅ Created: ${categoryData.name} (${categoryData.type})`);
      created++;
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Created: ${created} categories`);

    // Show distribution by type
    console.log(`\n📈 Category Distribution:`);
    const types = ['menu', 'gallery', 'qa', 'announcement'];
    for (const type of types) {
      const count = await Category.countDocuments({ type, active: true });
      const categories = await Category.find({ type, active: true }).sort({ sortOrder: 1 });
      console.log(`   ${type}: ${count} categories`);
      categories.forEach(cat => console.log(`     - ${cat.name} (${cat.slug})`));
    }

    console.log('\n✅ All categories seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Main function
const runSeeding = async () => {
  try {
    await connectDB();
    await clearAndSeedCategories();
    
    console.log('\n🎉 Category seeding completed!');
    console.log('\nNext steps:');
    console.log('1. Test the admin interface at http://localhost:8080/dashboard/categories');
    console.log('2. Check category dropdowns in forms');
    console.log('3. Verify API endpoints are working');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the seeding
runSeeding();
