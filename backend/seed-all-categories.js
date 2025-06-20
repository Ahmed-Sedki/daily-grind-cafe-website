// seed-all-categories.js
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
  { name: 'Food', slug: 'food', type: 'gallery', description: 'Food and beverage photography', color: '#FF6347', icon: '📸', sortOrder: 2 },
  { name: 'Drinks', slug: 'drinks', type: 'gallery', description: 'Coffee and beverage photos', color: '#4682B4', icon: '🥤', sortOrder: 3 },
  { name: 'Events', slug: 'events', type: 'gallery', description: 'Special events and gatherings', color: '#9370DB', icon: '🎉', sortOrder: 4 },
  { name: 'Team', slug: 'team', type: 'gallery', description: 'Staff and team photos', color: '#32CD32', icon: '👥', sortOrder: 5 },

  // Q&A categories
  { name: 'Coffee Basics', slug: 'coffee-basics', type: 'qa', description: 'Questions about coffee and brewing', color: '#8B4513', icon: '☕', sortOrder: 1, isDefault: true },
  { name: 'Products', slug: 'products', type: 'qa', description: 'Questions about our menu items', color: '#FF6347', icon: '🛍️', sortOrder: 2 },
  { name: 'Events', slug: 'events', type: 'qa', description: 'Questions about events and bookings', color: '#9370DB', icon: '📅', sortOrder: 3 },
  { name: 'Dietary', slug: 'dietary', type: 'qa', description: 'Dietary restrictions and allergen info', color: '#32CD32', icon: '🥗', sortOrder: 4 },
  { name: 'General', slug: 'general', type: 'qa', description: 'General questions and inquiries', color: '#6B7280', icon: '❓', sortOrder: 5 },

  // Announcement categories
  { name: 'General', slug: 'general', type: 'announcement', description: 'General announcements and news', color: '#6B7280', icon: '📢', sortOrder: 1, isDefault: true },
  { name: 'Event', slug: 'event', type: 'announcement', description: 'Event announcements and invitations', color: '#9370DB', icon: '🎉', sortOrder: 2 },
  { name: 'Menu', slug: 'menu', type: 'announcement', description: 'New menu items and updates', color: '#FF6347', icon: '📋', sortOrder: 3 },
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

// Seed all categories
const seedAllCategories = async () => {
  try {
    console.log('🏷️ Starting Complete Category Seeding...\n');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeding first.');
      return;
    }
    console.log('✅ Admin user found:', adminUser.username);

    let created = 0;
    let skipped = 0;

    for (const categoryData of allCategories) {
      // Check if category already exists
      const existing = await Category.findOne({ 
        type: categoryData.type, 
        slug: categoryData.slug 
      });

      if (existing) {
        console.log(`   ⏭️  Skipped: ${categoryData.name} (${categoryData.type}) - already exists`);
        skipped++;
        continue;
      }

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
    console.log(`   ⏭️  Skipped: ${skipped} categories`);
    console.log(`   📋 Total: ${created + skipped} categories processed`);

    // Show distribution by type
    console.log(`\n📈 Category Distribution:`);
    const types = ['menu', 'gallery', 'qa', 'announcement'];
    for (const type of types) {
      const count = await Category.countDocuments({ type, active: true });
      console.log(`   ${type}: ${count} categories`);
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
    await seedAllCategories();
    
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
