# Supabase Role-Based Access Control Setup

This guide shows you how to add admin/user roles to your RadioAI application.

## Step 1: Create User Roles Table

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only admins can insert/update roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
```

## Step 2: Create Function to Auto-Assign Default Role

This automatically gives new users the 'user' role:

```sql
-- Function to create default user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Create Your First Admin User

After you sign up with your account, run this SQL to make yourself an admin:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Or if the role doesn't exist yet:

```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Step 4: Helper Function to Check User Role

```sql
-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Step 5: View All Users and Their Roles

```sql
-- Query to see all users and their roles
SELECT 
  u.id,
  u.email,
  u.created_at as signed_up_at,
  COALESCE(ur.role, 'user') as role,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

## Usage in Your App

The frontend code will automatically fetch the user's role and show/hide features based on it.

### Admin Features:
- Full access to all dashboard features
- Can view usage stats
- Can manage system settings
- Can see all recordings and analysis

### User Features:
- Read-only access to dashboard
- Can view stations and recordings
- Cannot start/stop recordings
- Cannot change settings
- Cannot view usage stats

## Testing

1. Sign up with a new account → Should get 'user' role automatically
2. Make yourself admin using SQL above
3. Sign in → Should see full dashboard
4. Create another test account → Should have limited access

## Security Notes

- Row Level Security (RLS) is enabled on the user_roles table
- Users can only see their own role
- Only admins can modify roles
- The trigger automatically assigns 'user' role to new signups
- All role checks happen server-side for security

## Troubleshooting

### Check if trigger is working:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Check if function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### Manually fix missing roles:
```sql
-- Add missing roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;
```

---

## Quick Reference

**Make user an admin:**
```sql
UPDATE public.user_roles SET role = 'admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```

**Remove admin (make regular user):**
```sql
UPDATE public.user_roles SET role = 'user' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```

**Delete a user's role:**
```sql
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```
