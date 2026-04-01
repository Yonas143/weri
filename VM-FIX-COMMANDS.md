# 🔧 Fix Node.js Version on VM

## The Problem

Your VM has an old Node.js version that doesn't support `node:fs/promises`. You need Node.js 20.

## Quick Fix (Copy & Paste These Commands)

SSH into your VM and run these commands:

```bash
# Check current version (probably old)
node -v

# Remove old Node.js
sudo apt remove -y nodejs
sudo apt autoremove -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify new version
node -v  # Should show v20.x.x
npm -v

# Go to project directory
cd ~/weri

# Reinstall dependencies with new Node.js
rm -rf node_modules package-lock.json
npm install

# Restart the server
pm2 restart ethioradio-backend

# Check logs
pm2 logs ethioradio-backend
```

## Expected Output

After running these commands, you should see:
- Node.js version: `v20.x.x`
- Server starting without errors
- Backend accessible at `http://136.115.62.42:3000`

## Test Your Backend

From your local computer:

```bash
curl http://136.115.62.42:3000/api/stations
```

Should return JSON with station data!

---

## If You Still Have Issues

### Check PM2 Status
```bash
pm2 status
pm2 logs ethioradio-backend --lines 50
```

### Restart PM2
```bash
pm2 delete ethioradio-backend
pm2 start ecosystem.config.cjs
pm2 save
```

### Check .env File
```bash
cat ~/weri/.env
```

Make sure all values are filled in (not "your_key_here").

---

## Your Backend Info

- **VM Name**: ethioradio-backend
- **External IP**: 136.115.62.42
- **Backend URL**: http://136.115.62.42:3000
- **Project Path**: ~/weri

---

## Next Steps After Fix

1. ✅ Backend running on Google Cloud
2. ⏭️ Update Vercel environment variables:
   - `VITE_API_URL=http://136.115.62.42:3000`
3. ⏭️ Update backend .env with Vercel URL:
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`
4. ⏭️ Test the full application!
