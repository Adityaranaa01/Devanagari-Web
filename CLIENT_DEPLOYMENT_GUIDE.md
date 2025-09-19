# 🚀 Client Deployment Guide - Devanagari Web

This guide will help you deploy the Devanagari Web application to production.

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **1. Environment Setup**

1. **Create Environment Files:**

   - Copy `env.example` to `.env` in the root directory
   - Copy `server/env.example` to `server/.env`

2. **Fill in Environment Variables:**

   ```env
   # Frontend (.env)
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_live_razorpay_key_id
   VITE_API_BASE_URL=https://your-domain.com/api
   NODE_ENV=production
   ```

   ```env
   # Backend (server/.env)
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_ANON_KEY=your_production_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   RAZORPAY_KEY_ID=your_live_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_live_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   PORT=3001
   FRONTEND_URL=https://your-domain.com
   BACKEND_URL=https://your-domain.com
   ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
   NODE_ENV=production
   ```

### ✅ **2. Database Setup**

1. **Create New Supabase Project:**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Note down the project URL and API keys

2. **Run Database Schema:**

   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire contents of `database-schema.sql`
   - Execute the script
   - This single script handles everything: tables, policies, sample data, and fixes existing users

3. **Set Up Admin Users:**
   ```sql
   -- Replace with your actual admin email
   UPDATE public.users
   SET is_admin = true, role = 'super_admin'
   WHERE email = 'your-admin-email@example.com';
   ```

### ✅ **3. Payment Setup**

1. **Create Razorpay Account:**

   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Complete KYC verification
   - Generate live API keys

2. **Set Up Webhooks:**
   - Go to Webhooks section in Razorpay dashboard
   - Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select payment events: `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`

## 🚀 **DEPLOYMENT STEPS**

### **Frontend Deployment (Vercel/Netlify)**

1. **Build the Application:**

   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Vercel:**

   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

3. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### **Backend Deployment (Railway/Render/Heroku)**

1. **Prepare Server:**

   ```bash
   cd server
   npm install --production
   ```

2. **Deploy to Railway:**

   - Connect your GitHub repository
   - Set environment variables
   - Deploy

3. **Deploy to Render:**
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `node razorpay-server.cjs`
   - Add environment variables

## 🔧 **POST-DEPLOYMENT CONFIGURATION**

### **1. Update CORS Settings**

- Update `ALLOWED_ORIGINS` in server environment variables
- Include your production domain

### **2. Test All Features**

- [ ] User registration/login
- [ ] Product browsing
- [ ] Shopping cart
- [ ] Payment processing
- [ ] Admin panel access
- [ ] Order management

### **3. SSL Certificate**

- Ensure your domain has SSL certificate
- Update all HTTP references to HTTPS

## 📊 **MONITORING & MAINTENANCE**

### **1. Database Monitoring**

- Monitor Supabase usage and limits
- Set up alerts for high usage

### **2. Payment Monitoring**

- Monitor Razorpay dashboard for failed payments
- Check webhook delivery status

### **3. Application Monitoring**

- Monitor server logs
- Set up error tracking (Sentry, etc.)

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **"Missing environment variables" error:**

   - Check all environment variables are set correctly
   - Verify variable names match exactly

2. **Payment not working:**

   - Verify Razorpay keys are live (not test keys)
   - Check webhook URL is correct
   - Ensure CORS is configured properly

3. **Database connection issues:**

   - Verify Supabase URL and keys
   - Check if database schema is properly set up

4. **Admin access issues:**
   - Run the admin setup SQL command
   - Verify user email is correct

## 📞 **SUPPORT**

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test each component individually
4. Check the troubleshooting section above

## 🔐 **SECURITY CHECKLIST**

- [ ] All hardcoded credentials removed
- [ ] Environment variables properly configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Admin users properly set up
- [ ] Database RLS policies active

---

**Note:** This application requires both frontend and backend to be deployed for full functionality. The payment system will not work without the backend server running.
