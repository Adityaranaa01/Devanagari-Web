# 🔧 RAZORPAY ENVIRONMENT SETUP

## IMPORTANT: Replace with Your Actual Keys

To complete the Razorpay integration, you need to:

### 1. Get Razorpay Test Keys

1. **Sign up/Login to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Navigate to Settings > API Keys**
3. **Generate Test Keys** (for development)
4. **Copy the Key ID and Key Secret**

### 2. Update Environment Variables

Replace the placeholder values in `.env` file:

```bash
# Replace these with your actual Razorpay test keys
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_test_key_secret
```

### 3. Test Configuration

Currently set to:
- Key ID: `rzp_test_1234567890` (placeholder)
- Key Secret: `your_test_key_secret_here` (placeholder)

### 4. Start Testing

Once you have real keys:

```bash
# Start backend server
npm run server

# Start frontend (in another terminal)
npm run dev

# Test the complete flow
open http://localhost:5173
```

### 5. Test Cards (Razorpay Test Mode)

- **Success**: 4111 1111 1111 1111
- **Failed**: 4000 0000 0000 0002  
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **OTP**: 123456

### 6. Production Deployment

For production:
1. Get live keys from Razorpay dashboard
2. Update environment variables
3. Change webhook URLs to production URLs
4. Test thoroughly before going live

---

**Need Help?**
- Razorpay Documentation: https://razorpay.com/docs/
- Test Integration: https://razorpay.com/docs/payments/test-card-details/
