# Database Constraint Migration Guide

## Problem
The database has CHECK constraints that don't match the application's expected values, causing errors when creating tasks with `status="To Do"` and `priority="Medium"`.

## Solution
All database constraints and validation have been updated to use consistent values:

- **Status values**: `'To Do'`, `'In Progress'`, `'Completed'`
- **Priority values**: `'High'`, `'Medium'`, `'Low'`

## Steps to Fix

### Option 1: Run Migration Script (Recommended for Existing Databases)

```bash
cd backend
npm run migrate-constraints
```

This will:
- Update existing database constraints
- Add proper CHECK constraints for status and priority
- Verify the constraints are applied correctly

### Option 2: Reinitialize Database (For New/Empty Databases)

```bash
cd backend
npm run init-db
```

This will:
- Create the table with correct constraints if it doesn't exist
- Update constraints if the table already exists

### Option 3: Restart Server (Auto-migration)

Simply restart your backend server:

```bash
cd backend
npm start
```

The server will automatically update constraints on startup.

## What Was Changed

### 1. Database Schema
- Added CHECK constraints: `status IN ('To Do', 'In Progress', 'Completed')`
- Added CHECK constraints: `priority IN ('High', 'Medium', 'Low')`

### 2. Backend Validation
- Added validation middleware in `routes/tasks.js`
- Validates status and priority before database operations
- Returns clear error messages for invalid values

### 3. Frontend
- Already using correct values (no changes needed)
- Status options: To Do, In Progress, Completed
- Priority options: High, Medium, Low

## Verification

After running the migration, test by creating a task with:
- Status: "To Do"
- Priority: "Medium"

This should now work without errors.

## Troubleshooting

### Error: "constraint violation" during migration
If you have existing tasks with invalid status/priority values, you'll need to update them first:

```sql
-- Update any invalid status values
UPDATE tasks SET status = 'To Do' WHERE status NOT IN ('To Do', 'In Progress', 'Completed');

-- Update any invalid priority values  
UPDATE tasks SET priority = 'Medium' WHERE priority NOT IN ('High', 'Medium', 'Low');
```

Then run the migration again.

### Error: "constraint already exists"
This is normal - the migration script handles this automatically.

## Files Modified

- `backend/scripts/init-db.js` - Updated schema with CHECK constraints
- `backend/server.js` - Updated auto-initialization with constraints
- `backend/routes/tasks.js` - Added validation middleware
- `backend/constants.js` - Centralized valid values
- `backend/database/init.sql` - Updated SQL schema
- `backend/scripts/migrate-constraints.js` - New migration script

