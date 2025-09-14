#!/bin/bash

# 🚀 Razorpay Integration Test Setup Script

echo "🎯 Setting up Razorpay Integration Test Environment..."

# Check if required files exist
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Creating template..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://yclgaxigalixrimuixgo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbGdheGlnYWxpeHJpbXVpeGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTQ4ODAsImV4cCI6MjA0OTY5MDg4MH0.rLUsHLtIiYUnKzGCX0-Zl2d0TtJRqW2yi2lQRO6rPrQ

# Razorpay Configuration (Add your test keys here)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here

# Environment
NODE_ENV=development
EOF
    echo "📝 Please update .env with your actual Razorpay test keys!"
    echo "   Get them from: https://dashboard.razorpay.com/app/keys"
fi

# Check if schema update is needed
echo "📋 Checking database schema..."
echo "⚠️  Please run this SQL in your Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/yclgaxigalixrimuixgo/sql"
echo ""
cat razorpay-schema-update.sql
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if server directory exists
if [ ! -f "server/razorpay-server.js" ]; then
    echo "❌ Server file not found!"
    exit 1
fi

echo "✅ Setup complete! Next steps:"
echo ""
echo "1. 🔑 Update .env with your Razorpay test keys"
echo "2. 🗄️  Run the SQL schema update in Supabase dashboard"
echo "3. 🚀 Start the development servers:"
echo "   npm run dev:full"
echo ""
echo "4. 🧪 Test the integration:"
echo "   - Visit: http://localhost:5173/shop"
echo "   - Add items to cart"
echo "   - Try payment with test card: 4111 1111 1111 1111"
echo ""
echo "📚 Check RAZORPAY_TESTING.md for detailed testing instructions"
echo ""
echo "🔗 Useful links:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3001"
echo "   - API Health: http://localhost:3001/health"
echo "   - Razorpay Dashboard: https://dashboard.razorpay.com"
echo ""
echo "Happy testing! 🎉"
