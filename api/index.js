// Vercel serverless function entry point
// This wraps the Express app for Vercel's serverless environment

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const taskRoutes = require(path.join(__dirname, '../backend/routes/tasks'));

const app = express();

// Configure CORS to allow requests from Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
    ].filter(Boolean);
    
    // Allow Vercel preview and production domains
    if (origin.includes('vercel.app') || origin.includes('vercel.dev')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const connectionString = process.env.DATABASE_URL || '';
const isNeon = connectionString.includes('neon') || connectionString.includes('neon.tech');

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || isNeon
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pool settings for serverless
  max: 1, // Limit connections in serverless environment
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Make pool available to routes
app.locals.pool = pool;

// Routes
// Note: Vercel routes /api/* to this function, so paths should include /api
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Management API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      tasks: '/api/tasks'
    }
  });
});

// Initialize database tables (run once)
let dbInitialized = false;
async function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    const client = await pool.connect();
    
    // Create tasks table with CHECK constraints
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
        status VARCHAR(20) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
        assigned_to VARCHAR(255),
        due_date DATE,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add tags column if it doesn't exist
    try {
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'tags'
      `);
      
      if (columnCheck.rows.length === 0) {
        await client.query(`
          ALTER TABLE tasks 
          ADD COLUMN tags TEXT
        `);
        console.log('✓ Added tags column to existing table');
      }
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        console.log('Note: Tags column check -', error.message);
      }
    }
    
    // Add/update constraints for existing tables
    try {
      await client.query(`
        ALTER TABLE tasks 
        DROP CONSTRAINT IF EXISTS tasks_priority_check,
        DROP CONSTRAINT IF EXISTS tasks_status_check
      `);
      
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('High', 'Medium', 'Low'))
      `);
      
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_status_check CHECK (status IN ('To Do', 'In Progress', 'Completed'))
      `);
    } catch (constraintError) {
      if (!constraintError.message.includes('already exists')) {
        console.log('Note: Updating constraints...');
      }
    }
    
    // Create index on status for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
    `);
    
    console.log('Database tables initialized successfully');
    client.release();
    dbInitialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on first request
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    await initializeDatabase();
  }
  next();
});

// Export for Vercel serverless functions
// Vercel's @vercel/node can handle Express apps directly
module.exports = app;

