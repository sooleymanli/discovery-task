-- Seed dashboard data for testing

-- Insert some test applications
INSERT INTO applications (full_name, email, phone, age, gender, coverage_amount, term_years, premium_estimate, status, created_at) VALUES
('Əli Məmmədov', 'ali@example.com', '+994501234567', 30, 'male', 50000, 10, 25.50, 'pending', NOW() - INTERVAL '5 days'),
('Aynur Həsənova', 'aynur@example.com', '+994507654321', 28, 'female', 75000, 15, 35.25, 'in_progress', NOW() - INTERVAL '3 days'),
('Rəşad Quliyev', 'rashad@example.com', '+994509876543', 35, 'male', 100000, 20, 45.80, 'closed', NOW() - INTERVAL '1 day'),
('Leyla Əliyeva', 'leyla@example.com', '+994501111111', 25, 'female', 30000, 5, 15.75, 'pending', NOW() - INTERVAL '2 days'),
('Cavid Məlikov', 'cavid@example.com', '+994502222222', 40, 'male', 150000, 25, 65.30, 'in_progress', NOW() - INTERVAL '4 days'),
('Günel Rəhimova', 'gunel@example.com', '+994503333333', 32, 'female', 80000, 12, 38.90, 'pending', NOW() - INTERVAL '6 days'),
('Tural Həsənov', 'tural@example.com', '+994504444444', 45, 'male', 120000, 18, 55.40, 'closed', NOW() - INTERVAL '7 days'),
('Səbinə Quliyeva', 'sabina@example.com', '+994505555555', 29, 'female', 60000, 8, 28.60, 'in_progress', NOW() - INTERVAL '1 day'),
('Rəşad Əliyev', 'rashad2@example.com', '+994506666666', 33, 'male', 90000, 14, 42.30, 'pending', NOW() - INTERVAL '8 days'),
('Nərgiz Məmmədova', 'nargiz@example.com', '+994507777777', 27, 'female', 45000, 7, 21.15, 'in_progress', NOW() - INTERVAL '9 days'),
('Elçin Həsənov', 'elcin@example.com', '+994508888888', 38, 'male', 110000, 16, 70.40, 'closed', NOW() - INTERVAL '10 days'),
('Aysel Quliyeva', 'aysel@example.com', '+994509999999', 31, 'female', 70000, 11, 33.25, 'pending', NOW() - INTERVAL '11 days'),
('Vüsal Məlikov', 'vusal@example.com', '+994500000000', 42, 'male', 130000, 22, 58.50, 'in_progress', NOW() - INTERVAL '12 days'),
('Günelə Rəhimova', 'gunela@example.com', '+994501111112', 26, 'female', 40000, 6, 18.00, 'pending', NOW() - INTERVAL '13 days'),
('Rəşad Həsənov', 'rashad3@example.com', '+994502222223', 36, 'male', 95000, 13, 60.80, 'closed', NOW() - INTERVAL '14 days');

-- Insert some test analytics (calculator usage)
INSERT INTO analytics (event_type, event_properties, source, timestamp) VALUES
('calculator_used', '{"age": 30, "gender": "male", "coverageAmount": 50000, "termYears": 10, "smoker": false, "premium": 25.50}', 'landing_page', NOW() - INTERVAL '1 hour'),
('calculator_used', '{"age": 28, "gender": "female", "coverageAmount": 75000, "termYears": 15, "smoker": false, "premium": 35.25}', 'landing_page', NOW() - INTERVAL '2 hours'),
('calculator_used', '{"age": 35, "gender": "male", "coverageAmount": 100000, "termYears": 20, "smoker": true, "premium": 73.28}', 'landing_page', NOW() - INTERVAL '3 hours'),
('calculator_used', '{"age": 25, "gender": "female", "coverageAmount": 30000, "termYears": 5, "smoker": false, "premium": 12.83}', 'landing_page', NOW() - INTERVAL '4 hours'),
('calculator_used', '{"age": 40, "gender": "male", "coverageAmount": 150000, "termYears": 25, "smoker": false, "premium": 81.75}', 'landing_page', NOW() - INTERVAL '5 hours'),
('calculator_used', '{"age": 32, "gender": "female", "coverageAmount": 80000, "termYears": 12, "smoker": false, "premium": 38.90}', 'landing_page', NOW() - INTERVAL '6 hours'),
('calculator_used', '{"age": 45, "gender": "male", "coverageAmount": 120000, "termYears": 18, "smoker": true, "premium": 88.64}', 'landing_page', NOW() - INTERVAL '7 hours'),
('calculator_used', '{"age": 29, "gender": "female", "coverageAmount": 60000, "termYears": 8, "smoker": false, "premium": 28.60}', 'landing_page', NOW() - INTERVAL '8 hours'),
('calculator_used', '{"age": 33, "gender": "male", "coverageAmount": 90000, "termYears": 14, "smoker": false, "premium": 42.30}', 'landing_page', NOW() - INTERVAL '1 day'),
('calculator_used', '{"age": 27, "gender": "female", "coverageAmount": 45000, "termYears": 7, "smoker": false, "premium": 21.15}', 'landing_page', NOW() - INTERVAL '2 days'),
('calculator_used', '{"age": 38, "gender": "male", "coverageAmount": 110000, "termYears": 16, "smoker": true, "premium": 70.40}', 'landing_page', NOW() - INTERVAL '3 days'),
('calculator_used', '{"age": 31, "gender": "female", "coverageAmount": 70000, "termYears": 11, "smoker": false, "premium": 33.25}', 'landing_page', NOW() - INTERVAL '4 days'),
('calculator_used', '{"age": 42, "gender": "male", "coverageAmount": 130000, "termYears": 22, "smoker": false, "premium": 58.50}', 'landing_page', NOW() - INTERVAL '5 days'),
('calculator_used', '{"age": 26, "gender": "female", "coverageAmount": 40000, "termYears": 6, "smoker": false, "premium": 18.00}', 'landing_page', NOW() - INTERVAL '6 days'),
('calculator_used', '{"age": 36, "gender": "male", "coverageAmount": 95000, "termYears": 13, "smoker": true, "premium": 60.80}', 'landing_page', NOW() - INTERVAL '7 days');

-- Assign some applications to agents
UPDATE applications 
SET assigned_agent_id = (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
    assigned_at = NOW() - INTERVAL '2 days'
WHERE id IN (
  SELECT id FROM applications 
  WHERE status = 'in_progress' 
  LIMIT 3
);

-- Update some applications to different statuses
UPDATE applications 
SET status = 'in_progress', 
    status_changed_at = NOW() - INTERVAL '1 day'
WHERE id IN (
  SELECT id FROM applications 
  WHERE status = 'pending' 
  LIMIT 2
);

UPDATE applications 
SET status = 'closed', 
    status_changed_at = NOW() - INTERVAL '2 hours',
    notes = 'Məlumatların yoxlanılması zamanı problem aşkarlandı'
WHERE id IN (
  SELECT id FROM applications 
  WHERE status = 'pending' 
  LIMIT 1
);
