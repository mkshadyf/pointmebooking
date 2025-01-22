-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES auth.users(id),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    service_id UUID NOT NULL REFERENCES services(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX bookings_business_id_idx ON bookings(business_id);
CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX bookings_service_id_idx ON bookings(service_id);
CREATE INDEX bookings_scheduled_at_idx ON bookings(scheduled_at);
CREATE INDEX bookings_status_idx ON bookings(status);

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow businesses to view their own bookings
CREATE POLICY "businesses_view_own_bookings" ON bookings
    FOR SELECT TO authenticated
    USING (business_id = auth.uid());

-- Allow customers to view their own bookings
CREATE POLICY "customers_view_own_bookings" ON bookings
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

-- Allow businesses to insert bookings for their services
CREATE POLICY "businesses_insert_bookings" ON bookings
    FOR INSERT TO authenticated
    WITH CHECK (business_id = auth.uid());

-- Allow customers to insert bookings
CREATE POLICY "customers_insert_bookings" ON bookings
    FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());

-- Allow businesses to update their own bookings
CREATE POLICY "businesses_update_own_bookings" ON bookings
    FOR UPDATE TO authenticated
    USING (business_id = auth.uid())
    WITH CHECK (business_id = auth.uid());

-- Allow customers to update their own bookings (e.g., cancel)
CREATE POLICY "customers_update_own_bookings" ON bookings
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_updated_at();
