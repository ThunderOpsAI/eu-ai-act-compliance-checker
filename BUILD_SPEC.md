# EU AI Act Compliance Checker - MVP Spec

## 1. Architecture & Stack
- **Framework:** Next.js (App Router) monolith on Vercel.
- **Database/Auth:** Supabase.
- **Payments:** Stripe (Embedded elements + Webhooks).
- **Email Provider:** Resend.
- **PDF Generation:** `@react-pdf/renderer` (Server-side in Next.js).
- **LLM:** Google Gemini via Next.js server actions. Uses the `@google/genai` SDK (not `@google/generative-ai`). Configured via a `GEMINI_MODEL` env var (e.g., `gemini-3.5-flash`) rather than hardcoding or using `gemini-flash-latest` aliases to prevent unannounced output shifts. Uses `responseMimeType: "application/json"` and a `responseSchema` for strict structured JSON output.

## 2. Data Flow & State Management
- **Input:** Text-paste only (no file uploads for V1).
- **In-Memory Processing:** Raw system prompts and data source descriptions are processed in memory and **never** persisted to the database.
- **State Handoff:**
  - The Next.js server calls the LLM.
  - The LLM returns a structured JSON result (Risk Tier, Rationale, Matched Article, etc.).
  - This JSON result is saved to a `reports` table in Supabase. The Next.js client uses Supabase **Anonymous Sign-ins** (`supabase.auth.signInAnonymously()`) to provision a real `auth.uid()`. This allows the client to securely poll their own row using standard `auth.uid() = user_id` RLS policies. The report-row creation (INSERT) happens in the same Next.js server action that calls the LLM, using the Supabase service role, so the client never inserts directly. *Note: Anonymous Sign-ins must be enabled in the Supabase dashboard (Auth -> Providers).*

## 3. UI Flow ("Micro-SaaS Upsell")
1. **Landing:** Open text area. User pastes their AI system prompt/description.
2. **Analysis:** Next.js server action runs the LLM classification.
3. **Result:** User sees the Risk Tier badge (e.g., "High Risk - Annex III") for free.
4. **Checkout:** An embedded Stripe payment element is rendered below the badge. Call to action: *"Unlock full PDF report for $X"*.
5. **Fulfillment:** Payment clears on-page. The client polls Supabase (or uses a Realtime subscription) waiting for the `pdf_ready` flag. Concurrently, the Stripe **webhook** receives the event, looks up the report by `stripe_payment_intent_id`, generates the PDF, uploads it to Supabase Storage, sets `pdf_ready = true` + `paid_at`, and emails the PDF. Once the client sees `pdf_ready = true`, it flips to a download button.
6. **Upsell:** The UI flips to a success state. It immediately prompts the user to enter a password. This triggers `supabase.auth.updateUser({ password })`, upgrading the anonymous UID to a permanent user account, keeping the report history intact without migration.

## 4. Classification Logic
- **Prompting:** The LLM is given a dense summary of Article 5 (Prohibited) and Annex III (High Risk), rather than the raw 100+ page act. This prevents context bloat and hallucination.
- **Dynamic Context:** A `{{VERIFIED_DATE}}` variable is injected into the system prompt at runtime to handle shifting regulatory timelines (e.g., Digital Omnibus).
- **Output:** The LLM is forced to output strictly structured JSON containing `{risk_tier, matched_category, matched_article, confidence, rationale}`.
- **Privacy Enforcement:** The system prompt explicitly instructs the LLM to describe the *function* of the user's system in the `rationale`, avoiding quoting specifics verbatim from their input. Since the `rationale` is persisted to the DB, it must remain sufficiently abstracted so the claim "we don't store what you paste in" remains entirely true.
- **Known Gap (V1):** There is currently no rate limiting on the free classification endpoint. This leaves the API vulnerable to spamming which incurs real Gemini API costs. For V2, implement a simple IP-based rate limit on the classification endpoint.

## 5. PDF Report Contents
The PDF is generated using the LLM's JSON output and contains:
1. **Classification:** Risk tier + LLM rationale, citing the specific Article/Annex match.
2. **Obligations:** Applicable obligations for that tier pulled from Articles 9–17, 49 (e.g., risk management, transparency, logging).
3. **Action Plan:** Prioritized next-steps checklist (what first, self-assessment vs third-party).
4. **Disclaimer:** "Not legal advice" and "Last verified against the Act on [Date]".

## 6. Database Schema (`reports` table)
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users, Not Null - via anonymous sign-ins)
- `stripe_payment_intent_id` (Text, Nullable, UNIQUE for idempotency)
- `risk_tier` (Text, Check constraint: `Unacceptable | High | Limited | Minimal`)
- `matched_category` (Text)
- `matched_article` (Text)
- `confidence` (Text, Check constraint: `High | Medium | Low`)
- `rationale` (Text)
- `is_saved` (Boolean, default FALSE)
- `expires_at` (Timestamptz)
- `pdf_ready` (Boolean, default FALSE)
- `pdf_storage_path` (Text, Nullable)
- `paid_at` (Timestamptz, Nullable)
- **RLS:** Users can only `SELECT` where `auth.uid() = user_id`. The client NEVER inserts directly; report-row creation happens in the Next.js server action using the service role.
- **Cleanup:** Hourly `pg_cron` deletes rows where `is_saved = FALSE AND paid_at IS NULL AND expires_at < NOW()`. (Note: To prevent orphaned PDFs in Supabase Storage, the cron job must fetch the `pdf_storage_path` and delete the Storage object before deleting the row, or a Storage bucket lifecycle rule must be configured).
- **Known Gap (V1):** Anonymous `auth.users` rows are never cleaned up. Supabase doesn't auto-expire anonymous accounts, so once report rows are deleted, the underlying user record persists. For V2, implement a cleanup job for orphaned anonymous users once the table's growth becomes an issue.
