-- Add new fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS branch text,
ADD COLUMN IF NOT EXISTS year text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS projects text;

-- Add comments for documentation
COMMENT ON COLUMN profiles.branch IS 'Student branch/department (e.g., Computer Science, IT, BCA)';
COMMENT ON COLUMN profiles.year IS 'Student year (e.g., First Year, Second Year, Third Year)';
COMMENT ON COLUMN profiles.email IS 'Student email address';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN profiles.projects IS 'JSON string containing array of project objects with title, description, urls, and images';
