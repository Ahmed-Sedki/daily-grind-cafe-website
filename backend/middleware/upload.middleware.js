// middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const galleryDir = path.join(__dirname, '..', 'public', 'uploads', 'gallery');
const thumbnailsDir = path.join(galleryDir, 'thumbnails');

if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to handle gallery image uploads and create thumbnails
export const galleryUpload = (req, res, next) => {
  // Use multer's single file upload
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: err.message });
    }
    
    // If no file was uploaded, continue
    if (!req.file) {
      return next();
    }
    
    try {
      // Create thumbnail using sharp
      const thumbnailFilename = `thumbnail-${req.file.filename}`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
      
      await sharp(req.file.path)
        .resize(300, 200, { fit: 'cover' })
        .toFile(thumbnailPath);
      
      // Add thumbnail info to request
      req.thumbnail = {
        filename: thumbnailFilename,
        path: thumbnailPath
      };
      
      next();
    } catch (error) {
      return res.status(500).json({ message: `Thumbnail creation error: ${error.message}` });
    }
  });
};

export default galleryUpload;