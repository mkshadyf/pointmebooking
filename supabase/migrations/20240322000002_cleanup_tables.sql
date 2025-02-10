-- Clean up and reorganize tables
BEGIN;

-- Drop duplicate/old tables
DROP TABLE IF EXISTS public.service;  -- Remove duplicate service table
DROP VIEW IF EXISTS public.service_details;  -- We'll recreate this view later

-- Create categories table for businesses if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table for services if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert service categories data
INSERT INTO categories (id, name, description, icon, created_at, updated_at)
VALUES 
    ('24968233-1d17-42d5-b087-e0147d74a840', 'Beauty Services', 'Makeup, waxing, and other beauty treatments', 'face_retouching_natural', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('380d854a-d475-4d52-a888-e8dd6bb4d53d', 'Mind & Body', 'Yoga, meditation, and wellness services', 'self_improvement', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('4f80ace0-7093-42a6-9b21-15085ab954db', 'Massage & Bodywork', 'Therapeutic massage and bodywork services', 'massage', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('5c59de68-9c0c-4a31-9af0-4c1fd8b61eb2', 'Skincare', 'Facial treatments and skincare services', 'face', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('6dafae28-5169-408f-af56-352cfbdf087d', 'Hair Services', 'Haircuts, styling, and coloring services', 'content_cut', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('7e80ace0-7093-42a6-9b21-15085ab954dc', 'Nail Services', 'Manicure, pedicure, and nail art services', 'spa', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('8c59de68-9c0c-4a31-9af0-4c1fd8b61eb3', 'Fitness Training', 'Personal training and fitness coaching', 'fitness_center', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('9dafae28-5169-408f-af56-352cfbdf087e', 'Group Fitness', 'Group exercise classes and training', 'groups', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00')
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Insert business categories data
INSERT INTO business_categories (name, description, icon)
VALUES 
    ('Health & Wellness', 'Health and wellness services', 'favorite'),
    ('Beauty & Personal Care', 'Beauty and personal care services', 'spa'),
    ('Fitness & Training', 'Fitness and training services', 'fitness_center'),
    ('Professional Services', 'Professional and business services', 'business'),
    ('Home Services', 'Home maintenance and improvement', 'home'),
    ('Education & Training', 'Education and training services', 'school'),
    ('Events & Entertainment', 'Event planning and entertainment', 'celebration'),
    ('Auto & Transport', 'Automotive and transportation', 'directions_car')
ON CONFLICT (name) DO UPDATE 
SET 
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- First, drop any existing foreign key constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_id_fkey;

-- Create a temporary column for the new UUID
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id_new UUID;

-- Update existing services to use the Beauty Services category as default
-- You can modify this to map to different categories based on your needs
UPDATE services 
SET category_id_new = '24968233-1d17-42d5-b087-e0147d74a840'
WHERE category_id_new IS NULL;

-- Drop the old category_id column and rename the new one
ALTER TABLE services DROP COLUMN category_id;
ALTER TABLE services RENAME COLUMN category_id_new TO category_id;

-- Make category_id NOT NULL and add the foreign key constraint
ALTER TABLE services 
    ALTER COLUMN category_id SET NOT NULL,
    ADD CONSTRAINT services_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT;

-- Recreate service_details view with correct table structure
CREATE OR REPLACE VIEW service_details AS
SELECT 
    s.*,
    p.business_name,
    p.description as business_description,
    p.location as business_address,
    split_part(p.location, ',', 2) as business_city,
    p.contact_number as business_phone,
    p.contact_email as business_email,
    p.business_images[1] as business_logo_url,
    c.name as category_name,
    c.icon as category_icon
FROM services s
LEFT JOIN profiles p ON s.business_id = p.id
LEFT JOIN categories c ON s.category_id = c.id;

-- Enable RLS on both category tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Categories are viewable by everyone" 
    ON categories FOR SELECT 
    USING (true);

CREATE POLICY "Business categories are viewable by everyone" 
    ON business_categories FOR SELECT 
    USING (true);

COMMIT; 