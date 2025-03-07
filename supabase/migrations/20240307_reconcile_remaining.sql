BEGIN;

-- Remove business-related columns from profiles (these were in the original migration)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS business_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS business_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS description;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS city;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS state;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS working_hours;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS social_media;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_attempts;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS logo_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS first_name; -- This was in the original migration
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_name;  -- This was in the original migration

-- Rename phone to phone_number in profiles (to match AuthProfile)
ALTER TABLE public.profiles RENAME COLUMN phone TO phone_number;

-- Rename owner_profile_id to owner_id in businesses (to match intended schema)
ALTER TABLE public.businesses RENAME COLUMN owner_profile_id TO owner_id;

-- **DO NOT** Rename business_category to category_id in businesses.  Keep it as business_category.
-- ALTER TABLE public.businesses RENAME COLUMN business_category TO category_id; -- REMOVED

-- Rename contact_number to phone in businesses (to match intended schema)
ALTER TABLE public.businesses RENAME COLUMN contact_number TO phone;

-- Rename contact_email to email in businesses (to match intended schema)
ALTER TABLE public.businesses RENAME COLUMN contact_email TO email;

-- Rename postal_code to zip_code in businesses (to match intended schema)
ALTER TABLE public.businesses RENAME COLUMN postal_code TO zip_code;

-- Rename cover_image_url to banner_url in businesses (to match intended schema)
ALTER TABLE public.businesses RENAME COLUMN cover_image_url TO banner_url;

-- Remove duplicate logo_url column from businesses, rename avatar_url
ALTER TABLE public.businesses DROP COLUMN IF EXISTS logo_url;
ALTER TABLE public.businesses RENAME COLUMN avatar_url TO logo_url;

-- Add services column to staff (if it doesn't exist)
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS services text[] NULL;

-- Update user_role enum (add 'staff') - ONLY if it doesn't already exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'staff';

-- Update booking_status enum (add 'no-show') - ONLY if it doesn't already exist
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'no-show';

-- Update service_status enum - ONLY if these values don't already exist
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'archived';
-- Rename is tricky; do this ONLY if you're sure 'deleted' isn't used.  It's safer to just add 'archived'.
-- ALTER TYPE public.service_status RENAME VALUE 'deleted' TO 'archived';

-- Update user_status enum - ONLY if it doesn't already exist
ALTER TYPE public.user_status ADD VALUE IF NOT EXISTS 'pending';

COMMIT; 