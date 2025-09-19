# Devanagari Health Mix - E-commerce Platform

A modern, full-stack e-commerce platform for Devanagari Health Mix products, built with React, TypeScript, Supabase, and Razorpay.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd DevanagariWeb
   npm install
   ```

2. **Set up environment variables:**
   Copy the example files and fill in your credentials:

   ```bash
   # Copy environment templates
   cp env.example .env
   cp server/env.example server/.env
   ```

   Then edit both files with your actual credentials.

3. **Set up the database:**

   - Go to your Supabase dashboard
   - Run the SQL script from `database-schema.sql` in the SQL Editor
   - This will create all necessary tables and policies

4. **Start the development servers:**

   ```bash
   # Terminal 1: Start the frontend
   npm run dev

   # Terminal 2: Start the payment server
   npm run server
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Payment API: http://localhost:3001

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Razorpay payment server
- `npm run dev:full` - Start both frontend and payment server

## 📁 Project Structure

```
DevanagariWeb/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/           # React contexts (Auth, Cart, Admin)
│   ├── pages/             # Page components
│   ├── services/          # API services (Supabase, Razorpay)
│   └── utils/             # Utility functions
├── server/                # Payment server
│   ├── razorpay-server.cjs # Razorpay API server
│   └── package.json       # Server dependencies
├── supabase-schema.sql    # Database schema
├── .env                   # Environment variables
└── README.md             # This file
```

## 🔧 Features

### ✅ Implemented

- **Authentication**: Google OAuth, user management
- **Product Management**: Product listing, cart functionality
- **Admin Panel**: Complete admin dashboard
- **Database**: Supabase integration with RLS policies
- **UI/UX**: Modern, responsive design
- **Payment Integration**: Razorpay payment processing

### 🔑 Required Setup

- **Razorpay API Keys**: Get from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
- **Supabase Project**: Create project and get API keys
- **Database Schema**: Run the SQL script in Supabase

## 🚨 Troubleshooting

### Common Issues

1. **Payment server won't start:**

   - Ensure Razorpay API keys are set in `.env`
   - Check that port 5000 is available

2. **Database connection issues:**

   - Verify Supabase URL and keys are correct
   - Ensure database schema is properly set up

3. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript configuration

### Getting Help

- Check the `TROUBLESHOOTING.md` file for detailed solutions
- Review the console logs for specific error messages
- Ensure all environment variables are properly set

## 🚀 Deployment

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Deploy frontend:**

   - Deploy the `dist/` folder to your hosting service
   - Update environment variables for production

3. **Deploy payment server:**
   - Deploy the server to a Node.js hosting service
   - Set production environment variables

## 📋 Client Handover

This project includes comprehensive handover documentation:

- **`CLIENT_HANDOVER.md`** - Complete client handover guide
- **`MAINTENANCE_GUIDE.md`** - Maintenance and support procedures
- **`PRODUCTION_DEPLOYMENT.md`** - Production deployment instructions
- **`CREDENTIALS_TEMPLATE.md`** - Account access and credentials
- **`HANDOVER_CHECKLIST.md`** - Complete handover checklist

### Quick Handover Steps

1. Add Razorpay API keys to `.env`
2. Deploy to production using `PRODUCTION_DEPLOYMENT.md`
3. Transfer all account access to client
4. Complete training sessions
5. Sign off using `HANDOVER_CHECKLIST.md`

## 📝 License

This project is proprietary software for Devanagari Health Mix.

---

**Note**: This project requires Razorpay API keys to function properly. Without them, the payment system will not work.
