-- Table: reports
-- Holds both temporary anonymous reports (for PDF fulfillment) and saved Pro history.

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NULL, -- NULL for anonymous/temporary
    risk_tier TEXT NOT NULL,
    matched_category TEXT NOT NULL,
    matched_article TEXT NOT NULL,
    confidence TEXT NOT NULL,
    rationale TEXT NOT NULL,
    is_saved BOOLEAN DEFAULT FALSE, -- TRUE if it's a Pro user saving history
    expires_at TIMESTAMPTZ -- Used for cleanup of temporary reports
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own saved reports
CREATE POLICY "Users can view own reports" 
ON reports FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Service role (Next.js server) can do everything
-- Note: Anonymous insertions and Stripe webhook reading happen on the server via the service_role key, 
-- bypassing RLS. The frontend never writes/reads this table directly to prevent scraping or tampering.

-- Cleanup mechanism: pg_cron job to delete expired temporary reports every hour
-- (Temporary reports expire after 24 hours to give them time to complete checkout)
SELECT cron.schedule(
    'cleanup-temp-reports',
    '0 * * * *', -- Every hour
    $$ DELETE FROM reports WHERE is_saved = FALSE AND expires_at < NOW() $$
);
