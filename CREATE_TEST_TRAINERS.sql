-- SQL Script to Create Test Trainers
-- Run this in your PostgreSQL database

-- Make sure these user_ids exist as 'trainer' role users first
-- Or modify user_id values to match existing users

INSERT INTO trainers (user_id, name, specialty, phone, email, bio, status) 
VALUES 
  (1, 'Jane Doe', 'yoga', '+1111111111', 'jane@trainer.com', 'Experienced yoga instructor with 10 years of teaching', 'active'),
  (1, 'John Smith', 'pilates', '+2222222222', 'john@trainer.com', 'Certified Pilates expert specializing in core strength', 'active'),
  (1, 'Sarah Johnson', 'dance', '+3333333333', 'sarah@trainer.com', 'Professional dance instructor - hip hop, contemporary, salsa', 'active');

-- Verify trainers were created
SELECT COUNT(*) as trainer_count FROM trainers;

-- View all trainers
SELECT trainer_id, user_id, name, specialty, email, phone, status FROM trainers;
