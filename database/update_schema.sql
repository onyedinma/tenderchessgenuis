-- Add is_active column to question_banks table if it doesn't exist
ALTER TABLE question_banks 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Add question_order column to questions table if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS question_order INT DEFAULT 0;

-- Update the documentation
COMMENT ON TABLE question_banks IS 'Stores question banks for Section 1 and Section 2';
COMMENT ON COLUMN question_banks.is_active IS 'Indicates if this bank is currently active';
COMMENT ON COLUMN questions.question_order IS 'Order in which question should be displayed';

-- Add question_order field to questions table to track ordering within a bank for Section 1
ALTER TABLE questions ADD COLUMN question_order INT DEFAULT 0 AFTER position;

-- Update existing question_order to be sequential within each bank
SET @rank = 0;
SET @current_bank = 0;

-- This will update question_order for each question based on its bank_id
-- Questions will be ordered by their id within each bank
UPDATE questions q1
JOIN (
    SELECT id, bank_id,
    @rank := IF(@current_bank = bank_id, @rank + 1, 1) AS new_order,
    @current_bank := bank_id
    FROM questions
    ORDER BY bank_id, id
) q2 ON q1.id = q2.id
SET q1.question_order = q2.new_order;

-- Add an index to improve query performance when sorting by question_order
ALTER TABLE questions ADD INDEX idx_bank_order (bank_id, question_order); 