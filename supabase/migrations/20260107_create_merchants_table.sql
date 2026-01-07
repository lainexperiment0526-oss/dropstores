-- Migration: Create merchants table
-- Description: Creates the missing merchants table required by the payment system

-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_pi_username ON public.merchants(pi_username);
CREATE INDEX IF NOT EXISTS idx_merchants_verification_status ON public.merchants(verification_status);
CREATE INDEX IF NOT EXISTS idx_merchants_is_active ON public.merchants(is_active);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS merchants_updated_at ON public.merchants;
CREATE TRIGGER merchants_updated_at
    BEFORE UPDATE ON public.merchants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own merchant profile" ON public.merchants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own merchant profile" ON public.merchants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own merchant profile" ON public.merchants
    FOR UPDATE USING (user_id = auth.uid());

-- Admin can view all merchants
CREATE POLICY "Admins can view all merchants" ON public.merchants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND email IN ('mrwain@dropstore.com', 'admin@dropstore.com')
        )
    );

-- Public read access for basic merchant info (for payment links)
CREATE POLICY "Public can view basic merchant info" ON public.merchants
    FOR SELECT USING (is_active = true);