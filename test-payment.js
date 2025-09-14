#!/usr/bin/env node

// Simple test script to verify Razorpay integration
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testRazorpayIntegration() {
  console.log('🧪 Testing Razorpay Integration...\n');
  
  try {
    // Test 1: Get Razorpay Config
    console.log('1️⃣ Testing Razorpay Config...');
    const configResponse = await fetch(`${API_BASE}/razorpay/config`);
    
    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('✅ Config retrieved:', config);
    } else {
      console.log('❌ Config failed:', configResponse.status);
      const error = await configResponse.text();
      console.log('Error:', error);
      return;
    }
    
    // Test 2: Create Order
    console.log('\n2️⃣ Testing Order Creation...');
    const orderData = {
      amount: 2000, // ₹20 in paise
      currency: 'INR',
      receipt: 'test_receipt_123',
      notes: {
        test: true,
        user_email: 'test@example.com'
      }
    };
    
    const orderResponse = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (orderResponse.ok) {
      const order = await orderResponse.json();
      console.log('✅ Order created:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      });
      
      // Test 3: Get Order Details
      console.log('\n3️⃣ Testing Order Details...');
      const orderDetailsResponse = await fetch(`${API_BASE}/razorpay/order/${order.id}`);
      
      if (orderDetailsResponse.ok) {
        const orderDetails = await orderDetailsResponse.json();
        console.log('✅ Order details retrieved:', {
          id: orderDetails.id,
          status: orderDetails.status,
          amount: orderDetails.amount
        });
      } else {
        console.log('❌ Order details failed:', orderDetailsResponse.status);
      }
      
    } else {
      console.log('❌ Order creation failed:', orderResponse.status);
      const error = await orderResponse.text();
      console.log('Error:', error);
    }
    
    console.log('\n🎉 Integration test completed!');
    console.log('\nNote: For full payment testing, use the frontend with test cards:');
    console.log('- Test Card: 4111 1111 1111 1111');
    console.log('- CVV: Any 3 digits');
    console.log('- Expiry: Any future date');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run server');
  }
}

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (e) {
  console.log('❌ node-fetch not found. Installing...');
  console.log('Run: npm install node-fetch@2');
  process.exit(1);
}

testRazorpayIntegration();
