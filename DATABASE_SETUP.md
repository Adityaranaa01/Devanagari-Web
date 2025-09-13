# 🚀 Supabase Database Setup Instructions

## Step 1: Run the SQL Schema

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `yclgaxigalixrimuixgo`

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Run the Schema:**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL editor
   - Click **"Run"** to execute

## Step 2: Verify Tables Created

1. **Check Table Editor:**
   - Go to **"Table Editor"** in the left sidebar
   - You should see these tables:
     - `users`
     - `products` 
     - `cart_items`
     - `orders`
     - `order_items`

## Step 3: Test the Application

1. **Visit the Shop page:**
   - Go to: http://localhost:5174/shop
   - Open browser console (F12)
   - Look for database check results

2. **Expected Console Output:**
   ```
   🔍 Checking database setup...
   ✅ Database connection successful
   ✅ Products table accessible
   📦 Found 3 products
   ✅ Users table accessible
   ✅ Cart items table accessible
   🎉 All database checks passed!
   ```

## Step 4: Test Cart Functionality

1. **Sign in with Google**
2. **Add items to cart** - should work without errors
3. **Check cart page** - should show added items
4. **Place an order** - should create database records

## Troubleshooting

**If you see errors:**
- Check the browser console for specific error messages
- Make sure you've run the SQL schema script
- Verify your Supabase project URL and API key are correct

**Common Issues:**
- **"Failed to add item to cart"** → Database tables not created
- **"new row violates row-level security policy for table 'products'"** → Run the fix script: `fix-products-rls.sql`
- **"Products not found"** → Sample products not created
- **Connection errors** → Check Supabase configuration
