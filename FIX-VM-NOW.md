# 🚀 Fix Your Google Cloud VM - 5 Minutes

## SSH into VM

```bash
gcloud compute ssh --zone "us-central1-a" "ethioradio-backend" --project "werinegari"
```

## Run These Commands

```bash
cd ~/weri
git pull
cp backend.package.json package.json
npm install
pm2 delete ethioradio-backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs ethioradio-backend
```

## You Should See

```
Server running on http://0.0.0.0:3000
```

## Test It

From your Mac:

```bash
curl http://136.115.62.42:3000/api/stations
```

Should return JSON!

## What We Fixed

- Updated `--loader tsx` to `--import tsx` (Node 20 compatibility)
- Updated Dockerfile
- Updated PM2 config

Your backend will now stay running!
