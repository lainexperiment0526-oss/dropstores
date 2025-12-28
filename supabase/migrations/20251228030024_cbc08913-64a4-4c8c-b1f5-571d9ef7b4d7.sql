-- Drop the old plan_type constraint that only allows monthly/yearly
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add new constraint that allows the actual plan types used
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type IN ('free', 'basic', 'grow', 'advance', 'plus', 'monthly', 'yearly'));

-- Drop and recreate status constraint to include 'superseded'
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'superseded'));