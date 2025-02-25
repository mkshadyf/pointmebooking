-- Seed business categories
DO $$
DECLARE
    business_user_id UUID;
    customer_user_id UUID;
    staff_user_id UUID;
    inserted_business_id UUID;
    inserted_staff_id UUID;
    admin_user_id UUID;
    business_profile_id UUID;
    customer_profile_id UUID;
    beauty_category_id UUID;
    fitness_category_id UUID;
    hair_service_category_id UUID;
    wellness_service_category_id UUID;
BEGIN
    -- Insert business categories first and store IDs
    INSERT INTO public.business_categories (name, description, icon) VALUES
    ('Beauty & Wellness', 'Beauty and wellness services including hair, nails, spa, and massage', '💆‍♀️')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        icon = EXCLUDED.icon
    RETURNING id INTO beauty_category_id;

    INSERT INTO public.business_categories (name, description, icon) VALUES
    ('Health & Fitness', 'Health and fitness services including personal training, yoga, and nutrition', '💪')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        icon = EXCLUDED.icon
    RETURNING id INTO fitness_category_id;

    -- Insert remaining business categories
    INSERT INTO public.business_categories (name, description, icon) VALUES
('Home Services', 'Home maintenance and improvement services', '🏠'),
('Professional Services', 'Business and professional services', '💼'),
('Education & Training', 'Educational and training services', '📚'),
('Events & Entertainment', 'Event planning and entertainment services', '🎉'),
('Auto & Transport', 'Automotive and transportation services', '🚗'),
('Pet Services', 'Pet care and grooming services', '🐾'),
('Tech & IT', 'Technology and IT services', '💻'),
('Legal & Financial', 'Legal and financial services', '⚖️')
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
icon = EXCLUDED.icon;

    -- Insert service categories and store IDs
    INSERT INTO public.service_categories (business_category_id, name, description)
    VALUES (beauty_category_id, 'Hair', 'Hair styling and care services')
    ON CONFLICT (name) DO UPDATE SET
        business_category_id = EXCLUDED.business_category_id,
        description = EXCLUDED.description
    RETURNING id INTO hair_service_category_id;

    INSERT INTO public.service_categories (business_category_id, name, description)
    VALUES (beauty_category_id, 'Wellness', 'Wellness and spa services')
    ON CONFLICT (name) DO UPDATE SET
        business_category_id = EXCLUDED.business_category_id,
        description = EXCLUDED.description
    RETURNING id INTO wellness_service_category_id;

    -- Create a business user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
    VALUES (gen_random_uuid(), 'business@example.com', NOW(), '{"role": "business"}'::jsonb)
    RETURNING id INTO business_user_id;

    -- Create a customer user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
    VALUES (gen_random_uuid(), 'customer@example.com', NOW(), '{"role": "customer"}'::jsonb)
    RETURNING id INTO customer_user_id;

    -- Create a staff user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
    VALUES (gen_random_uuid(), 'staff@example.com', NOW(), '{"role": "business"}'::jsonb)
    RETURNING id INTO staff_user_id;

    -- Create admin user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
    VALUES (gen_random_uuid(), 'admin@pointme.com', NOW(), '{"role": "admin"}'::jsonb)
    RETURNING id INTO admin_user_id;

    -- Create a business profile
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        email,
        role,
        email_verified,
        status,
        onboarding_completed
    ) VALUES 
        (gen_random_uuid(), business_user_id, 'Business Owner', 'business@example.com', 'business', true, 'active', true)
    RETURNING id INTO business_profile_id;

    -- Create a customer profile
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        email,
        role,
        email_verified,
        status,
        onboarding_completed
    ) VALUES 
        (gen_random_uuid(), customer_user_id, 'Test Customer', 'customer@example.com', 'customer', true, 'active', true)
    RETURNING id INTO customer_profile_id;

    -- Create a staff profile
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        email,
        role,
        email_verified,
        status,
        onboarding_completed
    ) VALUES 
        (gen_random_uuid(), staff_user_id, 'Staff Member', 'staff@example.com', 'business', true, 'active', true);

    -- Create sample business with stored category ID
    INSERT INTO public.businesses (
        owner_profile_id,
        name,
        description,
        business_type,
        business_category,
        address,
        city,
        state,
        postal_code,
        contact_number,
        contact_email,
        website,
        status,
        working_hours
    ) VALUES (
        business_profile_id,
        'Sample Beauty Salon',
        'A premium beauty salon offering a wide range of services',
        'Salon',
        beauty_category_id,
        '123 Main Street',
        'Cape Town',
        'Western Cape',
        '8001',
        '+27 21 1234567',
        'contact@samplebeautysalon.com',
        'https://samplebeautysalon.com',
        'active',
        '{
            "monday": {"start": "09:00", "end": "18:00", "is_closed": false},
            "tuesday": {"start": "09:00", "end": "18:00", "is_closed": false},
            "wednesday": {"start": "09:00", "end": "18:00", "is_closed": false},
            "thursday": {"start": "09:00", "end": "18:00", "is_closed": false},
            "friday": {"start": "09:00", "end": "18:00", "is_closed": false},
            "saturday": {"start": "09:00", "end": "14:00", "is_closed": false},
            "sunday": {"start": "00:00", "end": "00:00", "is_closed": true}
        }'::jsonb
    )
    ON CONFLICT (owner_profile_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO inserted_business_id;

    SELECT id INTO inserted_business_id FROM public.businesses WHERE owner_profile_id = business_profile_id;

    -- Create staff member
    INSERT INTO public.staff (
        business_id,
        user_id,
        role,
        status
    ) VALUES (
        inserted_business_id,
        staff_user_id,
        'stylist',
        'active'
    )
    ON CONFLICT (business_id, user_id) DO UPDATE SET
        role = EXCLUDED.role
    RETURNING id INTO inserted_staff_id;

    -- Create staff schedule
    INSERT INTO public.schedules (
        staff_id,
        business_id,
        day_of_week,
        start_time,
        end_time,
        is_available
    )
    SELECT t.staff_id, t.business_id, t.day_of_week, t.start_time, t.end_time, t.is_available
    FROM (
    SELECT 
            inserted_staff_id AS staff_id,
            inserted_business_id AS business_id,
        day_of_week,
            '09:00'::TIME AS start_time,
        CASE 
            WHEN day_of_week = 6 THEN '14:00'::TIME  -- Saturday
                WHEN day_of_week = 0 THEN '09:01'::TIME  -- Sunday (closed, minimal valid interval)
                ELSE '18:00'::TIME
            END AS end_time,
        CASE 
            WHEN day_of_week = 0 THEN false  -- Sunday
            ELSE true
            END AS is_available
    FROM generate_series(0, 6) day_of_week
    ) t
    ON CONFLICT ON CONSTRAINT schedules_business_staff_day_unique DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time;

    -- Create sample services with stored category IDs
    INSERT INTO public.services (
        id, 
        business_id, 
        name, 
        description, 
        price, 
        duration, 
        category_id, 
        image_url, 
        status,
        is_available, 
        created_at, 
        updated_at
    ) VALUES 
    ('3f80ace0-7093-42a6-9b21-15085ab954da', inserted_business_id, 'Haircut', 'Professional haircut service', 50.00, 45, hair_service_category_id, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop', 'active', true, NOW(), NOW()),
    ('c59de468-9c0c-4a31-9af0-4c1fd8b61eb1', inserted_business_id, 'Manicure', 'Professional nail care service', 35.00, 30, hair_service_category_id, 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?q=80&w=2070&auto=format&fit=crop', 'active', true, NOW(), NOW()),
    ('dafae2e8-5169-408f-af56-352cfbdf087c', inserted_business_id, 'Hair Coloring', 'Professional hair coloring service', 120.00, 90, hair_service_category_id, 'https://images.unsplash.com/photo-1560869713-da86a9ec0580?q=80&w=2070&auto=format&fit=crop', 'active', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        status = EXCLUDED.status;

    -- Create admin-managed featured services with stored category IDs
    INSERT INTO public.services (
        id,
        business_id,
        name,
        description,
        price,
        duration,
        category_id,
        image_url,
        status,
        is_available,
        created_at,
        updated_at,
        created_by_id,
        approved_by_id,
        approved_at,
        featured,
        featured_order,
        approval_status,
        admin_notes
    ) VALUES 
    (
        gen_random_uuid(),
        inserted_business_id,
        'Premium Spa Package',
        'Luxurious full-day spa treatment including massage, facial, and body wrap',
        299.99,
        240,
        wellness_service_category_id,
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
        'active',
        true,
        NOW(),
        NOW(),
        admin_user_id,
        admin_user_id,
        NOW(),
        true,
        1,
        'approved',
        'Verified premium service provider'
    ),
    (
        gen_random_uuid(),
        inserted_business_id,
        'Wellness Consultation',
        'Comprehensive wellness assessment and personalized treatment plan',
        150.00,
        90,
        wellness_service_category_id,
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
        'active',
        true,
        NOW(),
        NOW(),
        admin_user_id,
        admin_user_id,
        NOW(),
        true,
        2,
        'approved',
        'Certified wellness expert'
    )
    ON CONFLICT (id) DO UPDATE SET
        featured = EXCLUDED.featured,
        featured_order = EXCLUDED.featured_order,
        admin_notes = EXCLUDED.admin_notes;

    -- Generate sample bookings
    INSERT INTO public.bookings (
        service_id,
        customer_id,
        business_id,
        date,
        start_time,
        end_time,
        status
    )
    SELECT 
        s.id,
        customer_profile_id,
        s.business_id,
        CURRENT_DATE + (i || ' days')::INTERVAL,
        ('09:00'::TIME + (j || ' hours')::INTERVAL)::TIME,
        ('09:00'::TIME + (j || ' hours')::INTERVAL + (s.duration || ' minutes')::INTERVAL)::TIME,
        'pending'
    FROM services s
    CROSS JOIN generate_series(0, 6) i
    CROSS JOIN generate_series(0, 2) j
    ON CONFLICT DO NOTHING;
END $$;

-- Remove these duplicate insertions
--INSERT INTO public.business_categories (name, description) VALUES
--('Beauty', 'Beauty and wellness services'),
--('Fitness', 'Fitness and training services'),
--('Professional', 'Professional services'),
--('Home', 'Home services');

-- Insert sample service categories
--INSERT INTO public.service_categories (business_category_id, name, description) VALUES
--((SELECT id FROM public.business_categories WHERE name = 'Beauty'), 'Hair', 'Hair styling and care services'),
--((SELECT id FROM public.business_categories WHERE name = 'Beauty'), 'Nails', 'Nail care services'),
--((SELECT id FROM public.business_categories WHERE name = 'Fitness'), 'Personal Training', 'One-on-one training sessions'),
--((SELECT id FROM public.business_categories WHERE name = 'Fitness'), 'Group Classes', 'Group fitness classes'); 