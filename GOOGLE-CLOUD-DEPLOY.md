# 🚀 Google Cloud Deployment Guide

## Quick Deploy (Automated)

### Option 1: Use the Deployment Script

```bash
# Run the automated deployment script
./deploy-to-gcloud.sh
```

This script will:
1. ✅ Check gcloud CLI installation
2. ✅ Set up your Google Cloud project
3. ✅ Enable required APIs
4. ✅ Create firewall rules
5. ✅ Create VM instance
6. ✅ Install Node.js, FFmpeg, PM2
7. ✅ Clone your repository
8. ✅ Set up the backend

---

## Manual Deployment (Step by Step)

### Prerequisites

1. **Google Cloud Account**
   - Sign up at https://cloud.google.com
   - Enable billing (free tier available)

2. **Install gcloud CLI**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from:
   # https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

---

### Step 1: Create VM Instance

```bash
# Set variables
PROJECT_ID="your-project-id"
INSTANCE_NAME="ethioradio-backend"
ZONE="us-central1-a"

# Create instance
gcloud compute instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --zone=$ZONE \
  --machine-type=e2-small \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server
```

---

### Step 2: Configure Firewall

```bash
# Allow port 3000
gcloud compute firewall-rules create allow-ethioradio \
  --allow=tcp:3000 \
  --target-tags=http-server \
  --description="Allow port 3000 for EthioRadio backend"
```

---

### Step 3: SSH into VM

```bash
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE
```

---

### Step 4: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v

# Install FFmpeg
sudo apt install -y ffmpeg

# Verify FFmpeg
ffmpeg -version

# Install PM2 globally
sudo npm install -g pm2
```

---

### Step 5: Clone Repository

```bash
# Clone your repo
git clone https://github.com/Yonas143/weri.git
cd weri

# Copy backend package.json
cp backend.package.json package.json

# Install dependencies
npm install
```

---

### Step 6: Configure Environment

```bash
# Create .env file
nano .env
```

Add this content:

```bash
NODE_ENV=production
PORT=3000

# Gemini API Key (Required)
GEMINI_API_KEY=your_actual_gemini_api_key

# Supabase (Required for auth and storage)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS - Add your Vercel URL after frontend deployment
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

Save and exit (Ctrl+X, Y, Enter)

---

### Step 7: Create Required Directories

```bash
mkdir -p recordings logs
```

---

### Step 8: Start the Server

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs ethioradio-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs (copy and run it)
```

---

### Step 9: Get Your Backend URL

```bash
# Get external IP
curl ifconfig.me

# Your backend URL is:
# http://YOUR_IP:3000
```

---

### Step 10: Test the Backend

```bash
# Test from VM
curl http://localhost:3000/api/stations

# Test from your computer
curl http://YOUR_IP:3000/api/stations
```

You should see JSON with station data.

---

## Verify Deployment

### Check Server Status

```bash
# SSH into VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Check PM2 status
pm2 status

# View logs
pm2 logs ethioradio-backend --lines 50

# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000
```

### Test API Endpoints

```bash
# Get stations
curl http://YOUR_IP:3000/api/stations

# Get status
curl http://YOUR_IP:3000/api/status

# Get settings
curl http://YOUR_IP:3000/api/settings
```

---

## Common Issues & Solutions

### Port 3000 Not Accessible

**Problem**: Can't reach backend from internet

**Solution**:
```bash
# Check firewall rule exists
gcloud compute firewall-rules list | grep ethioradio

# If not, create it
gcloud compute firewall-rules create allow-ethioradio \
  --allow=tcp:3000 \
  --target-tags=http-server
```

### FFmpeg Not Found

**Problem**: Recording fails with "ffmpeg not found"

**Solution**:
```bash
sudo apt install ffmpeg
ffmpeg -version
```

### Server Not Starting

**Problem**: PM2 shows error status

**Solution**:
```bash
# Check logs
pm2 logs ethioradio-backend

# Common issues:
# 1. Missing .env file
# 2. Wrong Node.js version
# 3. Missing dependencies

# Restart server
pm2 restart ethioradio-backend
```

### Out of Memory

**Problem**: Server crashes with memory errors

**Solution**:
```bash
# Upgrade to larger machine type
gcloud compute instances stop ethioradio-backend --zone=us-central1-a
gcloud compute instances set-machine-type ethioradio-backend \
  --machine-type=e2-medium \
  --zone=us-central1-a
gcloud compute instances start ethioradio-backend --zone=us-central1-a
```

---

## Useful Commands

### VM Management

```bash
# Start VM
gcloud compute instances start ethioradio-backend --zone=us-central1-a

# Stop VM
gcloud compute instances stop ethioradio-backend --zone=us-central1-a

# Restart VM
gcloud compute instances reset ethioradio-backend --zone=us-central1-a

# Delete VM
gcloud compute instances delete ethioradio-backend --zone=us-central1-a

# SSH into VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Get VM info
gcloud compute instances describe ethioradio-backend --zone=us-central1-a
```

### PM2 Management

```bash
# Status
pm2 status

# Logs
pm2 logs ethioradio-backend
pm2 logs ethioradio-backend --lines 100

# Restart
pm2 restart ethioradio-backend

# Stop
pm2 stop ethioradio-backend

# Delete
pm2 delete ethioradio-backend

# Monitor
pm2 monit
```

### Update Code

```bash
# SSH into VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Pull latest code
cd ~/weri
git pull

# Install new dependencies (if any)
npm install

# Restart server
pm2 restart ethioradio-backend
```

---

## Cost Optimization

### Current Setup Cost
- **e2-small VM**: ~$13/month
- **30GB Storage**: ~$2/month
- **Network**: ~$1-5/month
- **Total**: ~$16-20/month

### Save Money

1. **Stop VM when not in use**
   ```bash
   gcloud compute instances stop ethioradio-backend --zone=us-central1-a
   ```

2. **Use preemptible instances** (up to 80% cheaper)
   ```bash
   --preemptible
   ```
   Note: Can be terminated at any time

3. **Use smaller machine type**
   - e2-micro: ~$6/month (free tier eligible)
   - e2-small: ~$13/month (current)
   - e2-medium: ~$27/month

---

## Security Best Practices

### 1. Restrict SSH Access

```bash
# Only allow your IP
gcloud compute firewall-rules create allow-ssh-from-my-ip \
  --allow=tcp:22 \
  --source-ranges=YOUR_IP/32
```

### 2. Use HTTPS (Optional)

```bash
# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

### 3. Regular Updates

```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd ~/weri
npm update
```

---

## Monitoring

### Set Up Monitoring

```bash
# Install monitoring agent
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
```

### View Metrics

1. Go to Google Cloud Console
2. Navigate to **Monitoring** → **Dashboards**
3. View CPU, memory, disk usage

---

## Backup Strategy

### Automated Backups

```bash
# Create snapshot schedule
gcloud compute resource-policies create snapshot-schedule daily-backup \
  --region=us-central1 \
  --max-retention-days=7 \
  --on-source-disk-delete=keep-auto-snapshots \
  --daily-schedule \
  --start-time=02:00

# Attach to disk
gcloud compute disks add-resource-policies ethioradio-backend \
  --resource-policies=daily-backup \
  --zone=us-central1-a
```

---

## Next Steps

1. ✅ Backend deployed on Google Cloud
2. ⏭️ Deploy frontend to Vercel (see `DEPLOYMENT.md`)
3. ⏭️ Set up Supabase auth (see `SUPABASE-AUTH-SETUP.md`)
4. ⏭️ Configure custom domain (optional)
5. ⏭️ Set up monitoring and alerts

---

## Support

- **Google Cloud Docs**: https://cloud.google.com/docs
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **Project Docs**: See `DEPLOYMENT.md`

Your backend is now live! 🎉
