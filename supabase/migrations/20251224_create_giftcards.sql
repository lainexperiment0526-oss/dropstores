-- Gift Cards for Holiday Gifting
-- Allows users to purchase gift cards for subscriptions and share with loved ones

CREATE TABLE IF NOT EXISTS giftcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  purchased_by UUID REFERENCES auth.users(id),
  purchased_at TIMESTAMP DEFAULT now(),
  
  -- Recipient information
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  gift_message TEXT,
  
  -- Redemption tracking
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMP,
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Expiry
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_giftcards_code ON giftcards(code);
CREATE INDEX IF NOT EXISTS idx_giftcards_purchased_by ON giftcards(purchased_by);
CREATE INDEX IF NOT EXISTS idx_giftcards_redeemed_by ON giftcards(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_giftcards_status ON giftcards(redeemed_at) 
  WHERE redeemed_at IS NULL;

-- Enable RLS
ALTER TABLE giftcards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own purchased gift cards
CREATE POLICY "Users can view own gift cards"
  ON giftcards FOR SELECT
  USING (auth.uid() = purchased_by OR auth.uid() = redeemed_by);

-- Policy: Users can see gift cards sent to their email
CREATE POLICY "Users can view gift cards sent to them"
  ON giftcards FOR SELECT
  USING (recipient_email = auth.jwt() ->> 'email');

-- Policy: Authenticated users can insert gift cards (via edge function)
CREATE POLICY "Users can purchase gift cards"
  ON giftcards FOR INSERT
  WITH CHECK (auth.uid() = purchased_by);

-- Policy: Users can redeem their own gift cards
CREATE POLICY "Users can redeem gift cards"
  ON giftcards FOR UPDATE
  USING (auth.uid() = redeemed_by AND redeemed_at IS NULL)
  WITH CHECK (redeemed_at IS NOT NULL);
