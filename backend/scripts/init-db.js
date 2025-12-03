const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL || '';
  const isNeon = connectionString.includes('neon') || connectionString.includes('neon.tech');
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' || isNeon
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected to database successfully');

    // Create tasks table with CHECK constraints
    console.log('Creating tasks table...');
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
        subtasks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tasks table created');
    
    // Add constraints to existing table if they don't exist (for existing databases)
    console.log('Adding/updating constraints...');
    try {
      // Drop existing constraints if they exist (to avoid conflicts)
      await client.query(`
        ALTER TABLE tasks 
        DROP CONSTRAINT IF EXISTS tasks_priority_check,
        DROP CONSTRAINT IF EXISTS tasks_status_check
      `);
      
      // Add new constraints
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('High', 'Medium', 'Low'))
      `);
      
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_status_check CHECK (status IN ('To Do', 'In Progress', 'Completed'))
      `);
      
      console.log('✓ Constraints added/updated');
    } catch (constraintError) {
      // Constraints might already exist, that's okay
      if (!constraintError.message.includes('already exists')) {
        console.log('⚠ Note: Some constraints may already exist');
      }
    }

    // Ensure subtasks column exists on existing databases
    console.log('Ensuring subtasks column exists...');
    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb
    `);
    console.log('✓ Subtasks column ready');
    
    // Create index on status for better query performance
    console.log('Creating index on status...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
    `);
    console.log('✓ Index created');

    // Verify table creation
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Database initialized successfully!');
    console.log('\nTable structure:');
    console.table(result.rows);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error initializing database:');
    console.error(error.message);
    
    if (error.code === '28P01') {
      console.error('\n⚠ Authentication failed. Please check your DATABASE_URL in .env file');
    } else if (error.code === '3D000') {
      console.error('\n⚠ Database does not exist. Please create it first or check your DATABASE_URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠ Connection refused. Please check if your database server is running');
    } else if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
      console.error('\n⚠ Hostname not found. Your DATABASE_URL appears to be malformed.');
      console.error('\nPlease check your .env file. The connection string should look like:');
      console.error('DATABASE_URL=postgresql://username:password@host:port/database');
      console.error('\nFor Neon PostgreSQL, it should be:');
      console.error('DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require');
      console.error('\nRun "npm run validate-env" to check your .env file format.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();

