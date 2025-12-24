-- Update subscriptions table to support new plan types
-- This migration removes the old constraint and adds support for all plan types

-- Drop the old constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add new constraint with all plan types
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type = ANY (ARRAY['free'::text, 'basic'::text, 'grow'::text, 'advance'::text, 'plus'::text, 'monthly'::text, 'yearly'::text]));

-- Add comment
COMMENT ON CONSTRAINT subscriptions_plan_type_check ON subscriptions IS 
  'Allows free, basic, grow, advance, plus plans plus legacy monthly/yearly';
