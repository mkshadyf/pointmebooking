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

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create tables using the REST API
    const { error: categoriesError } = await supabase.from('categories').select('*').limit(1);
    if (categoriesError) {
      console.log('Creating categories table...');
      await supabase.rest.from('categories').post({
        body: {
          name: 'CREATE TABLE IF NOT EXISTS categories (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, description TEXT, icon TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL);'
        }
      });
    }

    const { error: servicesError } = await supabase.from('services').select('*').limit(1);
    if (servicesError) {
      console.log('Creating services table...');
      await supabase.rest.from('services').post({
        body: {
          name: 'CREATE TABLE IF NOT EXISTS services (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, category_id UUID REFERENCES categories(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, duration INTEGER NOT NULL, image_url TEXT, is_available BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL)'
        }
      });
    }

    const { error: profilesError } = await supabase.from('profiles').select('*').limit(1);
    if (profilesError) {
      console.log('Creating profiles table...');
      await supabase.rest.from('profiles').post({
        body: {
          name: 'CREATE TABLE IF NOT EXISTS profiles (id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, role TEXT NOT NULL CHECK (role IN (\'business\', \'customer\')), business_name TEXT, description TEXT, location TEXT, contact_number TEXT, working_hours JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL)'
        }
      });
    }

    // Enable RLS
    console.log('Enabling Row Level Security...');
    await supabase.rest.from('categories').post({
      body: {
        name: 'ALTER TABLE categories ENABLE ROW LEVEL SECURITY;'
      }
    });
    await supabase.rest.from('services').post({
      body: {
        name: 'ALTER TABLE services ENABLE ROW LEVEL SECURITY;'
      }
    });
    await supabase.rest.from('profiles').post({
      body: {
        name: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
      }
    });

    // Create RLS policies
    console.log('Creating RLS policies...');
    
    // Profiles policies
    await supabase.rest.from('profiles').post({
      body: {
        name: 'CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);'
      }
    });
    await supabase.rest.from('profiles').post({
      body: {
        name: 'CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);'
      }
    });

    // Services policies
    await supabase.rest.from('services').post({
      body: {
        name: 'CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);'
      }
    });
    await supabase.rest.from('services').post({
      body: {
        name: 'CREATE POLICY "Business owners can insert their own services" ON services FOR INSERT WITH CHECK (auth.uid() = business_id);'
      }
    });
    await supabase.rest.from('services').post({
      body: {
        name: 'CREATE POLICY "Business owners can update their own services" ON services FOR UPDATE USING (auth.uid() = business_id);'
      }
    });
    await supabase.rest.from('services').post({
      body: {
        name: 'CREATE POLICY "Business owners can delete their own services" ON services FOR DELETE USING (auth.uid() = business_id);'
      }
    });

    // Categories policies
    await supabase.rest.from('categories').post({
      body: {
        name: 'CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);'
      }
    });

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
