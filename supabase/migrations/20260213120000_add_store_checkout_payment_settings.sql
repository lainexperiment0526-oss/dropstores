-- Store-level checkout payment configuration for public checkout flow
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS checkout_payment_mode TEXT DEFAULT 'pi_only',
ADD COLUMN IF NOT EXISTS manual_pi_wallet_address TEXT,
ADD COLUMN IF NOT EXISTS manual_pi_wallet_username TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stores_checkout_payment_mode_check'
  ) THEN
    ALTER TABLE public.stores
    ADD CONSTRAINT stores_checkout_payment_mode_check
    CHECK (checkout_payment_mode IN ('pi_only', 'manual_only', 'both'));
  END IF;
END $$;
