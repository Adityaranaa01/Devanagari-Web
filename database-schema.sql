
    -- Drop all existing policies first
    DO $$ 
    DECLARE
        r RECORD;
    BEGIN
        -- Drop all policies on all tables
        FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
        END LOOP;
    END $$;

    -- Drop all existing tables in correct order (respecting foreign keys)
    DROP TABLE IF EXISTS public.admin_actions CASCADE;
    DROP TABLE IF EXISTS public.order_items CASCADE;
    DROP TABLE IF EXISTS public.orders CASCADE;
    DROP TABLE IF EXISTS public.cart_items CASCADE;
    DROP TABLE IF EXISTS public.user_addresses CASCADE;
    DROP TABLE IF EXISTS public.products CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;

    -- Drop existing functions and triggers
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- =====================================================
    -- 2. CREATE TABLES
    -- =====================================================

    -- Users table - extends auth.users with additional profile data
    CREATE TABLE public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        full_name TEXT,
        avatar_url TEXT,
        phone TEXT,
        address JSONB, -- Store address as JSON for flexibility
        is_admin BOOLEAN DEFAULT FALSE,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Products table - store product information
    CREATE TABLE public.products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2) NOT NULL CHECK (price > 0),
        image_url TEXT,
        images JSONB, -- Store multiple images as JSON array
        stock INTEGER DEFAULT 0 CHECK (stock >= 0),
        weight INTEGER NOT NULL CHECK (weight > 0), -- Weight in grams
        category TEXT DEFAULT 'health_mix',
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        meta_data JSONB, -- Store additional product metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- User addresses table - store user shipping addresses
    CREATE TABLE public.user_addresses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL, -- Full name for the address
        phone TEXT NOT NULL, -- Phone number for the address
        address_line_1 TEXT NOT NULL, -- Street address, P.O. box, etc.
        address_line_2 TEXT, -- Apartment, suite, unit, building, floor, etc.
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'India',
        is_default BOOLEAN DEFAULT FALSE, -- Only one address per user can be default
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Cart items table - user shopping cart
    CREATE TABLE public.cart_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
    );

    -- Orders table - order information
    CREATE TABLE public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        order_number TEXT UNIQUE, -- Human-readable order number
        total DECIMAL(10,2) NOT NULL CHECK (total > 0),
        subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
        tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
        shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
        discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
        
        -- Payment information
        payment_id TEXT,
        payment_order_id TEXT,
        payment_signature TEXT,
        payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_method TEXT DEFAULT 'razorpay',
        currency TEXT DEFAULT 'INR',
        
        -- Shipping information
        shipping_address JSONB,
        billing_address JSONB,
        
        -- Additional order metadata
        notes TEXT,
        admin_notes TEXT,
        
        -- Refund information
        refund_id TEXT,
        refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0),
        refund_reason TEXT,
        refund_status TEXT CHECK (refund_status IN ('pending', 'processed', 'failed')),
        refunded_at TIMESTAMP WITH TIME ZONE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Order items table - individual items in an order
    CREATE TABLE public.order_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
        product_name TEXT NOT NULL, -- Store product name at time of order
        product_price DECIMAL(10,2) NOT NULL CHECK (product_price > 0), -- Store price at time of order
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Admin actions table - audit log for admin activities
    CREATE TABLE public.admin_actions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
        resource_type TEXT NOT NULL, -- 'user', 'product', 'order', etc.
        resource_id TEXT,
        old_values JSONB,
        new_values JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =====================================================
    -- 3. CREATE INDEXES FOR PERFORMANCE
    -- =====================================================

    -- Users table indexes
    CREATE INDEX idx_users_email ON public.users(email);
    CREATE INDEX idx_users_role ON public.users(role);
    CREATE INDEX idx_users_is_admin ON public.users(is_admin);
    CREATE INDEX idx_users_is_active ON public.users(is_active);

    -- Products table indexes
    CREATE INDEX idx_products_name ON public.products(name);
    CREATE INDEX idx_products_category ON public.products(category);
    CREATE INDEX idx_products_is_active ON public.products(is_active);
    CREATE INDEX idx_products_is_featured ON public.products(is_featured);
    CREATE INDEX idx_products_weight ON public.products(weight);
    CREATE INDEX idx_products_price ON public.products(price);

    -- User addresses indexes
    CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
    CREATE INDEX idx_user_addresses_is_default ON public.user_addresses(is_default);

    -- Cart items indexes
    CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
    CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

    -- Orders table indexes
    CREATE INDEX idx_orders_user_id ON public.orders(user_id);
    CREATE INDEX idx_orders_status ON public.orders(status);
    CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
    CREATE INDEX idx_orders_payment_id ON public.orders(payment_id);
    CREATE INDEX idx_orders_payment_order_id ON public.orders(payment_order_id);
    CREATE INDEX idx_orders_created_at ON public.orders(created_at);
    CREATE INDEX idx_orders_order_number ON public.orders(order_number);
    CREATE INDEX idx_orders_refund_id ON public.orders(refund_id);
    CREATE INDEX idx_orders_refund_status ON public.orders(refund_status);
    CREATE INDEX idx_orders_refunded_at ON public.orders(refunded_at);

    -- Order items indexes
    CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
    CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

    -- Admin actions indexes
    CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
    CREATE INDEX idx_admin_actions_resource_type ON public.admin_actions(resource_type);
    CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at);

    -- =====================================================
    -- 4. ENABLE ROW LEVEL SECURITY
    -- =====================================================

    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

    -- =====================================================
    -- 5. CREATE RLS POLICIES
    -- =====================================================

    -- Helper function to check if user is admin
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() 
            AND au.email = 'adityapiyush71@gmail.com'
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Helper function to check if user is admin by role
    CREATE OR REPLACE FUNCTION public.is_admin_by_role()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() 
            AND u.is_admin = true
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Users table policies
    CREATE POLICY "Users can view their own profile or admins can view all" ON public.users
        FOR SELECT USING (
            auth.uid() = id OR public.is_admin_by_role()
        );

    CREATE POLICY "Users can update their own profile or admins can update all" ON public.users
        FOR UPDATE USING (
            auth.uid() = id OR public.is_admin_by_role()
        );

    CREATE POLICY "Users can insert their own profile or admins can insert users" ON public.users
        FOR INSERT WITH CHECK (
            auth.uid() = id OR public.is_admin_by_role()
        );

    -- Products table policies
    CREATE POLICY "Products are viewable by everyone" ON public.products
        FOR SELECT USING (is_active = true);

    CREATE POLICY "Admins can manage all products" ON public.products
        FOR ALL USING (public.is_admin_by_role());

    -- User addresses policies
    CREATE POLICY "Users can manage their own addresses" ON public.user_addresses
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all addresses" ON public.user_addresses
        FOR SELECT USING (public.is_admin_by_role());

    -- Cart items policies
    CREATE POLICY "Users can manage their own cart items" ON public.cart_items
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all cart items" ON public.cart_items
        FOR SELECT USING (public.is_admin_by_role());

    -- Orders policies
    CREATE POLICY "Users can view their own orders" ON public.orders
        FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (public.is_admin_by_role());

    -- Order items policies
    CREATE POLICY "Users can view their own order items" ON public.order_items
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_items.order_id
                AND o.user_id = auth.uid()
            )
        );

    CREATE POLICY "Users can create order items for their orders" ON public.order_items
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_items.order_id
                AND o.user_id = auth.uid()
            )
        );

    CREATE POLICY "Admins can manage all order items" ON public.order_items
        FOR ALL USING (public.is_admin_by_role());

    -- Admin actions policies
    CREATE POLICY "Admins can manage admin actions" ON public.admin_actions
        FOR ALL USING (public.is_admin_by_role());

    -- =====================================================
    -- 6. CREATE FUNCTIONS AND TRIGGERS
    -- =====================================================

    -- Function to automatically create user profile on signup
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.users (id, email, name, full_name, avatar_url, is_admin, role, is_active)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
            NEW.raw_user_meta_data->>'avatar_url',
            CASE WHEN NEW.email = 'adityapiyush71@gmail.com' THEN true ELSE false END,
            CASE WHEN NEW.email = 'adityapiyush71@gmail.com' THEN 'super_admin' ELSE 'user' END,
            true
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger to automatically create user profile
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- Function to generate order numbers
    CREATE OR REPLACE FUNCTION public.generate_order_number()
    RETURNS TEXT AS $$
    DECLARE
        order_num TEXT;
        counter INTEGER;
    BEGIN
        -- Get the next counter value
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
        INTO counter
        FROM public.orders
        WHERE order_number ~ '^ORD-\d+$';
        
        -- Format as ORD-000001, ORD-000002, etc.
        order_num := 'ORD-' || LPAD(counter::TEXT, 6, '0');
        
        RETURN order_num;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to update order totals when order items change
    CREATE OR REPLACE FUNCTION public.update_order_totals()
    RETURNS TRIGGER AS $$
    DECLARE
        order_total DECIMAL(10,2);
        order_subtotal DECIMAL(10,2);
    BEGIN
        -- Calculate totals for the affected order
        SELECT 
            COALESCE(SUM(total_price), 0),
            COALESCE(SUM(total_price), 0)
        INTO order_subtotal, order_total
        FROM public.order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
        
        -- Update the order
        UPDATE public.orders
        SET 
            subtotal = order_subtotal,
            total = order_total,
            updated_at = NOW()
        WHERE id = COALESCE(NEW.order_id, OLD.order_id);
        
        RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to update order totals when order items change
    CREATE TRIGGER update_order_totals_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.order_items
        FOR EACH ROW EXECUTE FUNCTION public.update_order_totals();

    -- Function to set order number on insert
    CREATE OR REPLACE FUNCTION public.set_order_number()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.order_number IS NULL THEN
            NEW.order_number := public.generate_order_number();
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to set order number
    CREATE TRIGGER set_order_number_trigger
        BEFORE INSERT ON public.orders
        FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

    -- Function to ensure only one default address per user
    CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
    RETURNS TRIGGER AS $$
    BEGIN
        -- If this address is being set as default, unset all other default addresses for this user
        IF NEW.is_default = true THEN
            UPDATE public.user_addresses
            SET is_default = false
            WHERE user_id = NEW.user_id
            AND id != NEW.id;
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to ensure only one default address per user
    CREATE TRIGGER ensure_single_default_address_trigger
        BEFORE INSERT OR UPDATE ON public.user_addresses
        FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();

    -- =====================================================
    -- 7. INSERT SAMPLE DATA
    -- =====================================================

    -- Insert sample products
    INSERT INTO public.products (name, description, short_description, price, image_url, stock, weight, category, is_featured) VALUES
    (
        'Devanagari Health Mix 200g',
        'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition. This 200g pack is perfect for trying our signature health mix.',
        'Premium 21-grain health mix - 200g pack',
        19.99,
        '/src/assets/shop/First page Flipkart.png',
        100,
        200,
        'health_mix',
        true
    ),
    (
        'Devanagari Health Mix 450g',
        'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition. This 450g pack offers great value for regular consumption.',
        'Premium 21-grain health mix - 450g pack',
        29.99,
        '/src/assets/shop/First page Flipkart.png',
        100,
        450,
        'health_mix',
        true
    ),
    (
        'Devanagari Health Mix 900g',
        'A premium blend of 21 natural grains, millets, and pulses, carefully crafted to provide complete nutrition. This 900g family pack is perfect for households.',
        'Premium 21-grain health mix - 900g family pack',
        49.99,
        '/src/assets/shop/First page Flipkart.png',
        100,
        900,
        'health_mix',
        true
    );

    -- Sync existing auth.users to public.users
    INSERT INTO public.users (id, email, name, full_name, avatar_url, is_admin, role, is_active)
    SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'name', au.email),
        COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
        au.raw_user_meta_data->>'avatar_url',
        CASE WHEN au.email = 'adityapiyush71@gmail.com' THEN true ELSE false END,
        CASE WHEN au.email = 'adityapiyush71@gmail.com' THEN 'super_admin' ELSE 'user' END,
        true
    FROM auth.users au
    WHERE au.id NOT IN (SELECT id FROM public.users)
    ON CONFLICT (id) DO UPDATE SET 
        is_admin = CASE WHEN EXCLUDED.email = 'adityapiyush71@gmail.com' THEN true ELSE EXCLUDED.is_admin END,
        role = CASE WHEN EXCLUDED.email = 'adityapiyush71@gmail.com' THEN 'super_admin' ELSE EXCLUDED.role END,
        is_active = true,
        updated_at = NOW();

    -- =====================================================
    -- 8. VERIFICATION QUERIES
    -- =====================================================

    -- Verify setup
    SELECT 'Database setup complete!' as status;

    -- Check table counts
    SELECT 'Tables created:' as info, COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'products', 'user_addresses', 'cart_items', 'orders', 'order_items', 'admin_actions');

    -- Check RLS status
    SELECT 'RLS enabled tables:' as info, COUNT(*) as count 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true 
    AND tablename IN ('users', 'products', 'user_addresses', 'cart_items', 'orders', 'order_items', 'admin_actions');

    -- Check policies
    SELECT 'Policies created:' as info, COUNT(*) as count 
    FROM pg_policies 
    WHERE schemaname = 'public';

    -- Check sample data
    SELECT 'Users count:' as info, COUNT(*) as count FROM public.users;
    SELECT 'Products count:' as info, COUNT(*) as count FROM public.products;
    SELECT 'Admin users:' as info, COUNT(*) as count FROM public.users WHERE is_admin = true;

