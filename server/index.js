import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(os.homedir(), '.tiffin-tracker-db.json');
const OLD_DB_FILE = path.join(__dirname, 'db.json');

// Migrate old db if it exists
try {
  if (fs.existsSync(OLD_DB_FILE) && !fs.existsSync(DB_FILE)) {
    fs.copyFileSync(OLD_DB_FILE, DB_FILE);
    console.log('Migrating db.json to home directory...');
  }
} catch (err) {
  console.error('Failed to migrate database file:', err);
}

const app = express();
const PORT = process.env.PORT || 5180;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiffin-tracker';
const APP_PASSWORD = process.env.VITE_APP_PASSWORD || 'falguni03';

app.use(cors());
app.use(express.json());

// MongoDB connection and fallback flag
let useLocalJsonDb = false;

// Attempt to connect to MongoDB asynchronously on startup (non-blocking)
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  console.log('MongoDB connected successfully');
  useLocalJsonDb = false;
}).catch(err => {
  console.warn('MongoDB connection failed, using local JSON DB:', err.message);
  useLocalJsonDb = true;
});

// Database connection middleware (non-blocking status check)
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    useLocalJsonDb = false;
  } else {
    useLocalJsonDb = true;
  }
  next();
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

// Local JSON DB Helper functions
function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { meals: {}, settings: { key: 'global', theme: 'dark', costPerTiffin: 70, maxTiffins: 60 } };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON DB:', err);
    return { meals: {}, settings: { key: 'global', theme: 'dark', costPerTiffin: 70, maxTiffins: 60 } };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local JSON DB:', err);
  }
}

// Abstract DB functions
async function saveMealLog(date, lunch, dinner) {
  if (useLocalJsonDb) {
    const db = readLocalDb();
    db.meals[date] = { lunch, dinner };
    writeLocalDb(db);
    return { date, lunch, dinner };
  } else {
    return await MealLog.findOneAndUpdate(
      { date },
      { lunch, dinner },
      { upsert: true, new: true }
    );
  }
}

async function findSettings() {
  if (useLocalJsonDb) {
    const db = readLocalDb();
    return db.settings;
  } else {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({ key: 'global' });
    }
    return settings;
  }
}

async function updateSettingsData(theme, costPerTiffin, maxTiffins) {
  if (useLocalJsonDb) {
    const db = readLocalDb();
    db.settings = { ...db.settings, theme, costPerTiffin, maxTiffins };
    writeLocalDb(db);
    return db.settings;
  } else {
    return await Settings.findOneAndUpdate(
      { key: 'global' },
      { theme, costPerTiffin, maxTiffins },
      { upsert: true, new: true }
    );
  }
}

async function clearAllData() {
  if (useLocalJsonDb) {
    const db = readLocalDb();
    db.meals = {};
    writeLocalDb(db);
  } else {
    await MealLog.deleteMany({});
  }
}

// Automatically populate defaults for past and current days if they don't exist
async function ensureDefaultsForMonth(year, month) {
  const y = Number(year);
  const m = Number(month); // 0-indexed month
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  let existingLogs = {};
  if (useLocalJsonDb) {
    const db = readLocalDb();
    existingLogs = db.meals || {};
  } else {
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
    const logs = await MealLog.find({ date: new RegExp(`^${prefix}`) });
    logs.forEach(log => {
      existingLogs[log.date] = { lunch: log.lunch, dinner: log.dinner };
    });
  }
  
  let dbChanged = false;
  const dbUpdates = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Skip future dates
    if (dateStr > todayStr) {
      continue;
    }
    
    if (!existingLogs[dateStr]) {
      const dateObj = new Date(y, m, d);
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;
      
      const defaultLunch = true;
      const defaultDinner = !isSunday;
      
      existingLogs[dateStr] = { lunch: defaultLunch, dinner: defaultDinner };
      
      if (useLocalJsonDb) {
        dbChanged = true;
      } else {
        dbUpdates.push(
          MealLog.findOneAndUpdate(
            { date: dateStr },
            { lunch: defaultLunch, dinner: defaultDinner },
            { upsert: true, new: true }
          )
        );
      }
    }
  }
  
  if (useLocalJsonDb && dbChanged) {
    const db = readLocalDb();
    db.meals = { ...db.meals, ...existingLogs };
    writeLocalDb(db);
  } else if (!useLocalJsonDb && dbUpdates.length > 0) {
    await Promise.all(dbUpdates);
  }
  
  const monthData = {};
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
  Object.keys(existingLogs).forEach(date => {
    if (date.startsWith(prefix)) {
      monthData[date] = existingLogs[date];
    }
  });
  
  return monthData;
}

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
    const monthData = await ensureDefaultsForMonth(year, month);
    return res.json(monthData);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Update or log a meal
app.post('/api/meals/:date', authenticate, async (req, res) => {
  try {
    const { date } = req.params;
    const { lunch, dinner } = req.body;
    const log = await saveMealLog(date, lunch, dinner);
    return res.json(log);
  } catch (error) {
    console.error('Error saving meal log:', error);
    return res.status(500).json({ error: 'Failed to save meal log' });
  }
});

// Get settings
app.get('/api/settings', authenticate, async (req, res) => {
  try {
    const settings = await findSettings();
    return res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
app.post('/api/settings', authenticate, async (req, res) => {
  try {
    const { theme, costPerTiffin, maxTiffins } = req.body;
    const settings = await updateSettingsData(theme, costPerTiffin, maxTiffins);
    return res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Clear all logs
app.post('/api/clear-all', authenticate, async (req, res) => {
  try {
    await clearAllData();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error clearing database:', error);
    return res.status(500).json({ error: 'Failed to clear database' });
  }
});

// Static assets serving in production
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
