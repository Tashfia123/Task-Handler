# Deployment Guide

This guide will help you deploy both the frontend and backend of the Task Management application.

## Architecture

- **Frontend**: React app deployed on Vercel
- **Backend**: Express.js API deployed on Railway/Render/Fly.io (or similar Node.js hosting)
- **Database**: PostgreSQL (Neon, Supabase, or any PostgreSQL provider)

## Prerequisites

1. GitHub account
2. Vercel account (for frontend)
3. Railway/Render account (for backend)
4. PostgreSQL database (Neon, Supabase, or similar)

## Step 1: Deploy Backend

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Railway will automatically detect Node.js and deploy
6. Note your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
6. Deploy and note your backend URL

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In the `backend` directory, run: `fly launch`
3. Add secrets:
   ```bash
   fly secrets set DATABASE_URL=your_postgresql_connection_string
   fly secrets set NODE_ENV=production
   fly secrets set FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. Deploy: `fly deploy`

## Step 2: Initialize Database

After backend is deployed, initialize the database:

1. SSH into your backend server (if possible) OR
2. Use a database migration tool OR
3. Run the init script locally pointing to your production database:

```bash
cd backend
DATABASE_URL=your_production_database_url npm run init-db
```

## Step 3: Deploy Frontend on Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Add environment variable:
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter your backend URL: https://your-backend.railway.app/api
   ```

### Method 2: Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend.railway.app/api` (your backend URL)
6. Click "Deploy"

## Step 4: Update Backend CORS

After deploying frontend, update your backend's `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Redeploy the backend if needed.

## Step 5: Verify Deployment

1. Visit your Vercel frontend URL
2. Check browser console for any errors
3. Test creating a task
4. Verify API calls are going to your backend

## Environment Variables Summary

### Frontend (Vercel)
- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)

### Backend (Railway/Render/Fly.io)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: `production`
- `PORT`: `5000` (or let the platform assign)
- `FRONTEND_URL`: Your Vercel frontend URL (for CORS)

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that backend CORS configuration allows your Vercel domain

### API Connection Issues
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check backend logs for errors
- Ensure backend is running and accessible

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from your backend hosting
- Ensure SSL is enabled for production databases

## Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:
- Push to `main` branch → Automatic deployment
- Preview deployments for pull requests

## Support

If you encounter issues:
1. Check backend logs
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Test API endpoints directly using curl or Postman

