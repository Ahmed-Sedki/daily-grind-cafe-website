// models/activeSession.model.js
import mongoose from 'mongoose';

const activeSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  startTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);

export default ActiveSession;