# 🚀 Quick Auth Reference Card

## Environment Variables Needed

```bash
# Add to .env.local (local dev)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3000
VITE_GEMINI_API_KEY=your_key

# Add to Vercel (production)
Same variables in Vercel dashboard → Settings → Environment Variables
```

---

## Supabase Setup (5 minutes)

1. **Create Project**: https://supabase.com → New Project
2. **Get Credentials**: Settings → API → Copy URL and anon key
3. **Add Redirect URLs**: Authentication → URL Configuration
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
4. **Enable Google OAuth** (optional):
   - Get Client ID/Secret from Google Cloud Console
   - Add to Supabase: Authentication → Providers → Google

---

## Google OAuth Setup (10 minutes)

1. **Google Cloud Console**: https://console.cloud.google.com
2. **Create OAuth Client**: APIs & Services → Credentials → Create
3. **Authorized Origins**:
   ```
   https://xxxxx.supabase.co
   http://localhost:5173
   https://your-app.vercel.app
   ```
4. **Authorized Redirects**:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
5. **Copy Client ID & Secret** → Add to Supabase

---

## Test Authentication

```bash
# 1. Start app
npm run dev

# 2. Visit http://localhost:5173

# 3. Try sign-in methods:
- Google OAuth
- Email signup (check email for confirmation)
- Email login

# 4. Check user menu in header
- Click avatar
- View profile
- Sign out
```

---

## Using Auth in Your Code

```typescript
// Get current user
import { useAuth } from './components/AuthProvider';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login page not showing | Check env vars are set |
| Google OAuth fails | Verify redirect URLs match |
| User not persisting | Clear cookies, check localStorage |
| "Invalid credentials" | Confirm email first |

---

## Files to Check

- `src/components/LoginPage.tsx` - Login UI
- `src/components/AuthProvider.tsx` - Auth logic
- `src/lib/supabase.ts` - Supabase config
- `src/App.tsx` - Protected routes
- `.env.local` - Environment variables

---

## Deploy Checklist

- [ ] Supabase project created
- [ ] Environment variables added to Vercel
- [ ] Redirect URLs configured in Supabase
- [ ] Google OAuth configured (if using)
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] Tested in production

---

## Support

- Full guide: `SUPABASE-AUTH-SETUP.md`
- Supabase docs: https://supabase.com/docs/guides/auth
- Google OAuth: https://developers.google.com/identity/protocols/oauth2

Done! 🎉
