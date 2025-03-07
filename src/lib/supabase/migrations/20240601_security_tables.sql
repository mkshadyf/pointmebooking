-- Security Tables Migration
-- This migration adds tables for audit logging, two-factor authentication, and account lockouts

-- Create audit_logs table for tracking security and authentication events
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own audit logs
CREATE POLICY view_own_audit_logs ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy for admins to view all audit logs
CREATE POLICY admin_view_all_audit_logs ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy for system to insert audit logs
CREATE POLICY insert_audit_logs ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;

-- Create function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    -- Delete audit logs older than 1 year (adjust retention period as needed)
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run the cleanup function monthly
SELECT cron.schedule(
    'cleanup-audit-logs',
    '0 0 1 * *',  -- At midnight on the first day of each month
    $$SELECT cleanup_old_audit_logs()$$
);

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW audit_logs_summary AS
SELECT
    date_trunc('day', created_at) AS day,
    event_type,
    COUNT(*) AS event_count
FROM
    public.audit_logs
WHERE
    created_at > NOW() - INTERVAL '30 days'
GROUP BY
    day, event_type
ORDER BY
    day DESC, event_count DESC;

-- Grant access to the view
GRANT SELECT ON audit_logs_summary TO authenticated;

-- Create user_2fa table for two-factor authentication
CREATE TABLE IF NOT EXISTS public.user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    totp_secret TEXT NOT NULL,
    backup_codes JSONB,
    enabled BOOLEAN NOT NULL DEFAULT false,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_2fa_user_id_key UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON public.user_2fa(enabled);

-- Enable Row Level Security
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own 2FA data
CREATE POLICY user_2fa_select_policy ON public.user_2fa
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy for users to update their own 2FA data
CREATE POLICY user_2fa_update_policy ON public.user_2fa
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own 2FA data
CREATE POLICY user_2fa_insert_policy ON public.user_2fa
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_2fa TO authenticated;

-- Create function to check if 2FA is enabled for a user
CREATE OR REPLACE FUNCTION is_2fa_enabled(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_enabled BOOLEAN;
BEGIN
    SELECT enabled INTO v_enabled
    FROM public.user_2fa
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(p_user_id UUID, p_count INTEGER DEFAULT 10)
RETURNS JSONB AS $$
DECLARE
    v_codes JSONB;
    v_code TEXT;
    i INTEGER;
BEGIN
    v_codes := '[]'::JSONB;
    
    FOR i IN 1..p_count LOOP
        -- Generate a random 8-character code
        v_code := encode(gen_random_bytes(4), 'hex');
        v_codes := v_codes || jsonb_build_object(
            'code', v_code,
            'used', false
        );
    END LOOP;
    
    -- Update the user's backup codes
    UPDATE public.user_2fa
    SET backup_codes = v_codes,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify a backup code
CREATE OR REPLACE FUNCTION verify_backup_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_backup_codes JSONB;
    v_index INTEGER;
    v_found BOOLEAN := false;
BEGIN
    -- Get the user's backup codes
    SELECT backup_codes INTO v_backup_codes
    FROM public.user_2fa
    WHERE user_id = p_user_id;
    
    -- If no backup codes, return false
    IF v_backup_codes IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check each code
    FOR i IN 0..jsonb_array_length(v_backup_codes) - 1 LOOP
        IF v_backup_codes->i->>'code' = p_code AND (v_backup_codes->i->>'used')::BOOLEAN = false THEN
            v_index := i;
            v_found := true;
            EXIT;
        END IF;
    END LOOP;
    
    -- If code found and not used, mark it as used
    IF v_found THEN
        v_backup_codes := jsonb_set(
            v_backup_codes,
            ARRAY[v_index::text, 'used'],
            'true'::jsonb
        );
        
        UPDATE public.user_2fa
        SET backup_codes = v_backup_codes,
            last_used_at = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_2fa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_2fa_updated_at_trigger
BEFORE UPDATE ON public.user_2fa
FOR EACH ROW
EXECUTE FUNCTION update_user_2fa_updated_at();

-- Create account_lockouts table for tracking failed login attempts and account lockouts
CREATE TABLE IF NOT EXISTS public.account_lockouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL UNIQUE, -- Email or username
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    last_failed_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_lockouts_identifier ON public.account_lockouts(identifier);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON public.account_lockouts(locked_until);

-- Enable Row Level Security
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;

-- Only admins can view account lockouts
CREATE POLICY account_lockouts_select_policy ON public.account_lockouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow the service role to manage lockouts
CREATE POLICY account_lockouts_all_policy ON public.account_lockouts
    USING (true);

-- Create function to check if a user is locked out
CREATE OR REPLACE FUNCTION is_account_locked(p_identifier TEXT)
RETURNS JSONB AS $$
DECLARE
    v_locked_until TIMESTAMPTZ;
    v_is_locked BOOLEAN;
BEGIN
    SELECT locked_until INTO v_locked_until
    FROM public.account_lockouts
    WHERE identifier = p_identifier;
    
    -- Check if locked_until exists and is in the future
    v_is_locked := v_locked_until IS NOT NULL AND v_locked_until > NOW();
    
    RETURN jsonb_build_object(
        'locked', v_is_locked,
        'unlocksAt', v_locked_until
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record a failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login_attempt(p_identifier TEXT)
RETURNS VOID AS $$
BEGIN
    -- Insert or update the record
    INSERT INTO public.account_lockouts (identifier, failed_attempts, last_failed_attempt)
    VALUES (p_identifier, 1, NOW())
    ON CONFLICT (identifier) DO UPDATE
    SET 
        failed_attempts = account_lockouts.failed_attempts + 1,
        last_failed_attempt = NOW();
    
    -- Lock the account if max attempts reached (5 attempts)
    UPDATE public.account_lockouts
    SET locked_until = NOW() + INTERVAL '30 minutes'
    WHERE identifier = p_identifier
    AND failed_attempts >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_identifier TEXT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.account_lockouts
    WHERE identifier = p_identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old lockout records
CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.account_lockouts
    WHERE locked_until IS NULL OR locked_until < NOW();
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'cleanup-expired-lockouts',
    '0 * * * *',  -- Run hourly
    $$SELECT cleanup_expired_lockouts()$$
);

-- Create sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- Add RLS policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own sessions
CREATE POLICY sessions_select_policy ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own sessions
CREATE POLICY sessions_insert_policy ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own sessions
CREATE POLICY sessions_update_policy ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own sessions
CREATE POLICY sessions_delete_policy ON public.sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;

-- Add function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.sessions
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the cleanup function daily
SELECT cron.schedule(
    'cleanup-expired-sessions',
    '0 0 * * *',  -- Run at midnight every day
    $$SELECT cleanup_expired_sessions()$$
);

-- Add trigger to update last_active_at on session update
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_last_active_trigger
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_last_active(); 