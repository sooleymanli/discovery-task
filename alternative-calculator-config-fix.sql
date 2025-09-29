-- Alternative fix: Temporarily disable RLS for calculator_config
-- This is a quick fix but less secure

-- Option 1: Disable RLS temporarily (NOT RECOMMENDED for production)
-- ALTER TABLE calculator_config DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a function to handle calculator config operations
CREATE OR REPLACE FUNCTION create_calculator_config(
  p_version text,
  p_is_active boolean,
  p_effective_from timestamp with time zone,
  p_description text,
  p_config jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_id uuid;
  user_role text;
BEGIN
  -- Check if user is superadmin
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  IF user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmin users can create calculator configs';
  END IF;
  
  -- Deactivate all existing configs if this one is active
  IF p_is_active THEN
    UPDATE calculator_config 
    SET is_active = false 
    WHERE is_active = true;
  END IF;
  
  -- Insert new config
  INSERT INTO calculator_config (
    version,
    is_active,
    effective_from,
    description,
    config
  ) VALUES (
    p_version,
    p_is_active,
    p_effective_from,
    p_description,
    p_config
  ) RETURNING id INTO config_id;
  
  RETURN config_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_calculator_config TO authenticated;

-- Test the function
-- SELECT create_calculator_config(
--   'v1.0',
--   true,
--   NOW(),
--   'Test config',
--   '{"baseRate": 50}'::jsonb
-- );
