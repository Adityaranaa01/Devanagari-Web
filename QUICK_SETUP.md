# 🚀 Quick Database Setup Guide

## The Problem
You're getting "failed to add item to cart" because the database tables haven't been created yet.

## The Solution (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (the one with URL: `yclgaxigalixrimuixgo.supabase.co`)

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"**

### Step 3: Run the Database Schema
1. Copy the entire contents of `supabase-schema.sql` file
2. Paste it into the SQL Editor
3. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Setup
1. Go back to your app: http://localhost:5174/shop
2. Try adding an item to cart
3. It should work now! ✅

## What This Creates
The SQL script creates these tables:
- `users` - Store user profiles
- `products` - Store product information  
- `cart_items` - Store shopping cart items
- `orders` - Store order information
- `order_items` - Store individual order items

## Still Having Issues?
1. Check the browser console (F12) for error messages
2. Make sure you're signed in with Google
3. Verify your Supabase project is active

## Need Help?
The app will now show specific error messages if something is wrong with the database setup.
