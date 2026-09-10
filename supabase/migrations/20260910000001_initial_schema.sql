-- ==============================================================================
-- Migration: 20260910000001_initial_schema.sql
-- Description: EU AI Act Compliance Checker - Initial Schema & Storage Setup
-- Tables: public.reports
-- Storage Bucket: compliance-reports (private)
-- Cron: hourly cleanup of expired unpurchased reports
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE NULL,
    receipt_email TEXT NULL,
    risk_tier TEXT NOT NULL CHECK (risk_tier IN ('Unacceptable', 'High', 'Limited', 'Minimal')),
    matched_category TEXT NOT NULL,
    matched_article TEXT NOT NULL,
    confidence TEXT NOT NULL CHECK (confidence IN ('High', 'Medium', 'Low')),
    rationale TEXT NOT NULL,
    obligations JSONB NOT NULL DEFAULT '[]'::jsonb,
    action_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '24 hours'),
    pdf_ready BOOLEAN NOT NULL DEFAULT FALSE,
    pdf_storage_path TEXT NULL,
    paid_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id 
    ON public.reports(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_stripe_payment_intent_id 
    ON public.reports(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_reports_expires_at 
    ON public.reports(expires_at);

-- Partial index to speed up hourly cleanup query
CREATE INDEX IF NOT EXISTS idx_reports_unpurchased_cleanup 
    ON public.reports(expires_at) 
    WHERE is_saved = FALSE AND paid_at IS NULL;

-- 4. Enable Row Level Security (RLS) on public.reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow users (authenticated and anonymous) to view only their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
    ON public.reports
    FOR SELECT
    TO authenticated, anon
    USING (auth.uid() = user_id);

-- Allow users to update their own reports (e.g. marking is_saved = true on account upgrade)
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports"
    ON public.reports
    FOR UPDATE
    TO authenticated, anon
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Note on INSERT: No INSERT policy is granted to authenticated/anon roles.
-- All report creations are performed strictly on the server via Supabase Service Role.

-- 5. Storage Bucket Setup: compliance-reports (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'compliance-reports',
    'compliance-reports',
    FALSE,
    10485760, -- 10MB limit per PDF
    ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies: Allow users to read/download their own PDFs
-- The storage path follows: <user_id>/<report_id>.pdf
DROP POLICY IF EXISTS "Users can read own compliance report PDFs" ON storage.objects;
CREATE POLICY "Users can read own compliance report PDFs"
    ON storage.objects
    FOR SELECT
    TO authenticated, anon
    USING (
        bucket_id = 'compliance-reports'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 6. Cleanup Function & pg_cron Schedule for Expired Unpurchased Reports
CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.reports
    WHERE is_saved = FALSE
      AND paid_at IS NULL
      AND expires_at < NOW();
END;
$$;

-- Schedule hourly cron job if pg_cron is enabled in the database environment
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Remove any previously scheduled job with this name
        PERFORM cron.unschedule('cleanup-expired-reports')
        WHERE EXISTS (
            SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-reports'
        );

        -- Schedule hourly execution at minute 0
        PERFORM cron.schedule(
            'cleanup-expired-reports',
            '0 * * * *',
            'SELECT public.cleanup_expired_reports();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron scheduling skipped: %', SQLERRM;
END;
$$;
