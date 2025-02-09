-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- Create enums to match TypeScript types
CREATE TYPE user_role AS ENUM ('customer', 'business', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE service_status AS ENUM ('active', 'inactive', 'deleted');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Update profiles table to match TypeScript interface
ALTER TABLE public.profiles
    ALTER COLUMN role TYPE user_role USING role::user_role,
    ALTER COLUMN status TYPE user_status USING status::user_status,
    ALTER COLUMN email_verified SET DEFAULT false,
    ALTER COLUMN onboarding_completed SET DEFAULT false,
    ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMPTZ,
    ADD CONSTRAINT profiles_verification_attempts_check CHECK (verification_attempts >= 0);

-- Update services table to match TypeScript interface
ALTER TABLE public.services
    ALTER COLUMN status TYPE service_status USING status::service_status,
    ALTER COLUMN is_available SET DEFAULT true,
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update bookings table to match TypeScript interface
ALTER TABLE public.bookings
    ALTER COLUMN status TYPE booking_status USING status::booking_status,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Services policies
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
            AND services.business_id = (
                SELECT id FROM businesses WHERE user_id = auth.uid()
            )
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = customer_id
        OR 
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = bookings.business_id
            AND businesses.user_id = auth.uid()
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
            SELECT 1 FROM businesses
            WHERE businesses.id = bookings.business_id
            AND businesses.user_id = auth.uid()
        )
    );

-- Update functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, email, role, email_verified, status)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 