-- Migration: 20240706_enum_updates.sql
-- Description: Updates enum types with new values
-- Author: PointMe System

-- Start transaction to ensure all changes are applied atomically
BEGIN;

-- =====================================================
-- ENUM ENHANCEMENTS
-- =====================================================

-- Add more granular booking statuses
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'no-show';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'rescheduled';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'in-progress';

-- Add user role enhancements
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'staff';

-- Add service status enhancements
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'archived';

-- Add user status enhancements
ALTER TYPE public.user_status ADD VALUE IF NOT EXISTS 'pending';

-- =====================================================
-- COMMIT CHANGES
-- =====================================================
COMMIT;

-- Use DO block for RAISE NOTICE
DO $$
BEGIN
  RAISE NOTICE 'Enum updates completed successfully';
END $$; 