import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkDatabaseSetup } from '../utils/databaseCheck';
import { checkDatabaseStatus, getDatabaseSetupInstructions, DatabaseStatus } from '../utils/databaseSetupHelper';
import '../utils/debugDatabase'; // Import debug utility
import '../utils/verifyDatabase'; // Import verification utility

const Shop = () => {
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const { addItem } = useCart();
  const { user } = useAuth();

  // Weight options with prices
  const weightOptions = {
    200: 19.99,
    450: 29.99,
    900: 49.99
  };

  useEffect(() => {
    const initializeShop = async () => {
      try {
        // Check database setup (with timeout to prevent hanging)
        const setupPromise = checkDatabaseSetup();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database check timeout')), 10000)
        );
        
        await Promise.race([setupPromise, timeoutPromise]);
        
        // Check database status for better error handling
        const status = await checkDatabaseStatus();
        setDatabaseStatus(status);
        
        console.log('Shop initialized with database status:', status);
      } catch (error) {
        console.error('Error initializing shop:', error);
        setDatabaseStatus({
          isConnected: false,
          tablesExist: false,
          missingTables: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeShop();
  }, []);

  const handleAddToCart = async (weight: number, quantity: number = 1) => {
    if (!user) {
      alert('Please sign in to add items to your cart');
      return;
    }

    const productKey = `devanagari-${weight}`;
    setAddingToCart(productKey);

    try {
      // Create product data based on user selection
      const productData = {
        name: 'Devanagari Health Mix',
        weight: weight,
        price: weightOptions[weight as keyof typeof weightOptions],
        description: 'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition.',
        image_url: '/src/assets/shop/First page Flipkart.png'
      };

      console.log('Adding to cart:', { productData, quantity, userId: user.id });
      
      // This will create the product in the database if it doesn't exist, then add to cart
      await addItem(productData, quantity);
      
      // Show success feedback
      setShowSuccess(productKey);
      setTimeout(() => setShowSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more specific error messages
      if (errorMessage.includes('Database tables not found')) {
        alert(`🚨 Database Setup Required!\n\n${errorMessage}\n\nPlease follow the setup instructions to create the required database tables.`);
      } else if (errorMessage.includes('User must be logged in')) {
        alert('Please sign in to add items to your cart');
      } else {
        alert(`Failed to add item to cart: ${errorMessage}\n\nPlease check the console for more details.`);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FDFBF8] pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A5C3D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show database setup error if needed
  if (databaseStatus && (!databaseStatus.isConnected || !databaseStatus.tablesExist)) {
  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <h2 className="text-xl font-bold text-red-800">Database Setup Required</h2>
            </div>
            <div className="text-red-700 whitespace-pre-line">
              {getDatabaseSetupInstructions(databaseStatus)}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href="https://supabase.com/dashboard/project/yclgaxigalixrimuixgo/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                🚀 Setup Database Now
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  console.log('Running debug database...');
                  (window as any).debugDatabase?.();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Debug Database
              </button>
              <button
                onClick={() => {
                  console.log('Verifying database setup...');
                  (window as any).verifyDatabaseSetup?.();
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Verify Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#4A5C3D] mb-4">
                Devanagari Health Mix
              </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide 
                complete nutrition. Rich in protein, fiber, vitamins, and minerals for your daily wellness journey.
              </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* 200g Product Card */}
          <ProductCard
            weight={200}
            price={weightOptions[200]}
            imageUrl="/src/assets/shop/First page Flipkart.png"
            onAddToCart={handleAddToCart}
            isAdding={addingToCart === 'devanagari-200'}
            showSuccess={showSuccess === 'devanagari-200'}
          />

          {/* 450g Product Card */}
          <ProductCard
            weight={450}
            price={weightOptions[450]}
            imageUrl="/src/assets/shop/First page Flipkart.png"
            onAddToCart={handleAddToCart}
            isAdding={addingToCart === 'devanagari-450'}
            showSuccess={showSuccess === 'devanagari-450'}
          />

          {/* 900g Product Card */}
          <ProductCard
            weight={900}
            price={weightOptions[900]}
            imageUrl="/src/assets/shop/First page Flipkart.png"
            onAddToCart={handleAddToCart}
            isAdding={addingToCart === 'devanagari-900'}
            showSuccess={showSuccess === 'devanagari-900'}
            isBestValue={true}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={24} />
              <span className="text-gray-700">Free shipping on orders over $50</span>
              </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={24} />
              <span className="text-gray-700">30-day money-back guarantee</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={24} />
              <span className="text-gray-700">Made from 100% natural ingredients</span>
            </div>
          </div>
              </div>
              </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  weight: number;
  price: number;
  imageUrl: string;
  onAddToCart: (weight: number, quantity?: number) => void;
  isAdding: boolean;
  showSuccess: boolean;
  isBestValue?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  weight,
  price,
  imageUrl,
  onAddToCart,
  isAdding,
  showSuccess,
  isBestValue = false
}) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden">
        <img 
          src={imageUrl}
          alt={`Devanagari Health Mix ${weight}g`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
            </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-[#4A5C3D]">
            Devanagari Health Mix
          </h3>
          {isBestValue && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Best Value
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          Premium blend of 21 natural grains, millets, and pulses
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-[#A88B67]">
            ${price.toFixed(2)}
                  </div>
          <div className="text-sm text-gray-500">
            {weight}g pack
              </div>
            </div>

            {/* Quantity Selector */}
        <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={decrementQuantity}
            className="w-8 h-8 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
                >
            <Minus size={14} />
                </button>
          <span className="text-lg font-semibold text-[#4A5C3D] w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
            className="w-8 h-8 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
          >
            <Plus size={14} />
            </button>
        </div>

        {/* Add to Cart Button */}
            <button
          onClick={() => onAddToCart(weight, quantity)}
          disabled={isAdding}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            showSuccess
              ? 'bg-green-500 text-white'
              : isAdding
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-[#4A5C3D] text-white hover:bg-[#3a4a2f] hover:scale-[1.02]'
          }`}
        >
          {showSuccess ? (
            <>
              <CheckCircle size={20} />
              <span>Added to Cart!</span>
            </>
          ) : isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              <span>Add to Cart - ${(price * quantity).toFixed(2)}</span>
            </>
          )}
            </button>
      </div>
    </div>
  );
};

export default Shop;