const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrateConstraints() {
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

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tasks table does not exist. Please run: npm run init-db');
      client.release();
      await pool.end();
      process.exit(1);
    }

    console.log('✓ Tasks table exists');
    console.log('Updating constraints...\n');

    // Drop existing constraints if they exist
    try {
      await client.query(`
        ALTER TABLE tasks 
        DROP CONSTRAINT IF EXISTS tasks_priority_check,
        DROP CONSTRAINT IF EXISTS tasks_status_check
      `);
      console.log('✓ Removed old constraints (if any)');
    } catch (error) {
      console.log('ℹ No old constraints to remove');
    }

    // Add new constraints
    await client.query(`
      ALTER TABLE tasks 
      ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('High', 'Medium', 'Low'))
    `);
    console.log('✓ Added priority constraint: High, Medium, Low');

    await client.query(`
      ALTER TABLE tasks 
      ADD CONSTRAINT tasks_status_check CHECK (status IN ('To Do', 'In Progress', 'Completed'))
    `);
    console.log('✓ Added status constraint: To Do, In Progress, Completed');

    // Verify constraints
    const constraints = await client.query(`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name IN ('tasks_priority_check', 'tasks_status_check')
    `);

    console.log('\n✓ Migration completed successfully!');
    console.log('\nCurrent constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}`);
    });

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === '23514') {
      console.error('\n⚠ Some existing data violates the new constraints.');
      console.error('Please update existing tasks to use valid status/priority values before running this migration.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

migrateConstraints();

