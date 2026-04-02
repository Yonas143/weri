# 🔐 Make Yourself Admin

## Step 1: Create the user_roles Table

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only admins can insert/update roles
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Step 2: Make Yourself Admin

First, sign up with your email at http://localhost:5173

Then, go to Supabase Dashboard → SQL Editor and run:

```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Step 3: Access Admin Dashboard

### Option 1: Direct Admin Login
Go to: http://localhost:5173/admin

This will show the admin login page. Sign in with your email and password.

### Option 2: Regular Login
Go to: http://localhost:5173

Sign in normally. If you're an admin, you'll automatically see the admin dashboard.

---

## How It Works

1. **Regular users** → Sign in → See User Dashboard (limited features)
2. **Admin users** → Sign in → See Full Admin Dashboard (all features)
3. **Admin login page** (`/admin`) → Only allows admin users to sign in

---

## Create the recording_requests Table

For the user request feature to work, also run this SQL:

```sql
-- Create recording_requests table
CREATE TABLE IF NOT EXISTS recording_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  station_id TEXT NOT NULL,
  station_title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recording_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own requests
CREATE POLICY "Users can read own requests"
  ON recording_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create requests
CREATE POLICY "Users can create requests"
  ON recording_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all requests
CREATE POLICY "Admins can read all requests"
  ON recording_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update requests
CREATE POLICY "Admins can update requests"
  ON recording_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Testing

1. Sign up with your email
2. Run the SQL to make yourself admin
3. Sign out and sign back in
4. You should see the full admin dashboard!

---

## Troubleshooting

### "Access denied" error
- Make sure you ran the SQL to insert your user as admin
- Check your email matches exactly (case-sensitive)
- Try signing out and back in

### Can't see admin dashboard
- Go to http://localhost:5173/admin to use the admin login
- Or check if your role is set correctly in Supabase

### Table doesn't exist
- Run all the SQL commands in Step 1 and Step 3
- Refresh your browser

---

Your email will be an admin and can access all features!
