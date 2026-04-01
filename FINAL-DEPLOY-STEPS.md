# ✅ Your VM is Ready! Final Setup Steps

## 🎉 Good News!

Your Google Cloud VM is created and running!

- **VM Name**: `ethioradio-backend`
- **External IP**: `136.115.62.42`
- **Zone**: `us-central1-a`
- **Status**: ✅ RUNNING

---

## 🚀 Complete Setup (5 Minutes)

### Step 1: SSH into Your VM

1. Go to https://console.cloud.google.com/compute/instances
2. Find `ethioradio-backend`
3. Click the **SSH** button (opens in browser window)

### Step 2: Run Setup Commands

Copy and paste these commands one by one:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
node -v  # Should show v20.x.x

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Yonas143/weri.git
cd weri

# Setup backend
cp backend.package.json package.json
npm install

# Create directories
mkdir -p recordings logs
```

### Step 3: Create .env File

```bash
nano .env
```

Paste this content (replace with your actual values):

```bash
NODE_ENV=production
PORT=3000

# REQUIRED: Get from Google AI Studio
GEMINI_API_KEY=your_actual_gemini_api_key

# REQUIRED: Get from Supabase Dashboard → Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS - Will update after Vercel deployment
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Step 4: Start the Server

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs ethioradio-backend

# If everything looks good, save PM2 config
pm2 save

# Enable startup on boot
pm2 startup
# Copy and run the command it outputs
```

### Step 5: Test Your Backend

From your local computer, test the API:

```bash
curl http://136.115.62.42:3000/api/stations
```

You should see JSON with station data!

---

## 🎯 Your Backend URL

```
http://136.115.62.42:3000
```

Use this in your Vercel frontend deployment!

---

## ✅ Verification Checklist

- [ ] SSH into VM successful
- [ ] Node.js 20 installed
- [ ] FFmpeg installed
- [ ] PM2 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file created with real values
- [ ] Server started with PM2
- [ ] PM2 saved and startup configured
- [ ] API responds: `curl http://136.115.62.42:3000/api/stations`

---

## 🔧 Useful Commands

### Check Server Status
```bash
pm2 status
pm2 logs ethioradio-backend
```

### Restart Server
```bash
pm2 restart ethioradio-backend
```

### Stop Server
```bash
pm2 stop ethioradio-backend
```

### Update Code
```bash
cd ~/weri
git pull
npm install
pm2 restart ethioradio-backend
```

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs ethioradio-backend

# Common issues:
# 1. Missing .env values
# 2. Wrong Node.js version
# 3. Port already in use

# Restart
pm2 restart ethioradio-backend
```

### Can't access from internet
```bash
# Test locally first
curl http://localhost:3000/api/stations

# If works locally but not externally:
# - Check firewall rule exists
# - Verify VM has http-server tag
```

### FFmpeg not found
```bash
sudo apt install ffmpeg
ffmpeg -version
```

---

## 📊 What's Running

Your backend provides these endpoints:

- `GET /api/stations` - List radio stations
- `GET /api/status` - Recording status
- `POST /api/record/start/:id` - Start recording
- `POST /api/record/stop/:id` - Stop recording
- `GET /api/recordings` - List recordings
- `POST /api/analyze/:station/:date/:file` - Analyze audio
- And many more...

---

## 💰 Cost

- **e2-small VM**: ~$13/month
- **30GB Storage**: ~$2/month
- **Network**: ~$1-5/month
- **Total**: ~$16-20/month

**You have $300 free credit!** (3 months free)

---

## 🎯 Next Steps

1. ✅ Backend deployed and running
2. ⏭️ Deploy frontend to Vercel
3. ⏭️ Update ALLOWED_ORIGINS in backend .env
4. ⏭️ Set up Supabase authentication
5. ⏭️ Test the complete application

---

## 📚 Documentation

- **Deployment Guide**: `DEPLOYMENT.md`
- **Auth Setup**: `SUPABASE-AUTH-SETUP.md`
- **Quick Reference**: `QUICKSTART.md`

---

## 🎉 Success!

Your backend is deployed on Google Cloud!

**Backend URL**: http://136.115.62.42:3000

Now deploy your frontend to Vercel and connect them together!
