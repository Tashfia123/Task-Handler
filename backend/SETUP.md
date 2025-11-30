# Database Setup Instructions

## Error Explanation

The error `password authentication failed for user "username"` occurs because:
1. The server is trying to connect to PostgreSQL using placeholder credentials
2. You need to create a `.env` file with your actual database connection details

## Steps to Fix

1. **Create a `.env` file** in the `backend` folder (not `.env.example`)

2. **Add your PostgreSQL connection string** in this format:
   ```
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DATABASE_NAME
   PORT=5000
   NODE_ENV=development
   ```

3. **Example connection strings:**
   
   **Local PostgreSQL:**
   ```
   DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/taskmanagement
   ```
   
   **Cloud PostgreSQL (like Neon, Supabase, etc.):**
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

4. **Replace these values:**
   - `YOUR_USERNAME` - Your PostgreSQL username (often `postgres`)
   - `YOUR_PASSWORD` - Your PostgreSQL password
   - `YOUR_HOST` - Database host (usually `localhost` for local, or a cloud URL)
   - `YOUR_PORT` - Database port (usually `5432` for PostgreSQL)
   - `YOUR_DATABASE_NAME` - Name of your database (e.g., `taskmanagement`)

5. **Save the file** and restart the server:
   ```bash
   npm start
   ```

## Important Notes

- The `.env` file should be in the `backend` folder
- Never commit `.env` to git (it's already in `.gitignore`)
- Make sure your PostgreSQL server is running
- Make sure the database exists (or the connection string will create it if permissions allow)

