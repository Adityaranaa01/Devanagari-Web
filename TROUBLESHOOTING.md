# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### Database Issues

**Error**: "Could not find the 'name' column of 'users'"

- **Solution**: Run the `supabase-schema.sql` script in Supabase SQL Editor

**Error**: "Database tables not found"

- **Solution**: Verify tables exist by running:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  ```

### Payment Issues

**Error**: "Razorpay SDK not loaded"

- **Solution**: Add Razorpay API keys to `.env` file

**Error**: "Payment verification failed"

- **Solution**: Check Razorpay API keys and server configuration

### Authentication Issues

**Error**: "User not authenticated"

- **Solution**: Sign in with Google OAuth

### Build Issues

**Error**: "Module not found"

- **Solution**: Run `npm install` to install dependencies

## Quick Diagnostics

1. Check browser console (F12) for error messages
2. Verify all environment variables are set
3. Ensure both servers are running (`npm run dev` and `npm run server`)

## Need More Help?

Check the main README.md for complete setup instructions.


