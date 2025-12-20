-- Create merchant_payouts table for tracking withdrawal requests
CREATE TABLE public.merchant_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  wallet_address TEXT NOT NULL,
  pi_txid TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merchant_payouts ENABLE ROW LEVEL SECURITY;

-- Store owners can view their own payout requests
CREATE POLICY "Store owners can view their payout requests" 
ON public.merchant_payouts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = merchant_payouts.store_id 
  AND stores.owner_id = auth.uid()
));

-- Store owners can create payout requests for their stores
CREATE POLICY "Store owners can create payout requests" 
ON public.merchant_payouts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = merchant_payouts.store_id 
  AND stores.owner_id = auth.uid()
));

-- Create merchant_sales table for tracking all sales per merchant
CREATE TABLE public.merchant_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  pi_txid TEXT,
  payout_id UUID REFERENCES public.merchant_payouts(id),
  payout_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merchant_sales ENABLE ROW LEVEL SECURITY;

-- Store owners can view their sales
CREATE POLICY "Store owners can view their sales" 
ON public.merchant_sales 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = merchant_sales.store_id 
  AND stores.owner_id = auth.uid()
));

-- Service role can insert sales records (via edge functions)
CREATE POLICY "Service role can insert sales" 
ON public.merchant_sales 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_merchant_payouts_updated_at
BEFORE UPDATE ON public.merchant_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_merchant_payouts_store_id ON public.merchant_payouts(store_id);
CREATE INDEX idx_merchant_payouts_status ON public.merchant_payouts(status);
CREATE INDEX idx_merchant_sales_store_id ON public.merchant_sales(store_id);
CREATE INDEX idx_merchant_sales_payout_status ON public.merchant_sales(payout_status);