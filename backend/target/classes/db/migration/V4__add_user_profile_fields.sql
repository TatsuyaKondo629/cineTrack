-- Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS bio VARCHAR(500),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;