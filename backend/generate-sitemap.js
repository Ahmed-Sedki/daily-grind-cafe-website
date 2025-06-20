// generate-sitemap.js - Manual sitemap generation script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SitemapItem from './models/sitemap.model.js';
import { create } from 'xmlbuilder2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  },
  {
    url: '/site-map.xml',
    title: 'Site Map - L Café',
    priority: 0.4,
    changeFrequency: 'weekly',
    level: 0,
    order: 8,
    isVisible: true
  }
];

// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected for sitemap generation...');
    generateSitemap();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Generate sitemap
const generateSitemap = async () => {
  try {
    console.log('Starting sitemap generation...');
    
    // Check if sitemap items exist
    const existingItems = await SitemapItem.find();
    console.log(`Found ${existingItems.length} existing sitemap items`);
    
    // If no items exist, create them
    if (existingItems.length === 0) {
      console.log('Creating default sitemap items...');
      
      for (const item of defaultSitemapItems) {
        const sitemapItem = new SitemapItem(item);
        await sitemapItem.save();
        console.log(`Created: ${item.title} (${item.url})`);
      }
      
      console.log('Default sitemap items created successfully');
    }
    
    // Generate XML sitemap
    console.log('Generating XML sitemap...');
    await generateXmlSitemap();
    
    // Close the database connection
    mongoose.connection.close();
    console.log('Sitemap generation completed successfully');
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Generate XML sitemap
const generateXmlSitemap = async () => {
  try {
    // Get all visible items
    const items = await SitemapItem.find({ isVisible: true }).sort({ level: 1, order: 1 });
    console.log(`Found ${items.length} visible sitemap items`);
    
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
      
      console.log(`Added to sitemap: ${item.url} (${item.title})`);
    });
    
    // Convert to XML string
    const xml = doc.end({ prettyPrint: true });
    
    // Save to file
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    
    console.log(`XML sitemap saved to: ${sitemapPath}`);
    console.log('XML sitemap generated successfully');
    
  } catch (error) {
    console.error('Error generating XML sitemap:', error);
    throw error;
  }
};
