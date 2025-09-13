import { supabase } from '../lib/supabaseClient';

export const debugDatabase = async () => {
  console.log('🔍 Debugging database setup...');
  
  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Auth user:', user ? { id: user.id, email: user.email } : 'Not authenticated');
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }

    // Test 2: Check if user exists in users table
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('❌ User table error:', userError);
      if (userError.code === 'PGRST116') {
        console.log('👤 User not found in users table - this is the problem!');
        
        // Try to create the user
        console.log('🔧 Attempting to create user...');
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url
          });

        if (createError) {
          console.error('❌ Failed to create user:', createError);
        } else {
          console.log('✅ User created successfully!');
        }
      }
    } else {
      console.log('✅ User exists in database:', dbUser);
    }

    // Test 3: Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count');

    if (productsError) {
      console.error('❌ Products table error:', productsError);
    } else {
      console.log('✅ Products table accessible');
    }

    // Test 4: Check cart_items table
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('count');

    if (cartError) {
      console.error('❌ Cart items table error:', cartError);
    } else {
      console.log('✅ Cart items table accessible');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Make it available globally for debugging
(window as any).debugDatabase = debugDatabase;
