// seeds.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import SitemapItem from './models/sitemap.model.js';

// Load environment variables
dotenv.config();

// Admin user credentials - in a real app, use more secure values
const adminUser = {
  username: 'admin',
  email: 'admin@lcafe.com',
  password: 'admin@lcafe.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  active: true
};

// Default sitemap items based on React routes
const defaultSitemapItems = [
  {
    url: '/',
    title: 'Home - L Café',
    priority: 1.0,
    changeFrequency: 'weekly',
    level: 0,
    order: 1,
    isVisible: true
  },
  {
    url: '/menu',
    title: 'Menu - L Café',
    priority: 0.9,
    changeFrequency: 'daily',
    level: 0,
    order: 2,
    isVisible: true
  },
  {
    url: '/about',
    title: 'About Us - L Café',
    priority: 0.8,
    changeFrequency: 'monthly',
    level: 0,
    order: 3,
    isVisible: true
  },
  {
    url: '/contact',
    title: 'Contact Us - L Café',
    priority: 0.7,
    changeFrequency: 'monthly',
    level: 0,
    order: 4,
    isVisible: true
  },
  {
    url: '/gallery',
    title: 'Gallery - L Café',
    priority: 0.6,
    changeFrequency: 'weekly',
    level: 0,
    order: 5,
    isVisible: true
  },
  {
    url: '/announcements',
    title: 'Announcements - L Café',
    priority: 0.8,
    changeFrequency: 'daily',
    level: 0,
    order: 6,
    isVisible: true
  },
  {
    url: '/faq',
    title: 'FAQ - L Café',
    priority: 0.5,
    changeFrequency: 'monthly',
    level: 0,
    order: 7,
    isVisible: true
  }
];

// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected for seeding...');
    seedData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed all data
const seedData = async () => {
  try {
    await seedAdmin();
    await seedSitemap();

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminUser.email }, { username: adminUser.username }]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
    } else {
      // Create new admin user
      const newAdmin = new User(adminUser);
      await newAdmin.save();

      console.log('Admin user created successfully:');
      console.log(`Username: ${adminUser.username}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
      console.log(`Role: ${adminUser.role}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
};

// Seed sitemap items
const seedSitemap = async () => {
  try {
    console.log('\nSeeding sitemap items...');

    // Check if sitemap items already exist
    const existingItems = await SitemapItem.find();

    if (existingItems.length > 0) {
      console.log(`Found ${existingItems.length} existing sitemap items. Skipping sitemap seeding.`);
      return;
    }

    // Create sitemap items
    const createdItems = [];
    for (const item of defaultSitemapItems) {
      const sitemapItem = new SitemapItem(item);
      await sitemapItem.save();
      createdItems.push(sitemapItem);
      console.log(`Created sitemap item: ${item.title} (${item.url})`);
    }

    console.log(`Successfully created ${createdItems.length} sitemap items`);

    // Generate initial XML sitemap
    console.log('Generating initial XML sitemap...');
    await generateInitialXmlSitemap();

  } catch (error) {
    console.error('Error seeding sitemap:', error);
    throw error;
  }
};

// Generate initial XML sitemap
const generateInitialXmlSitemap = async () => {
  try {
    const { create } = await import('xmlbuilder2');
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    // Get __dirname equivalent in ES module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Get all visible items
    const items = await SitemapItem.find({ isVisible: true });

    // Create XML document
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

    // Add URLs to sitemap
    items.forEach(item => {
      const urlElement = doc.ele('url');
      urlElement.ele('loc').txt(`https://lcafe.com${item.url}`);
      urlElement.ele('lastmod').txt(item.lastModified.toISOString().split('T')[0]);
      urlElement.ele('changefreq').txt(item.changeFrequency);
      urlElement.ele('priority').txt(item.priority.toString());
    });

    // Convert to XML string
    const xml = doc.end({ prettyPrint: true });

    // Save to file
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

    console.log('Initial XML sitemap generated successfully');

  } catch (error) {
    console.error('Error generating initial XML sitemap:', error);
    // Don't throw here as this is not critical for seeding
  }
};