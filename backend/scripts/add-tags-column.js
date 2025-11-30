const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function addTagsColumn() {
  const connectionString = process.env.DATABASE_URL || '';
  const isNeon = connectionString.includes('neon') || connectionString.includes('neon.tech');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' || isNeon
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected to database successfully\n');

    // Check if column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'tags'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✓ Tags column already exists');
      client.release();
      await pool.end();
      process.exit(0);
    }

    // Add tags column
    console.log('Adding tags column to tasks table...');
    await client.query(`
      ALTER TABLE tasks 
      ADD COLUMN tags TEXT
    `);
    console.log('✓ Tags column added successfully');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error adding tags column:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    await pool.end();
    process.exit(1);
  }
}

addTagsColumn();
