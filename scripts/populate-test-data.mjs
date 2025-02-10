import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Test users data
const testUsers = {
  businesses: [
    {
      email: 'spa@test.com',
      password: 'test123456',
      profile: {
        role: 'business',
        business_name: 'Zen Spa & Wellness',
        description: 'Luxury spa treatments and wellness services',
        location: '123 Relaxation Ave, Wellness City',
        contact_number: '+1234567890',
        working_hours: {
          monday: { start: '09:00', end: '20:00', closed: false },
          tuesday: { start: '09:00', end: '20:00', closed: false },
          wednesday: { start: '09:00', end: '20:00', closed: false },
          thursday: { start: '09:00', end: '20:00', closed: false },
          friday: { start: '09:00', end: '21:00', closed: false },
          saturday: { start: '10:00', end: '18:00', closed: false },
          sunday: { start: '10:00', end: '16:00', closed: false }
        },
        business_images: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1'
        ],
        social_media: {
          instagram: '@zenspa',
          facebook: 'zenspawellness',
          website: 'https://zenspa.example.com'
        },
        amenities: ['Parking', 'WiFi', 'Wheelchair Access', 'Credit Cards Accepted']
      },
      services: [
        {
          name: 'Swedish Massage',
          description: '60-minute relaxing massage therapy',
          price: 80.00,
          duration: 60,
          is_available: true,
          category: 'Massage & Bodywork'
        },
        {
          name: 'Deep Tissue Massage',
          description: '90-minute therapeutic massage',
          price: 120.00,
          duration: 90,
          is_available: true,
          category: 'Massage & Bodywork'
        },
        {
          name: 'Facial Treatment',
          description: 'Customized facial for your skin type',
          price: 95.00,
          duration: 60,
          is_available: true,
          category: 'Skincare'
        }
      ]
    },
    {
      email: 'fitness@test.com',
      password: 'test123456',
      profile: {
        role: 'business',
        business_name: 'PowerFit Studio',
        description: 'Professional fitness training and classes',
        location: '456 Fitness Blvd, Health District',
        contact_number: '+1234567891',
        working_hours: {
          monday: { start: '06:00', end: '22:00', closed: false },
          tuesday: { start: '06:00', end: '22:00', closed: false },
          wednesday: { start: '06:00', end: '22:00', closed: false },
          thursday: { start: '06:00', end: '22:00', closed: false },
          friday: { start: '06:00', end: '21:00', closed: false },
          saturday: { start: '08:00', end: '18:00', closed: false },
          sunday: { start: '08:00', end: '16:00', closed: false }
        },
        business_images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f'
        ],
        social_media: {
          instagram: '@powerfitgym',
          facebook: 'powerfitstudio',
          website: 'https://powerfit.example.com'
        },
        amenities: ['Parking', 'Showers', 'Lockers', 'Towel Service', 'Water Station']
      },
      services: [
        {
          name: 'Personal Training Session',
          description: '1-hour personalized workout session',
          price: 65.00,
          duration: 60,
          is_available: true,
          category: 'Fitness Training'
        },
        {
          name: 'Group HIIT Class',
          description: '45-minute high-intensity interval training',
          price: 25.00,
          duration: 45,
          is_available: true,
          category: 'Group Fitness'
        },
        {
          name: 'Yoga Class',
          description: '60-minute yoga session for all levels',
          price: 20.00,
          duration: 60,
          is_available: true,
          category: 'Mind & Body'
        }
      ]
    },
    {
      email: 'salon@test.com',
      password: 'test123456',
      profile: {
        role: 'business',
        business_name: 'Glamour Hair & Beauty',
        description: 'Premium hair and beauty services',
        location: '789 Style Street, Fashion Quarter',
        contact_number: '+1234567892',
        working_hours: {
          monday: { start: '10:00', end: '19:00', closed: false },
          tuesday: { start: '10:00', end: '19:00', closed: false },
          wednesday: { start: '10:00', end: '19:00', closed: false },
          thursday: { start: '10:00', end: '20:00', closed: false },
          friday: { start: '10:00', end: '20:00', closed: false },
          saturday: { start: '09:00', end: '18:00', closed: false },
          sunday: { start: '00:00', end: '00:00', closed: true }
        },
        business_images: [
          'https://images.unsplash.com/photo-1560066984-138dadb4c035',
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f'
        ],
        social_media: {
          instagram: '@glamourbeauty',
          facebook: 'glamourbeauty',
          website: 'https://glamourbeauty.example.com'
        },
        amenities: ['Parking', 'WiFi', 'Refreshments', 'Credit Cards Accepted']
      },
      services: [
        {
          name: 'Haircut & Style',
          description: 'Professional haircut and styling',
          price: 55.00,
          duration: 45,
          is_available: true,
          category: 'Hair Services'
        },
        {
          name: 'Full Color Treatment',
          description: 'Hair coloring with premium products',
          price: 120.00,
          duration: 120,
          is_available: true,
          category: 'Hair Services'
        },
        {
          name: 'Manicure & Pedicure',
          description: 'Luxury nail care treatment',
          price: 75.00,
          duration: 90,
          is_available: true,
          category: 'Nail Services'
        }
      ]
    }
  ],
  customers: [
    {
      email: 'customer1@test.com',
      password: 'test123456',
      profile: {
        role: 'customer',
        full_name: 'John Smith',
        phone_number: '+1234567893',
        preferences: {
          notification_email: true,
          notification_sms: true
        }
      }
    },
    {
      email: 'customer2@test.com',
      password: 'test123456',
      profile: {
        role: 'customer',
        full_name: 'Emma Wilson',
        phone_number: '+1234567894',
        preferences: {
          notification_email: true,
          notification_sms: false
        }
      }
    }
  ]
};

// Create service categories first
async function createServiceCategories() {
  const categories = [
    {
      name: 'Massage & Bodywork',
      description: 'Therapeutic massage and bodywork services',
      icon: 'massage',
    },
    {
      name: 'Skincare',
      description: 'Facial treatments and skincare services',
      icon: 'face',
    },
    {
      name: 'Hair Services',
      description: 'Haircuts, styling, and coloring services',
      icon: 'content_cut',
    },
    {
      name: 'Nail Services',
      description: 'Manicure, pedicure, and nail art services',
      icon: 'spa',
    },
    {
      name: 'Fitness Training',
      description: 'Personal training and fitness coaching',
      icon: 'fitness_center',
    },
    {
      name: 'Group Fitness',
      description: 'Group exercise classes and training',
      icon: 'groups',
    },
    {
      name: 'Mind & Body',
      description: 'Yoga, meditation, and wellness services',
      icon: 'self_improvement',
    },
    {
      name: 'Beauty Services',
      description: 'Makeup, waxing, and other beauty treatments',
      icon: 'face_retouching_natural',
    }
  ];

  // Delete existing categories
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase
    .from('categories')
    .insert(categories);

  if (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
}

// Helper function to get category ID by name
async function getCategoryId(categoryName) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (error) {
    console.error('Error getting category:', error);
    throw error;
  }
  return data.id;
}

// Create a test user and their profile
async function createTestUser(userData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        ...userData.profile,
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    return authData.user;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    throw error;
  }
}

// Create services for a business
async function createServices(businessId, services) {
  try {
    for (const service of services) {
      const categoryId = await getCategoryId(service.category);
      const { error } = await supabase
        .from('services')
        .insert({
          business_id: businessId,
          category_id: categoryId,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          is_available: service.is_available,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Service creation error:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in createServices:', error);
    throw error;
  }
}

// Delete existing test users
// async function  deleteTestUsers() {
//   try {
//     console.log('Deleting existing test users...');
//     const allTestEmails = [...testUsers.businesses, ...testUsers.customers].map(user => user.email);
    
//     // First get all users
//     const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
//     if (listError) {
//       console.error('Error listing users:', listError);
//       throw listError;
//     }

//     // Delete each test user
//     for (const email of allTestEmails) {
//       const user = users.find(u => u.email === email);
//       if (user) {
//         console.log(`Deleting user: ${email}`);
//         // First delete their profile and services
//         await supabase.from('services').delete().eq('business_id', user.id);
//         await supabase.from('profiles').delete().eq('id', user.id);
//         // Then delete the auth user
//         await supabase.auth.admin.deleteUser(user.id);
//       }
//     }
//   } catch (error) {
//     console.error('Error deleting test users:', error);
//     throw error;
//   }
// }

// Main function to populate test data
async function populateTestData() {
  try {
    console.log('Creating service categories...');
    await createServiceCategories();

    console.log('Creating test users...');

    // Create business users and their services
    for (const businessData of testUsers.businesses) {
      console.log(`Creating business: ${businessData.profile.business_name}`);
      const user = await createTestUser(businessData);
      await createServices(user.id, businessData.services);
    }

    // Create customer users
    for (const customerData of testUsers.customers) {
      console.log(`Creating customer: ${customerData.email}`);
      await createTestUser(customerData);
    }

    console.log('\nTest accounts created successfully:');
    console.log('\nBusiness Accounts:');
    testUsers.businesses.forEach(business => {
      console.log(`- ${business.email} (${business.profile.business_name})`);
      console.log(`  Password: ${business.password}`);
    });

    console.log('\nCustomer Accounts:');
    testUsers.customers.forEach(customer => {
      console.log(`- ${customer.email}`);
      console.log(`  Password: ${customer.password}`);
    });
  } catch (error) {
    console.error('Error in populateTestData:', error);
    throw error;
  }
}

// Run the population script
populateTestData()
  .catch(error => {
    console.error('Error populating test data:', error);
    process.exit(1);
  });
