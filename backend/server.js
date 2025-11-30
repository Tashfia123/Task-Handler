const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const taskRoutes = require('./routes/tasks');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectionString = process.env.DATABASE_URL || '';
const isNeon = connectionString.includes('neon') || connectionString.includes('neon.tech');

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || isNeon
    ? { rejectUnauthorized: false } 
    : false
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Make pool available to routes
app.locals.pool = pool;

// Routes
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful',
      database: {
        time: result.rows[0].current_time,
        version: result.rows[0].pg_version.split(',')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message,
      code: error.code
    });
  }
});

// Initialize database tables
async function initializeDatabase() {
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
    
    // Add tags column if it doesn't exist (for existing databases created before tags was added)
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
      // Column might already exist or table doesn't exist yet
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
      // Constraints might already exist, that's okay
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
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  
  // Initialize database (non-blocking)
  initializeDatabase().catch(err => {
    console.error('Database initialization failed:', err.message);
    console.log('Server is still running, but database operations may fail.');
    console.log('Please check your DATABASE_URL in .env file and restart the server.');
  });
});

