-- Add profile_picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Update RLS policy to allow users to update their own profile picture
-- (This should already be covered by existing policies, but let's ensure it)
