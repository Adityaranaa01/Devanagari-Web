import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { cartService, CartItem } from '../services/supabase';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addItem: (productData: {
    name: string;
    weight: number;
    price: number;
    description?: string;
    image_url?: string;
  }, quantity?: number) => Promise<void>;
  updateQty: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const cartItems = await cartService.getCartItems(user.id);
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addItem = async (productData: {
    name: string;
    weight: number;
    price: number;
    description?: string;
    image_url?: string;
  }, quantity: number = 1) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      await cartService.addToCart(user.id, productData, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const updateQty = async (cartItemId: string, quantity: number) => {
    console.log('🔵 CartContext.updateQty called with:', { cartItemId, quantity });
    
    if (quantity < 1) {
      console.log('Quantity cannot be less than 1, removing item instead');
      await removeItem(cartItemId);
      return;
    }

    try {
      console.log('🟡 Calling cartService.updateCartItemQuantity...');
      await cartService.updateCartItemQuantity(cartItemId, quantity);
      console.log('🟢 Successfully updated quantity, refreshing cart...');
      await refreshCart();
      console.log('🟢 Cart refresh completed');
    } catch (error) {
      console.error('🔴 Error updating cart item quantity:', error);
      alert('Failed to update quantity. Please try again.');
      throw error;
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await cartService.removeFromCart(cartItemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await cartService.clearCart(user.id);
      await refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  const totalPrice = useMemo(() => 
    items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0), 
    [items]
  );

  const value: CartContextValue = useMemo(() => ({ 
    items, 
    totalItems, 
    totalPrice, 
    loading,
    addItem, 
    updateQty, 
    removeItem, 
    clearCart,
    refreshCart
  }), [items, totalItems, totalPrice, loading]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};