# Deploy Both Backend and Frontend on Vercel

This guide will help you deploy both the frontend and backend on Vercel as a single project.

## 🎯 Architecture

- **Frontend**: React app deployed as static site on Vercel
- **Backend**: Express.js API converted to Vercel serverless functions
- **Database**: PostgreSQL (Neon, Supabase, or any PostgreSQL provider)

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free tier works)
3. PostgreSQL database (Neon, Supabase, or similar)

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

1. Make sure all changes are committed:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Navigate to project root:
```bash
cd /path/to/Task_managament
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Enter a name or press Enter for default)
   - Directory? **./** (current directory)
   - Override settings? **No**

6. Add environment variables:
```bash
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

vercel env add NODE_ENV
# Enter: production

vercel env add FRONTEND_URL
# Enter: https://your-project.vercel.app (will be provided after first deploy)
```

7. Redeploy with environment variables:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in

2. Click **"Add New"** → **"Project"**

3. Import your GitHub repository

4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of repository)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd backend && npm install && cd ../frontend && npm install`

5. Add Environment Variables:
   - Go to **Settings** → **Environment Variables**
   - Add the following:
     ```
     DATABASE_URL=your_postgresql_connection_string
     NODE_ENV=production
     FRONTEND_URL=https://your-project.vercel.app
     ```

6. Click **"Deploy"**

### Step 3: Initialize Database

After deployment, initialize the database:

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Functions**
3. Or use Vercel CLI:
```bash
vercel env pull .env.local
cd backend
DATABASE_URL=your_database_url npm run init-db
```

Alternatively, you can trigger database initialization by making a request to any API endpoint - it will auto-initialize on first request.

### Step 4: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Check browser console (F12) for any errors
3. Test the API: Visit `https://your-project.vercel.app/api/health`
4. Try creating a task in the app

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Your Vercel app URL | `https://your-app.vercel.app` |

### Optional Variables

- `REACT_APP_API_URL`: Override API URL (defaults to `/api` in production)

## 📁 Project Structure for Vercel

```
Task_managament/
├── api/
│   └── index.js          # Vercel serverless function (backend)
├── backend/
│   ├── routes/
│   │   └── tasks.js       # API routes
│   └── package.json
├── frontend/
│   ├── src/
│   ├── build/             # Built files (generated)
│   └── package.json
├── vercel.json            # Vercel configuration
└── package.json
```

## 🐛 Troubleshooting

### API Not Working

1. Check Vercel function logs:
   - Go to Vercel dashboard → Your project → **Functions** tab
   - Check for errors in logs

2. Test API endpoint directly:
   ```
   https://your-app.vercel.app/api/health
   ```

3. Verify environment variables are set:
   - Go to **Settings** → **Environment Variables**
   - Make sure all variables are added

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if database allows connections from Vercel IPs
3. For Neon/Supabase, ensure SSL is enabled
4. Check function logs for database errors

### CORS Errors

1. Verify `FRONTEND_URL` matches your Vercel URL
2. Check browser console for CORS error details
3. Ensure backend CORS configuration allows your domain

### Build Errors

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Vercel uses Node 18.x by default)

## 🔄 Updating Deployment

After making changes:

1. Commit and push to GitHub:
```bash
git add .
git commit -m "Update app"
git push origin main
```

2. Vercel will automatically redeploy (if connected to GitHub)

Or manually deploy:
```bash
vercel --prod
```

## 📝 Notes

- **Serverless Functions**: The backend runs as Vercel serverless functions
- **Cold Starts**: First request after inactivity may be slower (cold start)
- **Database Connections**: Connection pooling is optimized for serverless
- **Environment Variables**: Set in Vercel dashboard, not in `.env` files
- **API Routes**: All `/api/*` routes are handled by serverless functions

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Database initialized
- [ ] API health check works (`/api/health`)
- [ ] Frontend loads correctly
- [ ] Can create tasks
- [ ] Tasks persist in database

## 🎉 You're Done!

Your full-stack app is now live on Vercel with both frontend and backend deployed together!

