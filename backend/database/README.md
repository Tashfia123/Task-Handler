# Database Initialization

## Automatic Initialization (Recommended)

The database tables are **automatically created** when you start the server. Just make sure:

1. Your `.env` file has the correct `DATABASE_URL`
2. The database exists (or you have permission to create it)
3. Start the server: `npm start`

The server will automatically create the `tasks` table and index on startup.

## Manual Initialization

If you prefer to initialize the database manually, follow these steps:

### Step 1: Create the Database

Connect to PostgreSQL as a superuser and create the database:

```bash
# Using psql command line
psql -U postgres

# Then in psql:
CREATE DATABASE taskmanagement;
\q
```

### Step 2: Run the SQL Script

```bash
# Connect to your database
psql -U postgres -d taskmanagement

# Run the initialization script
\i database/init.sql

# Or copy and paste the SQL commands from init.sql
```

### Step 3: Verify

Check that the table was created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tasks';
```

## Connection String Format

Your `.env` file should have:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

**Examples:**

**Local PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanagement
```

**Cloud Database (Neon, Supabase, etc.):**
```
DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## Troubleshooting

- **"database does not exist"**: Create the database first (Step 1 above)
- **"password authentication failed"**: Check your `.env` file credentials
- **"permission denied"**: Make sure your user has CREATE TABLE permissions

