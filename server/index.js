import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5180;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiffin-tracker';
const APP_PASSWORD = process.env.VITE_APP_PASSWORD || 'falguni03';

app.use(cors());
app.use(express.json());

// MongoDB connection caching for serverless environments
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  if (mongoose.connection.readyState >= 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }
  
  cachedConnection = await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully');
  return cachedConnection;
}

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Schemas & Models
const mealLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  lunch: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false }
});
const MealLog = mongoose.model('MealLog', mealLogSchema);

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  theme: { type: String, default: 'dark' },
  costPerTiffin: { type: Number, default: 70 },
  maxTiffins: { type: Number, default: 60 }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  next();
};

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    return res.json({ success: true, token: APP_PASSWORD });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

// Get meals for a specific month
app.get('/api/meals/:year/:month', authenticate, async (req, res) => {
  try {
    const { year, month } = req.params;
    const prefix = `${year}-${String(Number(month) + 1).padStart(2, '0')}-`;
    const logs = await MealLog.find({ date: new RegExp(`^${prefix}`) });
    
    // Transform array to monthData object structure
    const monthData = {};
    logs.forEach(log => {
      monthData[log.date] = { lunch: log.lunch, dinner: log.dinner };
    });
    return res.json(monthData);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Update or log a meal
app.post('/api/meals/:date', authenticate, async (req, res) => {
  try {
    const { date } = req.params;
    const { lunch, dinner } = req.body;
    const log = await MealLog.findOneAndUpdate(
      { date },
      { lunch, dinner },
      { upsert: true, new: true }
    );
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save meal log' });
  }
});

// Get settings
app.get('/api/settings', authenticate, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({ key: 'global' });
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
app.post('/api/settings', authenticate, async (req, res) => {
  try {
    const { theme, costPerTiffin, maxTiffins } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { theme, costPerTiffin, maxTiffins },
      { upsert: true, new: true }
    );
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Clear all logs
app.post('/api/clear-all', authenticate, async (req, res) => {
  try {
    await MealLog.deleteMany({});
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear database' });
  }
});

// Static assets serving in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Router Fallback
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
