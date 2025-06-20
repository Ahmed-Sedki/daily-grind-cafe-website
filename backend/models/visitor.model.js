// models/visitor.model.js
import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ipAddress: { type: String },
  userAgent: { type: String },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;