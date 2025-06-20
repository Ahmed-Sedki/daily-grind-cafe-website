// middleware/role.middleware.js
const roleMiddleware = (roles = []) => {
    return (req, res, next) => {
      // Convert string to array if single role is provided
      if (typeof roles === 'string') {
        roles = [roles];
      }
      
      // Check if user exists (should be attached by auth middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
      }
      
      // Check if user role is included in allowed roles
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Forbidden - You do not have permission to access this resource' 
        });
      }
      
      // User has required role, proceed to next middleware
      next();
    };
  };
  
  export default roleMiddleware;