-- Fix service categories relationship
BEGIN;

-- First, ensure we're using the correct table name (categories instead of service_categories)
ALTER TABLE IF EXISTS service_categories 
    RENAME TO categories;

-- Make sure the categories table has the correct structure
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Update existing category data
INSERT INTO categories (id, name, description, icon, created_at, updated_at)
VALUES 
    ('24968233-1d17-42d5-b087-e0147d74a840', 'Beauty Services', 'Makeup, waxing, and other beauty treatments', 'face_retouching_natural', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00'),
    ('380d854a-d475-4d52-a888-e8dd6bb4d53d', 'Mind & Body', 'Yoga, meditation, and wellness services', 'self_improvement', '2025-01-20 16:33:44.192309+00', '2025-01-20 16:33:44.192309+00')
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Update existing services to use the proper category UUID
UPDATE services 
SET category_id = '24968233-1d17-42d5-b087-e0147d74a840'
WHERE category_id::text = '1';

-- Ensure foreign key constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_category_id_fkey'
    ) THEN
        ALTER TABLE services
        ADD CONSTRAINT services_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT;
    END IF;
END $$;

-- Update sample services data if needed
INSERT INTO services (id, business_id, name, description, price, duration, category_id, image_url, is_available, created_at, updated_at)
VALUES 
    ('3f80ace0-7093-42a6-9b21-15085ab954da', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Haircut', 'Professional haircut service', 50.00, 45, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00'),
    ('c59de468-9c0c-4a31-9af0-4c1fd8b61eb1', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Manicure', 'Professional nail care service', 35.00, 30, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?q=80&w=2070&auto=format&fit=crop', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00'),
    ('dafae2e8-5169-408f-af56-352cfbdf087c', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Hair Coloring', 'Professional hair coloring service', 120.00, 90, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1560869713-da86a9ec0580?q=80&w=2070&auto=format&fit=crop', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00')
ON CONFLICT (id) DO UPDATE 
SET 
    business_id = EXCLUDED.business_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration = EXCLUDED.duration,
    category_id = EXCLUDED.category_id,
    image_url = EXCLUDED.image_url,
    is_available = EXCLUDED.is_available;

COMMIT; 