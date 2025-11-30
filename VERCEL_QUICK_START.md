# Quick Start: Deploy on Vercel

## 🚀 Fast Deployment (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
vercel
```

### Step 4: Add Environment Variables
```bash
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

vercel env add NODE_ENV
# Enter: production
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

## ✅ Done!

Your app is now live at: `https://your-project.vercel.app`

- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/health`

## 🔧 Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `./` (root)
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd backend && npm install && cd ../frontend && npm install`
5. Add Environment Variables:
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `NODE_ENV` = `production`
6. Click **"Deploy"**

## 📝 Notes

- Database will auto-initialize on first API request
- All `/api/*` routes go to serverless functions
- Frontend is served as static files
- Environment variables are set in Vercel dashboard

