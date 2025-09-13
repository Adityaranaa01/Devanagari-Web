-- Fix missing INSERT policy for products table
-- Run this in your Supabase SQL Editor

CREATE POLICY "Authenticated users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
