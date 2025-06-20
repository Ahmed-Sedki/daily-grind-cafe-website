
// config/env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Export environment variables with defaults
export default {
  // Server configuration
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/l-cafe',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-default-jwt-secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1d',
  
  // Cors configuration (comma-separated list of allowed origins)
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // File upload limits
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  
  // Public URL (for generating absolute URLs to resources)
  PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:5000',
};
