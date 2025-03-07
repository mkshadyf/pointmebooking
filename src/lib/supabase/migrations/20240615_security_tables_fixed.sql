-- Consolidated Security Tables Migration (Fixed Version)
-- This migration creates and enhances security tables for the PointMe application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Create sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create user_2fa table for two-factor authentication
CREATE TABLE IF NOT EXISTS public.user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    totp_secret TEXT NOT NULL,
    backup_codes JSONB,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create account_lockouts table for tracking failed login attempts
CREATE TABLE IF NOT EXISTS public.account_lockouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active_at ON public.sessions(last_active_at);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_user_id ON public.account_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON public.account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_expires_at ON public.account_lockouts(expires_at);

-- Add function to check if a user's email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_verified BOOLEAN;
BEGIN
  SELECT email_verified INTO v_is_verified
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_is_verified, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to enforce email verification for sensitive operations
CREATE OR REPLACE FUNCTION public.require_verified_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_email_verified(auth.uid()) THEN
    RAISE EXCEPTION 'Email verification required for this operation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to automatically clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.sessions
  SET is_active = FALSE
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skip cron scheduling to avoid errors
-- We'll manually run the cleanup functions periodically

-- Add function to automatically clean up expired account lockouts
CREATE OR REPLACE FUNCTION public.cleanup_expired_lockouts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.account_lockouts
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to record security events in the audit log
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details
  ) VALUES (
    p_event_type,
    auth.uid(),
    COALESCE(request.header('X-Forwarded-For'), request.header('CF-Connecting-IP')),
    request.header('User-Agent'),
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to log password changes
CREATE OR REPLACE FUNCTION public.log_password_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_security_event(
    'password_changed',
    jsonb_build_object('user_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table for password changes
DROP TRIGGER IF EXISTS on_password_change ON auth.users;
CREATE TRIGGER on_password_change
  AFTER UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_password_change();

-- Add function to check if a user has 2FA enabled
CREATE OR REPLACE FUNCTION public.has_2fa_enabled(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_2fa BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_2fa
    WHERE user_id = p_user_id
    AND enabled = TRUE
  ) INTO v_has_2fa;
  
  RETURN COALESCE(v_has_2fa, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get user's active sessions
CREATE OR REPLACE FUNCTION public.get_user_active_sessions(p_user_id UUID)
RETURNS SETOF public.sessions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.sessions
  WHERE user_id = p_user_id
  AND is_active = TRUE
  AND expires_at > NOW()
  ORDER BY last_active_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.sessions
  SET last_active_at = NOW()
  WHERE id = p_session_id
  AND is_active = TRUE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to invalidate all sessions for a user
CREATE OR REPLACE FUNCTION public.invalidate_all_sessions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sessions
  SET is_active = FALSE
  WHERE user_id = p_user_id;
  
  PERFORM public.log_security_event(
    'all_sessions_invalidated',
    jsonb_build_object('user_id', p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to generate backup codes for 2FA
CREATE OR REPLACE FUNCTION public.generate_backup_codes(p_user_id UUID, p_count INTEGER DEFAULT 10)
RETURNS TEXT[] AS $$
DECLARE
  v_codes TEXT[] := '{}';
  v_code TEXT;
  i INTEGER;
BEGIN
  -- Generate random backup codes
  FOR i IN 1..p_count LOOP
    v_code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 8));
    v_codes := array_append(v_codes, v_code);
  END LOOP;
  
  -- Update the user's 2FA record with the new backup codes
  UPDATE public.user_2fa
  SET backup_codes = jsonb_build_object(
    'codes', to_jsonb(v_codes),
    'created_at', to_jsonb(NOW())
  )
  WHERE user_id = p_user_id;
  
  RETURN v_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to verify a backup code
CREATE OR REPLACE FUNCTION public.verify_backup_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_backup_codes JSONB;
  v_codes TEXT[];
  v_new_codes TEXT[];
  v_code TEXT;
  v_found BOOLEAN := FALSE;
BEGIN
  -- Get the user's backup codes
  SELECT backup_codes INTO v_backup_codes
  FROM public.user_2fa
  WHERE user_id = p_user_id
  AND enabled = TRUE;
  
  -- If no backup codes exist, return false
  IF v_backup_codes IS NULL OR v_backup_codes->'codes' IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Convert JSONB array to text array
  SELECT array_agg(value::text)
  INTO v_codes
  FROM jsonb_array_elements_text(v_backup_codes->'codes');
  
  -- Check if the provided code exists in the backup codes
  FOREACH v_code IN ARRAY v_codes
  LOOP
    IF v_code = UPPER(p_code) THEN
      v_found := TRUE;
    ELSE
      v_new_codes := array_append(v_new_codes, v_code);
    END IF;
  END LOOP;
  
  -- If code was found, update the backup codes to remove the used code
  IF v_found THEN
    UPDATE public.user_2fa
    SET 
      backup_codes = jsonb_build_object(
        'codes', to_jsonb(v_new_codes),
        'created_at', v_backup_codes->'created_at',
        'last_used', to_jsonb(NOW())
      ),
      last_used_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN v_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update the updated_at timestamp for user_2fa
CREATE OR REPLACE FUNCTION public.update_user_2fa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_2fa table
DROP TRIGGER IF EXISTS update_user_2fa_updated_at_trigger ON public.user_2fa;
CREATE TRIGGER update_user_2fa_updated_at_trigger
  BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_2fa_updated_at();

-- Enable Row Level Security on all security tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the audit_logs table
CREATE POLICY audit_logs_select_policy ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for the sessions table
CREATE POLICY sessions_select_policy ON public.sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY sessions_insert_policy ON public.sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY sessions_update_policy ON public.sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY sessions_delete_policy ON public.sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add RLS policies for the account_lockouts table
CREATE POLICY account_lockouts_select_policy ON public.account_lockouts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for the user_2fa table
CREATE POLICY user_2fa_select_policy ON public.user_2fa
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_2fa_insert_policy ON public.user_2fa
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_2fa_update_policy ON public.user_2fa
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_2fa_delete_policy ON public.user_2fa
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_2fa TO authenticated;
GRANT SELECT ON public.account_lockouts TO authenticated; 