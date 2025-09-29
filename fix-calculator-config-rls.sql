-- Fix calculator_config RLS policies
-- This script adds the missing INSERT and UPDATE policies for calculator_config table

-- Drop ALL existing policies for calculator_config
DROP POLICY IF EXISTS "Users can read calculator config" ON calculator_config;
DROP POLICY IF EXISTS "Read calculator config" ON calculator_config;
DROP POLICY IF EXISTS "calculator_config_select" ON calculator_config;
DROP POLICY IF EXISTS "calculator_config_insert" ON calculator_config;
DROP POLICY IF EXISTS "calculator_config_update" ON calculator_config;
DROP POLICY IF EXISTS "calculator_config_delete" ON calculator_config;

-- Create comprehensive policies for calculator_config
-- SELECT: All authenticated users can read
CREATE POLICY "calculator_config_select" ON calculator_config 
FOR SELECT 
USING (true);

-- INSERT: Only superadmin users can insert
CREATE POLICY "calculator_config_insert" ON calculator_config 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- UPDATE: Only superadmin users can update
CREATE POLICY "calculator_config_update" ON calculator_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- DELETE: Only superadmin users can delete
CREATE POLICY "calculator_config_delete" ON calculator_config 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'calculator_config';
