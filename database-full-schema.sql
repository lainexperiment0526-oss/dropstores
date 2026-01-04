-- =============================================
-- DropStore Complete Database Schema
-- For Supabase PostgreSQL Database
-- =============================================
-- Project: kvqfnmdkxaclsnyuzkyp
-- Date: December 21, 2025
-- =============================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function: Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- CORE TABLES
-- =============================================

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pi Network Users
CREATE TABLE IF NOT EXISTS public.pi_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pi_uid TEXT NOT NULL UNIQUE,
    pi_username TEXT,
    wallet_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    store_id UUID,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'grow', 'advance', 'plus')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'superseded')),
    pi_payment_id TEXT,
    pi_transaction_id TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STORE TABLES
-- =============================================

-- Stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT DEFAULT '#0EA5E9',
    secondary_color TEXT DEFAULT '#38BDF8',
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_published BOOLEAN DEFAULT false,
    template_id TEXT DEFAULT 'modern',
    payout_wallet TEXT,
    store_type TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(10,2),
    images TEXT[] DEFAULT '{}',
    category TEXT,
    inventory_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    product_type TEXT DEFAULT 'physical',
    digital_file_url TEXT,
    download_limit INTEGER DEFAULT 3,
    download_count INTEGER DEFAULT 0,
    has_variants BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    title TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    compare_at_price NUMERIC,
    inventory_quantity INTEGER DEFAULT 0,
    inventory_policy TEXT DEFAULT 'deny',
    weight NUMERIC,
    weight_unit TEXT DEFAULT 'kg',
    requires_shipping BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    option1 TEXT,
    option2 TEXT,
    option3 TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Options
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    values TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    handle TEXT,
    sort_order TEXT DEFAULT 'manual',
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collection Products
CREATE TABLE IF NOT EXISTS public.collection_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL,
    product_id UUID NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(collection_id, product_id)
);

-- =============================================
-- ORDERS & CUSTOMERS
-- =============================================

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    pi_payment_id TEXT,
    pi_txid TEXT,
    payout_status TEXT DEFAULT 'pending',
    payout_txid TEXT,
    download_count INTEGER DEFAULT 0,
    download_expires_at TIMESTAMPTZ,
    delivery_email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID,
    variant_id UUID,
    title TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    total_discount NUMERIC DEFAULT 0,
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    requires_shipping BOOLEAN DEFAULT true,
    taxable BOOLEAN DEFAULT true,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Store Customers
CREATE TABLE IF NOT EXISTS public.store_customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    accepts_marketing BOOLEAN DEFAULT false,
    orders_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    note TEXT,
    verified_email BOOLEAN DEFAULT false,
    default_address JSONB,
    addresses JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(store_id, email)
);

-- =============================================
-- DISCOUNTS & PRICING
-- =============================================

-- Discount Codes
CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    code TEXT NOT NULL,
    title TEXT,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC NOT NULL DEFAULT 0,
    minimum_purchase NUMERIC DEFAULT 0,
    maximum_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    once_per_customer BOOLEAN DEFAULT false,
    applies_to TEXT DEFAULT 'all',
    product_ids UUID[] DEFAULT '{}',
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(store_id, code)
);

-- Price Rules
CREATE TABLE IF NOT EXISTS public.price_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    title TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'line_item',
    target_selection TEXT DEFAULT 'all',
    allocation_method TEXT DEFAULT 'across',
    value_type TEXT NOT NULL DEFAULT 'percentage',
    value NUMERIC NOT NULL DEFAULT 0,
    once_per_customer BOOLEAN DEFAULT false,
    customer_selection TEXT DEFAULT 'all',
    prerequisite_subtotal_min NUMERIC,
    prerequisite_quantity_min INTEGER,
    prerequisite_product_ids UUID[] DEFAULT '{}',
    entitled_product_ids UUID[] DEFAULT '{}',
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SHIPPING & INVENTORY
-- =============================================

-- Shipping Zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping Rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id UUID NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC,
    max_order_amount NUMERIC,
    min_weight NUMERIC,
    max_weight NUMERIC,
    weight_unit TEXT DEFAULT 'kg',
    delivery_days_min INTEGER,
    delivery_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Locations
CREATE TABLE IF NOT EXISTS public.inventory_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    zip TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ANALYTICS & PAYOUTS
-- =============================================

-- Store Analytics
CREATE TABLE IF NOT EXISTS public.store_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    add_to_carts INTEGER DEFAULT 0,
    checkouts_initiated INTEGER DEFAULT 0,
    checkouts_completed INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    total_sales NUMERIC DEFAULT 0,
    average_order_value NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    top_products JSONB DEFAULT '[]',
    traffic_sources JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(store_id, date)
);

-- Merchant Sales
CREATE TABLE IF NOT EXISTS public.merchant_sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    order_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    platform_fee NUMERIC NOT NULL DEFAULT 0,
    net_amount NUMERIC NOT NULL DEFAULT 0,
    pi_txid TEXT,
    payout_id UUID,
    payout_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant Payouts
CREATE TABLE IF NOT EXISTS public.merchant_payouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    wallet_address TEXT NOT NULL,
    pi_txid TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- File Uploads (for cloud storage tracking)
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    bucket_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- REPORTS & MODERATION
-- =============================================

-- Store Reports
CREATE TABLE IF NOT EXISTS public.store_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    product_id UUID,
    report_type TEXT NOT NULL CHECK (report_type IN ('illegal', 'fraud', 'inappropriate', 'counterfeit', 'copyright', 'misleading', 'other')),
    description TEXT NOT NULL,
    reporter_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_store_reports_store_id ON public.store_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reports_product_id ON public.store_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_store_reports_status ON public.store_reports(status);
CREATE INDEX IF NOT EXISTS idx_store_reports_created_at ON public.store_reports(created_at DESC);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- Profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Pi Users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pi_users_user_id_fkey') THEN
        ALTER TABLE public.pi_users ADD CONSTRAINT pi_users_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_fkey') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_store_id_fkey') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Stores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_owner_id_fkey') THEN
        ALTER TABLE public.stores ADD CONSTRAINT stores_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_store_id_fkey') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Product Variants
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_product_id_fkey') THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Product Options
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_options_product_id_fkey') THEN
        ALTER TABLE public.product_options ADD CONSTRAINT product_options_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Collections
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collections_store_id_fkey') THEN
        ALTER TABLE public.collections ADD CONSTRAINT collections_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Collection Products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collection_products_collection_id_fkey') THEN
        ALTER TABLE public.collection_products ADD CONSTRAINT collection_products_collection_id_fkey 
        FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collection_products_product_id_fkey') THEN
        ALTER TABLE public.collection_products ADD CONSTRAINT collection_products_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_store_id_fkey') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Order Items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_variant_id_fkey') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT order_items_variant_id_fkey 
        FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Store Customers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_customers_store_id_fkey') THEN
        ALTER TABLE public.store_customers ADD CONSTRAINT store_customers_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Discount Codes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discount_codes_store_id_fkey') THEN
        ALTER TABLE public.discount_codes ADD CONSTRAINT discount_codes_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Price Rules
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'price_rules_store_id_fkey') THEN
        ALTER TABLE public.price_rules ADD CONSTRAINT price_rules_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Shipping Zones
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipping_zones_store_id_fkey') THEN
        ALTER TABLE public.shipping_zones ADD CONSTRAINT shipping_zones_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Shipping Rates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipping_rates_zone_id_fkey') THEN
        ALTER TABLE public.shipping_rates ADD CONSTRAINT shipping_rates_zone_id_fkey 
        FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Inventory Locations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_locations_store_id_fkey') THEN
        ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Store Analytics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_analytics_store_id_fkey') THEN
        ALTER TABLE public.store_analytics ADD CONSTRAINT store_analytics_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Merchant Sales
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'merchant_sales_store_id_fkey') THEN
        ALTER TABLE public.merchant_sales ADD CONSTRAINT merchant_sales_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'merchant_sales_order_id_fkey') THEN
        ALTER TABLE public.merchant_sales ADD CONSTRAINT merchant_sales_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'merchant_sales_payout_id_fkey') THEN
        ALTER TABLE public.merchant_sales ADD CONSTRAINT merchant_sales_payout_id_fkey 
        FOREIGN KEY (payout_id) REFERENCES public.merchant_payouts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Merchant Payouts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'merchant_payouts_store_id_fkey') THEN
        ALTER TABLE public.merchant_payouts ADD CONSTRAINT merchant_payouts_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- File Uploads
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'file_uploads_user_id_fkey') THEN
        ALTER TABLE public.file_uploads ADD CONSTRAINT file_uploads_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Store Reports
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_reports_store_id_fkey') THEN
        ALTER TABLE public.store_reports ADD CONSTRAINT store_reports_store_id_fkey 
        FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_reports_product_id_fkey') THEN
        ALTER TABLE public.store_reports ADD CONSTRAINT store_reports_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_reports_reviewed_by_fkey') THEN
        ALTER TABLE public.store_reports ADD CONSTRAINT store_reports_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pi_users_user_id ON public.pi_users(user_id);
CREATE INDEX IF NOT EXISTS idx_pi_users_pi_uid ON public.pi_users(pi_uid);
CREATE INDEX IF NOT EXISTS idx_merchant_payouts_store_id ON public.merchant_payouts(store_id);
CREATE INDEX IF NOT EXISTS idx_merchant_payouts_status ON public.merchant_payouts(status);
CREATE INDEX IF NOT EXISTS idx_merchant_sales_store_id ON public.merchant_sales(store_id);
CREATE INDEX IF NOT EXISTS idx_merchant_sales_payout_status ON public.merchant_sales(payout_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_bucket_id ON public.file_uploads(bucket_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pi_users_updated_at') THEN
        CREATE TRIGGER update_pi_users_updated_at BEFORE UPDATE ON public.pi_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stores_updated_at') THEN
        CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_variants_updated_at') THEN
        CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_collections_updated_at') THEN
        CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_store_customers_updated_at') THEN
        CREATE TRIGGER update_store_customers_updated_at BEFORE UPDATE ON public.store_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_discount_codes_updated_at') THEN
        CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_price_rules_updated_at') THEN
        CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON public.price_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shipping_zones_updated_at') THEN
        CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_locations_updated_at') THEN
        CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_merchant_payouts_updated_at') THEN
        CREATE TRIGGER update_merchant_payouts_updated_at BEFORE UPDATE ON public.merchant_payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_store_reports_updated_at') THEN
        CREATE TRIGGER update_store_reports_updated_at BEFORE UPDATE ON public.store_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Auto-create profile on signup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pi_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pi Users
DROP POLICY IF EXISTS "Users can view their own pi user data" ON public.pi_users;
CREATE POLICY "Users can view their own pi user data" ON public.pi_users FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own pi user data" ON public.pi_users;
CREATE POLICY "Users can create their own pi user data" ON public.pi_users FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pi user data" ON public.pi_users;
CREATE POLICY "Users can update their own pi user data" ON public.pi_users FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Stores
DROP POLICY IF EXISTS "Published stores are viewable by everyone" ON public.stores;
CREATE POLICY "Published stores are viewable by everyone" ON public.stores FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Store owners can manage their stores" ON public.stores;
CREATE POLICY "Store owners can manage their stores" ON public.stores USING (auth.uid() = owner_id);

-- Products
DROP POLICY IF EXISTS "Active products in published stores are viewable" ON public.products;
CREATE POLICY "Active products in published stores are viewable" ON public.products FOR SELECT USING (
    is_active = true AND EXISTS (
        SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.is_published = true
    )
);

DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
CREATE POLICY "Store owners can manage their products" ON public.products USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);

-- Product Variants
DROP POLICY IF EXISTS "Active variants in published stores are viewable" ON public.product_variants;
CREATE POLICY "Active variants in published stores are viewable" ON public.product_variants FOR SELECT USING (
    is_active = true AND EXISTS (
        SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id 
        WHERE p.id = product_variants.product_id AND p.is_active = true AND s.is_published = true
    )
);

DROP POLICY IF EXISTS "Store owners can manage their product variants" ON public.product_variants;
CREATE POLICY "Store owners can manage their product variants" ON public.product_variants USING (
    EXISTS (
        SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id 
        WHERE p.id = product_variants.product_id AND s.owner_id = auth.uid()
    )
);

-- Product Options
DROP POLICY IF EXISTS "Options viewable for published products" ON public.product_options;
CREATE POLICY "Options viewable for published products" ON public.product_options FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id 
        WHERE p.id = product_options.product_id AND p.is_active = true AND s.is_published = true
    )
);

DROP POLICY IF EXISTS "Store owners can manage product options" ON public.product_options;
CREATE POLICY "Store owners can manage product options" ON public.product_options USING (
    EXISTS (
        SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id 
        WHERE p.id = product_options.product_id AND s.owner_id = auth.uid()
    )
);

-- Collections
DROP POLICY IF EXISTS "Published collections are viewable" ON public.collections;
CREATE POLICY "Published collections are viewable" ON public.collections FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Store owners can manage collections" ON public.collections;
CREATE POLICY "Store owners can manage collections" ON public.collections USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = collections.store_id AND stores.owner_id = auth.uid())
);

-- Collection Products
DROP POLICY IF EXISTS "Collection products are viewable for published collections" ON public.collection_products;
CREATE POLICY "Collection products are viewable for published collections" ON public.collection_products FOR SELECT USING (
    EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_products.collection_id AND collections.is_published = true)
);

DROP POLICY IF EXISTS "Store owners can manage collection products" ON public.collection_products;
CREATE POLICY "Store owners can manage collection products" ON public.collection_products USING (
    EXISTS (
        SELECT 1 FROM collections c JOIN stores s ON s.id = c.store_id 
        WHERE c.id = collection_products.collection_id AND s.owner_id = auth.uid()
    )
);

-- Orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Store owners can view their orders" ON public.orders;
CREATE POLICY "Store owners can view their orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Store owners can update their orders" ON public.orders;
CREATE POLICY "Store owners can update their orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);

-- Order Items
DROP POLICY IF EXISTS "Order items can be created with orders" ON public.order_items;
CREATE POLICY "Order items can be created with orders" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Store owners can view order items" ON public.order_items;
CREATE POLICY "Store owners can view order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id 
        WHERE o.id = order_items.order_id AND s.owner_id = auth.uid()
    )
);

-- Store Customers
DROP POLICY IF EXISTS "Store owners can manage their customers" ON public.store_customers;
CREATE POLICY "Store owners can manage their customers" ON public.store_customers USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_customers.store_id AND stores.owner_id = auth.uid())
);

-- Discount Codes
DROP POLICY IF EXISTS "Active discount codes are viewable" ON public.discount_codes;
CREATE POLICY "Active discount codes are viewable" ON public.discount_codes FOR SELECT USING (
    is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())
);

DROP POLICY IF EXISTS "Store owners can manage their discount codes" ON public.discount_codes;
CREATE POLICY "Store owners can manage their discount codes" ON public.discount_codes USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = discount_codes.store_id AND stores.owner_id = auth.uid())
);

-- Price Rules
DROP POLICY IF EXISTS "Store owners can manage their price rules" ON public.price_rules;
CREATE POLICY "Store owners can manage their price rules" ON public.price_rules USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = price_rules.store_id AND stores.owner_id = auth.uid())
);

-- Shipping Zones
DROP POLICY IF EXISTS "Store owners can manage shipping zones" ON public.shipping_zones;
CREATE POLICY "Store owners can manage shipping zones" ON public.shipping_zones USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = shipping_zones.store_id AND stores.owner_id = auth.uid())
);

-- Shipping Rates
DROP POLICY IF EXISTS "Shipping rates viewable for published stores" ON public.shipping_rates;
CREATE POLICY "Shipping rates viewable for published stores" ON public.shipping_rates FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shipping_zones sz JOIN stores s ON s.id = sz.store_id 
        WHERE sz.id = shipping_rates.zone_id AND s.is_published = true
    )
);

DROP POLICY IF EXISTS "Store owners can manage shipping rates" ON public.shipping_rates;
CREATE POLICY "Store owners can manage shipping rates" ON public.shipping_rates USING (
    EXISTS (
        SELECT 1 FROM shipping_zones sz JOIN stores s ON s.id = sz.store_id 
        WHERE sz.id = shipping_rates.zone_id AND s.owner_id = auth.uid()
    )
);

-- Inventory Locations
DROP POLICY IF EXISTS "Store owners can manage inventory locations" ON public.inventory_locations;
CREATE POLICY "Store owners can manage inventory locations" ON public.inventory_locations USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = inventory_locations.store_id AND stores.owner_id = auth.uid())
);

-- Store Analytics
DROP POLICY IF EXISTS "Store owners can view their analytics" ON public.store_analytics;
CREATE POLICY "Store owners can view their analytics" ON public.store_analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_analytics.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Store owners can insert analytics" ON public.store_analytics;
CREATE POLICY "Store owners can insert analytics" ON public.store_analytics FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_analytics.store_id AND stores.owner_id = auth.uid())
);

-- Merchant Sales
DROP POLICY IF EXISTS "Store owners can view their sales" ON public.merchant_sales;
CREATE POLICY "Store owners can view their sales" ON public.merchant_sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = merchant_sales.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Service role can insert sales" ON public.merchant_sales;
CREATE POLICY "Service role can insert sales" ON public.merchant_sales FOR INSERT WITH CHECK (true);

-- Merchant Payouts
DROP POLICY IF EXISTS "Store owners can view their payout requests" ON public.merchant_payouts;
CREATE POLICY "Store owners can view their payout requests" ON public.merchant_payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = merchant_payouts.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Store owners can create payout requests" ON public.merchant_payouts;
CREATE POLICY "Store owners can create payout requests" ON public.merchant_payouts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = merchant_payouts.store_id AND stores.owner_id = auth.uid())
);

-- File Uploads
DROP POLICY IF EXISTS "Users can view their own files" ON public.file_uploads;
CREATE POLICY "Users can view their own files" ON public.file_uploads FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upload files" ON public.file_uploads;
CREATE POLICY "Users can upload files" ON public.file_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own files" ON public.file_uploads;
CREATE POLICY "Users can delete their own files" ON public.file_uploads FOR DELETE USING (auth.uid() = user_id);

-- Store Reports
DROP POLICY IF EXISTS "Anyone can submit reports" ON public.store_reports;
CREATE POLICY "Anyone can submit reports" ON public.store_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Store owners can view reports about their store" ON public.store_reports;
CREATE POLICY "Store owners can view reports about their store" ON public.store_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_reports.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can view all reports" ON public.store_reports;
CREATE POLICY "Authenticated users can view all reports" ON public.store_reports FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update reports" ON public.store_reports;
CREATE POLICY "Authenticated users can update reports" ON public.store_reports FOR UPDATE USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKETS (Create in Supabase Dashboard)
-- =============================================

-- Run these commands in Supabase SQL Editor after creating buckets in Storage:
-- 
-- Bucket: store-assets (public)
-- - Product images
-- - Store logos
-- - Banners
--
-- CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
-- CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
-- CREATE POLICY "Own File Delete" ON storage.objects FOR DELETE USING (bucket_id = 'store-assets' AND owner = auth.uid());

-- =============================================
-- COMPLETE!
-- =============================================
-- Run this entire SQL file in your Supabase SQL Editor
-- Database: kvqfnmdkxaclsnyuzkyp
-- =============================================
