
-- Rename tiers to new naming scheme
ALTER TABLE public.profiles ALTER COLUMN tier SET DEFAULT 'Intern';
UPDATE public.profiles SET tier = CASE tier
  WHEN 'Internship' THEN 'Intern'
  WHEN 'Silver' THEN 'C1'
  WHEN 'Gold' THEN 'C2'
  WHEN 'Platinum' THEN 'C3'
  ELSE tier
END;

-- Update app_settings tier_rates JSON to new keys/rates
UPDATE public.app_settings
SET tier_rates = jsonb_build_object(
  'Intern', 0.4,
  'C1', 0.4,
  'C2', 0.5,
  'C3', 0.8,
  'C4', 1.6,
  'C5', 3.2
),
updated_at = now()
WHERE id = 1;
