-- Drop conflicting tables/views if they exist
DROP VIEW IF EXISTS public.businesses;
DROP TABLE IF EXISTS public.service;  -- Looks like a duplicate of services
DROP TABLE IF EXISTS public.service_categories;  -- Will be replaced with categories

-- Create missing tables
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
    business_category VARCHAR(100),
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT profiles_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT staff_business_user_unique UNIQUE (business_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT schedules_time_check CHECK (start_time < end_time),
    CONSTRAINT schedules_business_staff_day_unique UNIQUE (business_id, staff_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_code VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedules_business_id ON schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
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

-- Create view for business details
CREATE OR REPLACE VIEW business_details AS
SELECT 
    b.*,
    p.full_name as owner_name,
    p.email as owner_email,
    p.avatar_url as owner_avatar,
    COUNT(DISTINCT s.id) as staff_count,
    COUNT(DISTINCT sv.id) as service_count
FROM businesses b
LEFT JOIN profiles p ON b.user_id = p.user_id
LEFT JOIN staff s ON b.id = s.business_id
LEFT JOIN services sv ON b.id = sv.business_id
GROUP BY b.id, p.id; 