-- Seed service categories
insert into public.service_categories (name, description, icon)
values 
    ('Beauty & Wellness', 'Beauty and wellness services', 'spa'),
    ('Health & Fitness', 'Health and fitness services', 'fitness'),
    ('Professional Services', 'Professional and business services', 'business'),
    ('Home Services', 'Home maintenance and improvement', 'home'),
    ('Education & Training', 'Educational and training services', 'school'),
    ('Events & Entertainment', 'Event planning and entertainment services', 'event'),
    ('Automotive', 'Automotive maintenance and repair services', 'car'),
    ('Pet Services', 'Pet care and grooming services', 'pets');

-- Create a test business user (you'll need to replace 'business_user_id' with an actual user ID)
-- This is commented out because you should create the user through the auth API first
/*
insert into public.profiles (
    id,
    role,
    business_name,
    description,
    location,
    contact_number,
    working_hours
)
values (
    'business_user_id'::uuid,
    'business',
    'Sample Business',
    'A sample business offering various services',
    '123 Business St, City, Country',
    '+1234567890',
    '{"start": "09:00", "end": "17:00"}'::jsonb
);

-- Add some sample services
insert into public.services (
    business_id,
    category_id,
    name,
    description,
    price,
    duration,
    is_available
)
values 
    ('business_user_id'::uuid, (select id from public.service_categories where name = 'Beauty & Wellness' limit 1), 'Massage Therapy', 'Relaxing full body massage', 80.00, 60, true),
    ('business_user_id'::uuid, (select id from public.service_categories where name = 'Beauty & Wellness' limit 1), 'Facial Treatment', 'Rejuvenating facial care', 65.00, 45, true);
*/
