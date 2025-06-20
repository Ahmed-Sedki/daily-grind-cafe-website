
import csrf from 'csurf';
import { randomBytes } from 'crypto';

// Configure CSRF protection
const csrfMiddleware = csrf({
  cookie: {
    httpOnly: true,
    secure: false, // Set to false to work in both HTTP and HTTPS
    sameSite: 'lax' // Changed from strict to lax for better compatibility
  }
});

// Create a wrapper middleware that logs CSRF information
const csrfProtection = (req, res, next) => {
  // Add debug logging for troubleshooting
  console.log('CSRF Protection Middleware Called');
  console.log('CSRF Cookie:', req.cookies['_csrf']);
  console.log('CSRF Header:', req.headers['x-csrf-token']);
  console.log('All Cookies:', req.cookies);

  // Pass to the actual CSRF middleware
  csrfMiddleware(req, res, (err) => {
    if (err) {
      console.error('CSRF Middleware Error:', err);
      // Send more detailed error response
      if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
          message: 'Invalid CSRF token. Please refresh the page and try again.',
          error: err.message,
          code: err.code
        });
      }
      return next(err);
    }

    // Log the generated token for debugging
    console.log('Generated CSRF Token:', req.csrfToken());
    next();
  });
};

// Middleware to handle CSRF errors gracefully
const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // More debug information when CSRF validation fails
  console.log('CSRF Error - Cookies:', req.cookies);
  console.log('CSRF Error - Headers:', req.headers);

  // Handle CSRF token errors
  res.status(403).json({
    message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    error: err.message,
    code: err.code
  });
};

export { csrfProtection, handleCSRFError };
