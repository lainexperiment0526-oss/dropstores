-- =============================================
-- ENHANCED E-COMMERCE FEATURES
-- Additional tables for advanced features
-- =============================================

-- Flash Sales / Limited Time Offers
CREATE TABLE IF NOT EXISTS public.flash_sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    product_ids UUID[] DEFAULT '{}',
    collection_ids UUID[] DEFAULT '{}',
    applies_to TEXT DEFAULT 'products', -- 'products', 'collections', 'store'
    is_active BOOLEAN DEFAULT true,
    show_timer BOOLEAN DEFAULT true,
    max_uses_per_customer INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Holiday Promotions
CREATE TABLE IF NOT EXISTS public.holiday_promotions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    holiday_name TEXT NOT NULL, -- 'Black Friday', 'Christmas', 'New Year', 'Valentine', etc.
    banner_text TEXT,
    banner_color TEXT DEFAULT '#FF0000',
    discount_code TEXT,
    featured_products UUID[] DEFAULT '{}',
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buy X Get Y Deals
CREATE TABLE IF NOT EXISTS public.bogo_deals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    buy_quantity INTEGER NOT NULL DEFAULT 1,
    get_quantity INTEGER NOT NULL DEFAULT 1,
    buy_product_ids UUID[] NOT NULL DEFAULT '{}',
    get_product_ids UUID[] NOT NULL DEFAULT '{}',
    get_discount_percentage NUMERIC DEFAULT 100, -- 100% = free, 50% = half off
    minimum_purchase NUMERIC DEFAULT 0,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volume Discounts (Bulk Pricing)
CREATE TABLE IF NOT EXISTS public.volume_discounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
    discount_value NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, product_id, variant_id)
);

-- Product Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.store_customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bundle Products (Product Bundles)
CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    bundle_price NUMERIC NOT NULL,
    compare_at_price NUMERIC,
    product_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Cards
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    initial_value NUMERIC NOT NULL,
    current_balance NUMERIC NOT NULL,
    currency TEXT DEFAULT 'PI',
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    recipient_email TEXT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Card Transactions
CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    transaction_type TEXT NOT NULL, -- 'issued', 'redeemed', 'refunded'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Abandoned Carts
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_email TEXT,
    customer_name TEXT,
    cart_items JSONB NOT NULL DEFAULT '[]',
    cart_total NUMERIC DEFAULT 0,
    recovery_email_sent BOOLEAN DEFAULT false,
    recovered BOOLEAN DEFAULT false,
    recovered_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pre-orders
CREATE TABLE IF NOT EXISTS public.pre_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    release_date TIMESTAMPTZ NOT NULL,
    max_pre_orders INTEGER,
    current_pre_orders INTEGER DEFAULT 0,
    pre_order_price NUMERIC,
    deposit_amount NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping Zones & Rates
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT '{}',
    states TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shipping_zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    min_order_value NUMERIC DEFAULT 0,
    max_order_value NUMERIC,
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Methods Configuration
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL, -- 'pi_payment', 'manual_wallet', 'cash_on_delivery'
    is_enabled BOOLEAN DEFAULT true,
    wallet_address TEXT, -- For manual wallet payments
    qr_code_data TEXT, -- QR code for wallet address
    display_name TEXT,
    instructions TEXT, -- Instructions for manual payment
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_flash_sales_store_id ON public.flash_sales(store_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON public.flash_sales(starts_at, ends_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_holiday_promotions_store_id ON public.holiday_promotions(store_id);
CREATE INDEX IF NOT EXISTS idx_holiday_promotions_dates ON public.holiday_promotions(starts_at, ends_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_bogo_deals_store_id ON public.bogo_deals(store_id);
CREATE INDEX IF NOT EXISTS idx_bogo_deals_dates ON public.bogo_deals(starts_at, ends_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_volume_discounts_product_id ON public.volume_discounts(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_id ON public.wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON public.product_reviews(product_id) WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gift_cards_store_id ON public.gift_cards(store_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_store_id ON public.abandoned_carts(store_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(customer_email) WHERE recovered = false;

CREATE INDEX IF NOT EXISTS idx_payment_methods_store_id ON public.payment_methods(store_id) WHERE is_enabled = true;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Flash Sales
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their flash sales" ON public.flash_sales
USING (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = flash_sales.store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Active flash sales viewable for published stores" ON public.flash_sales FOR SELECT
USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = flash_sales.store_id AND stores.is_published = true
));

-- Holiday Promotions
ALTER TABLE public.holiday_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their holiday promotions" ON public.holiday_promotions
USING (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = holiday_promotions.store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Active holiday promotions viewable" ON public.holiday_promotions FOR SELECT
USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = holiday_promotions.store_id AND stores.is_published = true
));

-- BOGO Deals
ALTER TABLE public.bogo_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their bogo deals" ON public.bogo_deals
USING (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = bogo_deals.store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Active bogo deals viewable" ON public.bogo_deals FOR SELECT
USING (is_active = true);

-- Product Reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Store owners can manage reviews for their products" ON public.product_reviews
USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = product_reviews.product_id AND s.owner_id = auth.uid()
));

-- Payment Methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their payment methods" ON public.payment_methods
USING (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = payment_methods.store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Enabled payment methods viewable for published stores" ON public.payment_methods FOR SELECT
USING (is_enabled = true AND EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = payment_methods.store_id AND stores.is_published = true
));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_flash_sales_updated_at BEFORE UPDATE ON public.flash_sales 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_holiday_promotions_updated_at BEFORE UPDATE ON public.holiday_promotions 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bogo_deals_updated_at BEFORE UPDATE ON public.bogo_deals 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON public.abandoned_carts 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
