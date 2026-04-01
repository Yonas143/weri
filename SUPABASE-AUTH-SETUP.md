# Supabase Authentication Setup Guide

## Overview

Your EthioRadio Intelligence Engine now includes Supabase authentication with:
- ✅ Google OAuth Sign-in
- ✅ Email/Password authentication
- ✅ Protected routes
- ✅ User profile menu
- ✅ Session management

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: `ethioradio-intelligence`
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:

```bash
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Configure Google OAuth (Optional but Recommended)

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted:
   - User Type: External
   - App name: EthioRadio Intelligence
   - User support email: your email
   - Developer contact: your email
6. Application type: **Web application**
7. Name: `EthioRadio Auth`
8. **Authorized JavaScript origins**:
   ```
   https://your-project.supabase.co
   http://localhost:5173
   https://your-app.vercel.app
   ```
9. **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:5173
   https://your-app.vercel.app
   ```
10. Click **Create**
11. Copy your **Client ID** and **Client Secret**

### 3.2 Add Google OAuth to Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable Google provider
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

---

## Step 4: Configure Redirect URLs in Supabase

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:

```
http://localhost:5173
http://localhost:3000
https://your-app.vercel.app
https://your-app-preview.vercel.app
```

3. Set **Site URL** to your production URL:
```
https://your-app.vercel.app
```

4. Click **Save**

---

## Step 5: Update Environment Variables

### Local Development (.env.local)

Create `.env.local` in your project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API (for local dev)
VITE_API_URL=http://localhost:3000

# Gemini
VITE_GEMINI_API_KEY=your_gemini_key
```

### Vercel Production

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_API_URL` | `http://YOUR_GCP_IP:3000` |
| `VITE_GEMINI_API_KEY` | `your_gemini_key` |

4. Redeploy your app

---

## Step 6: Test Authentication

### Test Locally

```bash
# Start backend
npm run dev

# In another terminal, start frontend
npm run dev
```

Visit `http://localhost:5173` and you should see the login page.

### Test Sign-in Methods

1. **Google Sign-in**:
   - Click "Continue with Google"
   - Select your Google account
   - Should redirect back to app

2. **Email Sign-up**:
   - Click "Sign Up"
   - Enter email and password (min 6 characters)
   - Check your email for confirmation link
   - Click confirmation link
   - Sign in with your credentials

3. **Email Sign-in**:
   - Enter your email and password
   - Click "Sign In"
   - Should see the dashboard

---

## Step 7: Verify User in Supabase

1. Go to Supabase dashboard
2. Go to **Authentication** → **Users**
3. You should see your user account listed
4. Check user metadata and last sign-in time

---

## Features Included

### Login Page
- ✅ Google OAuth button
- ✅ Email/password form
- ✅ Sign up / Sign in toggle
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

### Protected App
- ✅ Automatic redirect to login if not authenticated
- ✅ Session persistence (stays logged in)
- ✅ User profile in header
- ✅ Sign out functionality

### User Menu
- ✅ User avatar with initial
- ✅ Display name and email
- ✅ Settings link
- ✅ Sign out button

---

## Customization

### Change Login Page Branding

Edit `src/components/LoginPage.tsx`:

```typescript
// Change logo, colors, text, etc.
<h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
  Your<span className="text-orange-500">Brand</span>
</h1>
```

### Add More OAuth Providers

Supabase supports:
- GitHub
- GitLab
- Bitbucket
- Azure
- Facebook
- Twitter
- Discord
- And more...

Just enable them in **Authentication** → **Providers**

### Customize User Metadata

When signing up, you can add custom fields:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: 'John Doe',
      company: 'Radio Station XYZ',
    }
  }
});
```

---

## Security Best Practices

### ✅ Do's
- Use environment variables for all keys
- Never commit `.env.local` to git
- Use HTTPS in production
- Enable email confirmation
- Set strong password requirements
- Use Row Level Security (RLS) in Supabase

### ❌ Don'ts
- Don't use service role key in frontend
- Don't disable email confirmation in production
- Don't allow weak passwords
- Don't expose API keys in client code

---

## Troubleshooting

### "Invalid login credentials"
- Check email/password are correct
- Verify email is confirmed (check inbox)
- Try password reset

### Google OAuth not working
- Verify redirect URLs in Google Console
- Check Client ID and Secret in Supabase
- Ensure URLs match exactly (no trailing slashes)

### "Auth session missing"
- Clear browser cookies
- Check Supabase URL is correct
- Verify anon key is correct

### User not persisting after refresh
- Check `supabase.auth.getSession()` is called
- Verify auth listener is set up
- Check browser localStorage is enabled

---

## Database Setup (Optional)

If you want to store user profiles or app data:

### Create Users Table

```sql
-- In Supabase SQL Editor
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policy: Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Create policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );
```

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure Google OAuth
3. ✅ Add environment variables
4. ✅ Test authentication locally
5. ✅ Deploy to Vercel
6. ✅ Test in production
7. 🎯 Add user roles/permissions (optional)
8. 🎯 Create user profiles table (optional)
9. 🎯 Add password reset flow (optional)

---

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Vercel Env Vars**: https://vercel.com/docs/environment-variables

Your app now has enterprise-grade authentication! 🎉
