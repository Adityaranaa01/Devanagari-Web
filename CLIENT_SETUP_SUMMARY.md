# 🚀 Client Setup Summary - Devanagari Web

## 📋 **SINGLE SCRIPT SETUP**

Your client only needs to run **ONE** database script:

### **`database-schema.sql`** - Complete Database Setup

This single file contains everything needed:

- ✅ Creates all database tables
- ✅ Sets up security policies (RLS)
- ✅ Creates sample products
- ✅ Sets up admin user instructions
- ✅ Fixes existing user data (last_login timestamps)
- ✅ Handles all triggers and functions

## 🔧 **What the Client Needs to Do:**

### **1. Database Setup (One-time)**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the **entire** `database-schema.sql` file
3. Click "Run" - that's it!

### **2. Set Up Admin Users**

After running the schema, set up admin users:

```sql
-- Replace with actual admin email
UPDATE public.users
SET is_admin = true, role = 'super_admin'
WHERE email = 'admin@yourcompany.com';
```

### **3. Environment Variables**

- Copy `env.example` to `.env` (frontend)
- Copy `server/env.example` to `server/.env` (backend)
- Fill in actual credentials

## ✅ **No Additional Scripts Needed**

The client doesn't need to run any other scripts. Everything is consolidated into the main `database-schema.sql` file, including:

- User table creation
- Product setup
- Security policies
- Admin user setup instructions
- Last login fixes
- All triggers and functions

## 📞 **Client Handover Checklist**

- [ ] `database-schema.sql` - Complete database setup
- [ ] `env.example` - Frontend environment template
- [ ] `server/env.example` - Backend environment template
- [ ] `CLIENT_DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- [ ] Admin user setup instructions (in database schema comments)

**That's it!** The client has everything they need in these files.
