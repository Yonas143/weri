# 🚀 Deploy to Alibaba Cloud (Cheaper Alternative)

## Why Alibaba Cloud?

- **60% cheaper** than Google Cloud (~$4/month vs $13/month)
- **Better for Africa** - Good network to Ethiopia
- **$300 free credit** for 3 months
- **Same setup** as Google Cloud

---

## Step 1: Create Account

1. Go to https://www.alibabacloud.com
2. Click **Free Trial** or **Sign Up**
3. Complete registration
4. Activate **$300 free trial** (valid 3 months)

---

## Step 2: Create ECS Instance

1. Go to **Console** → **Elastic Compute Service (ECS)**
2. Click **Create Instance**

### Configuration:

**Billing Method:**
- Pay-As-You-Go (or use free trial credit)

**Region:**
- **Europe (Frankfurt)** - Good for Ethiopia
- Or **Middle East (Dubai)** - Even closer

**Instance Type:**
- **ecs.t5-lc1m2.small** (1 vCPU, 2GB RAM) - ~$4/month
- Or **ecs.t6-c1m2.small** (1 vCPU, 2GB RAM) - ~$5/month

**Image:**
- **Ubuntu 22.04 64-bit**

**Storage:**
- **System Disk**: 40GB (default is fine)

**Network:**
- **VPC**: Use default or create new
- **Public IP**: ✅ Assign public IP
- **Bandwidth**: 1-5 Mbps (adjust based on needs)

**Security Group:**
- Create new security group
- Add rules:
  - **SSH**: Port 22 (0.0.0.0/0)
  - **HTTP**: Port 80 (0.0.0.0/0)
  - **Custom**: Port 3000 (0.0.0.0/0) - For backend API

**Login Credentials:**
- **Password**: Set a strong password
- Or use **SSH Key Pair** (recommended)

3. Click **Create Instance**
4. Wait 2-3 minutes for instance to start

---

## Step 3: Get Your Instance IP

1. Go to **Instances** list
2. Find your instance
3. Copy the **Public IP Address** (e.g., 47.254.x.x)

---

## Step 4: SSH into Instance

### Using Password:
```bash
ssh root@YOUR_ALIBABA_IP
```

### Using SSH Key:
```bash
ssh -i /path/to/your-key.pem root@YOUR_ALIBABA_IP
```

---

## Step 5: Setup Backend (Same as Google Cloud!)

Once connected, run these commands:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js
node -v  # Should show v20.x.x

# Install FFmpeg (for audio processing)
apt install -y ffmpeg

# Install PM2 (process manager)
npm install -g pm2

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

## Step 6: Configure .env File

Paste this into nano:

```bash
NODE_ENV=production
PORT=3000

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# CORS - Add your Vercel URL
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

**Get your actual values from:**
- Gemini API: https://aistudio.google.com/apikey
- Supabase: Your project settings

Save: `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## Step 7: Start Backend

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

## Step 8: Test Backend

From your local computer:

```bash
curl http://YOUR_ALIBABA_IP:3000/api/stations
```

Should return JSON with station data!

---

## Step 9: Update Frontend

Update your frontend to use the Alibaba Cloud backend:

**Local (.env.local):**
```bash
VITE_API_URL=http://YOUR_ALIBABA_IP:3000
```

**Vercel (Environment Variables):**
```bash
VITE_API_URL=http://YOUR_ALIBABA_IP:3000
```

---

## 💰 Cost Comparison

| Service | Alibaba Cloud | Google Cloud |
|---------|---------------|--------------|
| VM (1 vCPU, 2GB) | $4-5/month | $13/month |
| Storage (40GB) | $1/month | $2/month |
| Bandwidth (1Mbps) | $1/month | $3-5/month |
| **Total** | **~$6/month** | **~$18/month** |

**With free trial**: First 3 months FREE!

---

## 🔧 Useful Commands

### Check Status
```bash
pm2 status
pm2 logs ethioradio-backend
```

### Restart Backend
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

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -h
```

---

## 🆘 Troubleshooting

### Can't SSH into instance

1. Check security group has port 22 open
2. Verify you're using correct IP
3. Check if instance is running
4. Try resetting password in console

### Can't access backend from internet

1. Check security group has port 3000 open
2. Verify backend is running: `pm2 status`
3. Test locally: `curl http://localhost:3000/api/stations`
4. Check firewall: `ufw status` (should be inactive)

### Backend keeps crashing

1. Check logs: `pm2 logs ethioradio-backend`
2. Verify .env file has correct values
3. Check Node.js version: `node -v` (should be v20.x)
4. Check memory: `free -h`

### Out of memory

Upgrade to larger instance:
- **ecs.t5-lc1m4.large** (1 vCPU, 4GB RAM) - ~$8/month

---

## 🌐 Your Backend Info

After deployment:

- **Backend URL**: `http://YOUR_ALIBABA_IP:3000`
- **API Endpoints**:
  - Stations: `/api/stations`
  - Status: `/api/status`
  - Recordings: `/api/recordings`
  - Health: `/health`

---

## 🎉 Success!

Your backend is now running on Alibaba Cloud!

Next: Update your Vercel frontend to use this backend URL.
