# Devanagari Health Mix - E-commerce Platform

A modern, full-stack e-commerce platform for Devanagari Health Mix products, built with React, TypeScript, Supabase, and Razorpay.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Razorpay account
- Google Cloud account (for OAuth)

### Installation

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd DevanagariWeb
   npm install
   cd server && npm install && cd ..
   ```

2. **Follow the complete setup guide:**
   📖 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup from clone to production

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
├── database-schema.sql    # Database schema
├── SETUP_GUIDE.md        # Complete setup guide
└── README.md             # This file
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Razorpay payment server
- `npm run dev:full` - Start both frontend and payment server

## 🔧 Features

### ✅ Implemented

- **Authentication**: Google OAuth, user management
- **Product Management**: Product listing, cart functionality
- **Admin Panel**: Complete admin dashboard
- **Database**: Supabase integration with RLS policies
- **UI/UX**: Modern, responsive design
- **Payment Integration**: Razorpay payment processing

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup guide (start here!)
- **[database-schema.sql](./database-schema.sql)** - Database schema

## 🚨 Need Help?

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Review browser console logs for error messages
3. Ensure all environment variables are properly set
4. Verify both servers are running (`npm run dev` and `npm run server`)

## 📝 License

This project is proprietary software for Devanagari Health Mix.

---

**Note**: This project requires Razorpay API keys and Supabase configuration to function properly. Follow the setup guide for complete instructions.
