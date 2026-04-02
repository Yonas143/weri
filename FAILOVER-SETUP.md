# 🔄 Dual Backend Failover Setup

## Strategy: Run Both, Failover Automatically

Deploy on both Google Cloud AND Alibaba Cloud, with automatic failover if one goes down.

---

## Architecture

```
Frontend (Vercel)
    ↓
Primary: Google Cloud (136.115.62.42:3000)
    ↓ (if fails)
Fallback: Alibaba Cloud (YOUR_ALIBABA_IP:3000)
```

---

## Step 1: Deploy Both Backends

### Google Cloud (Primary)
Follow: `GOOGLE-CLOUD-FIX.md` or `FIX-VM-NOW.md`
- IP: `136.115.62.42`
- URL: `http://136.115.62.42:3000`

### Alibaba Cloud (Backup)
Follow: `ALIBABA-CLOUD-DEPLOY.md`
- IP: `YOUR_ALIBABA_IP`
- URL: `http://YOUR_ALIBABA_IP:3000`

---

## Step 2: Update Frontend with Failover Logic

Create a new file: `src/lib/api.ts`

```typescript
// API client with automatic failover
const BACKENDS = [
  'http://136.115.62.42:3000',           // Google Cloud (primary)
  'http://YOUR_ALIBABA_IP:3000',         // Alibaba Cloud (backup)
];

let currentBackendIndex = 0;

async function fetchWithFailover(endpoint: string, options?: RequestInit) {
  for (let i = 0; i < BACKENDS.length; i++) {
    const backendUrl = BACKENDS[(currentBackendIndex + i) % BACKENDS.length];
    
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        ...options,
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        // Success! Update current backend if we switched
        if (i > 0) {
          console.log(`Switched to backup backend: ${backendUrl}`);
          currentBackendIndex = (currentBackendIndex + i) % BACKENDS.length;
        }
        return response;
      }
    } catch (error) {
      console.warn(`Backend ${backendUrl} failed:`, error);
      // Try next backend
      continue;
    }
  }
  
  throw new Error('All backends are down');
}

export async function apiGet(endpoint: string) {
  const response = await fetchWithFailover(endpoint);
  return response.json();
}

export async function apiPost(endpoint: string, data: any) {
  const response = await fetchWithFailover(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

---

## Step 3: Update Your API Calls

Replace direct fetch calls with the failover client:

### Before:
```typescript
const response = await fetch('/api/stations');
const stations = await response.json();
```

### After:
```typescript
import { apiGet } from './lib/api';

const stations = await apiGet('/api/stations');
```

---

## Step 4: Environment Variables

### Local Development (.env.local)
```bash
# Primary backend
VITE_API_URL=http://136.115.62.42:3000

# Backup backend
VITE_API_URL_BACKUP=http://YOUR_ALIBABA_IP:3000
```

### Vercel (Production)
Add both URLs:
```bash
VITE_API_URL=http://136.115.62.42:3000
VITE_API_URL_BACKUP=http://YOUR_ALIBABA_IP:3000
```

---

## Step 5: Update api.ts to Use Env Variables

```typescript
const BACKENDS = [
  import.meta.env.VITE_API_URL || 'http://136.115.62.42:3000',
  import.meta.env.VITE_API_URL_BACKUP || 'http://YOUR_ALIBABA_IP:3000',
].filter(Boolean);
```

---

## Alternative: Simple Failover (No Code Changes)

If you don't want to modify code, use environment variables only:

### Option A: Use Google Cloud
```bash
VITE_API_URL=http://136.115.62.42:3000
```

### Option B: Use Alibaba Cloud
```bash
VITE_API_URL=http://YOUR_ALIBABA_IP:3000
```

Just switch the URL in Vercel if one goes down.

---

## Monitoring Both Backends

Create a simple health check script: `check-backends.sh`

```bash
#!/bin/bash

echo "Checking backends..."

# Google Cloud
if curl -s -f http://136.115.62.42:3000/health > /dev/null; then
  echo "✅ Google Cloud: UP"
else
  echo "❌ Google Cloud: DOWN"
fi

# Alibaba Cloud
if curl -s -f http://YOUR_ALIBABA_IP:3000/health > /dev/null; then
  echo "✅ Alibaba Cloud: UP"
else
  echo "❌ Alibaba Cloud: DOWN"
fi
```

Run it:
```bash
chmod +x check-backends.sh
./check-backends.sh
```

---

## Cost Analysis

### Running Both:
- Google Cloud: $13/month
- Alibaba Cloud: $5/month
- **Total: $18/month** (99.9% uptime)

### Running One:
- Google Cloud: $13/month (single point of failure)
- Alibaba Cloud: $5/month (single point of failure)

**Recommendation**: Start with one, add second if you need redundancy.

---

## Which One to Use as Primary?

### Use Google Cloud if:
- You want better global network
- You're okay with higher cost
- You need Google Cloud integration

### Use Alibaba Cloud if:
- You want to save money (60% cheaper)
- Your users are in Africa/Middle East
- You want better value

**My recommendation**: Use Alibaba Cloud as primary (cheaper, good for Ethiopia).

---

## Quick Decision Matrix

| Scenario | Action |
|----------|--------|
| **Just starting** | Deploy to Alibaba Cloud only (cheaper) |
| **Need reliability** | Deploy to both, use failover code |
| **Google Cloud works** | Keep using it, add Alibaba as backup later |
| **Budget tight** | Alibaba Cloud only ($5/month) |
| **Mission critical** | Both with failover ($18/month) |

---

## Next Steps

1. ✅ Fix Google Cloud (5 minutes)
2. ✅ Deploy to Alibaba Cloud (15 minutes)
3. ⏭️ Test both backends
4. ⏭️ Choose: Single backend or failover?
5. ⏭️ Update Vercel environment variables
6. ⏭️ Deploy frontend

---

## 🎯 Recommended Approach

**For now**: 
1. Fix Google Cloud (you're 90% there)
2. Test it works
3. If stable: Keep using it
4. If unstable: Deploy to Alibaba Cloud and switch

**Later**:
- Add failover if you need 99.9% uptime
- Or just keep one backend (simpler)

You don't need both unless you're running a critical service!
