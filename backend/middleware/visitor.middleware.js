// middleware/visitor.middleware.js
import Visitor from '../models/visitor.model.js';

const visitorTracker = async (req, res, next) => {
    // console.log('[getVisitorCount] Request received at:', req); 
    // check visitor.middleware.md for more details
  // Skip for API requests and static resources
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  
  try {
    // console.log('[getVisitorCount] Querying Visitor collection...');
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    // console.log('[getVisitorCount] IP Address:', ip);
    const userAgent = req.headers['user-agent'] || 'unknown';
    // console.log('[getVisitorCount] User Agent:', userAgent);
    
    // Find or create visitor
    let visitor = await Visitor.findOne({ ipAddress: ip, userAgent: userAgent });
    // console.log(`[getVisitorCount] Visitor count: ${visitor}`);
    
    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = Date.now();
      visitor.visitCount += 1;
      await visitor.save();
    } else {
      // Create new visitor
      visitor = new Visitor({
        ipAddress: ip,
        userAgent: userAgent
      });
      await visitor.save();
    }
  } catch (error) {
    console.error('Error in visitor tracking middleware:', error);
    // Continue to next middleware even if tracking fails
  }
  
  next();
};

export default visitorTracker;