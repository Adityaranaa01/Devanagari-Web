# 🔧 Database Setup Troubleshooting

## The Problem
You're still getting this error:
```
Could not find the 'name' column of 'users' in the schema cache
```

This means the database tables weren't created properly.

## Step-by-Step Verification

### Step 1: Verify the SQL Script Ran
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/yclgaxigalixrimuixgo/sql
2. Look at the "Query History" section (bottom of the page)
3. Check if you see a recent query that created tables
4. If you don't see it, the script didn't run

### Step 2: Check if Tables Exist
1. In the SQL Editor, run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
2. You should see: `users`, `products`, `cart_items`, `orders`, `order_items`
3. If you don't see these tables, they weren't created

### Step 3: Check Users Table Structure
1. Run this query:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
```
2. You should see columns: `id`, `email`, `name`, `avatar_url`, `created_at`, `updated_at`
3. If `name` column is missing, the table wasn't created correctly

### Step 4: Re-run the Schema Script
If tables are missing or incomplete:
1. Copy the ENTIRE contents of `supabase-schema.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Wait for "Success" message
5. Refresh your app

### Step 5: Use the App's Verification Tool
1. Go to your app: http://localhost:5173/shop
2. Click "Verify Setup" button
3. Check the console for detailed results

## Common Issues

### Issue 1: Script Didn't Run
- **Cause**: Copied only part of the script
- **Fix**: Copy the ENTIRE `supabase-schema.sql` file

### Issue 2: Permission Error
- **Cause**: Insufficient database permissions
- **Fix**: Make sure you're logged into the correct Supabase project

### Issue 3: Partial Execution
- **Cause**: Script stopped partway through
- **Fix**: Re-run the entire script

## Quick Test
Run this in your browser console (F12):
```javascript
verifyDatabaseSetup()
```

This will tell you exactly what's wrong.
