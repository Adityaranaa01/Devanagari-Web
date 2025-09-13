# 🚀 URGENT: Database Setup Required

## The Problem
Your app is showing this error:
```
Could not find the 'name' column of 'users' in the schema cache
```

This means the database tables haven't been created yet.

## The Solution (2 minutes)

### Step 1: Open Supabase Dashboard
👉 **Click this link**: https://supabase.com/dashboard/project/yclgaxigalixrimuixgo/sql

### Step 2: Run the SQL Script
1. The SQL Editor should open automatically
2. Copy the entire contents of `supabase-schema.sql` (from your project folder)
3. Paste it into the SQL Editor
4. Click **"Run"** button
5. Wait for "Success" message

### Step 3: Test the Fix
1. Go back to your app: http://localhost:5173/shop
2. Try adding an item to cart
3. It should work now! ✅

## What This Creates
- `users` table (with name, email, avatar_url columns)
- `products` table 
- `cart_items` table
- `orders` table
- `order_items` table

## Still Having Issues?
Run this in your browser console (F12):
```javascript
debugDatabase()
```

This will show you exactly what's wrong.
