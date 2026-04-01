# Deployment Guide: Vercel + Google Cloud

This guide explains how to deploy the EthioRadio Intelligence Engine with:
- **Frontend**: Vercel (React SPA)
- **Backend**: Google Cloud (Node.js + FFmpeg)

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────────┐
│  Vercel         │         │  Google Cloud VM     │
│  (Frontend)     │ ──────> │  (Backend API)       │
│  React + Vite   │  HTTPS  │  Express + FFmpeg    │
└─────────────────┘         └──────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  Supabase        │
                            │  (Cloud Storage) │
                            └──────────────────┘
```

---

## Part 1: Deploy Backend to Google Cloud

### Option A: Compute Engine VM (Recommended)

#### Step 1: Create VM Instance

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create VM
gcloud compute instances create ethioradio-backend \
  --machine-type=e2-small \
  --zone=us-central1-a \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server

# Create firewall rule
gcloud compute firewall-rules create allow-ethioradio \
  --allow=tcp:3000 \
  --target-tags=http-server
```

#### Step 2: SSH into VM and Setup

```bash
# SSH into the VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 globally
sudo npm install -g pm2

# Clone your repository (or upload files)
git clone https://github.com/YOUR_USERNAME/ethioradio.git
cd ethioradio

# Copy backend package.json
cp backend.package.json package.json

# Install dependencies
npm install

# Create environment file
nano .env
```

#### Step 3: Configure Environment Variables

Create `.env` file:

```bash
# Backend Environment Variables
NODE_ENV=production
PORT=3000

# Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - for cloud backup)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# CORS - Allow your Vercel frontend
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
```

#### Step 4: Start the Backend

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs ethioradio-backend
```

#### Step 5: Get Your Backend URL

```bash
# Get external IP
gcloud compute instances describe ethioradio-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Your backend URL will be: http://YOUR_IP:3000
```

### Option B: Cloud Run (Alternative)

```bash
# Build and deploy
gcloud run deploy ethioradio-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 3600 \
  --set-env-vars GEMINI_API_KEY=your_key
```

**Note**: Cloud Run has limitations with long-running FFmpeg processes. VM is recommended.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

Update `vite.config.ts` to use environment variable for API URL:

```typescript
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_URL': JSON.stringify(
        env.VITE_API_URL || 'http://localhost:3000'
      ),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    // ... rest of config
  };
});
```

### Step 2: Update API Calls in Frontend

All fetch calls should use the API_URL:

```typescript
// Before
fetch('/api/stations')

// After
fetch(`${process.env.API_URL}/api/stations`)
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL = http://YOUR_GCP_IP:3000
# VITE_GEMINI_API_KEY = your_gemini_key

# Deploy to production
vercel --prod
```

Or use Vercel Dashboard:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set environment variables:
   - `VITE_API_URL`: Your Google Cloud backend URL
   - `VITE_GEMINI_API_KEY`: Your Gemini API key
4. Deploy

---

## Part 3: Enable CORS on Backend

Update `server/routes.ts` to add CORS:

```typescript
import cors from 'cors';

export async function setupRoutes(app: express.Application) {
  // Add CORS middleware
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'https://your-app.vercel.app'
  ];
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  app.use(express.json());
  
  // ... rest of routes
}
```

---

## Part 4: Setup Custom Domain (Optional)

### Backend Domain
1. Reserve static IP in Google Cloud
2. Point your domain (e.g., `api.ethioradio.com`) to the IP
3. Setup SSL with Let's Encrypt or Cloud Load Balancer

### Frontend Domain
1. Add custom domain in Vercel dashboard
2. Update DNS records as instructed
3. Vercel handles SSL automatically

---

## Monitoring & Maintenance

### Backend Logs
```bash
# SSH into VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a

# View logs
pm2 logs ethioradio-backend

# Check status
pm2 status

# Restart if needed
pm2 restart ethioradio-backend
```

### Frontend Logs
- View in Vercel dashboard
- Check deployment logs
- Monitor function invocations

---

## Cost Estimates

### Google Cloud VM (e2-small)
- VM: ~$13/month
- Storage: ~$2/month
- Network: ~$1-5/month
- **Total**: ~$16-20/month

### Vercel
- Hobby: Free (with limits)
- Pro: $20/month (if needed)

### Supabase
- Free tier: 500MB storage
- Pro: $25/month (50GB storage)

**Total Monthly Cost**: ~$16-65 depending on tier

---

## Troubleshooting

### Backend not accessible
```bash
# Check firewall
gcloud compute firewall-rules list

# Check if server is running
pm2 status

# Check logs
pm2 logs
```

### CORS errors
- Verify `ALLOWED_ORIGINS` in backend `.env`
- Check browser console for exact error
- Ensure frontend is using correct API URL

### FFmpeg not working
```bash
# Test FFmpeg
ffmpeg -version

# Reinstall if needed
sudo apt install --reinstall ffmpeg
```

---

## Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (SSL certificate)
- [ ] Restrict CORS to your domains only
- [ ] Use Supabase service role key (not anon key)
- [ ] Setup firewall rules properly
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs for suspicious activity

---

## Next Steps

1. Deploy backend to Google Cloud VM
2. Get backend URL
3. Update Vercel environment variables
4. Deploy frontend to Vercel
5. Test the integration
6. Setup monitoring and alerts
7. Configure custom domains (optional)

Need help? Check the logs or create an issue in the repository.
