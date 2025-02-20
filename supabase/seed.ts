import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as process from 'process';

config(); // Load environment variables from .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is missing.');
  process.exit(1); // Exit the script if environment variables are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

async function seedDatabase() {
  try {
    // --- Business Categories ---
    const { data: businessCategories, error: businessCategoryError } = await supabase
      .from('business_categories')
      .insert([
        { name: 'Restaurant', icon: 'restaurant', description: 'Food and dining establishments.' },
        { name: 'Salon', icon: 'salon', description: 'Hair and beauty services.' },
        { name: 'Spa', icon: 'spa', description: 'Relaxation and wellness services.' },
        { name: 'Fitness', icon: 'fitness', description: 'Gyms and fitness studios.' },
      ])
      .select();

    if (businessCategoryError) {
      throw businessCategoryError;
    }
    console.log('Business categories seeded');

    // --- Admin User ---
    const adminEmail = 'admin@example.com';
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'admin-password', // Use a strong password in a real scenario
      email_confirm: true, // Automatically confirm the email
    });

    if (adminError) {
      throw adminError;
    }

    const { error: adminProfileError } = await supabase.from('profiles').insert({
      id: adminUser.user?.id,
      email: adminEmail,
      role: 'admin',
      email_verified: true,
      onboarding_completed: true, // Admin is fully onboarded
    });

    if (adminProfileError) {
      throw adminProfileError;
    }
    console.log('Admin user seeded');

    // --- Customer User ---
    const customerEmail = 'customer@example.com';
    const { data: customerUser, error: customerError } = await supabase.auth.signUp({
      email: customerEmail,
      password: 'customer-password', // Use a strong password
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, // Use your app's URL
        data: { role: 'customer' },
      },
    });

    if (customerError) {
      throw customerError;
    }

    const { error: customerProfileError } = await supabase.from('profiles').insert({
      id: customerUser.user?.id,
      email: customerEmail,
      role: 'customer',
      email_verified: true, // For testing, auto-verify
      onboarding_completed: false, // Customer onboarding not completed
    });

    if (customerProfileError) {
      throw customerProfileError;
    }
    console.log('Customer user seeded');

    // --- Business User ---
    const businessEmail = 'business@example.com';
    const { data: businessUser, error: businessError } = await supabase.auth.signUp({
      email: businessEmail,
      password: 'business-password', // Use a strong password
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        data: { role: 'business' },
      },
    });

    if (businessError) {
      throw businessError;
    }

    const { error: businessProfileError } = await supabase.from('profiles').insert({
      id: businessUser.user?.id,
      email: businessEmail,
      role: 'business',
      email_verified: true, // Auto-verify for testing
      onboarding_completed: false, // Business onboarding *not* completed initially
    });

    if (businessProfileError) {
      throw businessProfileError;
    }
    console.log('Business user seeded (profile only)');

    // --- Business Profile (for the business user) ---
    const { data: businessProfile, error: insertBusinessProfileError } = await supabase
      .from('business_profiles')
      .insert({
        id: businessUser.user?.id, // Link to the business user's profile
        business_name: faker.company.name(),
        contact_number: faker.phone.number(),
        location: faker.location.streetAddress(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postal_code: faker.location.zipCode(),
        contact_email: businessEmail, // Use the business user's email
        website: faker.internet.url(),
        logo_url: faker.image.urlLoremFlickr({ category: 'business' }), // Example logo URL
      }).select();

    if (insertBusinessProfileError) {
      throw insertBusinessProfileError;
    }
    console.log('Business profile seeded');

    // --- Business (link to category and profile) ---
    const { data: business, error: insertBusinessError } = await supabase.from('businesses').insert({
      id: businessUser.user?.id, // Link to the business user
      business_category_id: businessCategories![0].id, // Use the first category
      business_profile_id: businessProfile![0].id,
    }).select();

    if (insertBusinessError) {
      throw insertBusinessError;
    }
    console.log('Business seeded');

    // --- Services (for the business) ---
    const { data: services, error: servicesError } = await supabase.from('services').insert([
      {
        business_id: business![0].id,
        name: 'Haircut',
        description: 'A standard haircut.',
        price: 25.0,
        duration: 30,
      },
      {
        business_id: business![0].id,
        name: 'Coloring',
        description: 'Hair coloring service.',
        price: 60.0,
        duration: 90,
      },
    ]).select();

    if (servicesError) {
      throw servicesError;
    }
    console.log('Services seeded');

    // --- Operating Hours (for the business) ---
    const { error: operatingHoursError } = await supabase.from('operating_hours').insert([
      { business_id: business![0].id, day_of_week: 1, start_time: '09:00', end_time: '17:00', is_open: true }, // Monday
      { business_id: business![0].id, day_of_week: 2, start_time: '09:00', end_time: '17:00', is_open: true }, // Tuesday
      { business_id: business![0].id, day_of_week: 3, start_time: '09:00', end_time: '17:00', is_open: true }, // Wednesday
      { business_id: business![0].id, day_of_week: 4, start_time: '09:00', end_time: '17:00', is_open: true }, // Thursday
      { business_id: business![0].id, day_of_week: 5, start_time: '09:00', end_time: '17:00', is_open: true }, // Friday
      { business_id: business![0].id, day_of_week: 6, start_time: '10:00', end_time: '15:00', is_open: true }, // Saturday
      { business_id: business![0].id, day_of_week: 0, start_time: '00:00', end_time: '00:00', is_open: false }, // Sunday (closed)
    ]);

    if (operatingHoursError) {
      throw operatingHoursError;
    }
    console.log('Operating hours seeded');

    // --- Bookings (for the customer and business) ---
    const { error: bookingsError } = await supabase.from('bookings').insert([
      {
        customer_id: customerUser.user?.id,
        business_id: business![0].id,
        service_id: services![0].id,
        date: new Date().toISOString(),
        start_time: '10:00',
        end_time: '10:30',
        total_amount: services![0].price,
        status: 'pending',
      },
    ]);

    if (bookingsError) {
      throw bookingsError;
    }
    console.log('Bookings seeded');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 