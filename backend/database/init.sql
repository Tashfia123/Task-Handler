-- Task Management Database Initialization Script
-- Run this script to manually initialize the database

-- Create the database (run this as a superuser/postgres user)
-- CREATE DATABASE taskmanagement;

-- Connect to the taskmanagement database, then run the following:

-- Create tasks table with CHECK constraints
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status VARCHAR(20) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
  assigned_to VARCHAR(255),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add/update constraints for existing tables
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_priority_check,
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('High', 'Medium', 'Low'));

ALTER TABLE tasks 
ADD CONSTRAINT tasks_status_check CHECK (status IN ('To Do', 'In Progress', 'Completed'));

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Verify table creation
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

