import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

// 👇 Import your logo
import logo from "../assets/logo.png"; // replace with your actual path

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-10 w-auto" // adjust size here
            />
            {/* Optional: Keep text with logo */}
            <span className="text-2xl font-bold text-[#4A5C3D]">Devanagari</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-[#4A5C3D] border-b-2 border-[#4A5C3D] pb-1'
                    : 'text-gray-700 hover:text-[#4A5C3D]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-[#4A5C3D] transition-colors duration-200">
              <ShoppingCart size={20} />
            </button>
            <button className="p-2 text-gray-700 hover:text-[#4A5C3D] transition-colors duration-200">
              <User size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-[#4A5C3D] font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button className="p-2 text-gray-700">
                  <ShoppingCart size={20} />
                </button>
                <button className="p-2 text-gray-700">
                  <User size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
