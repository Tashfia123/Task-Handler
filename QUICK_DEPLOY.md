# Quick Deployment Guide for Vercel

## 🚀 Deploy Frontend on Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
5. Add Environment Variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api` (you'll update this after deploying backend)
6. Click **"Deploy"**

### Step 3: Deploy Backend on Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Node.js
5. Set **Root Directory** to `backend`
6. Add Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. Railway will deploy automatically
8. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

### Step 4: Update Frontend Environment Variable

1. Go back to Vercel dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Update `REACT_APP_API_URL` to: `https://your-backend-url.railway.app/api`
4. Redeploy (Vercel will auto-redeploy)

### Step 5: Initialize Database

Run this command locally (or use Railway's console):

```bash
cd backend
DATABASE_URL=your_production_database_url npm run init-db
```

Or use Railway's built-in terminal:
1. Go to Railway project
2. Click on your service
3. Open **"Deploy Logs"** or **"Settings"** → **"Run Command"**
4. Run: `npm run init-db`

## ✅ Verify Deployment

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for any errors
4. Try creating a task
5. Verify it appears in the database

## 🔧 Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check Railway logs for CORS errors

### API Not Connecting
- Verify `REACT_APP_API_URL` in Vercel is correct
- Check Railway logs for backend errors
- Test backend directly: `https://your-backend.railway.app/api/health`

### Database Issues
- Verify `DATABASE_URL` is correct in Railway
- Run `npm run init-db` to initialize tables
- Check Railway logs for database connection errors

## 📝 Environment Variables Checklist

### Vercel (Frontend)
- ✅ `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

### Railway (Backend)
- ✅ `DATABASE_URL` = Your PostgreSQL connection string
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `5000` (or let Railway assign)
- ✅ `FRONTEND_URL` = `https://your-vercel-app.vercel.app`

## 🎉 You're Done!

Your app should now be live on Vercel with the backend on Railway!

