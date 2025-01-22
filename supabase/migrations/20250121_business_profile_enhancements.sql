-- Enhance profiles table with business-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS operating_hours jsonb,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    duration integer NOT NULL,
    price decimal(10,2) NOT NULL,
    category text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create verification_attempts table
CREATE TABLE IF NOT EXISTS verification_attempts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    attempts integer DEFAULT 0,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for services table
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON verification_attempts(user_id);

-- Create RLS policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public services are viewable by everyone"
    ON services FOR SELECT
    USING (active = true);

CREATE POLICY "Users can insert their own services"
    ON services FOR INSERT
    WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update their own services"
    ON services FOR UPDATE
    USING (business_id = auth.uid())
    WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can delete their own services"
    ON services FOR DELETE
    USING (business_id = auth.uid());

-- Create verification_attempts policies
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification attempts"
    ON verification_attempts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own verification attempts"
    ON verification_attempts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own verification attempts"
    ON verification_attempts FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
