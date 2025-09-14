import { supabase } from '../lib/supabaseClient';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  weight: number; // in grams
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_id?: string;
  payment_order_id?: string;
  payment_signature?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  currency?: string;
  created_at: string;
  updated_at?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
};

// Products Service
export const productsService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }

    return data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }

    return data;
  },

  async ensureSampleProducts(): Promise<Product[]> {
    // Check if products exist
    const existingProducts = await this.getAllProducts();
    
    if (existingProducts.length > 0) {
      return existingProducts;
    }

    // Create sample products if none exist
    const sampleProducts = [
      {
        name: 'Devanagari Health Mix',
        description: 'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition.',
        price: 19.99,
        image_url: '/src/assets/shop/First page Flipkart.png',
        stock: 100,
        weight: 200
      },
      {
        name: 'Devanagari Health Mix',
        description: 'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition.',
        price: 29.99,
        image_url: '/src/assets/shop/First page Flipkart.png',
        stock: 100,
        weight: 450
      },
      {
        name: 'Devanagari Health Mix',
        description: 'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition.',
        price: 49.99,
        image_url: '/src/assets/shop/First page Flipkart.png',
        stock: 100,
        weight: 900
      }
    ];

    const createdProducts: Product[] = [];
    for (const product of sampleProducts) {
      try {
        const created = await this.createProduct(product);
        createdProducts.push(created);
      } catch (error) {
        console.error('Error creating sample product:', error);
      }
    }

    return createdProducts;
  }
};

// Cart Service
export const cartService = {
  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('Failed to fetch cart items');
    }

    return data || [];
  },

  async addToCart(userId: string, productData: {
    name: string;
    weight: number;
    price: number;
    description?: string;
    image_url?: string;
  }, quantity: number = 1): Promise<void> {
    try {
      console.log('🛒 Adding to cart:', { productData, quantity, userId });

      // First, test if tables exist
      const { error: tableError } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('❌ Database table error:', tableError);
        if (tableError.code === 'PGRST116' || tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
          throw new Error('Database tables not found. Please run the SQL schema script in your Supabase dashboard first.');
        }
        throw new Error(`Database error: ${tableError.message}`);
      }

      // Ensure user exists in users table before proceeding
      console.log('👤 Ensuring user exists in database...');
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('❌ Error checking user:', userCheckError);
        throw new Error(`Failed to check user: ${userCheckError.message}`);
      }

      if (!existingUser) {
        console.log('👤 User not found in database, creating user...');
        // Get current user from Supabase auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          throw new Error('User not authenticated. Please sign in again.');
        }

        // Create user in users table
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
            avatar_url: authUser.user_metadata?.avatar_url
          });

        if (createUserError) {
          console.error('❌ Error creating user:', createUserError);
          if (createUserError.code === '23505') {
            // User already exists (unique constraint violation)
            console.log('✅ User already exists (race condition)');
          } else {
            throw new Error(`Failed to create user: ${createUserError.message}`);
          }
        } else {
          console.log('✅ User created in database');
        }
      } else {
        console.log('✅ User exists in database');
      }

      // First, ensure the product exists in the database
      let productId: string;
      
      // Check if product already exists
      const { data: existingProduct, error: productCheckError } = await supabase
        .from('products')
        .select('id')
        .eq('name', productData.name)
        .eq('weight', productData.weight)
        .single();

      if (productCheckError && productCheckError.code !== 'PGRST116') {
        console.error('❌ Error checking existing product:', productCheckError);
        throw new Error(`Failed to check existing product: ${productCheckError.message}`);
      }

      if (existingProduct) {
        // Product exists, use its ID
        productId = existingProduct.id;
        console.log('Using existing product ID:', productId);
      } else {
        // Create new product
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            description: productData.description || 'A premium blend of 21 natural grains, millets, and pulses',
            price: productData.price,
            image_url: productData.image_url || '/src/assets/shop/First page Flipkart.png',
            stock: 100,
            weight: productData.weight
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating product:', createError);
          throw new Error(`Failed to create product: ${createError.message}`);
        }

        productId = newProduct.id;
        console.log('✅ Created new product with ID:', productId);
      }

      // Now handle cart item - use UPSERT to handle insert-or-update atomically
      console.log('🛒 Checking for existing cart item...');
      const { data: existingCartItem, error: cartCheckError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (cartCheckError && cartCheckError.code !== 'PGRST116') {
        console.error('❌ Error checking existing cart item:', cartCheckError);
        throw new Error(`Failed to check cart item: ${cartCheckError.message}`);
      }

      if (existingCartItem) {
        // Update quantity - add to existing quantity
        const newQuantity = existingCartItem.quantity + quantity;
        console.log(`🔄 Updating existing cart item: ${existingCartItem.quantity} + ${quantity} = ${newQuantity}`);
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingCartItem.id);

        if (updateError) {
          console.error('❌ Error updating cart item:', updateError);
          throw new Error(`Failed to update cart item: ${updateError.message}`);
        }
        console.log('✅ Updated existing cart item quantity');
      } else {
        // Add new cart item
        console.log('➕ Creating new cart item');
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity
          });

        if (insertError) {
          console.error('❌ Error adding to cart:', insertError);
          // If it's a unique constraint violation, try to update instead
          if (insertError.code === '23505') {
            console.log('🔄 Unique constraint violation, attempting to update existing item...');
            const { data: existingItem, error: retryError } = await supabase
              .from('cart_items')
              .select('id, quantity')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .single();

            if (retryError) {
              throw new Error(`Failed to add item to cart: ${insertError.message}`);
            }

            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + quantity })
              .eq('id', existingItem.id);

            if (updateError) {
              throw new Error(`Failed to update cart item: ${updateError.message}`);
            }
            console.log('✅ Updated existing cart item after unique constraint violation');
          } else {
            throw new Error(`Failed to add item to cart: ${insertError.message}`);
          }
        } else {
          console.log('✅ Added new item to cart');
        }
      }
    } catch (error) {
      console.error('Cart service error:', error);
      throw error;
    }
  },

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    console.log('🛒 Updating cart item quantity:', { cartItemId, quantity });
    
    if (quantity <= 0) {
      console.log('Quantity is 0 or negative, removing item instead');
      await this.removeFromCart(cartItemId);
      return;
    }

    // First, verify the cart item exists and belongs to the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, user_id')
      .eq('id', cartItemId)
      .eq('user_id', user.id)
      .single();

    if (checkError) {
      console.error('❌ Error checking cart item:', checkError);
      throw new Error(`Cart item not found or access denied: ${checkError.message}`);
    }

    if (!existingItem) {
      throw new Error('Cart item not found or access denied');
    }

    // Update the quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', user.id) // Double-check user ownership
      .select();

    if (error) {
      console.error('❌ Error updating cart item quantity:', error);
      throw new Error(`Failed to update cart item quantity: ${error.message}`);
    }

    console.log('✅ Successfully updated cart item quantity:', data);
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    console.log('🗑️ Removing cart item:', cartItemId);
    
    // First, verify the cart item exists and belongs to the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id); // Ensure user can only delete their own items

    if (error) {
      console.error('❌ Error removing cart item:', error);
      throw new Error(`Failed to remove cart item: ${error.message}`);
    }
    
    console.log('✅ Successfully removed cart item');
  },

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }
};

// Orders Service
export const ordersService = {
  async createOrder(userId: string, cartItems: CartItem[], paymentData?: {
    payment_id?: string;
    payment_order_id?: string;
    payment_signature?: string;
    payment_status?: string;
    payment_method?: string;
    currency?: string;
  }): Promise<Order> {
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Create order with payment information
    const orderData = {
      user_id: userId,
      total,
      status: (paymentData?.payment_status === 'paid' ? 'processing' : 'pending') as Order['status'],
      payment_id: paymentData?.payment_id,
      payment_order_id: paymentData?.payment_order_id,
      payment_signature: paymentData?.payment_signature,
      payment_status: (paymentData?.payment_status || 'pending') as Order['payment_status'],
      payment_method: paymentData?.payment_method || 'razorpay',
      currency: paymentData?.currency || 'INR'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      throw new Error('Failed to create order items');
    }

    return order;
  },

  async updateOrderPayment(orderId: string, paymentData: {
    payment_id: string;
    payment_signature: string;
    payment_status: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_id: paymentData.payment_id,
        payment_signature: paymentData.payment_signature,
        payment_status: paymentData.payment_status,
        status: paymentData.payment_status === 'paid' ? 'processing' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order payment:', error);
      throw new Error('Failed to update order payment');
    }
  },

  async getUserOrders(userId: string): Promise<(Order & { order_items: OrderItem[] })[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }

    return data || [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
};

// User Service
export const userService = {
  async createOrUpdateUser(user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  }): Promise<void> {
    try {
      console.log('Creating/updating user in database:', { id: user.id, email: user.email });
      
      // First check if the users table exists by trying a simple select
      const { error: tableCheckError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        if (tableCheckError.code === 'PGRST116' || tableCheckError.message.includes('relation') || tableCheckError.message.includes('does not exist')) {
          throw new Error('Database tables not found. Please run the SQL schema script in your Supabase dashboard first.');
        }
        throw new Error(`Database table error: ${tableCheckError.message}`);
      }
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.name,
          avatar_url: user.avatar_url
        });

      if (error) {
        console.error('❌ Error creating/updating user:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.message.includes('full_name') && error.message.includes('column')) {
          throw new Error('Database schema mismatch. Please run the SQL schema script in your Supabase dashboard to create the correct table structure.');
        }
        
        throw new Error(`Failed to create/update user: ${error.message}`);
      }
      
      console.log('✅ User successfully created/updated in database');
    } catch (error) {
      console.error('❌ User service error:', error);
      throw error;
    }
  },

  async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  },

  async ensureUserExists(user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  }): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.getUser(user.id);
      
      if (!existingUser) {
        // User doesn't exist, create them
        console.log('User not found in database, creating new user...');
        await this.createOrUpdateUser(user);
      } else {
        // User exists, update their info
        console.log('User exists in database, updating info...');
        await this.createOrUpdateUser(user);
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }
};
