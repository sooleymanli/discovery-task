-- Simple fix: Disable RLS for calculator_config table
-- This allows all authenticated users to perform all operations

-- Disable RLS for calculator_config
ALTER TABLE calculator_config DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'calculator_config';
