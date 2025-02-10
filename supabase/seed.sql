-- Seed categories
INSERT INTO public.categories (name, description, icon) VALUES
('Beauty & Wellness', 'Beauty and wellness services including hair, nails, spa, and massage', '💆‍♀️'),
('Health & Fitness', 'Health and fitness services including personal training, yoga, and nutrition', '💪'),
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

-- Create sample users if they don't exist
DO $$
DECLARE
    business_user_id UUID;
    customer_user_id UUID;
    staff_user_id UUID;
    business_id UUID;
    staff_id UUID;
    admin_user_id UUID;
BEGIN
    -- Create a business user
    INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
    VALUES ('business@example.com', NOW(), '{"role": "business"}'::jsonb)
    ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
    RETURNING id INTO business_user_id;

    -- Create a customer user
    INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
    VALUES ('customer@example.com', NOW(), '{"role": "customer"}'::jsonb)
    ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
    RETURNING id INTO customer_user_id;

    -- Create a staff user
    INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
    VALUES ('staff@example.com', NOW(), '{"role": "business"}'::jsonb)
    ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
    RETURNING id INTO staff_user_id;

    -- Create admin user
    INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
    VALUES ('admin@pointme.com', NOW(), '{"role": "admin"}'::jsonb)
    ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
    RETURNING id INTO admin_user_id;

    -- Create profiles
    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
        role,
        email_verified,
        status,
        onboarding_completed
    ) VALUES 
    (business_user_id, 'Business Owner', 'business@example.com', 'business', true, 'active', true),
    (customer_user_id, 'Test Customer', 'customer@example.com', 'customer', true, 'active', true),
    (staff_user_id, 'Staff Member', 'staff@example.com', 'business', true, 'active', true)
    ON CONFLICT (user_id) DO UPDATE SET
        email_verified = EXCLUDED.email_verified,
        onboarding_completed = EXCLUDED.onboarding_completed;

    -- Create admin profile
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        email,
        role,
        email_verified,
        status,
        onboarding_completed
    ) VALUES (
        admin_user_id,
        admin_user_id,
        'System Admin',
        'admin@pointme.com',
        'admin',
        true,
        'active',
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email_verified = true,
        onboarding_completed = true;

    -- Create sample business
    INSERT INTO public.businesses (
        user_id,
        name,
        description,
        business_type,
        business_category,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        website,
        status,
        working_hours
    ) VALUES (
        business_user_id,
        'Sample Beauty Salon',
        'A premium beauty salon offering a wide range of services',
        'Salon',
        'Beauty & Wellness',
        '123 Main Street',
        'Cape Town',
        'Western Cape',
        '8001',
        '+27 21 123 4567',
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
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO business_id;

    -- Create staff member
    INSERT INTO public.staff (
        business_id,
        user_id,
        role,
        status
    ) VALUES (
        business_id,
        staff_user_id,
        'stylist',
        'active'
    )
    ON CONFLICT (business_id, user_id) DO UPDATE SET
        role = EXCLUDED.role
    RETURNING id INTO staff_id;

    -- Create staff schedule
    INSERT INTO public.schedules (
        staff_id,
        business_id,
        day_of_week,
        start_time,
        end_time,
        is_available
    )
    SELECT 
        staff_id,
        business_id,
        day_of_week,
        '09:00'::TIME,
        CASE 
            WHEN day_of_week = 6 THEN '14:00'::TIME  -- Saturday
            WHEN day_of_week = 0 THEN '09:00'::TIME  -- Sunday (closed)
            ELSE '18:00'::TIME                       -- Mon-Fri
        END,
        CASE 
            WHEN day_of_week = 0 THEN false  -- Sunday
            ELSE true
        END
    FROM generate_series(0, 6) day_of_week
    ON CONFLICT (business_id, staff_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time;

    -- Create sample services
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
    ('3f80ace0-7093-42a6-9b21-15085ab954da', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Haircut', 'Professional haircut service', 50.00, 45, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop', 'active', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00'),
    ('c59de468-9c0c-4a31-9af0-4c1fd8b61eb1', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Manicure', 'Professional nail care service', 35.00, 30, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?q=80&w=2070&auto=format&fit=crop', 'active', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00'),
    ('dafae2e8-5169-408f-af56-352cfbdf087c', '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174', 'Hair Coloring', 'Professional hair coloring service', 120.00, 90, '24968233-1d17-42d5-b087-e0147d74a840', 'https://images.unsplash.com/photo-1560869713-da86a9ec0580?q=80&w=2070&auto=format&fit=crop', 'active', true, '2025-01-22 22:41:48.892635+00', '2025-01-22 22:41:48.892635+00')
    ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        status = EXCLUDED.status;

    -- Create admin-managed featured services
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
        '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174',
        'Premium Spa Package',
        'Luxurious full-day spa treatment including massage, facial, and body wrap',
        299.99,
        240,
        '24968233-1d17-42d5-b087-e0147d74a840',
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
        '8d0fa00c-f36b-4bc4-b56c-e6d07a0ee174',
        'Wellness Consultation',
        'Comprehensive wellness assessment and personalized treatment plan',
        150.00,
        90,
        '380d854a-d475-4d52-a888-e8dd6bb4d53d',
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
        customer_user_id,
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