# 🚀 LAUNCH - One Command Setup

## ⚡ Fastest Way to Start

### Windows:

```cmd
install-tapango.bat
```

### Mac/Linux or using npm:

```bash
npm run setup
```

This will:
1. ✅ Check dependencies
2. ✅ Install missing packages
3. ✅ Verify installation
4. ✅ Show next steps

---

## 🎯 Manual Setup (If Preferred)

### One-Line Install:

```bash
npm install @tanstack/react-table @tanstack/react-query
```

### Database Setup:

```sql
-- Run in Supabase SQL Editor:
-- Copy contents of: supabase/migrations/20251201_add_role_and_rls.sql

-- Then set admin:
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Start:

```bash
npm run dev
```

---

## ✅ That's It!

Visit: `http://localhost:3000/admin`

Should redirect to login if not authenticated ✓

---

## 📚 Full Documentation

See `INSTALL.md` for complete instructions and optional features.

---

**You're ready to launch!** 🎉
