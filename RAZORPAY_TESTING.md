# 🧪 Razorpay Integration Testing Guide

## Quick Test Setup

### 1. Update Environment Variables

First, add your Razorpay test keys to `.env`:

```env
# Razorpay Test Keys (get from https://dashboard.razorpay.com/app/keys)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
```

### 2. Update Database Schema

Run this SQL in your Supabase dashboard to add payment fields:

```sql
-- Add payment fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
```

### 3. Start Both Servers

```bash
# Option 1: Start both frontend and backend together
npm run dev:full

# Option 2: Start them separately
npm run dev          # Frontend (http://localhost:5173)
npm run dev:server   # Backend API (http://localhost:3001)
```

## Testing the Payment Flow

### Step 1: Test Cart Functionality
1. **Go to Shop page**: http://localhost:5173/shop
2. **Add items to cart** - should work without errors
3. **Check cart page**: http://localhost:5173/cart
4. **Verify cart items** appear correctly

### Step 2: Test Payment Process
1. **Sign in with Google** (required for payments)
2. **Go to cart page**
3. **Click "Pay Now" button**
4. **Razorpay modal should open**

### Step 3: Test Payment Success
Use these **Razorpay test card numbers**:

#### ✅ **Successful Payment**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3-digit number (e.g., `123`)
- **Name**: Any name

#### Expected Result:
- Payment completes successfully
- Order is created with payment information
- Cart is cleared
- Success alert shows order ID and payment ID

### Step 4: Test Payment Failure
Use this **test card for failed payments**:

#### ❌ **Failed Payment**
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3-digit number

#### Expected Result:
- Payment fails
- Error message is shown
- Order is not created
- Cart items remain

## Verification Checklist

### ✅ Frontend Tests
- [ ] Razorpay script loads without errors
- [ ] Payment button appears on cart page
- [ ] Payment modal opens when clicked
- [ ] Success/failure messages appear
- [ ] Order appears in Profile page
- [ ] Order details page works

### ✅ Backend Tests
Visit http://localhost:3001/health to check server status

- [ ] API server starts without errors
- [ ] Create order endpoint works
- [ ] Payment verification works
- [ ] Order status endpoint works

### ✅ Database Tests
Check in Supabase dashboard:

- [ ] Orders table has payment fields
- [ ] Successful payments create orders
- [ ] Failed payments don't create orders
- [ ] Payment IDs are stored correctly

## Console Output Examples

### Successful Payment Flow:
```
🛒 Adding to cart: {productData: {...}, quantity: 1, userId: "..."}
✅ Razorpay SDK loaded successfully
📦 Created Razorpay order: {id: "order_...", amount: 2999, ...}
🔐 Payment verification: {payment_id: "pay_...", order_id: "order_...", isValid: true}
✅ Order created with payment info
```

### Failed Payment Flow:
```
🛒 Adding to cart: {productData: {...}, quantity: 1, userId: "..."}
✅ Razorpay SDK loaded successfully
📦 Created Razorpay order: {id: "order_...", amount: 2999, ...}
❌ Payment failed: Payment cancelled by user
```

## API Endpoint Testing

You can test API endpoints directly:

### Create Order
```bash
curl -X POST http://localhost:3001/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "currency": "INR", "receipt": "test_receipt"}'
```

### Verify Payment
```bash
curl -X POST http://localhost:3001/api/razorpay/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_test123",
    "razorpay_order_id": "order_test123", 
    "razorpay_signature": "test_signature"
  }'
```

## Troubleshooting

### Common Issues

#### 1. "Razorpay Key ID not configured"
**Solution**: Check `.env` file has correct `VITE_RAZORPAY_KEY_ID`

#### 2. Payment modal doesn't open
**Solutions**:
- Check browser console for errors
- Ensure both servers are running
- Verify internet connectivity
- Check if Razorpay script loaded

#### 3. "Failed to create order" error
**Solutions**:
- Check backend server is running on port 3001
- Verify CORS is allowing your frontend domain
- Check server logs for specific errors

#### 4. Payment verification fails
**Solutions**:
- Check if backend server is responding
- Verify API endpoints are working
- Check server logs for verification errors

#### 5. Database errors
**Solutions**:
- Run the payment schema update SQL
- Check Supabase connection
- Verify RLS policies allow order creation

### Server Logs Location
- Backend logs appear in the terminal running `npm run dev:server`
- Frontend logs appear in browser console (F12)

## Production Checklist

Before going live, ensure:

- [ ] Replace test keys with live Razorpay keys
- [ ] Set up proper backend server (not the mock one)
- [ ] Implement real signature verification
- [ ] Set up Razorpay webhooks
- [ ] Add proper error handling
- [ ] Test with real bank cards
- [ ] Set up SSL certificate
- [ ] Configure proper CORS policies

## Additional Test Cards

For comprehensive testing:

### Different Scenarios
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987` 
- **Stolen Card**: `4000 0000 0000 9979`
- **Processing Error**: `4000 0000 0000 0119`

### International Cards
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 8224 6310 005`

## Support Resources

- **Razorpay Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Razorpay API Docs**: https://razorpay.com/docs/api/
- **Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- **Webhook Guide**: https://razorpay.com/docs/webhooks/
