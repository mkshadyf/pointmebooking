-- Migration: 20240310_booking_system_enhancements.sql
-- Description: Enhances booking system database with best practices while preserving data
-- Author: PointMe System

-- Start transaction to ensure all changes are applied atomically
BEGIN;

-- Function to safely add enum values without errors if they already exist
CREATE OR REPLACE FUNCTION add_enum_value(enum_type text, enum_value text)
RETURNS VOID AS $$
BEGIN
    -- Check if the value already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = enum_type
        AND pg_enum.enumlabel = enum_value
    ) THEN
        -- Add the value if it doesn't exist
        EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_type, enum_value);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Handle the case where the value was added concurrently
        RAISE NOTICE 'Enum value "%" already exists in type "%"', enum_value, enum_type;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. ENUM ENHANCEMENTS
-- =====================================================

-- Add more granular booking statuses
SELECT add_enum_value('booking_status', 'no-show');
SELECT add_enum_value('booking_status', 'rescheduled');
SELECT add_enum_value('booking_status', 'in-progress');

-- Add user role enhancements
SELECT add_enum_value('user_role', 'staff');

-- Add service status enhancements
SELECT add_enum_value('service_status', 'draft');
SELECT add_enum_value('service_status', 'archived');

-- Add user status enhancements
SELECT add_enum_value('user_status', 'pending');

-- =====================================================
-- 2. TABLE MODIFICATIONS: Carefully handling existing data
-- =====================================================

-- Handle businesses table enhancements
DO $$ 
BEGIN
    -- Check if owner_profile_id exists and owner_id doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' 
        AND column_name = 'owner_profile_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' 
        AND column_name = 'owner_id'
    ) THEN
        -- Rename column with preserved data
        ALTER TABLE public.businesses RENAME COLUMN owner_profile_id TO owner_id;
        RAISE NOTICE 'Renamed owner_profile_id to owner_id in businesses table';
    END IF;
END $$;

-- Add additional columns to profiles table
DO $$ 
BEGIN
    -- Add onboarding_completed if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' 
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    END IF;
    
    -- Add notification_preferences if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{
            "email": true,
            "sms": false,
            "push": true,
            "reminder_hours": 24
        }'::jsonb;
        RAISE NOTICE 'Added notification_preferences column to profiles table';
    END IF;
    
    -- Add referral tracking if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' 
        AND column_name = 'referral_source'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN referral_source TEXT;
        RAISE NOTICE 'Added referral_source column to profiles table';
    END IF;
    
    -- Add marketing attribution if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' 
        AND column_name = 'utm_data'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN utm_data JSONB;
        RAISE NOTICE 'Added utm_data column to profiles table';
    END IF;
END $$;

-- Enhance booking table with additional fields
DO $$ 
BEGIN
    -- Add cancellation tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'cancellation_reason'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN cancellation_reason TEXT;
        RAISE NOTICE 'Added cancellation_reason column to bookings table';
    END IF;
    
    -- Add who cancelled
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'cancelled_by'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN cancelled_by UUID;
        RAISE NOTICE 'Added cancelled_by column to bookings table';
    END IF;
    
    -- Add staff assignment
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'staff_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN staff_id UUID;
        RAISE NOTICE 'Added staff_id column to bookings table';
    END IF;
    
    -- Add recurring booking support
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'is_recurring'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN is_recurring BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_recurring column to bookings table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'recurrence_pattern'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN recurrence_pattern JSONB;
        RAISE NOTICE 'Added recurrence_pattern column to bookings table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'parent_booking_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN parent_booking_id UUID;
        RAISE NOTICE 'Added parent_booking_id column to bookings table';
    END IF;
END $$;

-- Enhance staff table for better service management
DO $$ 
BEGIN
    -- Add services column for staff
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'staff' 
        AND column_name = 'services'
    ) THEN
        ALTER TABLE public.staff ADD COLUMN services JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added services column to staff table';
    END IF;
    
    -- Add notification preferences for staff
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'staff' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.staff ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added notification_preferences column to staff table';
    END IF;
    
    -- Add calendar sync option
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'staff' 
        AND column_name = 'calendar_sync_enabled'
    ) THEN
        ALTER TABLE public.staff ADD COLUMN calendar_sync_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added calendar_sync_enabled column to staff table';
    END IF;
END $$;

-- Enhance services table with capacity management
DO $$ 
BEGIN
    -- Add capacity management
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'max_capacity'
    ) THEN
        ALTER TABLE public.services ADD COLUMN max_capacity INTEGER DEFAULT 1;
        RAISE NOTICE 'Added max_capacity column to services table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'min_capacity'
    ) THEN
        ALTER TABLE public.services ADD COLUMN min_capacity INTEGER DEFAULT 1;
        RAISE NOTICE 'Added min_capacity column to services table';
    END IF;
    
    -- Add buffer time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'buffer_time_before'
    ) THEN
        ALTER TABLE public.services ADD COLUMN buffer_time_before INTEGER DEFAULT 0;
        RAISE NOTICE 'Added buffer_time_before column to services table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'buffer_time_after'
    ) THEN
        ALTER TABLE public.services ADD COLUMN buffer_time_after INTEGER DEFAULT 0;
        RAISE NOTICE 'Added buffer_time_after column to services table';
    END IF;
END $$;

-- Add payment enhancements
DO $$ 
BEGIN
    -- Add payment method tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN payment_method TEXT;
        RAISE NOTICE 'Added payment_method column to payments table';
    END IF;
    
    -- Add refund tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' 
        AND column_name = 'refunded_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN refunded_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added refunded_amount column to payments table';
    END IF;
    
    -- Add provider fee tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' 
        AND column_name = 'provider_fee'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN provider_fee DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added provider_fee column to payments table';
    END IF;
    
    -- Add tax amount
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added tax_amount column to payments table';
    END IF;
    
    -- Add currency tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN currency TEXT DEFAULT 'USD';
        RAISE NOTICE 'Added currency column to payments table';
    END IF;
END $$;

-- Add device info to sessions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sessions' 
        AND column_name = 'device_info'
    ) THEN
        ALTER TABLE public.sessions ADD COLUMN device_info JSONB;
        RAISE NOTICE 'Added device_info column to sessions table';
    END IF;
END $$;

-- =====================================================
-- 3. CREATE NEW TABLES - Only if they don't exist
-- =====================================================

-- Create booking_history table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'booking_history'
    ) THEN
        CREATE TABLE public.booking_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            booking_id UUID NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            changed_by UUID,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add foreign key constraints with validation
        -- Make sure the booking_id references a valid booking
        ALTER TABLE public.booking_history 
        ADD CONSTRAINT booking_history_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;
        
        -- Make sure changed_by references a valid profile
        ALTER TABLE public.booking_history 
        ADD CONSTRAINT booking_history_changed_by_fkey 
        FOREIGN KEY (changed_by) REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Created booking_history table';
    END IF;
END $$;

-- Create payment_methods table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'payment_methods'
    ) THEN
        CREATE TABLE public.payment_methods (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            customer_id UUID NOT NULL,
            provider TEXT NOT NULL,
            token TEXT,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add foreign key constraint
        ALTER TABLE public.payment_methods 
        ADD CONSTRAINT payment_methods_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Created payment_methods table';
    END IF;
END $$;

-- =====================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS - With validation
-- =====================================================

-- Add foreign key from bookings.cancelled_by to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bookings' 
        AND constraint_name = 'bookings_cancelled_by_fkey'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'cancelled_by'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE cancelled_by IS NOT NULL 
            AND cancelled_by NOT IN (SELECT id FROM public.profiles)
        ) THEN
            -- Update any invalid data to NULL
            UPDATE public.bookings 
            SET cancelled_by = NULL 
            WHERE cancelled_by IS NOT NULL 
            AND cancelled_by NOT IN (SELECT id FROM public.profiles);
            
            RAISE NOTICE 'Reset invalid cancelled_by values to NULL';
        END IF;
        
        -- Add the foreign key constraint
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_cancelled_by_fkey 
        FOREIGN KEY (cancelled_by) REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Added foreign key constraint for bookings.cancelled_by';
    END IF;
END $$;

-- Add foreign key from bookings.staff_id to staff
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bookings' 
        AND constraint_name = 'bookings_staff_id_fkey'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'staff_id'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE staff_id IS NOT NULL 
            AND staff_id NOT IN (SELECT id FROM public.staff)
        ) THEN
            -- Update any invalid data to NULL
            UPDATE public.bookings 
            SET staff_id = NULL 
            WHERE staff_id IS NOT NULL 
            AND staff_id NOT IN (SELECT id FROM public.staff);
            
            RAISE NOTICE 'Reset invalid staff_id values to NULL';
        END IF;
        
        -- Add the foreign key constraint
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES public.staff(id);
        
        RAISE NOTICE 'Added foreign key constraint for bookings.staff_id';
    END IF;
END $$;

-- Add foreign key from bookings.parent_booking_id to bookings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bookings' 
        AND constraint_name = 'bookings_parent_booking_id_fkey'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' 
        AND column_name = 'parent_booking_id'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE parent_booking_id IS NOT NULL 
            AND parent_booking_id NOT IN (SELECT id FROM public.bookings)
        ) THEN
            -- Update any invalid data to NULL
            UPDATE public.bookings 
            SET parent_booking_id = NULL 
            WHERE parent_booking_id IS NOT NULL 
            AND parent_booking_id NOT IN (SELECT id FROM public.bookings);
            
            RAISE NOTICE 'Reset invalid parent_booking_id values to NULL';
        END IF;
        
        -- Add the foreign key constraint
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_parent_booking_id_fkey 
        FOREIGN KEY (parent_booking_id) REFERENCES public.bookings(id);
        
        RAISE NOTICE 'Added foreign key constraint for bookings.parent_booking_id';
    END IF;
END $$;

-- =====================================================
-- 5. ADD INDEXES - For performance optimization
-- =====================================================

-- Add common query indexes
DO $$ 
BEGIN
    -- Index on bookings.date
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND indexname = 'idx_bookings_date'
    ) THEN
        CREATE INDEX idx_bookings_date ON public.bookings(date);
        RAISE NOTICE 'Created index on bookings.date';
    END IF;
    
    -- Index on bookings.customer_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND indexname = 'idx_bookings_customer'
    ) THEN
        CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
        RAISE NOTICE 'Created index on bookings.customer_id';
    END IF;
    
    -- Index on bookings.business_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND indexname = 'idx_bookings_business'
    ) THEN
        CREATE INDEX idx_bookings_business ON public.bookings(business_id);
        RAISE NOTICE 'Created index on bookings.business_id';
    END IF;
    
    -- Index on bookings.status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND indexname = 'idx_bookings_status'
    ) THEN
        CREATE INDEX idx_bookings_status ON public.bookings(status);
        RAISE NOTICE 'Created index on bookings.status';
    END IF;
    
    -- Index on services.business_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'services' 
        AND indexname = 'idx_services_business'
    ) THEN
        CREATE INDEX idx_services_business ON public.services(business_id);
        RAISE NOTICE 'Created index on services.business_id';
    END IF;
    
    -- Index on staff.business_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'staff' 
        AND indexname = 'idx_staff_business'
    ) THEN
        CREATE INDEX idx_staff_business ON public.staff(business_id);
        RAISE NOTICE 'Created index on staff.business_id';
    END IF;
END $$;

-- =====================================================
-- 6. ADD CHECK CONSTRAINTS - For data integrity
-- =====================================================

-- Add constraints for valid booking times
DO $$ 
BEGIN
    -- Constraint to ensure start_time < end_time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bookings' 
        AND constraint_name = 'check_booking_times'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE start_time >= end_time
        ) THEN
            RAISE NOTICE 'WARNING: Some bookings have start_time >= end_time. Constraint not added to avoid breaking existing data.';
        ELSE
            -- Add the check constraint
            ALTER TABLE public.bookings 
            ADD CONSTRAINT check_booking_times 
            CHECK (start_time < end_time);
            
            RAISE NOTICE 'Added check constraint for valid booking times';
        END IF;
    END IF;
END $$;

-- Add constraints for valid schedule times
DO $$ 
BEGIN
    -- Constraint to ensure start_time < end_time in schedules
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'schedules' 
        AND constraint_name = 'check_schedule_times'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE start_time >= end_time
        ) THEN
            RAISE NOTICE 'WARNING: Some schedules have start_time >= end_time. Constraint not added to avoid breaking existing data.';
        ELSE
            -- Add the check constraint
            ALTER TABLE public.schedules 
            ADD CONSTRAINT check_schedule_times 
            CHECK (start_time < end_time);
            
            RAISE NOTICE 'Added check constraint for valid schedule times';
        END IF;
    END IF;
END $$;

-- Add constraints for valid service capacities
DO $$ 
BEGIN
    -- Constraint to ensure min_capacity <= max_capacity
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'min_capacity'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' 
        AND column_name = 'max_capacity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'services' 
        AND constraint_name = 'check_service_capacity'
    ) THEN
        -- First check if we have any data that would violate the constraint
        IF EXISTS (
            SELECT 1 FROM public.services 
            WHERE min_capacity > max_capacity
        ) THEN
            -- Update any invalid data
            UPDATE public.services 
            SET min_capacity = max_capacity 
            WHERE min_capacity > max_capacity;
            
            RAISE NOTICE 'Updated services where min_capacity > max_capacity';
        END IF;
        
        -- Add the check constraint
        ALTER TABLE public.services 
        ADD CONSTRAINT check_service_capacity 
        CHECK (min_capacity <= max_capacity);
        
        RAISE NOTICE 'Added check constraint for valid service capacities';
    END IF;
END $$;

-- =====================================================
-- 7. CREATE HELPFUL VIEWS - For common queries
-- =====================================================

-- Create or replace upcoming_bookings view
DO $$ 
BEGIN
    -- Drop the view if it exists
    DROP VIEW IF EXISTS public.upcoming_bookings;
    
    -- Create the view
    CREATE VIEW public.upcoming_bookings AS
    SELECT 
        b.*,
        p.full_name AS customer_name,
        p.email AS customer_email,
        s.name AS service_name,
        s.duration AS service_duration,
        bus.name AS business_name,
        st.user_id AS staff_user_id
    FROM 
        public.bookings b
        JOIN public.profiles p ON b.customer_id = p.id
        JOIN public.services s ON b.service_id = s.id
        JOIN public.businesses bus ON b.business_id = bus.id
        LEFT JOIN public.staff st ON b.staff_id = st.id
    WHERE 
        b.date >= CURRENT_DATE
        AND b.status IN ('pending', 'confirmed')
    ORDER BY 
        b.date, b.start_time;
    
    RAISE NOTICE 'Created upcoming_bookings view';
END $$;

-- Create or replace business_metrics view
DO $$ 
BEGIN
    -- Drop the view if it exists
    DROP VIEW IF EXISTS public.business_metrics;
    
    -- Create the view
    CREATE VIEW public.business_metrics AS
    SELECT 
        b.id AS business_id,
        b.name AS business_name,
        COUNT(DISTINCT bk.id) AS total_bookings,
        COUNT(DISTINCT CASE WHEN bk.status = 'pending' THEN bk.id END) AS pending_bookings,
        COUNT(DISTINCT CASE WHEN bk.status = 'confirmed' THEN bk.id END) AS confirmed_bookings,
        COUNT(DISTINCT CASE WHEN bk.status = 'cancelled' THEN bk.id END) AS cancelled_bookings,
        COUNT(DISTINCT CASE WHEN bk.status = 'completed' THEN bk.id END) AS completed_bookings,
        COUNT(DISTINCT CASE WHEN bk.status = 'no-show' THEN bk.id END) AS no_show_bookings,
        SUM(CASE WHEN bk.status IN ('completed') THEN COALESCE(bk.total_amount, 0) ELSE 0 END) AS completed_revenue,
        COUNT(DISTINCT bk.customer_id) AS total_customers,
        COUNT(DISTINCT s.id) AS total_services
    FROM 
        public.businesses b
        LEFT JOIN public.bookings bk ON b.id = bk.business_id
        LEFT JOIN public.services s ON b.id = s.business_id
    GROUP BY 
        b.id, b.name;
    
    RAISE NOTICE 'Created business_metrics view';
END $$;

-- =====================================================
-- 8. TRIGGER FUNCTIONS - For automated tracking
-- =====================================================

-- Create trigger function for logging booking status changes
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO booking_history (
            booking_id,
            status,
            notes,
            changed_by
        ) VALUES (
            NEW.id,
            NEW.status,
            CASE 
                WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason 
                ELSE NULL 
            END,
            CASE 
                WHEN NEW.status = 'cancelled' THEN NEW.cancelled_by 
                ELSE NULL 
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for booking status changes
DO $$ 
BEGIN
    -- Check if the booking_history table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'booking_history'
    ) THEN
        -- Drop the trigger if it exists
        DROP TRIGGER IF EXISTS booking_status_change_trigger ON public.bookings;
        
        -- Create the trigger
        CREATE TRIGGER booking_status_change_trigger
        AFTER UPDATE OF status ON public.bookings
        FOR EACH ROW
        EXECUTE FUNCTION log_booking_status_change();
        
        RAISE NOTICE 'Created trigger for tracking booking status changes';
    END IF;
END $$;

-- Create trigger function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DO $$ 
DECLARE
    table_list text[] := ARRAY['bookings', 'businesses', 'profiles', 'services', 'staff', 'payment_methods'];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY table_list LOOP
        -- Check if table exists and has updated_at column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = table_name 
            AND column_name = 'updated_at'
        ) THEN
            -- Drop the trigger if it exists
            EXECUTE format('DROP TRIGGER IF EXISTS %I_update_timestamp ON public.%I', 
                           table_name, table_name);
            
            -- Create the trigger
            EXECUTE format(
                'CREATE TRIGGER %I_update_timestamp
                 BEFORE UPDATE ON public.%I
                 FOR EACH ROW
                 EXECUTE FUNCTION update_timestamp()',
                 table_name, table_name
            );
            
            RAISE NOTICE 'Added auto-update timestamp trigger to % table', table_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- COMMIT CHANGES
-- =====================================================
COMMIT;

RAISE NOTICE 'Migration completed successfully'; 