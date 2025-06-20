
// app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import visitorRoutes from './routes/visitor.routes.js';
import authRoutes from './routes/auth.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import qaRoutes from './routes/qa.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import userRoutes from './routes/user.routes.js';
import menuRoutes from './routes/menu.routes.js';
import contactRoutes from './routes/contact.routes.js';
import subscriberRoutes from './routes/subscriber.routes.js';
import categoryRoutes from './routes/category.routes.js';

// Import middleware
import visitorTracker from './middleware/visitor.middleware.js';
import { csrfProtection, handleCSRFError } from './middleware/csrf.middleware.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Enable trust proxy to properly handle IP addresses behind proxies
app.set('trust proxy', true);

// Setup directory structure for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const galleryDir = path.join(uploadsDir, 'gallery');
const menuDir = path.join(uploadsDir, 'menu');

// Create directories if they don't exist
[publicDir, uploadsDir, galleryDir, menuDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS to match frontend URL and allow credentials
const corsOptions = {
  // Allow multiple origins
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:8080',  // Default Vite dev server
      'http://localhost:5173',  // Alternative Vite dev server port
      'http://127.0.0.1:8080',  // Using IP instead of localhost
      'http://127.0.0.1:5173',  // Using IP instead of localhost
    ];

    // Add custom origin from env if available
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    // In development, allow any origin for easier testing
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // In production, check against allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], // Allowed headers
  exposedHeaders: ['Content-Disposition'] // Headers the browser is allowed to access
};

app.use(cors(corsOptions));

// Apply security headers, but configure for image serving
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: {
      policy: "cross-origin" // This allows cross-origin access to resources
    },
    crossOriginEmbedderPolicy: false // Disable COEP to allow embedding resources
  })
);

app.use(cookieParser()); // Parse cookies - REQUIRED for CSRF to work with cookies

// Serve static files from public directory with proper headers
app.use(express.static(publicDir, {
  setHeaders: (res, path) => {
    // For image files, set appropriate CORS headers
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected...');

    // Initialize sitemap on startup
    try {
      const { initializeSitemap } = await import('./controllers/sitemap.controller.js');
      await initializeSitemap();
      console.log('Sitemap initialized successfully');
    } catch (error) {
      console.error('Error initializing sitemap:', error);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Apply visitor tracking middleware
app.use(visitorTracker);

// CSRF error handler - must be before routes that use CSRF protection
app.use(handleCSRFError);

// Routes
app.use('/api/stats/visitors', visitorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/categories', categoryRoutes);

// Serve XML sitemap at the root level for SEO
app.get('/sitemap.xml', (req, res) => {
  res.redirect('/api/sitemap/xml');
});

// Serve robots.txt at the root level
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to L Café API! The API is up and running.' });
});

// 404 handler - for routes that don't exist
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
