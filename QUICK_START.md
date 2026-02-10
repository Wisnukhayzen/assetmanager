# 🚀 Quick Start - Satup App

## ⚡ 5-Minute Setup

### 1. Supabase Setup (2 minutes)
```
1. Go to https://app.supabase.com
2. Create new project
3. Copy Project URL + Anon Key
4. Paste into .env file
```

### 2. Database Setup (2 minutes)
```
1. Open Supabase SQL Editor
2. Run supabase/schema.sql
3. Run supabase/rls-policies.sql
```

### 3. Create Admin (1 minute)
```
1. Supabase > Authentication > Add User
2. Copy User ID
3. SQL Editor:
   INSERT INTO users (id, name, email, role)
   VALUES ('USER_ID', 'Your Name', 'your@email.com', 'admin');
```

### 4. Start App
```bash
npm run dev
```

### 5. Login
```
Open http://localhost:5173
Login with your email/password
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | **FILL THIS** with Supabase credentials |
| `supabase/schema.sql` | **RUN IN SUPABASE** to create tables |
| `supabase/rls-policies.sql` | **RUN IN SUPABASE** for security |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `README.md` | Full documentation |

---

## 🎯 Test Checklist

After setup, verify:

- [ ] Login works
- [ ] Dashboard shows stats
- [ ] Can create room
- [ ] Can upload room image
- [ ] Can create asset
- [ ] Can upload asset photo
- [ ] Search works
- [ ] Filter by condition works
- [ ] Mobile view (F12 > Device Mode)
- [ ] Bottom nav on mobile
- [ ] Sidebar on desktop

---

## 🔑 Default Credentials

You create these yourself in Supabase:

```
Email: (your choice)
Password: (your choice)
Role: admin
```

---

## 📱 Mobile Testing

```bash
npm run dev -- --host
```

Then open on phone: `http://YOUR_IP:5173`

---

## 🐛 Quick Fixes

**Can't login?**
```sql
-- Check if user exists
SELECT * FROM users;
```

**RLS errors?**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

**Env errors?**
```bash
# Restart server after changing .env
Ctrl+C
npm run dev
```

---

## 📚 Documentation

- **SETUP_GUIDE.md** - Step-by-step setup
- **README.md** - Full documentation
- **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🎨 Features

✅ Mobile-first responsive design
✅ Role-based access (Admin/Operator)
✅ Image upload with compression
✅ Search & filter assets
✅ Dashboard statistics
✅ Bottom nav (mobile) + Sidebar (desktop)

---

## 🔐 User Roles

**Admin**
- Full access to everything
- Manage all rooms & assets
- Create operators
- Assign rooms to operators

**Operator**
- Only assigned rooms
- Manage assets in assigned rooms
- No user management

---

## 💻 Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run type-check   # Check TypeScript
```

---

## 🌐 URLs

- **App**: http://localhost:5173
- **Supabase**: https://app.supabase.com
- **Vue DevTools**: http://localhost:5173/__devtools__/

---

## 📞 Need Help?

1. Check browser console (F12)
2. Check Supabase logs
3. Review SETUP_GUIDE.md
4. Check IMPLEMENTATION_SUMMARY.md

---

**Status**: ✅ Ready to use!

**Next Step**: Fill in `.env` and run database scripts in Supabase!
