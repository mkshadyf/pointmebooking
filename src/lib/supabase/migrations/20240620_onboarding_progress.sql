-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (business_id, step_number)
);

-- Add comment to the table
COMMENT ON TABLE public.onboarding_progress IS 'Stores business onboarding progress data for each step';

-- Add RLS policies
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policy for selecting onboarding progress
CREATE POLICY select_onboarding_progress ON public.onboarding_progress
    FOR SELECT
    USING (
        -- Business owners can see their own business's onboarding progress
        (auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        ))
        OR
        -- Admins can see all onboarding progress
        (auth.jwt() ->> 'role' = 'admin')
    );

-- Policy for inserting onboarding progress
CREATE POLICY insert_onboarding_progress ON public.onboarding_progress
    FOR INSERT
    WITH CHECK (
        -- Business owners can insert their own business's onboarding progress
        (auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        ))
        OR
        -- Admins can insert any onboarding progress
        (auth.jwt() ->> 'role' = 'admin')
    );

-- Policy for updating onboarding progress
CREATE POLICY update_onboarding_progress ON public.onboarding_progress
    FOR UPDATE
    USING (
        -- Business owners can update their own business's onboarding progress
        (auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        ))
        OR
        -- Admins can update any onboarding progress
        (auth.jwt() ->> 'role' = 'admin')
    )
    WITH CHECK (
        -- Business owners can update their own business's onboarding progress
        (auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        ))
        OR
        -- Admins can update any onboarding progress
        (auth.jwt() ->> 'role' = 'admin')
    );

-- Policy for deleting onboarding progress
CREATE POLICY delete_onboarding_progress ON public.onboarding_progress
    FOR DELETE
    USING (
        -- Business owners can delete their own business's onboarding progress
        (auth.uid() IN (
            SELECT owner_id FROM public.businesses WHERE id = business_id
        ))
        OR
        -- Admins can delete any onboarding progress
        (auth.jwt() ->> 'role' = 'admin')
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_onboarding_progress_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_progress TO authenticated; 