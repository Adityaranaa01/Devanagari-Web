# 💳 Razorpay Integration Setup Guide

## Overview
This guide will help you integrate Razorpay payment gateway into your Devanagari Web application.

## Prerequisites
1. A Razorpay account (sign up at https://razorpay.com)
2. Your Razorpay API keys (Key ID and Key Secret)

## Step 1: Get Razorpay API Keys

1. **Sign up/Login to Razorpay:**
   - Visit: https://razorpay.com
   - Create an account or log in

2. **Get API Keys:**
   - Go to Settings > API Keys
   - Generate new API keys if you don't have them
   - Copy the `Key ID` and `Key Secret`

## Step 2: Configure Environment Variables

1. **Update `.env` file:**
   ```env
   # Replace with your actual Razorpay keys
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

2. **Important Security Notes:**
   - Never expose `RAZORPAY_KEY_SECRET` in frontend code
   - Use `VITE_RAZORPAY_KEY_ID` for frontend (publicly visible)
   - Keep `RAZORPAY_KEY_SECRET` for backend verification only

## Step 3: Update Database Schema

Run the Razorpay schema update in your Supabase dashboard:

1. **Go to Supabase SQL Editor:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `yclgaxigalixrimuixgo`
   - Click "SQL Editor" → "New Query"

2. **Run Schema Update:**
   - Copy contents of `razorpay-schema-update.sql`
   - Paste and execute in SQL Editor

## Step 4: Test Payment Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the payment flow:**
   - Add items to cart
   - Go to checkout
   - Click "Pay Now" button
   - Test with Razorpay test cards

## Step 5: Razorpay Test Cards

Use these test card numbers for testing:

### Successful Payments
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date
- **CVV:** Any 3-digit number
- **Name:** Any name

### Failed Payments
- **Card Number:** `4000 0000 0000 0002`
- **Expiry:** Any future date
- **CVV:** Any 3-digit number

### Other Test Scenarios
- **Insufficient Funds:** `4000 0000 0000 9995`
- **Lost Card:** `4000 0000 0000 9987`
- **Stolen Card:** `4000 0000 0000 9979`

## Step 6: Production Setup

### Backend API Requirements
For production, you need to create these API endpoints:

1. **Create Order API (`POST /api/razorpay/create-order`):**
   ```javascript
   const Razorpay = require('razorpay');
   
   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET,
   });
   
   // Create order
   const order = await razorpay.orders.create({
     amount: amount * 100, // amount in paise
     currency: 'INR',
     receipt: receipt_id,
   });
   ```

2. **Verify Payment API (`POST /api/razorpay/verify-payment`):**
   ```javascript
   const crypto = require('crypto');
   
   const signature = req.body.razorpay_signature;
   const order_id = req.body.razorpay_order_id;
   const payment_id = req.body.razorpay_payment_id;
   
   const body = order_id + "|" + payment_id;
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(body.toString())
     .digest('hex');
   
   const isValid = expectedSignature === signature;
   ```

### Webhook Setup
1. **Configure Razorpay Webhooks:**
   - Go to Razorpay Dashboard > Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`

2. **Webhook Verification:**
   ```javascript
   const webhookSignature = req.headers['x-razorpay-signature'];
   const body = JSON.stringify(req.body);
   
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
     .update(body)
     .digest('hex');
   
   const isValidWebhook = expectedSignature === webhookSignature;
   ```

## Step 7: Currency Conversion

The app uses USD for display but converts to INR for Razorpay:

- **Display Price:** USD (for international users)
- **Payment Price:** INR (Razorpay requirement)
- **Conversion:** Automatic (you may want to use a real-time API)

## Step 8: Order Management

Orders are stored in Supabase with payment information:

- `payment_id`: Razorpay payment ID
- `payment_order_id`: Razorpay order ID  
- `payment_signature`: Razorpay signature
- `payment_status`: 'pending' | 'paid' | 'failed' | 'refunded'
- `payment_method`: 'razorpay'
- `currency`: 'INR'

## Troubleshooting

### Common Issues

1. **"Razorpay Key ID not configured"**
   - Check `.env` file has correct `VITE_RAZORPAY_KEY_ID`
   - Restart development server after updating `.env`

2. **Payment modal doesn't open**
   - Check browser console for errors
   - Ensure Razorpay script is loaded
   - Verify internet connectivity

3. **Payment verification fails**
   - Check webhook signature verification
   - Ensure correct secret keys are used
   - Verify API endpoint is working

4. **Database errors during order creation**
   - Run `razorpay-schema-update.sql` in Supabase
   - Check RLS policies allow order insertion
   - Verify user authentication

### Support
- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay Support:** https://razorpay.com/support/
- **Test Environment:** https://dashboard.razorpay.com/

## Security Checklist

- [ ] API keys are properly configured
- [ ] Key Secret is never exposed in frontend
- [ ] Payment verification is done server-side
- [ ] Webhooks are properly verified
- [ ] Orders are created only after payment verification
- [ ] SSL certificate is installed in production
- [ ] Database access is properly restricted

## Next Steps

1. Test payments thoroughly in test mode
2. Implement proper error handling
3. Add payment confirmation emails
4. Set up webhook monitoring
5. Configure refund handling
6. Add payment analytics
7. Switch to live keys for production
