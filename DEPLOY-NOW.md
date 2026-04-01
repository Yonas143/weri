# 🚀 Deploy Backend to Google Cloud NOW

## Quick Setup (5 Steps)

### Step 1: Enable Billing

1. Go to https://console.cloud.google.com
2. Select project: **werinegari** (423924811372)
3. Click **Billing** in the left menu
4. Click **Link a billing account**
5. Add a payment method (free tier available - $300 credit)

---

### Step 2: Create VM via Console (Easiest Way)

1. Go to https://console.cloud.google.com/compute/instances
2. Click **CREATE INSTANCE**
3. Configure:
   - **Name**: `ethioradio-backend`
   - **Region**: `us-central1 (Iowa)`
   - **Zone**: `us-central1-a`
   - **Machine type**: `e2-small` (2 vCPU, 2 GB memory)
   - **Boot disk**: Ubuntu 22.04 LTS, 30 GB
   - **Firewall**: ✅ Allow HTTP traffic
4. Click **CREATE**
5. Wait 1-2 minutes

---

### Step 3: Add Firewall Rule for Port 3000

1. Go to https://console.cloud.google.com/networking/firewalls
2. Click **CREATE FIREWALL RULE**
3. Configure:
   - **Name**: `allow-ethioradio`
   - **Direction**: Ingress
   - **Targets**: Specified target tags
   - **Target tags**: `http-server`
   - **Source filter**: IP ranges
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: ✅ TCP → `3000`
4. Click **CREATE**

---

### Step 4: SSH and Setup

1. Go back to https://console.cloud.google.com/compute/instances
2. Find your instance `ethioradio-backend`
3. Click **SSH** button (opens in browser)
4. Run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v  # Should show v20.x.x

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/Yonas143/weri.git
cd weri

# Setup backend
cp backend.package.json package.json
npm install

# Create directories
mkdir -p recordings logs

# Create .env file
nano .env
```

---

### Step 5: Configure .env File

Paste this into the nano editor:

```bash
NODE_ENV=production
PORT=3000

# Gemini API Key (REQUIRED)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Supabase (REQUIRED)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS - Add your Vercel URL after frontend deployment
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

**Replace with your actual values!**

Save and exit:
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

### Step 6: Start the Server

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs ethioradio-backend

# Save PM2 config
pm2 save

# Enable startup on boot
pm2 startup
# Copy and run the command it outputs
```

---

### Step 7: Get Your Backend URL

```bash
# Get your external IP
curl ifconfig.me
```

Your backend URL is: `http://YOUR_IP:3000`

---

### Step 8: Test It

From your local computer:

```bash
# Test stations endpoint
curl http://YOUR_IP:3000/api/stations

# Should return JSON with station data
```

---

## ✅ Success Checklist

- [ ] Billing enabled on Google Cloud
- [ ] VM instance created
- [ ] Firewall rule for port 3000 created
- [ ] Node.js, FFmpeg, PM2 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file configured with real values
- [ ] Server started with PM2
- [ ] PM2 saved and startup configured
- [ ] Backend accessible from internet
- [ ] API endpoints responding

---

## 🎯 Your Backend URL

After deployment, your backend will be at:

```
http://YOUR_EXTERNAL_IP:3000
```

Use this URL in your Vercel frontend environment variables:

```bash
VITE_API_URL=http://YOUR_IP:3000
```

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

### Update Code
```bash
cd ~/weri
git pull
npm install
pm2 restart ethioradio-backend
```

### View Logs
```bash
pm2 logs ethioradio-backend --lines 100
```

---

## 💰 Cost

- **e2-small VM**: ~$13/month
- **30GB Storage**: ~$2/month
- **Network**: ~$1-5/month
- **Total**: ~$16-20/month

**Free Tier**: $300 credit for new accounts (3 months free!)

---

## 🆘 Troubleshooting

### Can't access backend from internet

1. Check firewall rule exists
2. Verify port 3000 is in the rule
3. Check VM has `http-server` tag
4. Try from VM: `curl http://localhost:3000/api/stations`

### Server not starting

1. Check logs: `pm2 logs ethioradio-backend`
2. Verify .env file has correct values
3. Check Node.js version: `node -v` (should be v20.x)
4. Restart: `pm2 restart ethioradio-backend`

### FFmpeg not found

```bash
sudo apt install ffmpeg
ffmpeg -version
```

---

## 📚 Next Steps

1. ✅ Backend deployed on Google Cloud
2. ⏭️ Deploy frontend to Vercel
3. ⏭️ Update ALLOWED_ORIGINS in backend .env
4. ⏭️ Set up Supabase auth
5. ⏭️ Test the full application

---

## 🎉 You're Done!

Your backend is now running on Google Cloud!

Next: Deploy the frontend to Vercel (see `DEPLOYMENT.md`)
