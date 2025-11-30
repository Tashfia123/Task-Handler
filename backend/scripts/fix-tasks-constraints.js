const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Valid values
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_STATUSES = ['To Do', 'In Progress', 'Completed'];

async function fixTasksConstraints() {
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

  const client = await pool.connect();

  try {
    console.log('Connecting to database...');
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

    console.log('✓ Tasks table exists\n');

    // Step 1: Find tasks with invalid values
    console.log('Step 1: Finding tasks with invalid priority or status values...');
    
    const invalidTasks = await client.query(`
      SELECT id, title, priority, status
      FROM tasks
      WHERE priority NOT IN ($1, $2, $3)
         OR status NOT IN ($4, $5, $6)
    `, [VALID_PRIORITIES[0], VALID_PRIORITIES[1], VALID_PRIORITIES[2], 
        VALID_STATUSES[0], VALID_STATUSES[1], VALID_STATUSES[2]]);

    console.log(`Found ${invalidTasks.rows.length} task(s) with invalid values\n`);

    if (invalidTasks.rows.length > 0) {
      console.log('Invalid tasks:');
      invalidTasks.rows.forEach((task, index) => {
        console.log(`  ${index + 1}. ID: ${task.id}, Title: "${task.title}"`);
        console.log(`     Current Priority: "${task.priority}" ${!VALID_PRIORITIES.includes(task.priority) ? '❌ INVALID' : '✓'}`);
        console.log(`     Current Status: "${task.status}" ${!VALID_STATUSES.includes(task.status) ? '❌ INVALID' : '✓'}`);
      });
      console.log('');
    }

    // Step 2: Update invalid priorities to 'Medium'
    console.log('Step 2: Updating invalid priority values to "Medium"...');
    const priorityUpdate = await client.query(`
      UPDATE tasks
      SET priority = 'Medium',
          updated_at = CURRENT_TIMESTAMP
      WHERE priority NOT IN ($1, $2, $3)
      RETURNING id, title, priority
    `, [VALID_PRIORITIES[0], VALID_PRIORITIES[1], VALID_PRIORITIES[2]]);

    const priorityCount = priorityUpdate.rowCount;
    console.log(`✓ Updated ${priorityCount} task(s) with invalid priority\n`);

    if (priorityCount > 0) {
      console.log('Updated tasks (priority):');
      priorityUpdate.rows.forEach((task, index) => {
        console.log(`  ${index + 1}. ID: ${task.id}, Title: "${task.title}" → Priority: "${task.priority}"`);
      });
      console.log('');
    }

    // Step 3: Update invalid statuses to 'To Do'
    console.log('Step 3: Updating invalid status values to "To Do"...');
    const statusUpdate = await client.query(`
      UPDATE tasks
      SET status = 'To Do',
          updated_at = CURRENT_TIMESTAMP
      WHERE status NOT IN ($1, $2, $3)
      RETURNING id, title, status
    `, [VALID_STATUSES[0], VALID_STATUSES[1], VALID_STATUSES[2]]);

    const statusCount = statusUpdate.rowCount;
    console.log(`✓ Updated ${statusCount} task(s) with invalid status\n`);

    if (statusCount > 0) {
      console.log('Updated tasks (status):');
      statusUpdate.rows.forEach((task, index) => {
        console.log(`  ${index + 1}. ID: ${task.id}, Title: "${task.title}" → Status: "${task.status}"`);
      });
      console.log('');
    }

    // Step 4: Summary
    const totalUpdated = priorityCount + statusCount;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Summary: Updated ${totalUpdated} task(s) total`);
    console.log(`  - Priority fixes: ${priorityCount}`);
    console.log(`  - Status fixes: ${statusCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 5: Update table constraints
    console.log('Step 4: Updating table constraints...\n');

    // Drop existing constraints if they exist
    try {
      await client.query(`
        ALTER TABLE tasks 
        DROP CONSTRAINT IF EXISTS tasks_priority_check,
        DROP CONSTRAINT IF EXISTS tasks_status_check
      `);
      console.log('✓ Removed old constraints (if any)');
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        console.log('ℹ No old constraints to remove');
      }
    }

    // Add new constraints
    try {
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_priority_check 
        CHECK (priority IN ('High', 'Medium', 'Low'))
      `);
      console.log('✓ Added priority constraint: High, Medium, Low');
    } catch (error) {
      if (error.code === '23514') {
        console.log('⚠ Some data still violates the constraint. Please check the data.');
        throw error;
      } else if (!error.message.includes('already exists')) {
        throw error;
      } else {
        console.log('✓ Priority constraint already exists');
      }
    }

    try {
      await client.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('To Do', 'In Progress', 'Completed'))
      `);
      console.log('✓ Added status constraint: To Do, In Progress, Completed');
    } catch (error) {
      if (error.code === '23514') {
        console.log('⚠ Some data still violates the constraint. Please check the data.');
        throw error;
      } else if (!error.message.includes('already exists')) {
        throw error;
      } else {
        console.log('✓ Status constraint already exists');
      }
    }

    // Verify constraints
    const constraints = await client.query(`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name IN ('tasks_priority_check', 'tasks_status_check')
      ORDER BY constraint_name
    `);

    console.log('\n✓ Constraints verified:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}`);
    });

    // Final verification - check if any invalid values remain
    const remainingInvalid = await client.query(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE priority NOT IN ($1, $2, $3)
         OR status NOT IN ($4, $5, $6)
    `, [VALID_PRIORITIES[0], VALID_PRIORITIES[1], VALID_PRIORITIES[2], 
        VALID_STATUSES[0], VALID_STATUSES[1], VALID_STATUSES[2]]);

    if (parseInt(remainingInvalid.rows[0].count) === 0) {
      console.log('\n✅ All tasks now have valid priority and status values!');
      console.log('✅ Constraints successfully applied!');
      console.log('\n✓ Script completed successfully!');
    } else {
      console.log(`\n⚠ Warning: ${remainingInvalid.rows[0].count} task(s) still have invalid values.`);
      console.log('This should not happen. Please investigate.');
    }

    client.release();
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Error fixing constraints:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === '23514') {
      console.error('\n⚠ Constraint violation detected.');
      console.error('Some data still violates the constraints.');
      console.error('The script attempted to fix invalid values, but some may remain.');
      console.error('Please check the data manually and try again.');
    } else if (error.code === '28P01') {
      console.error('\n⚠ Authentication failed. Check your DATABASE_URL in .env file');
    } else if (error.code === '3D000') {
      console.error('\n⚠ Database does not exist. Check your DATABASE_URL');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n⚠ Hostname not found. Check your DATABASE_URL format');
    }
    
    client.release();
    await pool.end();
    process.exit(1);
  }
}

// Run the script
fixTasksConstraints();

