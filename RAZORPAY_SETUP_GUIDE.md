# 🔑 Razorpay Setup Guide

## Step 1: Create Razorpay Account

1. **Go to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Sign up** for a new account or **log in** if you already have one
3. **Complete KYC** verification (required for live payments)

## Step 2: Get API Keys

1. **Navigate to API Keys**: https://dashboard.razorpay.com/app/keys
2. **Generate Test Keys** (for development):
   - Click "Generate Test Key"
   - Copy the `Key ID` and `Key Secret`
3. **Generate Live Keys** (for production):
   - Complete KYC first
   - Click "Generate Live Key"
   - Copy the `Key ID` and `Key Secret`

## Step 3: Create Environment Files

Copy the example files and fill in your credentials:

```bash
# Copy environment templates
cp env.example .env
cp server/env.example server/.env
```

Then edit both files with your actual Razorpay credentials.

## Step 4: Fill in Your Credentials

Edit the `.env` files with your actual Razorpay credentials:

**Frontend (.env):**

- `VITE_RAZORPAY_KEY_ID` → Your actual Razorpay Key ID

**Backend (server/.env):**

- `RAZORPAY_KEY_ID` → Your actual Razorpay Key ID
- `RAZORPAY_KEY_SECRET` → Your actual Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET` → Your webhook secret (optional for development)

## Step 5: Test the Integration

1. **Start the servers**:

   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Payment server
   npm run server
   ```

2. **Test a payment**:
   - Go to http://localhost:5173
   - Add items to cart
   - Proceed to checkout
   - Test with Razorpay test cards

## Step 6: Webhook Setup (Optional for Development)

1. **Go to Webhooks**: https://dashboard.razorpay.com/app/webhooks
2. **Create Webhook**:
   - URL: `http://your-domain.com/api/webhooks/razorpay`
   - Events: Select payment events you want to track
3. **Copy Webhook Secret** and add to `.env`

## Test Cards for Development

Use these test cards to verify payments:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## Production Setup

When ready for production:

1. **Complete KYC** in Razorpay dashboard
2. **Generate Live Keys**
3. **Update environment variables** with live keys
4. **Set up production webhooks**
5. **Update frontend URL** in webhook settings

## Troubleshooting

### Common Issues:

1. **"Razorpay configuration missing"**:

   - Check if `.env` file exists
   - Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set

2. **"Invalid key"**:

   - Ensure you're using the correct test/live keys
   - Check for typos in the key values

3. **Payment not working**:
   - Check browser console for errors
   - Verify server is running on port 3001
   - Check server logs for Razorpay API errors

### Need Help?

- Check Razorpay documentation: https://razorpay.com/docs/
- Review server logs for specific error messages
- Ensure all environment variables are properly set
