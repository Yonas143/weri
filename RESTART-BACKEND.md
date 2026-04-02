# 🔄 Restart Backend on Google Cloud VM

## Quick Commands

SSH into your VM and run these commands:

```bash
# Go to project directory
cd ~/weri

# Pull latest code (with the tsx fix)
git pull

# Copy backend package.json
cp backend.package.json package.json

# Reinstall dependencies
npm install

# Stop old PM2 process
pm2 delete ethioradio-backend

# Start with new config
pm2 start ecosystem.config.cjs

# Save PM2 config
pm2 save

# Check status
pm2 status

# View logs
pm2 logs ethioradio-backend
```

## Expected Output

You should see:
```
Server running on http://0.0.0.0:3000
```

## Test Backend

From your local computer:

```bash
curl http://136.115.62.42:3000/api/stations
```

Should return JSON with station data!

---

## If Still Not Working

### Check if port 3000 is listening
```bash
sudo netstat -tulpn | grep 3000
```

### Check PM2 logs for errors
```bash
pm2 logs ethioradio-backend --lines 50
```

### Verify .env file has correct values
```bash
cat ~/weri/.env
```

Make sure:
- `GEMINI_API_KEY` is filled in
- `SUPABASE_URL` is filled in
- `SUPABASE_SERVICE_ROLE_KEY` is filled in

### Manual start (for debugging)
```bash
cd ~/weri
npm start
```

This will show errors directly in the terminal.

---

## Your Backend Info

- **External IP**: 136.115.62.42
- **Backend URL**: http://136.115.62.42:3000
- **Project Path**: ~/weri

---

## After Backend is Running

Update your local `.env.local` or Vercel environment variables:

```bash
VITE_API_URL=http://136.115.62.42:3000
```

Then restart your local dev server or redeploy to Vercel.
