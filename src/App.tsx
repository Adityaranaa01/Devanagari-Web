import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

// ✅ Import context providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  // Load Razorpay script when app starts
  useEffect(() => {
    const loadRazorpay = () => {
      if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Razorpay SDK loaded successfully');
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
        };
        document.head.appendChild(script);
      }
    };

    loadRazorpay();
  }, []);

  return (
    <Router>
      {/* ✅ Wrap everything inside Auth + Cart providers */}
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col font-['Inter']">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
