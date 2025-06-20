// seeds/categories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

// Default categories for each type
const defaultCategories = {
  menu: [
    { name: 'Coffee', slug: 'coffee', description: 'Coffee beverages and espresso drinks', color: '#8B4513', icon: '☕', sortOrder: 1, isDefault: true },
    { name: 'Tea', slug: 'tea', description: 'Tea varieties and herbal infusions', color: '#228B22', icon: '🍵', sortOrder: 2 },
    { name: 'Food', slug: 'food', description: 'Main dishes and light meals', color: '#FF6347', icon: '🍽️', sortOrder: 3 },
    { name: 'Dessert', slug: 'dessert', description: 'Sweet treats and desserts', color: '#FFB6C1', icon: '🧁', sortOrder: 4 },
    { name: 'Seasonal', slug: 'seasonal', description: 'Limited time seasonal offerings', color: '#FFA500', icon: '🍂', sortOrder: 5 }
  ],
  gallery: [
    { name: 'Interior', slug: 'interior', description: 'Café interior and ambiance photos', color: '#8B4513', icon: '🏠', sortOrder: 1, isDefault: true },
    { name: 'Food', slug: 'food', description: 'Food and beverage photography', color: '#FF6347', icon: '📸', sortOrder: 2 },
    { name: 'Drinks', slug: 'drinks', description: 'Coffee and beverage photos', color: '#4682B4', icon: '🥤', sortOrder: 3 },
    { name: 'Events', slug: 'events', description: 'Special events and gatherings', color: '#9370DB', icon: '🎉', sortOrder: 4 },
    { name: 'Team', slug: 'team', description: 'Staff and team photos', color: '#32CD32', icon: '👥', sortOrder: 5 }
  ],
  qa: [
    { name: 'Coffee Basics', slug: 'coffee-basics', description: 'Questions about coffee and brewing', color: '#8B4513', icon: '☕', sortOrder: 1, isDefault: true },
    { name: 'Products', slug: 'products', description: 'Questions about our menu items', color: '#FF6347', icon: '🛍️', sortOrder: 2 },
    { name: 'Events', slug: 'events', description: 'Questions about events and bookings', color: '#9370DB', icon: '📅', sortOrder: 3 },
    { name: 'Dietary', slug: 'dietary', description: 'Dietary restrictions and allergen info', color: '#32CD32', icon: '🥗', sortOrder: 4 },
    { name: 'General', slug: 'general', description: 'General questions and inquiries', color: '#6B7280', icon: '❓', sortOrder: 5 }
  ],
  announcement: [
    { name: 'General', slug: 'general', description: 'General announcements and news', color: '#6B7280', icon: '📢', sortOrder: 1, isDefault: true },
    { name: 'Event', slug: 'event', description: 'Event announcements and invitations', color: '#9370DB', icon: '🎉', sortOrder: 2 },
    { name: 'Menu', slug: 'menu', description: 'New menu items and updates', color: '#FF6347', icon: '📋', sortOrder: 3 },
    { name: 'Promotion', slug: 'promotion', description: 'Special offers and promotions', color: '#FFD700', icon: '🏷️', sortOrder: 4 }
  ]
};

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

// Seed categories
const seedCategories = async () => {
  try {
    console.log('\n🏷️ Starting Category Seeding...');

    // Find admin user to use as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeding first.');
      return;
    }

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const [type, categories] of Object.entries(defaultCategories)) {
      console.log(`\n📂 Seeding ${type} categories...`);

      for (const categoryData of categories) {
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
          type, 
          slug: categoryData.slug 
        });

        if (existingCategory) {
          console.log(`   ⏭️  Skipped: ${categoryData.name} (already exists)`);
          totalSkipped++;
          continue;
        }

        // Create new category
        const category = new Category({
          ...categoryData,
          type,
          createdBy: adminUser._id
        });

        await category.save();
        console.log(`   ✅ Created: ${categoryData.name}`);
        totalCreated++;
      }
    }

    console.log(`\n📊 Category Seeding Summary:`);
    console.log(`   ✅ Created: ${totalCreated} categories`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} categories`);
    console.log(`   📋 Total: ${totalCreated + totalSkipped} categories processed`);

    // Display category counts by type
    console.log(`\n📈 Category Distribution:`);
    for (const type of Object.keys(defaultCategories)) {
      const count = await Category.countDocuments({ type, active: true });
      console.log(`   ${type}: ${count} categories`);
    }

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Main seeding function
const runSeeding = async () => {
  try {
    await connectDB();
    await seedCategories();
    
    console.log('\n🎉 Category seeding completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your models to use dynamic categories');
    console.log('2. Test the category management in admin panel');
    console.log('3. Verify categories appear in dropdowns');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeding();
}

export { seedCategories, defaultCategories };
