-- Migration: Add merchant earnings and withdrawal system
-- Description: Creates tables for tracking merchant earnings and withdrawal requests

-- Create merchant_earnings table to track merchant earnings from payments
CREATE TABLE IF NOT EXISTS public.merchant_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    amount DECIMAL(20, 7) NOT NULL CHECK (amount > 0),
    platform_fee DECIMAL(20, 7) DEFAULT 0,
    net_amount DECIMAL(20, 7) GENERATED ALWAYS AS (amount - platform_fee) STORED,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('pending', 'available', 'pending_withdrawal', 'withdrawn')),
    payment_type VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'Pi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create withdrawal_requests table for merchants to request withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    amount DECIMAL(20, 7) NOT NULL CHECK (amount > 0),
    pi_wallet_address VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by_admin UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_earnings_merchant_id ON public.merchant_earnings(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_earnings_status ON public.merchant_earnings(status);
CREATE INDEX IF NOT EXISTS idx_merchant_earnings_created_at ON public.merchant_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_merchant_id ON public.withdrawal_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON public.withdrawal_requests(requested_at DESC);

-- Add updated_at trigger for merchant_earnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_merchant_earnings_updated_at ON public.merchant_earnings;
CREATE TRIGGER update_merchant_earnings_updated_at
    BEFORE UPDATE ON public.merchant_earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON public.withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at
    BEFORE UPDATE ON public.withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.merchant_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchant_earnings
CREATE POLICY "Merchants can view own earnings" ON public.merchant_earnings
    FOR SELECT USING (
        merchant_id = auth.uid()
        OR merchant_id = (SELECT id FROM public.merchants WHERE pi_username = current_setting('app.pi_username', true))
    );

CREATE POLICY "Service role can manage all earnings" ON public.merchant_earnings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all earnings" ON public.merchant_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.merchants 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- RLS Policies for withdrawal_requests
CREATE POLICY "Merchants can view own withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (
        merchant_id = auth.uid()
        OR merchant_id = (SELECT id FROM public.merchants WHERE pi_username = current_setting('app.pi_username', true))
    );

CREATE POLICY "Merchants can create withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (
        merchant_id = auth.uid()
        OR merchant_id = (SELECT id FROM public.merchants WHERE pi_username = current_setting('app.pi_username', true))
    );

CREATE POLICY "Service role can manage all withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.merchants 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Comments for documentation
COMMENT ON TABLE public.merchant_earnings IS 'Track merchant earnings from payment transactions';
COMMENT ON TABLE public.withdrawal_requests IS 'Merchant requests to withdraw their earnings';

COMMENT ON COLUMN public.merchant_earnings.platform_fee IS 'Platform fee deducted from the payment amount';
COMMENT ON COLUMN public.merchant_earnings.net_amount IS 'Amount merchant receives after platform fees';
COMMENT ON COLUMN public.merchant_earnings.status IS 'Status: pending, available (can withdraw), pending_withdrawal, withdrawn';

COMMENT ON COLUMN public.withdrawal_requests.status IS 'Status: pending (admin review), approved (ready to send), rejected, completed (sent)';
COMMENT ON COLUMN public.withdrawal_requests.pi_wallet_address IS 'Merchant Pi wallet address for withdrawal';

-- Grant necessary permissions
GRANT ALL ON public.merchant_earnings TO authenticated;
GRANT ALL ON public.withdrawal_requests TO authenticated;
GRANT ALL ON public.merchant_earnings TO service_role;
GRANT ALL ON public.withdrawal_requests TO service_role;