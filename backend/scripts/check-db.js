const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkDatabase() {
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
    console.log('Checking database connection...');
    const client = await pool.connect();
    console.log('✓ Connected to database successfully\n');

    // Check if tasks table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (tableExists) {
      console.log('✓ Tasks table exists');
      
      // Count tasks
      const countResult = await client.query('SELECT COUNT(*) as count FROM tasks');
      console.log(`✓ Found ${countResult.rows[0].count} tasks in database`);
      
      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'tasks'
        ORDER BY ordinal_position
      `);
      
      console.log('\nTable structure:');
      console.table(columns.rows);
    } else {
      console.log('❌ Tasks table does NOT exist');
      console.log('\nTo create the table, run:');
      console.log('  npm run init-db');
    }

    client.release();
    await pool.end();
    process.exit(tableExists ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Database check failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === '42P01') {
      console.log('\n⚠ Table does not exist. Run: npm run init-db');
    } else if (error.code === '28P01') {
      console.log('\n⚠ Authentication failed. Check your DATABASE_URL in .env');
    } else if (error.code === '3D000') {
      console.log('\n⚠ Database does not exist. Check your DATABASE_URL');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n⚠ Hostname not found. Check your DATABASE_URL format');
    }
    
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();

