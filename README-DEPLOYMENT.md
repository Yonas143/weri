# 🚀 Deployment Guide: Vercel + Google Cloud

## Quick Overview

Your EthioRadio Intelligence Engine is now split into:

| Component | Platform | What It Does |
|-----------|----------|--------------|
| **Frontend** | Vercel | React UI, user interface |
| **Backend** | Google Cloud | API, FFmpeg recording, AI processing |

---

## 📋 Prerequisites

### For Backend (Google Cloud)
- Google Cloud account
- `gcloud` CLI installed
- Basic Linux knowledge

### For Frontend (Vercel)
- Vercel account (free)
- `vercel` CLI installed
- Your backend URL

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend to Google Cloud

#### Option A: Using the Script (Easiest)

```bash
# SSH into your Google Cloud VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Clone your repository
git clone YOUR_REPO_URL
cd ethioradio

# Run the deployment script
bash deploy-backend.sh

# Edit environment variables
nano .env

# Start the server
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Option B: Manual Setup

See `DEPLOYMENT.md` for detailed manual instructions.

---

### Step 2: Get Your Backend URL

```bash
# On your Google Cloud VM
curl ifconfig.me
```

Your backend URL is: `http://YOUR_IP:3000`

---

### Step 3: Deploy Frontend to Vercel

#### Option A: Using the Script

```bash
# On your local machine
cd ethioradio

# Edit .env.production with your backend URL
nano .env.production

# Run deployment script
bash deploy-frontend.sh
```

#### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

---

## 🔐 Environment Variables

### Backend (.env on Google Cloud)

```bash
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_actual_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel Dashboard)

```bash
VITE_API_URL=http://YOUR_GCP_IP:3000
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## ✅ Verification

### Test Backend

```bash
# Check if backend is running
curl http://YOUR_IP:3000/api/stations

# Should return JSON with stations
```

### Test Frontend

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for CORS errors
4. Try recording a station

---

## 🐛 Troubleshooting

### CORS Error

**Problem**: Frontend can't connect to backend

**Solution**:
```bash
# On Google Cloud VM
nano .env
# Add your Vercel URL to ALLOWED_ORIGINS
# Example: ALLOWED_ORIGINS=https://your-app.vercel.app

# Restart backend
pm2 restart ethioradio-backend
```

### Backend Not Responding

**Problem**: Can't reach backend API

**Solution**:
```bash
# Check if server is running
pm2 status

# Check logs
pm2 logs ethioradio-backend

# Restart if needed
pm2 restart ethioradio-backend
```

### FFmpeg Not Found

**Problem**: Recording fails

**Solution**:
```bash
# Install FFmpeg
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

### Port 3000 Blocked

**Problem**: Can't access backend from internet

**Solution**:
```bash
# Create firewall rule
gcloud compute firewall-rules create allow-ethioradio \
  --allow=tcp:3000 \
  --target-tags=http-server
```

---

## 📊 Monitoring

### Backend Logs

```bash
# View live logs
pm2 logs ethioradio-backend

# View last 100 lines
pm2 logs ethioradio-backend --lines 100

# View error logs only
pm2 logs ethioradio-backend --err
```

### Frontend Logs

- Go to Vercel dashboard
- Select your project
- Click "Deployments"
- View logs for each deployment

---

## 🔄 Updates

### Update Backend

```bash
# SSH into VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Pull latest code
cd ethioradio
git pull

# Restart
pm2 restart ethioradio-backend
```

### Update Frontend

```bash
# On local machine
git pull
vercel --prod
```

---

## 💰 Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Google Cloud VM (e2-small) | Always on | ~$13/month |
| Google Cloud Storage | 30GB | ~$2/month |
| Vercel | Hobby | Free |
| Supabase | Free tier | Free |
| **Total** | | **~$15/month** |

---

## 📚 Documentation

- **`QUICKSTART.md`** - Quick reference guide
- **`DEPLOYMENT.md`** - Detailed deployment instructions
- **`SEPARATION-SUMMARY.md`** - What was changed
- **`DOCUMENTATION.md`** - Technical architecture

---

## 🆘 Need Help?

1. Check logs first (PM2 for backend, Vercel for frontend)
2. Read the troubleshooting section above
3. Review `DEPLOYMENT.md` for detailed steps
4. Check environment variables are correct

---

## ✨ Success Checklist

- [ ] Backend deployed to Google Cloud
- [ ] Backend accessible at `http://YOUR_IP:3000`
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Can record stations
- [ ] Can analyze recordings
- [ ] Supabase backup working (optional)

---

## 🎉 You're Done!

Your EthioRadio Intelligence Engine is now live with:
- ✅ Frontend on Vercel (fast, global CDN)
- ✅ Backend on Google Cloud (persistent, powerful)
- ✅ FFmpeg recording working
- ✅ AI analysis functional
- ✅ Cloud backup enabled

Enjoy your deployed application! 🚀
