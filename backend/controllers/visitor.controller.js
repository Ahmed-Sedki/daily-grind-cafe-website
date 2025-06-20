// controllers/visitor.controller.js
import Visitor from '../models/visitor.model.js';
import ActiveSession from '../models/activeSession.model.js';


// Get total unique visitor count
// http://localhost:5000/api/stats/visitors/count
export const getVisitorCount = async (req, res) => { // these gonna come from the client side
  // console.log('[getVisitorCount] Request received', res);
  // check visitor.controller.md for more details
  try {
    // console.log('[getVisitorCount] Counting documents in Visitor collection');
    const count = await Visitor.countDocuments();
    // console.log('[getVisitorCount] Visitor count:', Visitor.countDocuments());
    res.status(200).json({ count });
    //The { count } is shorthand for { count: count } - a JavaScript object where the key and variable name are the same.
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitor count', error: error.message });
  }
};


// Get current online user count
export const getOnlineUserCount = async (req, res) => {
  try {
    const count = await ActiveSession.countDocuments({ isActive: true });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching online user count', error: error.message });
  }
};


// Record a new visitor or update existing visitor
export const recordVisit = async (req, res) => {
  try {
    // Log the request for debugging
    console.log('Recording visitor from IP:', req.ip);
    console.log('User-Agent:', req.headers['user-agent']);

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check if visitor exists
    let visitor = await Visitor.findOne({ ipAddress: ip, userAgent: userAgent });

    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = Date.now();
      visitor.visitCount += 1;
      await visitor.save();
      console.log(`Updated existing visitor (${ip}), visit count: ${visitor.visitCount}`);
    } else {
      // Create new visitor
      visitor = new Visitor({
        ipAddress: ip,
        userAgent: userAgent
      });
      await visitor.save();
      console.log(`Recorded new visitor (${ip})`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording visitor:', error);
    // Return 200 status even on error to prevent client-side errors
    // This makes the API more resilient to ad blockers and other issues
    res.status(200).json({
      success: false,
      message: 'Error recording visit, but continuing',
      error: error.message
    });
  }
};