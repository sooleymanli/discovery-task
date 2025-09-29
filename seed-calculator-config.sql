-- Seed calculator_config table with default configuration
-- This script creates the initial calculator configuration

-- First, deactivate any existing active configs
UPDATE calculator_config SET is_active = false WHERE is_active = true;

-- Insert default calculator configuration
INSERT INTO calculator_config (
  version,
  is_active,
  effective_from,
  description,
  config
) VALUES (
  'v1.0',
  true,
  NOW(),
  'İlk default konfiqurasiya - PlanB Sığorta',
  '{
    "baseRate": 50,
    "ageMultipliers": [
      {"min": 18, "max": 25, "factor": 0.9},
      {"min": 26, "max": 35, "factor": 1.0},
      {"min": 36, "max": 45, "factor": 1.3},
      {"min": 46, "max": 55, "factor": 1.7},
      {"min": 56, "max": 65, "factor": 2.3}
    ],
    "genderMultipliers": {
      "male": 1.05,
      "female": 0.95
    },
    "smokerFactor": 1.6,
    "termMultipliers": [
      {"years": 5, "factor": 0.9},
      {"years": 10, "factor": 1.0},
      {"years": 15, "factor": 1.1},
      {"years": 20, "factor": 1.2},
      {"years": 30, "factor": 1.35}
    ]
  }'::jsonb
);

-- Verify the insertion
SELECT 
  id,
  version,
  is_active,
  effective_from,
  description,
  config
FROM calculator_config 
WHERE is_active = true;
