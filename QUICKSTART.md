# Quick Start Guide

## What Goes Where?

### 🌐 Vercel (Frontend Only)
**Files to deploy:**
- `src/` - React application
- `index.html` - Entry point
- `vite.config.ts` - Build configuration
- `package.json` - Frontend dependencies
- `vercel.json` - Vercel configuration

**What it does:**
- Serves the React UI
- Makes API calls to Google Cloud backend
- Handles user interface only

**Environment variables needed:**
```
VITE_API_URL=https://YOUR_GCP_IP:3000
VITE_GEMINI_API_KEY=your_gemini_key
```

---

### ☁️ Google Cloud (Backend Only)
**Files to deploy:**
- `server.ts` - Main server file
- `server/` - All backend modules
- `backend.package.json` → rename to `package.json`
- `ecosystem.config.cjs` - PM2 configuration
- `ethiopia_stations.json` - Station data
- `.env` - Environment variables

**What it does:**
- Records radio streams with FFmpeg
- Processes audio with Gemini AI
- Stores recordings locally + Supabase
- Runs scheduled tasks (cron jobs)
- Serves API endpoints

**Environment variables needed:**
```
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## Deployment Steps (TL;DR)

### 1. Deploy Backend First

```bash
# SSH into Google Cloud VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Clone repo
git clone YOUR_REPO_URL
cd ethioradio

# Setup backend
cp backend.package.json package.json
npm install

# Create .env file with your keys
nano .env

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Get your IP
curl ifconfig.me
```

Your backend is now at: `http://YOUR_IP:3000`

### 2. Deploy Frontend to Vercel

```bash
# In your local project
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL = http://YOUR_GCP_IP:3000
# VITE_GEMINI_API_KEY = your_key

# Deploy to production
vercel --prod
```

Done! Your app is live.

---

## File Structure

```
ethioradio/
├── 📁 DEPLOY TO VERCEL
│   ├── src/                    # React app
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json            # Frontend deps
│   └── vercel.json
│
├── 📁 DEPLOY TO GOOGLE CLOUD
│   ├── server.ts               # Main server
│   ├── server/                 # Backend modules
│   │   ├── ai.ts
│   │   ├── recording.ts
│   │   ├── scheduler.ts
│   │   ├── storage.ts
│   │   └── ...
│   ├── backend.package.json    # Backend deps
│   ├── ecosystem.config.cjs    # PM2 config
│   ├── Dockerfile              # Optional
│   └── .env                    # Secrets
│
└── 📁 DOCUMENTATION
    ├── DEPLOYMENT.md           # Full guide
    ├── DOCUMENTATION.md        # Technical docs
    └── QUICKSTART.md           # This file
```

---

## Testing Locally

### Backend
```bash
npm run dev
# Runs on http://localhost:3000
```

### Frontend
```bash
# In another terminal
cd src
npm run dev
# Runs on http://localhost:5173
# Proxies API calls to localhost:3000
```

---

## Common Issues

### CORS Error
- Add your Vercel URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart backend: `pm2 restart ethioradio-backend`

### API calls fail
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is running: `pm2 status`
- Check firewall: Port 3000 must be open

### FFmpeg not found
```bash
sudo apt install ffmpeg
```

---

## Need Help?

1. Check logs:
   - Backend: `pm2 logs ethioradio-backend`
   - Frontend: Vercel dashboard → Deployments → Logs

2. Read full guide: `DEPLOYMENT.md`

3. Check documentation: `DOCUMENTATION.md`
