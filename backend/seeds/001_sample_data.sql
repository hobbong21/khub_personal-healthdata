-- 개인 건강 플랫폼 샘플 데이터
-- 테스트 및 개발용 시드 데이터

-- 샘플 사용자 생성 (비밀번호: password123)
INSERT INTO users (id, email, password_hash, name, birth_date, gender, blood_type, height, weight, lifestyle_habits) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '김건강', '1985-03-15', 'male', 'A+', 175.5, 72.3, '{"smoking": false, "alcohol": "light", "exerciseFrequency": 3, "dietType": "balanced"}'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '이웰니스', '1990-07-22', 'female', 'B+', 162.0, 58.5, '{"smoking": false, "alcohol": "none", "exerciseFrequency": 5, "dietType": "vegetarian"}'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.johnson@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '박헬스', '1978-11-08', 'male', 'O+', 180.2, 85.7, '{"smoking": true, "alcohol": "moderate", "exerciseFrequency": 2, "dietType": "omnivore"}');

-- 샘플 바이탈 사인 데이터
INSERT INTO vital_signs (user_id, type, value, unit, measured_at) VALUES
-- 김건강의 데이터
('550e8400-e29b-41d4-a716-446655440001', 'blood_pressure', '{"systolic": 120, "diastolic": 80}', 'mmHg', '2024-10-30 08:00:00+00'),
('550e8400-e29b-41d4-a716-446655440001', 'heart_rate', '72', 'bpm', '2024-10-30 08:00:00+00'),
('550e8400-e29b-41d4-a716-446655440001', 'weight', '72.3', 'kg', '2024-10-30 07:30:00+00'),
('550e8400-e29b-41d4-a716-446655440001', 'blood_pressure', '{"systolic": 118, "diastolic": 78}', 'mmHg', '2024-10-29 08:00:00+00'),
('550e8400-e29b-41d4-a716-446655440001', 'heart_rate', '68', 'bpm', '2024-10-29 08:00:00+00'),
('550e8400-e29b-41d4-a716-446655440001', 'weight', '72.1', 'kg', '2024-10-29 07:30:00+00'),

-- 이웰니스의 데이터
('550e8400-e29b-41d4-a716-446655440002', 'blood_pressure', '{"systolic": 110, "diastolic": 70}', 'mmHg', '2024-10-30 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'heart_rate', '65', 'bpm', '2024-10-30 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'weight', '58.5', 'kg', '2024-10-30 08:30:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'temperature', '36.5', '°C', '2024-10-30 09:00:00+00'),

-- 박헬스의 데이터
('550e8400-e29b-41d4-a716-446655440003', 'blood_pressure', '{"systolic": 140, "diastolic": 90}', 'mmHg', '2024-10-30 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'heart_rate', '85', 'bpm', '2024-10-30 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'weight', '85.7', 'kg', '2024-10-30 09:30:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'blood_sugar', '110', 'mg/dL', '2024-10-30 10:00:00+00');

-- 샘플 건강 기록 데이터
INSERT INTO health_records (user_id, record_type, data, recorded_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'daily_journal', '{"condition": 4, "sleep_quality": 3, "stress_level": 2, "energy_level": 4, "notes": "오늘은 컨디션이 좋았습니다. 30분 조깅했어요."}', '2024-10-30'),
('550e8400-e29b-41d4-a716-446655440001', 'exercise', '{"type": "jogging", "duration": 30, "intensity": "moderate", "calories": 250}', '2024-10-30'),
('550e8400-e29b-41d4-a716-446655440002', 'daily_journal', '{"condition": 5, "sleep_quality": 4, "stress_level": 1, "energy_level": 5, "notes": "요가 수업 참여. 매우 상쾌함."}', '2024-10-30'),
('550e8400-e29b-41d4-a716-446655440002', 'exercise', '{"type": "yoga", "duration": 60, "intensity": "light", "calories": 180}', '2024-10-30'),
('550e8400-e29b-41d4-a716-446655440003', 'daily_journal', '{"condition": 2, "sleep_quality": 2, "stress_level": 4, "energy_level": 2, "notes": "스트레스가 많아서 컨디션이 안 좋음."}', '2024-10-30');

-- 샘플 진료 기록 데이터
INSERT INTO medical_records (user_id, hospital_name, department, doctor_name, diagnosis_code, diagnosis_description, doctor_notes, cost, visit_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '서울대학교병원', '내과', '김의사', 'Z00.00', '일반 건강검진', '전반적으로 건강상태 양호. 정기 검진 권장.', 150000, '2024-10-15'),
('550e8400-e29b-41d4-a716-446655440002', '연세세브란스병원', '산부인과', '이의사', 'Z01.411', '부인과 정기검진', '정상 소견. 1년 후 재검진 권장.', 80000, '2024-09-20'),
('550e8400-e29b-41d4-a716-446655440003', '삼성서울병원', '내분비내과', '박의사', 'E11.9', '제2형 당뇨병', '혈당 관리 필요. 식이요법과 운동 병행 권장.', 200000, '2024-10-10');

-- 샘플 검사 결과 데이터
INSERT INTO test_results (user_id, medical_record_id, test_type, test_name, results, reference_range, status, test_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM medical_records WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), 'blood_test', '총 콜레스테롤', '{"value": 180, "unit": "mg/dL"}', '< 200 mg/dL', 'normal', '2024-10-15'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM medical_records WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), 'blood_test', 'HDL 콜레스테롤', '{"value": 55, "unit": "mg/dL"}', '> 40 mg/dL (남성)', 'normal', '2024-10-15'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM medical_records WHERE user_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), 'blood_test', '공복혈당', '{"value": 126, "unit": "mg/dL"}', '70-100 mg/dL', 'abnormal', '2024-10-10'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM medical_records WHERE user_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), 'blood_test', 'HbA1c', '{"value": 7.2, "unit": "%"}', '< 5.7%', 'abnormal', '2024-10-10');

-- 샘플 약물 데이터
INSERT INTO medications (user_id, name, generic_name, dosage, frequency, route, start_date, is_active, purpose, prescribed_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', '오메가3', 'Omega-3 fatty acids', '1000mg', '1일 1회', 'oral', '2024-10-01', true, '심혈관 건강', '김의사'),
('550e8400-e29b-41d4-a716-446655440002', '종합비타민', 'Multivitamin', '1정', '1일 1회', 'oral', '2024-09-15', true, '영양 보충', '이의사'),
('550e8400-e29b-41d4-a716-446655440003', '메트포르민', 'Metformin', '500mg', '1일 2회', 'oral', '2024-10-10', true, '혈당 조절', '박의사'),
('550e8400-e29b-41d4-a716-446655440003', '아스피린', 'Aspirin', '100mg', '1일 1회', 'oral', '2024-10-10', true, '심혈관 보호', '박의사');

-- 샘플 복약 스케줄 데이터
INSERT INTO medication_schedules (medication_id, time_of_day, scheduled_time, dosage, is_active) VALUES
((SELECT id FROM medications WHERE name = '오메가3' AND user_id = '550e8400-e29b-41d4-a716-446655440001'), 'morning', '08:00:00', '1000mg', true),
((SELECT id FROM medications WHERE name = '종합비타민' AND user_id = '550e8400-e29b-41d4-a716-446655440002'), 'morning', '09:00:00', '1정', true),
((SELECT id FROM medications WHERE name = '메트포르민' AND user_id = '550e8400-e29b-41d4-a716-446655440003'), 'morning', '08:00:00', '500mg', true),
((SELECT id FROM medications WHERE name = '메트포르민' AND user_id = '550e8400-e29b-41d4-a716-446655440003'), 'evening', '20:00:00', '500mg', true),
((SELECT id FROM medications WHERE name = '아스피린' AND user_id = '550e8400-e29b-41d4-a716-446655440003'), 'morning', '08:30:00', '100mg', true);

-- 샘플 복약 기록 데이터
INSERT INTO dosage_logs (medication_id, user_id, taken_at, dosage_taken) VALUES
((SELECT id FROM medications WHERE name = '오메가3' AND user_id = '550e8400-e29b-41d4-a716-446655440001'), '550e8400-e29b-41d4-a716-446655440001', '2024-10-30 08:00:00+00', '1000mg'),
((SELECT id FROM medications WHERE name = '종합비타민' AND user_id = '550e8400-e29b-41d4-a716-446655440002'), '550e8400-e29b-41d4-a716-446655440002', '2024-10-30 09:00:00+00', '1정'),
((SELECT id FROM medications WHERE name = '메트포르민' AND user_id = '550e8400-e29b-41d4-a716-446655440003'), '550e8400-e29b-41d4-a716-446655440003', '2024-10-30 08:00:00+00', '500mg'),
((SELECT id FROM medications WHERE name = '아스피린' AND user_id = '550e8400-e29b-41d4-a716-446655440003'), '550e8400-e29b-41d4-a716-446655440003', '2024-10-30 08:30:00+00', '100mg');

-- 샘플 가족력 데이터
INSERT INTO family_history (user_id, relationship, name, birth_year, medical_conditions) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'father', '김아버지', 1955, '{"conditions": [{"name": "고혈압", "diagnosed_year": 2010}, {"name": "당뇨병", "diagnosed_year": 2015}]}'),
('550e8400-e29b-41d4-a716-446655440001', 'mother', '김어머니', 1960, '{"conditions": [{"name": "갑상선 기능 저하증", "diagnosed_year": 2018}]}'),
('550e8400-e29b-41d4-a716-446655440002', 'mother', '이어머니', 1965, '{"conditions": [{"name": "유방암", "diagnosed_year": 2020, "status": "완치"}]}'),
('550e8400-e29b-41d4-a716-446655440003', 'father', '박아버지', 1950, '{"conditions": [{"name": "심근경색", "diagnosed_year": 2005}, {"name": "당뇨병", "diagnosed_year": 2000}]}');

-- 샘플 예약 데이터
INSERT INTO appointments (user_id, hospital_name, department, doctor_name, appointment_date, purpose, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '서울대학교병원', '내과', '김의사', '2024-11-15 14:00:00+00', '정기 검진', 'scheduled'),
('550e8400-e29b-41d4-a716-446655440002', '연세세브란스병원', '산부인과', '이의사', '2024-11-20 10:30:00+00', '정기 검진', 'scheduled'),
('550e8400-e29b-41d4-a716-446655440003', '삼성서울병원', '내분비내과', '박의사', '2024-11-10 15:30:00+00', '당뇨 관리 상담', 'scheduled');

-- 샘플 태스크 데이터
INSERT INTO tasks (user_id, type, description, completed, priority, due_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'vital_sign', '혈압 측정하기', false, 'high', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440001', 'exercise', '30분 걷기', false, 'medium', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440001', 'medication', '오메가3 복용', true, 'high', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440002', 'journal', '건강 일지 작성', false, 'low', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440002', 'vital_sign', '체중 측정', true, 'medium', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440003', 'medication', '메트포르민 복용', false, 'high', '2024-11-01'),
('550e8400-e29b-41d4-a716-446655440003', 'vital_sign', '혈당 측정', false, 'high', '2024-11-01');

-- 샘플 웨어러블 기기 설정
INSERT INTO wearable_device_configs (user_id, device_type, device_name, is_connected, sync_settings) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'apple_watch', 'Apple Watch Series 8', true, '{"sync_frequency": "hourly", "data_types": ["heart_rate", "steps", "sleep"]}'),
('550e8400-e29b-41d4-a716-446655440002', 'fitbit', 'Fitbit Charge 5', true, '{"sync_frequency": "daily", "data_types": ["heart_rate", "steps", "calories"]}'),
('550e8400-e29b-41d4-a716-446655440003', 'samsung_health', 'Galaxy Watch 4', false, '{"sync_frequency": "manual", "data_types": ["heart_rate", "blood_pressure"]}');

-- 샘플 웨어러블 데이터
INSERT INTO wearable_data_points (user_id, device_config_id, data_type, value, recorded_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM wearable_device_configs WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'), 'steps', '{"count": 8500}', '2024-10-30 23:59:00+00'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM wearable_device_configs WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'), 'heart_rate', '{"bpm": 72}', '2024-10-30 12:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM wearable_device_configs WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'steps', '{"count": 12000}', '2024-10-30 23:59:00+00'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM wearable_device_configs WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'calories', '{"burned": 2100}', '2024-10-30 23:59:00+00');

COMMIT;