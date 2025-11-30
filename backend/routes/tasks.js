const express = require('express');
const router = express.Router();
const { VALID_STATUSES, VALID_PRIORITIES } = require('../constants');

// Validation middleware
const validateTask = (req, res, next) => {
  const { status, priority } = req.body;
  
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
    });
  }
  
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ 
      error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` 
    });
  }
  
  next();
};

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    if (error.code === '42P01') {
      return res.status(500).json({ 
        error: 'Database table does not exist. Please run: npm run init-db',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      details: error.message,
      code: error.code
    });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    // Try with id as-is first (for integer IDs)
    let result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    // If not found and id looks like UUID, try with text comparison
    if (result.rows.length === 0 && id.includes('-')) {
      result = await pool.query('SELECT * FROM tasks WHERE id::text = $1', [String(id)]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', validateTask, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { title, description, priority, status, assigned_to, due_date, tags } = req.body;
    
    if (!title || !priority || !status) {
      return res.status(400).json({ error: 'Title, priority, and status are required' });
    }
    
    // Additional validation (redundant but safe)
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }
    
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ 
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` 
      });
    }
    
    // Convert tags array to comma-separated string if it's an array
    const tagsString = Array.isArray(tags) ? tags.join(', ') : (tags || null);
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, priority, status, assigned_to, due_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || null, priority, status, assigned_to || null, due_date || null, tagsString]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Provide more specific error messages
    if (error.code === '42P01') {
      return res.status(500).json({ 
        error: 'Database table does not exist. Please run: npm run init-db',
        details: error.message 
      });
    } else if (error.code === '23514') {
      // CHECK constraint violation
      return res.status(400).json({ 
        error: 'Invalid status or priority value',
        details: error.message,
        hint: `Status must be one of: ${VALID_STATUSES.join(', ')}. Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    } else if (error.code === '28P01' || error.code === '3D000') {
      return res.status(500).json({ 
        error: 'Database connection failed. Please check your DATABASE_URL in .env file',
        details: error.message 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to create task',
        details: error.message,
        code: error.code
      });
    }
  }
});

// Update a task
router.put('/:id', validateTask, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    const { title, description, priority, status, assigned_to, due_date, tags } = req.body;
    
    console.log('Update request - ID:', id, 'Type:', typeof id);
    console.log('Update request - Body:', req.body);
    
    // Validate status and priority if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }
    
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ 
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` 
      });
    }
    
    // Convert tags array to comma-separated string if it's an array
    const tagsString = tags !== undefined ? (Array.isArray(tags) ? tags.join(', ') : tags) : null;
    
    // Use COALESCE approach (simpler and was working before)
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           status = COALESCE($4, status),
           assigned_to = COALESCE($5, assigned_to),
           due_date = COALESCE($6, due_date),
           tags = COALESCE($7, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, priority, status, assigned_to, due_date, tagsString, id]
    );
    
    if (result.rows.length === 0) {
      // Try with text comparison if id looks like UUID
      if (String(id).includes('-')) {
        const retryResult = await pool.query(
          `UPDATE tasks 
           SET title = COALESCE($1, title),
               description = COALESCE($2, description),
               priority = COALESCE($3, priority),
               status = COALESCE($4, status),
               assigned_to = COALESCE($5, assigned_to),
               due_date = COALESCE($6, due_date),
               tags = COALESCE($7, tags),
               updated_at = CURRENT_TIMESTAMP
           WHERE id::text = $8
           RETURNING *`,
          [title, description, priority, status, assigned_to, due_date, tagsString, String(id)]
        );
        
        if (retryResult.rows.length === 0) {
          return res.status(404).json({ error: 'Task not found', taskId: id });
        }
        
        return res.json(retryResult.rows[0]);
      }
      
      return res.status(404).json({ error: 'Task not found', taskId: id });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    if (error.code === '23514') {
      // CHECK constraint violation
      return res.status(400).json({ 
        error: 'Invalid status or priority value',
        details: error.message,
        hint: `Status must be one of: ${VALID_STATUSES.join(', ')}. Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update task',
      details: error.message,
      code: error.code
    });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    
    // Try with id as-is first (for integer IDs)
    let result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    // If not found and id looks like UUID, try with text comparison
    if (result.rows.length === 0 && id.includes('-')) {
      result = await pool.query('DELETE FROM tasks WHERE id::text = $1 RETURNING *', [String(id)]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM tasks');
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM tasks 
       GROUP BY status`
    );
    
    const today = new Date();
    const overdueResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE due_date < $1 AND status != 'Completed'`,
      [today]
    );
    
    const stats = {
      total: parseInt(totalResult.rows[0].count),
      byStatus: {},
      overdue: parseInt(overdueResult.rows[0].count)
    };
    
    statusResult.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;

