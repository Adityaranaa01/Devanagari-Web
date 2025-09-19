import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ChevronDown,
  Tag,
  MapPin,
  CreditCard,
  Check,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { addressService, UserAddress } from "../services/supabase";
import razorpayService from "../services/razorpay";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items: cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // Modal state
  const [currentStep, setCurrentStep] = useState(1);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Free delivery pincodes
  const freeDeliveryPincodes = [
    "577001",
    "577002",
    "577003",
    "577004",
    "577005",
    "577006",
    "577008",
  ];

  // Calculate totals
  const subtotal = totalPrice;
  const isFreeDelivery =
    selectedAddress &&
    freeDeliveryPincodes.includes(selectedAddress.postal_code);
  const shipping = isFreeDelivery ? 0 : 99;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  // Calculate offers based on current subtotal
  const offers = useMemo(
    () => [
      {
        code: "WELCOME10",
        discount: 10,
        type: "percentage",
        description: "10% off on your first order",
        minOrder: 0,
        applicable: true,
      },
      {
        code: "SAVE20",
        discount: 20,
        type: "percentage",
        description: "20% off on orders above ₹500",
        minOrder: 500,
        applicable: subtotal >= 500,
      },
      {
        code: "FREESHIP",
        discount: 0,
        type: "shipping",
        description: "Free shipping on orders above ₹300",
        minOrder: 300,
        applicable: subtotal >= 300,
      },
      {
        code: "NEWUSER",
        discount: 15,
        type: "percentage",
        description: "15% off for new users",
        minOrder: 0,
        applicable: true,
      },
    ],
    [subtotal]
  );

  // Load addresses when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchAddresses();
    }
  }, [isOpen, user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userAddresses = await addressService.getUserAddresses(user.id);
      setAddresses(userAddresses);

      // Auto-select default address if available
      const defaultAddress = userAddresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showError("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      showError("Invalid Code", "Please enter a promo code");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/promo/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: promoCode }),
        }
      );

      const data = await response.json();

      if (data.valid) {
        setPromoApplied(true);
        setPromoDiscount(Math.round(subtotal * (data.discount / 100)));
        showSuccess("Promo Applied", `${data.description}`);
      } else {
        showError(
          "Invalid Code",
          data.error || "The promo code you entered is not valid"
        );
      }
    } catch (error) {
      console.error("Promo code validation error:", error);
      showError("Error", "Failed to validate promo code. Please try again.");
    }
  };

  const handleOfferSelect = (offer: any) => {
    if (offer.applicable) {
      setPromoCode(offer.code);
      setShowOffersModal(false);
    } else {
      showError(
        "Not Applicable",
        `This offer requires a minimum order of ₹${
          offer.minOrder
        }. Your current order is ₹${subtotal.toFixed(2)}`
      );
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!selectedAddress) {
        showError("Address Required", "Please select a shipping address");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      showError("Address Required", "Please select a shipping address");
      return;
    }

    if (!user?.email) {
      showError("Authentication Required", "Please sign in to make a payment");
      return;
    }

    setPaymentLoading(true);
    try {
      // Create Razorpay order
      const order = await razorpayService.createOrder(
        total, // Amount in INR
        cartItems.map((item) => ({
          id: item.id,
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        user.email
      );

      // Open payment modal
      await razorpayService.openPaymentModal(
        order,
        user.email,
        user.user_metadata?.full_name || user.email,
        user.user_metadata?.phone,
        (response) => {
          showSuccess(
            "Payment Successful",
            "Your order has been placed successfully!"
          );
          clearCart();
          onClose();
          // Navigate to orders page
          window.location.href = "/orders";
        },
        (error) => {
          showError("Payment Failed", error.message);
        }
      );
    } catch (error) {
      console.error("Payment error:", error);
      showError(
        "Payment Error",
        "Failed to initiate payment. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/logo.png" alt="Logo" className="h-8 w-8" />
            <h2 className="text-xl font-bold text-[#4A5C3D]">Devanagari</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1
                    ? "bg-[#4A5C3D] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 1 ? <Check size={16} /> : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 1 ? "text-[#4A5C3D]" : "text-gray-500"
                }`}
              >
                Address
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2
                    ? "bg-[#4A5C3D] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 2 ? <Check size={16} /> : "2"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 2 ? "text-[#4A5C3D]" : "text-gray-500"
                }`}
              >
                Pay
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-semibold text-[#4A5C3D]">Order Summary</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${
                isOrderSummaryOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOrderSummaryOpen && (
            <div className="mt-4 space-y-4">
              {/* Product Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#4A5C3D] text-sm">
                  Items in your order:
                </h4>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product?.image_url || "/src/assets/logo.png"}
                      alt={item.product?.name || "Product"}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-gray-900">
                        {item.product?.name || "Product"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {item.product?.weight}g pack × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₹
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {isFreeDelivery ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Address Selection */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            {/* Welcome Message */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#4A5C3D]">
                  Hey! Welcome back{" "}
                  {user?.user_metadata?.full_name?.split(" ")[0] ||
                    user?.user_metadata?.name?.split(" ")[0] ||
                    user?.email?.split("@")[0] ||
                    "Customer"}
                </h3>
              </div>
              <button className="text-[#4A5C3D] text-sm font-medium">
                Edit
              </button>
            </div>

            {/* Promo Code Section */}
            <div className="bg-[#E6D9C5] rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="text-[#4A5C3D]" size={20} />
                <span className="font-semibold text-[#4A5C3D]">
                  ENTER COUPON CODE
                </span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5C3D] focus:border-transparent"
                  disabled={promoApplied}
                />
                <button
                  onClick={handlePromoCode}
                  disabled={promoApplied || !promoCode.trim()}
                  className="px-4 py-2 bg-[#4A5C3D] text-white rounded-lg hover:bg-[#3a4a2f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">
                  4 coupons available
                </span>
                <button
                  onClick={() => setShowOffersModal(true)}
                  className="text-[#4A5C3D] text-sm font-medium hover:underline"
                >
                  View Coupons →
                </button>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#4A5C3D]">
                  Shipping Address
                </h3>
                <button className="text-[#4A5C3D] text-sm font-medium">
                  + Add address
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5C3D] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <button className="text-[#4A5C3D] text-sm font-medium">
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? "border-[#4A5C3D] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedAddress?.id === address.id
                                  ? "border-[#4A5C3D] bg-[#4A5C3D]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddress?.id === address.id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900">
                              {address.name}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{address.address_line_1}</p>
                            {address.address_line_2 && (
                              <p>{address.address_line_2}</p>
                            )}
                            <p>
                              {address.city}, {address.state}{" "}
                              {address.postal_code}
                            </p>
                            <p>{address.country}</p>
                            <p className="font-medium">{address.phone}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-[#4A5C3D] text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-500 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedAddress}
              className="w-full bg-[#4A5C3D] text-white py-4 rounded-lg font-semibold hover:bg-[#3a4a2f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#4A5C3D] mb-2">
                Payment Details
              </h3>
              <p className="text-gray-600">
                Complete your order with secure payment
              </p>
            </div>

            {/* Order Summary for Payment Step */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-[#4A5C3D] mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Items ({cartItems.length})
                  </span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {isFreeDelivery ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Address */}
            {selectedAddress && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-[#4A5C3D] mb-2">
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedAddress.name}</p>
                  <p>{selectedAddress.address_line_1}</p>
                  {selectedAddress.address_line_2 && (
                    <p>{selectedAddress.address_line_2}</p>
                  )}
                  <p>
                    {selectedAddress.city}, {selectedAddress.state}{" "}
                    {selectedAddress.postal_code}
                  </p>
                  <p>{selectedAddress.country}</p>
                  <p className="font-medium">{selectedAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full bg-[#4A5C3D] text-white py-4 rounded-lg font-semibold hover:bg-[#3a4a2f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {paymentLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay ₹{total.toFixed(2)}</span>
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full text-[#4A5C3D] py-2 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              ← Back to Address
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPolicyModal(true)}
                className="hover:text-[#4A5C3D] transition-colors"
              >
                Terms and Policies
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span>PCI DSS Certified</span>
              <span>100% Secured Payments</span>
              <span>Verified Merchant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#4A5C3D]">
                  Available Offers
                </h3>
                <button
                  onClick={() => setShowOffersModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <div
                    key={index}
                    onClick={() => handleOfferSelect(offer)}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      offer.applicable
                        ? "border-gray-200 hover:border-[#4A5C3D] hover:bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`font-semibold ${
                          offer.applicable ? "text-[#4A5C3D]" : "text-gray-500"
                        }`}
                      >
                        {offer.code}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {offer.applicable ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {offer.type === "shipping"
                              ? "FREE SHIPPING"
                              : `${offer.discount}% OFF`}
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            NOT APPLICABLE
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-sm mb-2 ${
                        offer.applicable ? "text-gray-600" : "text-gray-500"
                      }`}
                    >
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs ${
                          offer.applicable ? "text-gray-500" : "text-red-500"
                        }`}
                      >
                        {offer.applicable
                          ? offer.minOrder > 0
                            ? `Minimum order: ₹${offer.minOrder}`
                            : "No minimum order required"
                          : `Requires minimum order of ₹${offer.minOrder}`}
                      </p>
                      {offer.applicable && (
                        <span className="text-xs text-[#4A5C3D] font-medium">
                          Click to apply →
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowOffersModal(false)}
                  className="w-full bg-[#4A5C3D] text-white py-3 rounded-lg font-semibold hover:bg-[#3a4a2f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#4A5C3D]">
                  Policies & Terms
                </h3>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Terms and Conditions */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#4A5C3D] transition-colors">
                  <a
                    href="https://merchant.razorpay.com/policy/RHjsekRLxMzas4/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="font-semibold text-[#4A5C3D] mb-2">
                      Terms and Conditions
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Read our terms of service and user agreement
                    </p>
                    <span className="text-xs text-[#4A5C3D] font-medium">
                      View Terms →
                    </span>
                  </a>
                </div>

                {/* Cancellation and Refund Policy */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#4A5C3D] transition-colors">
                  <a
                    href="https://merchant.razorpay.com/policy/RHjsekRLxMzas4/refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="font-semibold text-[#4A5C3D] mb-2">
                      Cancellation and Refund Policy
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Learn about our refund and cancellation policies
                    </p>
                    <span className="text-xs text-[#4A5C3D] font-medium">
                      View Policy →
                    </span>
                  </a>
                </div>

                {/* Shipping and Delivery Policy */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#4A5C3D] transition-colors">
                  <a
                    href="https://merchant.razorpay.com/policy/RHjsekRLxMzas4/shipping"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="font-semibold text-[#4A5C3D] mb-2">
                      Shipping and Delivery Policy
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Information about shipping, delivery times, and charges
                    </p>
                    <span className="text-xs text-[#4A5C3D] font-medium">
                      View Policy →
                    </span>
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="w-full bg-[#4A5C3D] text-white py-3 rounded-lg font-semibold hover:bg-[#3a4a2f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;
