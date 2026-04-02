# 🔧 Google Cloud Backend - Complete Fix Guide

## Problem
Backend keeps crashing due to the old `--loader tsx` flag (deprecated in Node 20).

## Solution
Updated to use `--import tsx` flag. Follow these steps to fix your VM.

---

## Step 1: SSH into Your VM

```bash
gcloud compute ssh --zone "us-central1-a" "ethioradio-backend" --project "werinegari"
```

---

## Step 2: Pull Latest Code

```bash
cd ~/weri
git pull origin main
```

If you get an error about uncommitted changes:
```bash
git stash
git pull origin main
```

---

## Step 3: Setup Environment

Create `.env` file if it doesn't exist:

```bash
cd ~/weri
nano .env
```

Paste this EXACTLY:

```bash
NODE_ENV=production
PORT=3000

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# CORS - Update with your Vercel URL
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

Save: `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## Step 4: Install Dependencies

```bash
cd ~/weri
cp backend.package.json package.json
npm install
```

---

## Step 5: Restart Backend with PM2

```bash
# Stop old process
pm2 delete ethioradio-backend

# Start with new config
pm2 start ecosystem.config.cjs

# Save PM2 config to restart on reboot
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Check status
pm2 status
```

---

## Step 6: Verify It's Running

Check logs:
```bash
pm2 logs ethioradio-backend --lines 50
```

You should see:
```
Server running on http://0.0.0.0:3000
```

---

## Step 7: Test from Your Local Computer

```bash
curl http://136.115.62.42:3000/api/stations
```

Should return JSON with station data!

---

## Troubleshooting

### If PM2 shows "errored" status:

```bash
pm2 logs ethioradio-backend --lines 100
```

Look for error messages and paste them.

### If port 3000 is not accessible:

Check firewall:
```bash
sudo ufw status
```

If firewall is active, allow port 3000:
```bash
sudo ufw allow 3000
```

### If Node version is wrong:

```bash
node --version
```

Should be v20.x. If not:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Manual start (for debugging):

```bash
cd ~/weri
npm start
```

This will show errors directly in terminal.

---

## Why It Was Crashing

1. **Old tsx loader flag**: `--loader tsx` is deprecated in Node 20
2. **New flag**: `--import tsx` is the correct way
3. **Files updated**:
   - `ecosystem.config.cjs` - PM2 config
   - `backend.package.json` - npm start script
   - `Dockerfile` - for Docker deployments

---

## After Backend is Running

### Update Frontend Environment Variables

**Local development** (`.env.local`):
```bash
VITE_API_URL=http://136.115.62.42:3000
```

**Vercel** (Environment Variables):
```bash
VITE_API_URL=http://136.115.62.42:3000
```

Then redeploy frontend or restart local dev server.

---

## Backend Info

- **VM Name**: ethioradio-backend
- **Zone**: us-central1-a
- **External IP**: 136.115.62.42
- **Backend URL**: http://136.115.62.42:3000
- **Project**: werinegari

---

## Monitoring

Check backend status anytime:
```bash
pm2 status
pm2 logs ethioradio-backend
```

Restart if needed:
```bash
pm2 restart ethioradio-backend
```

Stop backend:
```bash
pm2 stop ethioradio-backend
```
