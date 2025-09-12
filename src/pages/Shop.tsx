import { useState } from 'react';
import { Minus, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { ingredients } from '../data/ingredients';
import FirstPage from '/Users/test/Downloads/Ecommerce/src/assets/shop/First page Flipkart.png'
import SecondPage from '/Users/test/Downloads/Ecommerce/src/assets/shop/Second Page Fipkart (1).png'

const Shop = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(450); // Default to 450g

  // Product images array
  const productImages = [
    {
      src: FirstPage,
      alt: "Devanagari Health Mix - Main Product"
    },
    {
      src: SecondPage,
      alt: "Product Packaging"
    },
  ];

  // Weight options with prices
  const weightOptions = {
    200: 19.99,
    450: 29.99,
    900: 49.99
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Product Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Image Gallery with Slider */}
          <div className="space-y-6">
            {/* Main Image Slider */}
            <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg">
              <img 
                src={productImages[currentImageIndex].src}
                alt={productImages[currentImageIndex].alt}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#4A5C3D] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#4A5C3D] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {productImages.length}
              </div>
            </div>
            
            {/* Thumbnail Navigation */}
            <div className="flex space-x-4 justify-center overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'ring-2 ring-[#4A5C3D] ring-offset-2 scale-105' 
                      : 'hover:opacity-80 hover:scale-105'
                  }`}
                >
                  <img 
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Purchase Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#4A5C3D] mb-4">
                Devanagari Health Mix
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide 
                complete nutrition. Rich in protein, fiber, vitamins, and minerals for your daily wellness journey.
              </p>
              <div className="text-3xl font-bold text-[#A88B67] mb-2">
                ${weightOptions[selectedWeight as keyof typeof weightOptions].toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mb-8">
                Selected: {selectedWeight}g pack
              </div>
            </div>

            {/* Weight Options */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#4A5C3D] uppercase tracking-wide">
                Quantity
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedWeight(200)}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    selectedWeight === 200
                      ? 'border-[#4A5C3D] bg-[#4A5C3D] text-white'
                      : 'border-gray-300 hover:border-[#4A5C3D] text-gray-700'
                  }`}
                >
                  <div className="text-lg font-semibold">200g</div>
                  <div className="text-sm opacity-80">$19.99</div>
                </button>
                <button
                  onClick={() => setSelectedWeight(450)}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    selectedWeight === 450
                      ? 'border-[#4A5C3D] bg-[#4A5C3D] text-white'
                      : 'border-gray-300 hover:border-[#4A5C3D] text-gray-700'
                  }`}
                >
                  <div className="text-lg font-semibold">450g</div>
                  <div className="text-sm opacity-80">$29.99</div>
                </button>
                <button
                  onClick={() => setSelectedWeight(900)}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    selectedWeight === 900
                      ? 'border-[#4A5C3D] bg-[#4A5C3D] text-white'
                      : 'border-gray-300 hover:border-[#4A5C3D] text-gray-700'
                  }`}
                >
                  <div className="text-lg font-semibold">900g</div>
                  <div className="text-sm opacity-80">$49.99</div>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1">
                    Best Value
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#4A5C3D] uppercase tracking-wide">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  className="w-10 h-10 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-semibold text-[#4A5C3D] w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="w-10 h-10 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button className="w-full bg-[#4A5C3D] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#3a4a2f] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              Add to Cart - ${(weightOptions[selectedWeight as keyof typeof weightOptions] * quantity).toFixed(2)}
            </button>

            {/* Additional Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Free shipping on orders over $50</p>
              <p>✓ 30-day money-back guarantee</p>
              <p>✓ Made from 100% natural ingredients</p>
            </div>
          </div>
        </div>

        {/* Detailed Information Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-[#4A5C3D] mb-8 text-center">
            Product Details
          </h2>
          
          {/* Full Ingredient List Tab */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => toggleTab('ingredients')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-[#4A5C3D]">Full Ingredient List</span>
              {activeTab === 'ingredients' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {activeTab === 'ingredients' && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="p-3 bg-[#E6D9C5] rounded-lg">
                      <span className="text-sm font-medium text-[#4A5C3D]">
                        {ingredient.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* How to Prepare Tab */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => toggleTab('preparation')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-[#4A5C3D]">How to Prepare</span>
              {activeTab === 'preparation' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {activeTab === 'preparation' && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#4A5C3D]">Simple Preparation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Add 2-3 tablespoons of Devanagari Health Mix to a glass</li>
                      <li>Pour 200ml of warm or cold milk (or plant-based milk)</li>
                      <li>Stir well until completely mixed</li>
                      <li>Add honey or jaggery to taste (optional)</li>
                      <li>Enjoy immediately for best taste and nutrition</li>
                    </ol>
                  </div>
                  <div className="bg-[#E6D9C5] p-4 rounded-lg">
                    <p className="text-sm text-[#4A5C3D]">
                      <strong>Pro Tip:</strong> For a richer texture, blend with a banana or add to smoothies!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;