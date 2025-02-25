require('@faker-js/faker');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('business_categories').select('id').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('Supabase connection test failed (catch block):', err);
  }
}

testConnection();

async function seedDatabase() {
  try {
    // --- Business Categories ---
    const { data: existingCategories } = await supabase
      .from('business_categories')
      .select('*');

    let businessCategories = existingCategories;

    if (!existingCategories?.length) {
      const { data, error: businessCategoryError } = await supabase
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
      businessCategories = data;
      console.log('Business categories seeded');
    } else {
      console.log('Business categories already exist, skipping creation');
    }

    // --- Service Categories ---
    const { data: existingServiceCategories } = await supabase
      .from('service_categories')
      .select('*');

    let serviceCategories = existingServiceCategories;

    if (!existingServiceCategories?.length) {
      const { data, error: serviceCategoryError } = await supabase
        .from('service_categories')
        .insert([
          { name: 'Haircuts', business_category_id: businessCategories.find(c => c.name === 'Salon').id, description: 'Various haircut styles.' },
          { name: 'Coloring', business_category_id: businessCategories.find(c => c.name === 'Salon').id, description: 'Hair coloring services.' },
          { name: 'Massages', business_category_id: businessCategories.find(c => c.name === 'Spa').id, description: 'Different massage types.' },
          { name: 'Personal Training', business_category_id: businessCategories.find(c => c.name === 'Fitness').id, description: 'One-on-one training sessions.' },
        ])
        .select();

      if (serviceCategoryError) {
        throw serviceCategoryError;
      }
      serviceCategories = data;
      console.log('Service categories seeded');
    } else {
      console.log('Service categories already exist, skipping creation');
    }

    // --- Services ---
    // Since services require a business_id, we'll use a dummy business ID
    // You may need to adjust this based on your database schema and constraints

    const dummyBusinessId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID

    // Check if the dummy business exists; if not, insert it
    const { data: existingDummyBusiness } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', dummyBusinessId)
      .single();

    if (!existingDummyBusiness) {
      const { error: dummyBusinessError } = await supabase
        .from('businesses')
        .insert({
          id: dummyBusinessId,
          business_category_id: businessCategories.find(c => c.name === 'Salon').id,
          business_profile_id: null, // No profile for now
        });

      if (dummyBusinessError) {
        throw dummyBusinessError;
      }
      console.log('Dummy business seeded');
    } else {
      console.log('Dummy business already exists, skipping creation');
    }

    // Seed services linked to the dummy business
    const { data: existingServices } = await supabase
      .from('services')
      .select('*');

    if (!existingServices?.length) {
      const { error: servicesError } = await supabase
        .from('services')
        .insert([
          {
            business_id: dummyBusinessId,
            name: 'Men\'s Haircut',
            description: 'A classic men\'s haircut.',
            price: 25.0,
            duration: 30,
            category_id: serviceCategories.find(sc => sc.name === 'Haircuts').id,
          },
          {
            business_id: dummyBusinessId,
            name: 'Women\'s Haircut',
            description: 'A stylish women\'s haircut.',
            price: 40.0,
            duration: 45,
            category_id: serviceCategories.find(sc => sc.name === 'Haircuts').id,
          },
          {
            business_id: dummyBusinessId,
            name: 'Hair Coloring',
            description: 'Full hair coloring service.',
            price: 60.0,
            duration: 90,
            category_id: serviceCategories.find(sc => sc.name === 'Coloring').id,
          },
        ]);

      if (servicesError) {
        throw servicesError;
      }
      console.log('Services seeded');
    } else {
      console.log('Services already exist, skipping creation');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 