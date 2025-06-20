// controllers/sitemap.controller.js
import SitemapItem from '../models/sitemap.model.js';
import mongoose from 'mongoose';
import { create } from 'xmlbuilder2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all sitemap items (for admin)
export const getAllSitemapItems = async (req, res) => {
  try {
    const items = await SitemapItem.find()
      .sort({ level: 1, order: 1 })
      .populate('parent', 'title url');
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching sitemap items', 
      error: error.message 
    });
  }
};

// Get hierarchical sitemap structure (for user-facing sitemap)
export const getHierarchicalSitemap = async (req, res) => {
  try {
    // Get all visible items
    const allItems = await SitemapItem.find({ isVisible: true })
      .sort({ level: 1, order: 1 });
    
    // First, find root items (with no parent)
    const rootItems = allItems.filter(item => !item.parent);
    
    // Function to build the tree recursively
    const buildTree = (parentId) => {
      return allItems
        .filter(item => 
          item.parent && item.parent.toString() === parentId.toString()
        )
        .map(item => {
          return {
            _id: item._id,
            url: item.url,
            title: item.title,
            level: item.level,
            children: buildTree(item._id)
          };
        });
    };
    
    // Build the complete tree
    const sitemapTree = rootItems.map(item => {
      return {
        _id: item._id,
        url: item.url,
        title: item.title,
        level: item.level,
        children: buildTree(item._id)
      };
    });
    
    res.status(200).json(sitemapTree);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error building hierarchical sitemap', 
      error: error.message 
    });
  }
};

// Create a new sitemap item
export const createSitemapItem = async (req, res) => {
  try {
    const { 
      url, 
      title, 
      priority, 
      changeFrequency, 
      parent, 
      level, 
      order, 
      isVisible 
    } = req.body;
    
    // Basic validation
    if (!url || !title) {
      return res.status(400).json({ message: 'URL and title are required' });
    }
    
    // Check if URL already exists
    const existingItem = await SitemapItem.findOne({ url });
    if (existingItem) {
      return res.status(400).json({ message: 'URL already exists in sitemap' });
    }
    
    // Create new sitemap item
    const sitemapItem = new SitemapItem({
      url,
      title,
      priority: priority || 0.5,
      changeFrequency: changeFrequency || 'monthly',
      parent: parent || null,
      level: level || 0,
      order: order || 0,
      isVisible: isVisible !== undefined ? isVisible : true,
      lastModified: Date.now()
    });
    
    await sitemapItem.save();
    
    res.status(201).json({
      message: 'Sitemap item created successfully',
      sitemapItem
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating sitemap item', 
      error: error.message 
    });
  }
};

// Update an existing sitemap item
export const updateSitemapItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      url, 
      title, 
      priority, 
      changeFrequency, 
      parent, 
      level, 
      order, 
      isVisible 
    } = req.body;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sitemap item ID' });
    }
    
    // Find sitemap item
    const sitemapItem = await SitemapItem.findById(id);
    
    if (!sitemapItem) {
      return res.status(404).json({ message: 'Sitemap item not found' });
    }
    
    // If URL is being changed, check that new URL doesn't already exist
    if (url && url !== sitemapItem.url) {
      const existingItem = await SitemapItem.findOne({ url });
      if (existingItem && existingItem._id.toString() !== id) {
        return res.status(400).json({ message: 'URL already exists in sitemap' });
      }
    }
    
    // Update sitemap item
    const updatedItem = await SitemapItem.findByIdAndUpdate(
      id,
      {
        url: url || sitemapItem.url,
        title: title || sitemapItem.title,
        priority: priority !== undefined ? priority : sitemapItem.priority,
        changeFrequency: changeFrequency || sitemapItem.changeFrequency,
        parent: parent !== undefined ? parent : sitemapItem.parent,
        level: level !== undefined ? level : sitemapItem.level,
        order: order !== undefined ? order : sitemapItem.order,
        isVisible: isVisible !== undefined ? isVisible : sitemapItem.isVisible,
        lastModified: Date.now()
      },
      { new: true }
    );
    
    res.status(200).json({
      message: 'Sitemap item updated successfully',
      sitemapItem: updatedItem
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating sitemap item', 
      error: error.message 
    });
  }
};

// Delete a sitemap item
export const deleteSitemapItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sitemap item ID' });
    }
    
    // Check if the item has children
    const hasChildren = await SitemapItem.findOne({ parent: id });
    
    if (hasChildren) {
      return res.status(400).json({ 
        message: 'Cannot delete item with children. Remove or reassign children first.' 
      });
    }
    
    // Delete the item
    const result = await SitemapItem.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Sitemap item not found' });
    }
    
    res.status(200).json({
      message: 'Sitemap item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting sitemap item', 
      error: error.message 
    });
  }
};

// Generate XML sitemap dynamically
export const generateXmlSitemap = async (req, res) => {
  try {
    // Get base URL from request or use a default
    const baseUrl = req.query.baseUrl || req.get('host') ? `${req.protocol}://${req.get('host')}` : 'https://lcafe.com';

    // Ensure we have default sitemap items
    await ensureDefaultSitemapItems();

    // Get all visible items
    const items = await SitemapItem.find({ isVisible: true }).sort({ level: 1, order: 1 });

    // Create XML document
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

    // Add URLs to sitemap
    items.forEach(item => {
      const urlElement = doc.ele('url');
      urlElement.ele('loc').txt(`${baseUrl}${item.url}`);
      urlElement.ele('lastmod').txt(item.lastModified.toISOString().split('T')[0]);
      urlElement.ele('changefreq').txt(item.changeFrequency);
      urlElement.ele('priority').txt(item.priority.toString());
    });

    // Convert to XML string
    const xml = doc.end({ prettyPrint: true });

    // Set response headers
    res.header('Content-Type', 'application/xml');
    res.send(xml);

    // Save to file for static serving
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

  } catch (error) {
    res.status(500).json({
      message: 'Error generating XML sitemap',
      error: error.message
    });
  }
};

// Ensure default sitemap items exist
const ensureDefaultSitemapItems = async () => {
  try {
    const existingItems = await SitemapItem.find();

    if (existingItems.length === 0) {
      const defaultItems = [
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

      for (const item of defaultItems) {
        const sitemapItem = new SitemapItem(item);
        await sitemapItem.save();
      }

      console.log('Default sitemap items created');
    }
  } catch (error) {
    console.error('Error ensuring default sitemap items:', error);
  }
};

// Utility function to automatically update sitemap when content changes
export const autoUpdateSitemap = async (contentType, action, itemData) => {
  try {
    let shouldRegenerateSitemap = false;

    switch (contentType) {
      case 'announcement':
        if (action === 'create' && itemData.id) {
          // Add announcement to sitemap if it doesn't exist
          const announcementUrl = `/announcements/${itemData.id}`;
          const existingItem = await SitemapItem.findOne({ url: announcementUrl });

          if (!existingItem) {
            const sitemapItem = new SitemapItem({
              url: announcementUrl,
              title: `${itemData.title} - L Café Announcements`,
              priority: 0.6,
              changeFrequency: 'weekly',
              level: 1,
              order: 100, // Lower priority order
              isVisible: true,
              lastModified: Date.now()
            });

            await sitemapItem.save();
            shouldRegenerateSitemap = true;
          }
        } else if (action === 'delete' && itemData.id) {
          // Remove announcement from sitemap
          const announcementUrl = `/announcements/${itemData.id}`;
          const result = await SitemapItem.findOneAndDelete({ url: announcementUrl });
          if (result) {
            shouldRegenerateSitemap = true;
          }
        }
        break;

      case 'gallery':
        if (action === 'create' && itemData.id) {
          // Add gallery item to sitemap if it doesn't exist
          const galleryUrl = `/gallery/${itemData.id}`;
          const existingItem = await SitemapItem.findOne({ url: galleryUrl });

          if (!existingItem) {
            const sitemapItem = new SitemapItem({
              url: galleryUrl,
              title: `${itemData.title || 'Gallery Item'} - L Café Gallery`,
              priority: 0.4,
              changeFrequency: 'monthly',
              level: 1,
              order: 200, // Lower priority order
              isVisible: true,
              lastModified: Date.now()
            });

            await sitemapItem.save();
            shouldRegenerateSitemap = true;
          }
        } else if (action === 'delete' && itemData.id) {
          // Remove gallery item from sitemap
          const galleryUrl = `/gallery/${itemData.id}`;
          const result = await SitemapItem.findOneAndDelete({ url: galleryUrl });
          if (result) {
            shouldRegenerateSitemap = true;
          }
        }
        break;

      case 'menu':
        // Update menu page last modified date
        const menuItem = await SitemapItem.findOne({ url: '/menu' });
        if (menuItem) {
          menuItem.lastModified = Date.now();
          await menuItem.save();
          shouldRegenerateSitemap = true;
        }
        break;

      case 'qa':
        // Update FAQ page last modified date
        const faqItem = await SitemapItem.findOne({ url: '/faq' });
        if (faqItem) {
          faqItem.lastModified = Date.now();
          await faqItem.save();
          shouldRegenerateSitemap = true;
        }
        break;
    }

    // Regenerate XML sitemap if needed
    if (shouldRegenerateSitemap) {
      await regenerateXmlSitemap();
    }

    return { success: true, regenerated: shouldRegenerateSitemap };

  } catch (error) {
    console.error('Error in autoUpdateSitemap:', error);
    return { success: false, error: error.message };
  }
};

// Initialize sitemap on server startup
export const initializeSitemap = async () => {
  try {
    console.log('Initializing sitemap...');

    // Ensure default sitemap items exist
    await ensureDefaultSitemapItems();

    // Generate initial XML sitemap
    await regenerateXmlSitemap();

    console.log('Sitemap initialization completed');

  } catch (error) {
    console.error('Error initializing sitemap:', error);
    throw error;
  }
};

// Helper function to regenerate XML sitemap file
const regenerateXmlSitemap = async () => {
  try {
    // Get all visible items
    const items = await SitemapItem.find({ isVisible: true }).sort({ level: 1, order: 1 });

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
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

    console.log('XML sitemap regenerated successfully');

  } catch (error) {
    console.error('Error regenerating XML sitemap:', error);
    throw error;
  }
};