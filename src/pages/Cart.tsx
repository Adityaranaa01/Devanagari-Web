import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/supabase';
import RazorpayPayment from '../components/RazorpayPayment';

interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

const Cart = () => {
  const { items: cartItems, updateQty, removeItem, totalItems, totalPrice, clearCart, loading } = useCart();
  const { user } = useAuth();
  const [placingOrder, setPlacingOrder] = useState(false);

  const getSubtotal = (price: number, qty: number) => price * qty;

  const handlePaymentSuccess = async (paymentResponse: RazorpayPaymentResponse) => {
    if (!user) {
      alert('Please sign in to place an order');
      return;
    }

    setPlacingOrder(true);
    try {
      // Create order with payment information
      const paymentData = {
        payment_id: paymentResponse.razorpay_payment_id,
        payment_order_id: paymentResponse.razorpay_order_id,
        payment_signature: paymentResponse.razorpay_signature,
        payment_status: 'paid' as const,
        payment_method: 'razorpay',
        currency: 'INR'
      };

      const order = await ordersService.createOrder(user.id, cartItems, paymentData);
      await clearCart();
      
      const orderTotal = totalPrice + (totalPrice >= 50 ? 0 : 5.99);
      alert(`Order placed successfully!\n\nOrder ID: ${order.id}\nPayment ID: ${paymentResponse.razorpay_payment_id}\nTotal: $${orderTotal.toFixed(2)}\n\nCustomer: ${user.user_metadata?.full_name || user.email}`);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      alert('Payment successful but order creation failed. Please contact support.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message}`);
    setPlacingOrder(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please sign in to place an order');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // For cash on delivery or other payment methods
    setPlacingOrder(true);
    try {
      const order = await ordersService.createOrder(user.id, cartItems);
      await clearCart();
      
      const orderTotal = totalPrice + (totalPrice >= 50 ? 0 : 5.99);
      alert(`Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: $${orderTotal.toFixed(2)}\n\nCustomer: ${user.user_metadata?.full_name || user.email}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FDFBF8] pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A5C3D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#FDFBF8] pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-[#4A5C3D] mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-[#4A5C3D] text-white rounded-lg font-semibold hover:bg-[#3a4a2f] transition-colors duration-200"
            >
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4A5C3D]">
            Shopping Cart
          </h1>
          <Link
            to="/shop"
            className="inline-flex items-center text-[#4A5C3D] hover:text-[#3a4a2f] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              console.log('Cart item:', item);
              return (
              <div
                key={`${item.id}-${item.product_id}`}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-[#E6D9C5] rounded-lg flex items-center justify-center">
                        <ShoppingBag size={24} className="text-[#4A5C3D]" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#4A5C3D] mb-2">
                      {item.product?.name || 'Product'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-[#E6D9C5] px-3 py-1 rounded-full font-medium">
                        {item.product?.weight}g pack
                      </span>
                      <span className="text-lg font-bold text-[#A88B67]">
                        ${item.product?.price?.toFixed(2) || '0.00'} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          console.log('🔴 MINUS BUTTON CLICKED!');
                          console.log('Item details:', { id: item.id, quantity: item.quantity, product_id: item.product_id });
                          const newQuantity = item.quantity - 1;
                          console.log('Decreasing quantity for item:', item.id, 'from', item.quantity, 'to', newQuantity);
                          updateQty(item.product_id, newQuantity);
                        }}
                        className="w-10 h-10 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-xl font-semibold text-[#4A5C3D] w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          console.log('🔴 PLUS BUTTON CLICKED!');
                          console.log('Item details:', { id: item.id, quantity: item.quantity, product_id: item.product_id });
                          console.log('Increasing quantity for item:', item.id, 'from', item.quantity, 'to', item.quantity + 1);
                          updateQty(item.product_id, item.quantity + 1);
                        }}
                        className="w-10 h-10 rounded-full border-2 border-[#4A5C3D] flex items-center justify-center text-[#4A5C3D] hover:bg-[#4A5C3D] hover:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-lg font-bold text-[#4A5C3D]">
                        ${getSubtotal(item.product?.price || 0, item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${item.product?.price?.toFixed(2) || '0.00'} × {item.quantity}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-[#4A5C3D] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Items ({totalItems})</span>
                  <span className="font-semibold text-[#4A5C3D]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {totalPrice >= 50 ? 'Free' : '$5.99'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-[#4A5C3D]">Total</span>
                    <span className="text-[#A88B67]">
                      ${(totalPrice + (totalPrice >= 50 ? 0 : 5.99)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                {totalPrice >= 50 ? (
                  <p className="text-green-600 font-medium">✓ You qualify for free shipping!</p>
                ) : (
                  <p>Add ${(50 - totalPrice).toFixed(2)} more for free shipping</p>
                )}
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Secure checkout</p>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {/* Razorpay Payment Button */}
                <RazorpayPayment
                  amount={totalPrice + (totalPrice >= 50 ? 0 : 5.99)}
                  currency="USD"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={placingOrder}
                  className="w-full py-4 text-lg shadow-lg hover:shadow-xl"
                >
                  {placingOrder ? (
                    <span>Processing Order...</span>
                  ) : (
                    <span>Pay Now - $${(totalPrice + (totalPrice >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                  )}
                </RazorpayPayment>

                {/* Cash on Delivery Button */}
                <button 
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full bg-gray-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingOrder ? 'Placing Order...' : 'Cash on Delivery'}
                </button>
              </div>

              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="block w-full text-center py-3 border-2 border-[#4A5C3D] text-[#4A5C3D] rounded-lg font-semibold hover:bg-[#4A5C3D] hover:text-white transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;