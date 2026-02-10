-- Add header_background column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS header_background TEXT;
