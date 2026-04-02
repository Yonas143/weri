# Production Go-Live Checklist

## ✅ Already Done
- [x] Frontend deployed on Vercel
- [x] Backend deployed on Google Cloud VM (136.115.62.42:3000)
- [x] Supabase auth (Google OAuth + email)
- [x] Role-based access (admin/user)
- [x] Landing page
- [x] User dashboard (limited access)
- [x] Admin dashboard (full access)
- [x] Recording request system

## 🔧 Must Do Before Going Live

### 1. Update Backend CORS on VM
SSH into VM and run:
```bash
nano ~/weri/.env
```
Add your Vercel URL to ALLOWED_ORIGINS:
```
ALLOWED_ORIGINS=http://localhost:5173,https://YOUR-APP.vercel.app
```
Then restart:
```bash
pm2 restart ethioradio-backend
```

### 2. Set Vercel Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=http://136.115.62.42:3000
VITE_SUPABASE_URL=https://cpeenhzumzxwjkpwdayb.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_key
```

### 3. Run Supabase SQL
In Supabase SQL Editor, run the SQL from SUPABASE-ROLES-SETUP.md
Then make yourself admin:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ((SELECT id FROM auth.users WHERE email = 'yoniwin.yw@gmail.com'), 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 4. Set Supabase Auth Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: https://YOUR-APP.vercel.app
- Redirect URLs: https://YOUR-APP.vercel.app/**

### 5. Enable Google OAuth in Supabase
In Supabase Dashboard → Authentication → Providers → Google:
- Add your Google OAuth credentials
- Add redirect URL to Google Console

### 6. Redeploy Vercel
```bash
git push  # triggers auto-deploy
```
Or manually: vercel --prod

## 🔒 Security Notes
- Never commit .env files
- Rotate Supabase service_role key (was briefly exposed)
- Keep GEMINI_API_KEY server-side only when possible
