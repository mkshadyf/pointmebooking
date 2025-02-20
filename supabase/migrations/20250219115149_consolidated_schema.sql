-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, drop existing enum types if they exist
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;

-- Create enum types directly (without the DO block)
CREATE TYPE user_role AS ENUM ('customer', 'business', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE service_status AS ENUM ('active', 'inactive', 'deleted');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create business_categories table
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    business_category_id UUID REFERENCES business_categories(id) ON DELETE CASCADE, -- Ensure cascade delete
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(6),
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    business_category UUID REFERENCES business_categories(id) ON DELETE SET NULL, -- Foreign key to business_categories
    description TEXT,
    location TEXT,
    contact_number VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    contact_email VARCHAR(255),
    website VARCHAR(255),
    avatar_url TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    status user_status NOT NULL DEFAULT 'active',
    onboarding_completed BOOLEAN DEFAULT false,
    verification_attempts INTEGER DEFAULT 0,
    last_verification_attempt TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT profiles_email_key UNIQUE (email),
    CONSTRAINT profiles_verification_attempts_check CHECK (verification_attempts >= 0)
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Reference profiles, not businesses
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL, -- Reference service_categories
    image_url TEXT,
    status service_status NOT NULL DEFAULT 'active',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table *AFTER* the enum
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',  -- Uses the enum
    notes TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    customer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Reference profiles
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT staff_business_user_unique UNIQUE (business_id, user_id)
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Reference profiles
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT schedules_time_check CHECK (start_time < end_time),
    CONSTRAINT schedules_business_staff_day_unique UNIQUE (business_id, staff_id, day_of_week)
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_code VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedules_business_id ON schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

-- Create or replace view for business details (adjust as needed)
CREATE OR REPLACE VIEW business_details AS
SELECT
    p.*,
    COUNT(DISTINCT s.id) as staff_count,
    COUNT(DISTINCT sv.id) as service_count
FROM profiles p
LEFT JOIN staff s ON p.id = s.business_id
LEFT JOIN services sv ON p.id = sv.business_id
WHERE p.role = 'business'
GROUP BY p.id;

-- Create or replace view for service details
CREATE OR REPLACE VIEW service_details AS
SELECT
    s.*,
    p.business_name,
    p.description as business_description,
    p.logo_url as business_logo_url,
    p.email as business_email,
    p.phone as business_phone,
    p.address as business_address,
    p.city as business_city,
    sc.name as category_name,
    sc.icon as category_icon,
    bc.name as business_category_name,
    bc.icon as business_category_icon
FROM services s
LEFT JOIN profiles p ON s.business_id = p.id
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN business_categories bc ON sc.business_category_id = bc.id;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_categories_updated_at
    BEFORE UPDATE ON business_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Add these after creating the tables)

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Services policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone"
    ON public.services FOR SELECT
    USING (true);
CREATE POLICY "Business owners can manage their services"
    ON public.services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'business'
            AND services.business_id = profiles.id
        )
    );

-- Bookings policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = customer_id
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = bookings.business_id
            AND profiles.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (
        auth.uid() = customer_id
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = bookings.business_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Business categories policies
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business categories are viewable by everyone"
    ON business_categories FOR SELECT
    USING (true);
CREATE POLICY "Only admins can modify business categories"
    ON business_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Service categories policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service categories are viewable by everyone"
    ON service_categories FOR SELECT
    USING (true);
CREATE POLICY "Only admins can modify service categories"
    ON service_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Trigger to automatically create a profile when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, email, role, email_verified)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists and is correctly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
