-- Fix missing tables issue
-- Run this in your Supabase SQL Editor

-- First, check if the tables exist and create them
DO $$
BEGIN
    -- Create merchants table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'merchants') THEN
        CREATE TABLE public.merchants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            business_name TEXT NOT NULL,
            pi_username TEXT UNIQUE,
            wallet_address TEXT,
            business_description TEXT,
            business_email TEXT,
            business_phone TEXT,
            business_website TEXT,
            business_address TEXT,
            business_city TEXT,
            business_state TEXT,
            business_country TEXT,
            business_postal_code TEXT,
            verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
            verified_at TIMESTAMPTZ,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for merchants
        CREATE INDEX idx_merchants_user_id ON public.merchants(user_id);
        CREATE INDEX idx_merchants_pi_username ON public.merchants(pi_username);
        CREATE INDEX idx_merchants_verification_status ON public.merchants(verification_status);
        CREATE INDEX idx_merchants_is_active ON public.merchants(is_active);

        -- Add updated_at trigger for merchants
        CREATE TRIGGER merchants_updated_at
            BEFORE UPDATE ON public.merchants
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        -- Enable RLS for merchants
        ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for merchants
        CREATE POLICY "Users can view their own merchant profile" ON public.merchants
            FOR SELECT USING (user_id = auth.uid());

        CREATE POLICY "Users can create their own merchant profile" ON public.merchants
            FOR INSERT WITH CHECK (user_id = auth.uid());

        CREATE POLICY "Users can update their own merchant profile" ON public.merchants
            FOR UPDATE USING (user_id = auth.uid());

        CREATE POLICY "Users can delete their own merchant profile" ON public.merchants
            FOR DELETE USING (user_id = auth.uid());

        -- Admin policies for merchants
        CREATE POLICY "Admin can view all merchants" ON public.merchants
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND email IN ('admin@dropstore.com', 'support@dropstore.com')
                )
            );

        RAISE NOTICE 'Merchants table created successfully!';
    ELSE
        RAISE NOTICE 'Merchants table already exists!';
    END IF;

    -- Create payment_links table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_links') THEN
        CREATE TABLE public.payment_links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            amount DECIMAL(10, 2) NOT NULL,
            currency TEXT DEFAULT 'PI',
            merchant_id UUID NOT NULL,
            checkout_image TEXT,
            redirect_after_checkout TEXT,
            cancel_redirect_url TEXT,
            expire_access BOOLEAN DEFAULT false,
            add_waitlist BOOLEAN DEFAULT false,
            ask_questions BOOLEAN DEFAULT false,
            stock INTEGER,
            category TEXT,
            features JSONB,
            views INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for payment_links
        CREATE INDEX idx_payment_links_slug ON public.payment_links(slug);
        CREATE INDEX idx_payment_links_merchant_id ON public.payment_links(merchant_id);
        CREATE INDEX idx_payment_links_created_at ON public.payment_links(created_at);

        -- Add updated_at trigger for payment_links
        CREATE TRIGGER payment_links_updated_at
            BEFORE UPDATE ON public.payment_links
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        -- Enable RLS for payment_links
        ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for payment_links
        CREATE POLICY "Users can view all payment links" ON public.payment_links
            FOR SELECT USING (true);

        CREATE POLICY "Merchants can create their own payment links" ON public.payment_links
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = payment_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Merchants can update their own payment links" ON public.payment_links
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = payment_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Merchants can delete their own payment links" ON public.payment_links
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = payment_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        RAISE NOTICE 'Payment_links table created successfully!';
    ELSE
        RAISE NOTICE 'Payment_links table already exists!';
    END IF;

    -- Create checkout_links table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checkout_links') THEN
        CREATE TABLE public.checkout_links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            amount DECIMAL(10, 2) NOT NULL,
            currency TEXT DEFAULT 'PI',
            merchant_id UUID NOT NULL,
            checkout_image TEXT,
            redirect_after_checkout TEXT,
            cancel_redirect_url TEXT,
            expire_access BOOLEAN DEFAULT false,
            add_waitlist BOOLEAN DEFAULT false,
            ask_questions BOOLEAN DEFAULT false,
            stock INTEGER,
            category TEXT,
            features JSONB,
            views INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for checkout_links
        CREATE INDEX idx_checkout_links_slug ON public.checkout_links(slug);
        CREATE INDEX idx_checkout_links_merchant_id ON public.checkout_links(merchant_id);
        CREATE INDEX idx_checkout_links_created_at ON public.checkout_links(created_at);

        -- Add updated_at trigger for checkout_links
        CREATE TRIGGER checkout_links_updated_at
            BEFORE UPDATE ON public.checkout_links
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        -- Enable RLS for checkout_links
        ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for checkout_links (similar to payment_links)
        CREATE POLICY "Users can view all checkout links" ON public.checkout_links
            FOR SELECT USING (true);

        CREATE POLICY "Merchants can create their own checkout links" ON public.checkout_links
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = checkout_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Merchants can update their own checkout links" ON public.checkout_links
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = checkout_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Merchants can delete their own checkout links" ON public.checkout_links
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.merchants 
                    WHERE id = checkout_links.merchant_id 
                    AND user_id = auth.uid()
                )
            );

        RAISE NOTICE 'Checkout_links table created successfully!';
    ELSE
        RAISE NOTICE 'Checkout_links table already exists!';
    END IF;

END $$;

-- Add foreign key constraints after all tables are created
DO $$
BEGIN
    -- Add foreign key for payment_links -> merchants (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payment_links_merchant_id_fkey'
    ) THEN
        ALTER TABLE public.payment_links 
        ADD CONSTRAINT payment_links_merchant_id_fkey 
        FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for payment_links.merchant_id';
    END IF;

    -- Add foreign key for checkout_links -> merchants (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'checkout_links_merchant_id_fkey'
    ) THEN
        ALTER TABLE public.checkout_links 
        ADD CONSTRAINT checkout_links_merchant_id_fkey 
        FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for checkout_links.merchant_id';
    END IF;
END $$;

-- Create increment_views function for payment links
CREATE OR REPLACE FUNCTION public.increment_views(link_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Try to increment views in payment_links table first
    UPDATE public.payment_links 
    SET views = views + 1 
    WHERE id = link_id;
    
    -- If no rows were affected, try checkout_links table
    IF NOT FOUND THEN
        UPDATE public.checkout_links 
        SET views = views + 1 
        WHERE id = link_id;
    END IF;
END;
$$;

-- Verify all tables were created
SELECT 
    table_name,
    'created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('merchants', 'payment_links', 'checkout_links')
ORDER BY table_name;