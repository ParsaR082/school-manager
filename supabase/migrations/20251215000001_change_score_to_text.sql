-- Migration: Change score field from DECIMAL to TEXT to support fractional grades like "3/5"
-- Date: 2024-12-15

-- First, we need to handle the existing data and constraints
-- Step 1: Drop the existing check constraint
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_score_check;

-- Step 2: Add a temporary column to store the converted values
ALTER TABLE grades ADD COLUMN score_temp TEXT;

-- Step 3: Convert existing numeric scores to text format
UPDATE grades SET score_temp = score::TEXT;

-- Step 4: Drop the old numeric column
ALTER TABLE grades DROP COLUMN score;

-- Step 5: Rename the temporary column to score
ALTER TABLE grades RENAME COLUMN score_temp TO score;

-- Step 6: Add NOT NULL constraint to the new score column
ALTER TABLE grades ALTER COLUMN score SET NOT NULL;

-- Step 7: Add a check constraint to ensure valid score formats
-- This allows both fractional formats (like "3/5") and decimal formats (like "15.5")
ALTER TABLE grades ADD CONSTRAINT grades_score_format_check 
CHECK (
    -- Allow fractional format like "3/5", "7/4", etc.
    score ~ '^[0-9]+/[1-9][0-9]*$' OR
    -- Allow decimal format like "15.5", "18", "0.75", etc.
    (score ~ '^[0-9]+(\.[0-9]+)?$' AND score::NUMERIC >= 0 AND score::NUMERIC <= 20)
);

-- Add comment to document the change
COMMENT ON COLUMN grades.score IS 'Grade score - supports both fractional format (e.g., "3/5") and decimal format (e.g., "15.5")';