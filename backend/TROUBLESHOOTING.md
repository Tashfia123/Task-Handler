# Troubleshooting Guide

## Error: ERR_CONNECTION_REFUSED (Frontend can't connect to backend)

### Step 1: Check if Backend Server is Running

Open a terminal in the `backend` folder and run:
```bash
npm start
```

You should see:
```
Server is running on port 5000
API available at http://localhost:5000/api
Connected to PostgreSQL database
Database tables initialized successfully
```

### Step 2: Check Database Connection

If you see database errors, validate your `.env` file:
```bash
npm run validate-env
```

### Step 3: Verify .env File

Make sure your `backend/.env` file exists and has:
```env
DATABASE_URL=postgresql://username:password@host:port/database
PORT=5000
NODE_ENV=development
```

For Neon PostgreSQL:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
PORT=5000
NODE_ENV=development
```

### Step 4: Initialize Database

If database tables don't exist:
```bash
npm run init-db
```

### Step 5: Check Port Conflicts

Make sure port 5000 is not being used by another application:
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

## Error: Failed to add task / AxiosError

### Causes:
1. **Backend server not running** - Start it with `npm start` in backend folder
2. **Database connection failed** - Check your `.env` file
3. **Database tables not created** - Run `npm run init-db`

### Quick Fix:
1. Open terminal in `backend` folder
2. Run `npm run validate-env` to check .env
3. Run `npm run init-db` to create tables
4. Run `npm start` to start server
5. Keep the terminal open (server must stay running)

## Error: Database connection failed

### For Neon PostgreSQL:
1. Make sure your connection string includes `?sslmode=require`
2. Verify the connection string in Neon Console
3. Check that your Neon project is active (not paused)

### Common Issues:
- **"password authentication failed"** - Wrong credentials in DATABASE_URL
- **"ENOTFOUND base"** - Incomplete/malformed connection string
- **"database does not exist"** - Wrong database name in connection string

## Quick Checklist

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] `.env` file exists in `backend` folder
- [ ] `DATABASE_URL` is correctly formatted
- [ ] Database tables are created (`npm run init-db`)
- [ ] Frontend is running (`npm start` in frontend folder)
- [ ] No port conflicts (port 5000 available)

## Testing the Connection

1. **Test backend health:**
   Open browser: http://localhost:5000/api/health
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Test database:**
   ```bash
   cd backend
   npm run init-db
   ```

3. **Test API:**
   ```bash
   curl http://localhost:5000/api/tasks
   ```

