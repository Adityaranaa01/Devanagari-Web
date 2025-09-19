# OAuth Setup Guide - Google Authentication

## 🔐 **Why OAuth Setup is Required**

This project uses **Google OAuth** for user authentication through Supabase. Every developer/client setting up this project will need to:

1. **Create their own Google Cloud Project**
2. **Set up OAuth credentials**
3. **Configure Supabase with OAuth settings**
4. **Add redirect URLs**

## 📋 **Complete OAuth Setup Process**

### **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**

   - Click "Select a project" → "New Project"
   - Enter project name (e.g., "Devanagari Web Auth")
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### **Step 2: Configure OAuth Consent Screen**

1. **Go to OAuth Consent Screen**

   - Navigate to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Click "Create"

2. **Fill App Information**

   ```
   App name: Devanagari Web
   User support email: your-email@example.com
   Developer contact: your-email@example.com
   ```

3. **Add Scopes**

   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

4. **Add Test Users** (for development)
   - Add your email and any test user emails
   - This allows testing before going live

### **Step 3: Create OAuth Credentials**

1. **Go to Credentials**

   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"

2. **Configure OAuth Client**

   ```
   Application type: Web application
   Name: Devanagari Web Client
   ```

3. **Add Authorized Redirect URIs**

   ```
   Development:
   http://localhost:5173/auth/callback
   http://localhost:3000/auth/callback

   Production (replace with your domain):
   https://yourdomain.com/auth/callback
   https://www.yourdomain.com/auth/callback
   ```

4. **Save Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Keep these secure!

### **Step 4: Configure Supabase**

1. **Go to Supabase Dashboard**

   - Navigate to your project
   - Go to "Authentication" → "Providers"

2. **Enable Google Provider**

   - Find "Google" in the providers list
   - Toggle it ON

3. **Add OAuth Credentials**

   ```
   Client ID: [Your Google Client ID]
   Client Secret: [Your Google Client Secret]
   ```

4. **Add Redirect URLs in Supabase**

   ```
   Site URL: http://localhost:5173 (development)
   Site URL: https://yourdomain.com (production)

   Redirect URLs:
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```

### **Step 5: Update Environment Variables**

1. **Frontend (.env)**

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Backend (server/.env)**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## 🔧 **Development vs Production Setup**

### **Development Environment**

- Use `http://localhost:5173` for redirect URLs
- Add test users in Google Cloud Console
- Use Supabase development project

### **Production Environment**

- Use your actual domain for redirect URLs
- Publish OAuth consent screen
- Use Supabase production project
- Update all environment variables

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Redirect URI Mismatch"**

- **Problem**: Redirect URL doesn't match what's configured
- **Solution**: Add exact URL to Google Cloud Console redirect URIs

### **Issue 2: "OAuth Consent Screen Not Configured"**

- **Problem**: OAuth consent screen not set up properly
- **Solution**: Complete the OAuth consent screen configuration

### **Issue 3: "Invalid Client ID"**

- **Problem**: Wrong Client ID in Supabase
- **Solution**: Double-check Client ID from Google Cloud Console

### **Issue 4: "Access Blocked"**

- **Problem**: App not verified or user not in test users
- **Solution**: Add user to test users or verify the app

## 📝 **Quick Setup Checklist**

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Redirect URLs added to Google Cloud
- [ ] Supabase Google provider enabled
- [ ] OAuth credentials added to Supabase
- [ ] Redirect URLs added to Supabase
- [ ] Environment variables updated
- [ ] Test authentication working

## 🔒 **Security Best Practices**

1. **Keep credentials secure** - Never commit them to version control
2. **Use environment variables** - Store all sensitive data in .env files
3. **Limit redirect URLs** - Only add necessary URLs
4. **Regularly rotate secrets** - Update credentials periodically
5. **Monitor usage** - Check Google Cloud Console for unusual activity

## 📞 **Support Notes**

- Each developer needs their own Google Cloud Project
- OAuth setup is required for authentication to work
- Without proper OAuth setup, users cannot sign in
- This is a one-time setup per environment (dev/prod)

## 🎯 **What Happens Without OAuth Setup**

- ❌ Users cannot sign in with Google
- ❌ Authentication will fail
- ❌ App will not function properly
- ❌ "OAuth consent screen not configured" errors

## ✅ **What Happens With Proper OAuth Setup**

- ✅ Users can sign in with Google
- ✅ Authentication works seamlessly
- ✅ User profiles are created automatically
- ✅ App functions as intended
