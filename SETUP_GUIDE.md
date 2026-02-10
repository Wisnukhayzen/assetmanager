# Setup Guide - Satup App

## Quick Start Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] `.env` file configured with Supabase credentials
- [ ] Database schema created (`schema.sql`)
- [ ] RLS policies applied (`rls-policies.sql`)
- [ ] Admin user created
- [ ] Dev server running

---

## Detailed Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: Satup App (or any name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
4. Click **Create new project** and wait for setup to complete

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy the following:
   - **Project URL** (under Project URL section)
   - **anon public** key (under Project API keys section)

### Step 3: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Create Database Tables

1. In Supabase Dashboard, click **SQL Editor** in the sidebar
2. Click **New Query**
3. Open `supabase/schema.sql` from this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 5: Apply Row Level Security Policies

1. Still in SQL Editor, click **New Query** again
2. Open `supabase/rls-policies.sql` from this project
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run**
6. You should see "Success. No rows returned"

### Step 6: Create Your First Admin User

#### Option A: Using Supabase Dashboard (Recommended)

1. In Supabase Dashboard, click **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: your-secure-password
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create user**
5. **Copy the User ID** that appears in the users table

#### Option B: Using SQL

```sql
-- This will create a user in Supabase Auth
-- You'll need to use the Dashboard method above instead
```

### Step 7: Add User to Users Table

1. Go back to **SQL Editor**
2. Run this query (replace with your actual values):

```sql
INSERT INTO users (id, name, email, role)
VALUES (
  'paste-user-id-here',  -- The UUID from Step 6
  'Admin Name',           -- Your name
  'your-email@example.com', -- Same email as Step 6
  'admin'                 -- Role: 'admin' or 'operator'
);
```

3. Click **Run**

### Step 8: Verify Database Setup

Run this query to check if everything is set up correctly:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check your user
SELECT * FROM users;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

You should see:
- Tables: `users`, `ruangans`, `assets`
- Your user record
- All tables with `rowsecurity = true`

### Step 9: Run the Application

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Step 10: Login

Use the email and password you created in Step 6 to login.

---

## Creating Additional Users

### Create Operator User

1. **Authentication** > **Users** > **Add User**
2. Create user with email/password
3. Copy the User ID
4. Run SQL:

```sql
INSERT INTO users (id, name, email, role)
VALUES (
  'operator-user-id',
  'Operator Name',
  'operator@example.com',
  'operator'
);
```

### Assign Operator to Room

After creating a room as admin:

```sql
-- Update room to assign to operator
UPDATE ruangans 
SET user_id = 'operator-user-id'
WHERE id = 1;  -- Replace with actual room ID
```

---

## Testing the Application

### Test as Admin

1. Login with admin account
2. You should see:
   - ✅ Dashboard with all statistics
   - ✅ All navigation items (Dashboard, Ruangan, Aset, Pengguna)
   - ✅ Ability to create rooms
   - ✅ Ability to create assets in any room

### Test as Operator

1. Logout and login with operator account
2. You should see:
   - ✅ Dashboard with statistics for assigned rooms only
   - ✅ Navigation items (Dashboard, Ruangan, Aset) - NO Pengguna
   - ✅ Only rooms assigned to you
   - ✅ Only assets in your assigned rooms

### Test Mobile View

1. Open browser DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. You should see:
   - ✅ Bottom navigation instead of sidebar
   - ✅ Touch-friendly buttons (minimum 44px)
   - ✅ Responsive layout

---

## Common Issues

### Issue: "Missing Supabase environment variables"

**Solution**: 
- Check that `.env` file exists in project root
- Verify the values are correct (no quotes needed)
- Restart the dev server

### Issue: Cannot login

**Solution**:
- Verify user exists in Supabase Auth (Authentication > Users)
- Verify user exists in `users` table with correct ID
- Check that email matches in both places
- Try resetting password in Supabase Dashboard

### Issue: "Row Level Security policy violation"

**Solution**:
- Verify all policies from `rls-policies.sql` are applied
- Check that RLS is enabled on all tables
- Verify user role is set correctly in `users` table

### Issue: Operator can see all rooms

**Solution**:
- Check that `user_id` in `ruangans` table matches the operator's ID
- Verify RLS policies are applied correctly
- Check that the operator is logged in (not admin)

### Issue: Images not uploading

**Solution**:
- Check browser console for errors
- Verify image file is valid (JPEG, PNG, etc.)
- Try with a smaller image first
- Check that Base64 string is being saved to database

---

## Next Steps

After successful setup:

1. ✅ Create some test rooms
2. ✅ Add assets to rooms
3. ✅ Test search and filter functionality
4. ✅ Create an operator user and test permissions
5. ✅ Test on actual mobile device
6. ✅ Customize the app for your needs

---

## Support

If you encounter issues:

1. Check the browser console for errors (F12)
2. Check Supabase logs (Logs & Analytics in dashboard)
3. Verify all setup steps were completed
4. Review the README.md for additional information

Happy asset managing! 🎉
