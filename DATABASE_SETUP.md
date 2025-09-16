# Database Setup Guide - Devanagari Web

This guide will help you set up the database from scratch for your Devanagari Web application.

## 🚀 Quick Start

1. **Open Supabase Dashboard** → Go to your project → SQL Editor
2. **Copy the entire contents** of `database-schema.sql`
3. **Paste and run** the script in the SQL Editor
4. **Verify setup** using the verification queries at the end

## 📋 What This Setup Includes

### ✅ Database Tables

- **users** - User profiles extending auth.users
- **products** - Product catalog with images, pricing, inventory
- **cart_items** - Shopping cart functionality
- **orders** - Order management with payment integration
- **order_items** - Individual items within orders
- **admin_actions** - Audit log for admin activities

### ✅ Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Comprehensive policies** for user and admin access
- **Automatic user sync** when users sign up
- **Admin role management** with proper permissions

### ✅ Advanced Features

- **Order number generation** (ORD-000001, ORD-000002, etc.)
- **Automatic order total calculation** when items change
- **Performance indexes** for fast queries
- **JSON fields** for flexible data storage (addresses, metadata)
- **Audit logging** for admin actions

### ✅ Sample Data

- **3 sample products** with different weights and prices
- **Admin user setup** for your email address
- **Proper product categorization** and featured items

## 🔧 Database Schema Details

### Users Table

```sql
- id (UUID, Primary Key, References auth.users)
- email (TEXT, Unique)
- name, full_name (TEXT)
- avatar_url (TEXT)
- phone (TEXT)
- address (JSONB) - Flexible address storage
- is_admin (BOOLEAN)
- role (TEXT) - 'user', 'admin', 'super_admin'
- is_active (BOOLEAN)
- last_login (TIMESTAMP)
- created_by (UUID, References auth.users)
- created_at, updated_at (TIMESTAMP)
```

### Products Table

```sql
- id (UUID, Primary Key)
- name, description, short_description (TEXT)
- price (DECIMAL) - With validation for positive values
- image_url (TEXT) - Main product image
- images (JSONB) - Multiple images as JSON array
- stock (INTEGER) - Inventory count
- weight (INTEGER) - Weight in grams
- category (TEXT) - Product category
- is_featured (BOOLEAN) - Featured products
- is_active (BOOLEAN) - Product availability
- meta_data (JSONB) - Additional product data
- created_at, updated_at (TIMESTAMP)
```

### Orders Table

```sql
- id (UUID, Primary Key)
- user_id (UUID, References users)
- order_number (TEXT, Unique) - Auto-generated
- total, subtotal (DECIMAL) - Order totals
- tax_amount, shipping_amount, discount_amount (DECIMAL)
- status (TEXT) - Order status with validation
- payment_id, payment_order_id, payment_signature (TEXT)
- payment_status (TEXT) - Payment status with validation
- payment_method (TEXT) - Default 'razorpay'
- currency (TEXT) - Default 'INR'
- shipping_address, billing_address (JSONB)
- notes, admin_notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

## 🔐 Security & Permissions

### Row Level Security Policies

**Users can:**

- View and update their own profile
- View all active products
- Manage their own cart items
- View and create their own orders
- View their own order items

**Admins can:**

- View and manage all users
- Manage all products
- View all cart items
- Manage all orders and order items
- View admin action logs

### Admin Setup

- Your email (`adityapiyush71@gmail.com`) is automatically set as super admin
- Admin users have full access to all tables
- All admin actions are logged in the `admin_actions` table

## 🚀 Getting Started

### 1. Run the Database Schema

```sql
-- Copy and paste the entire database-schema.sql file
-- into your Supabase SQL Editor and run it
```

### 2. Verify Setup

After running the schema, you should see:

- ✅ "Database setup complete!" message
- ✅ 6 tables created
- ✅ 6 tables with RLS enabled
- ✅ Multiple policies created
- ✅ Sample users and products inserted

### 3. Test Admin Access

1. Sign in with your admin email
2. Check that you can see all users in the admin panel
3. Verify you can manage products and orders

## 🔧 Customization

### Adding New Products

```sql
INSERT INTO public.products (name, description, price, weight, category)
VALUES ('New Product', 'Description', 29.99, 500, 'health_mix');
```

### Adding New Admin Users

```sql
UPDATE public.users
SET is_admin = true, role = 'admin'
WHERE email = 'newadmin@example.com';
```

### Modifying Order Statuses

Update the CHECK constraints in the orders table if you need different status values.

## 🐛 Troubleshooting

### Common Issues

**1. RLS Policy Errors**

- Make sure you're signed in with the correct admin email
- Check that the `is_admin_by_role()` function is working

**2. User Sync Issues**

- The trigger should automatically create user profiles on signup
- If not working, check the `handle_new_user()` function

**3. Order Number Generation**

- Order numbers are auto-generated as ORD-000001, ORD-000002, etc.
- If you see NULL order numbers, check the `set_order_number()` trigger

### Verification Queries

```sql
-- Check if RLS is working
SELECT * FROM public.users; -- Should only show your own profile if not admin

-- Check admin status
SELECT is_admin, role FROM public.users WHERE email = 'your-email@example.com';

-- Check order number generation
SELECT order_number FROM public.orders ORDER BY created_at DESC LIMIT 5;
```

## 📊 Performance

The schema includes optimized indexes for:

- User lookups by email and role
- Product searches by name, category, and price
- Order queries by user, status, and date
- Cart item operations
- Admin action logging

## 🔄 Maintenance

### Regular Tasks

1. **Monitor admin actions** in the `admin_actions` table
2. **Update product inventory** as needed
3. **Review order statuses** and update accordingly
4. **Clean up old cart items** if needed

### Backup

- Always backup your database before major changes
- The schema includes proper foreign key relationships for data integrity

---

## 📞 Support

If you encounter any issues:

1. Check the verification queries at the end of the schema
2. Review the Supabase logs for any errors
3. Ensure all policies are created correctly
4. Verify your admin email is set up properly

Your database is now ready for the Devanagari Web application! 🎉
