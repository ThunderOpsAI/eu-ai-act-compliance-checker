## Question

**What is the exact Supabase schema for storing temporary reports and the opt-in Pro feature?**

- We decided to use a temporary database to hold LLM output (not raw input) across the Stripe checkout flow.
- We also need to support an opt-in "save history" Pro feature.
- What are the specific tables, columns, and Row Level Security (RLS) policies needed?
- How do we handle cleanup of expired temporary records? (e.g., pg_cron or Edge Functions).

**Type**: `wayfinder:task`
**Assignee**: antigravity
**Blocks**: None

## Resolution

- **Table Design:** A single `reports` table handles both temporary state (for Stripe fulfillment) and persistent history (for Pro users).
- **Columns:** `id`, `user_id` (nullable), LLM fields (`risk_tier`, `rationale`, etc.), `is_saved` (boolean), and `expires_at`.
- **Security (RLS):** Client-side users can only SELECT where `auth.uid() = user_id`. Anonymous insertions and Stripe webhook retrievals are handled entirely server-side in Next.js using the Supabase `service_role` key (bypassing RLS). The frontend cannot read or write anonymous reports, preventing scraping.
- **Cleanup:** A Supabase `pg_cron` schedule runs hourly to `DELETE FROM reports WHERE is_saved = FALSE AND expires_at < NOW()`.
- **Asset:** [supabase-schema-v1.sql](../assets/supabase-schema-v1.sql)

*Status: Closed*
