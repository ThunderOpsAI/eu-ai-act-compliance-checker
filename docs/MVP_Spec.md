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
  - **Implicit Auth:** On landing page load (or immediately upon clicking "Submit"), the client calls `supabase.auth.signInAnonymously()` to provision a real `auth.uid()`.
  - The Next.js server calls the LLM, receiving a structured JSON result (Risk Tier, Rationale, Matched Article, Obligations, Action Plan).
  - This JSON result is saved to a `reports` table in Supabase via the Next.js server action using the Supabase service role, explicitly setting the `user_id` to the client's anonymous UID.
  - The client securely polls their own row using standard `auth.uid() = user_id` RLS policies.
  - *Note: Anonymous Sign-ins must be enabled in the Supabase dashboard (Auth -> Providers).*

## 3. UI Flow ("Micro-SaaS Upsell")
1. **Landing:** Open text area. User pastes their AI system prompt/description. *Disclaimer: "Not Legal Advice" is clearly visible here.*
2. **Analysis:** Next.js server action runs the LLM classification. (Includes error boundaries for LLM safety filter rejections or JSON parse failures).
3. **Result:** User sees the Risk Tier badge (e.g., "High Risk - Annex III") for free.
4. **Checkout Initialization:** Before rendering the payment UI, the client requests a Stripe Payment Intent. The server creates it, saves the `stripe_payment_intent_id` to the `reports` row, and returns the `client_secret`.
5. **Checkout:** An embedded Stripe payment element is rendered. Call to action: *"Unlock full PDF report for $X"*. The Stripe element is configured to explicitly capture the user's email address.
6. **Fulfillment:** Payment clears on-page. The client polls Supabase (or uses a Realtime subscription) waiting for the `pdf_ready` flag. Concurrently, the Stripe **webhook** receives the event, extracts the `receipt_email`, looks up the report by `stripe_payment_intent_id`, generates the PDF, uploads it to Supabase Storage, sets `pdf_ready = true` + `paid_at` + `receipt_email`, and emails the PDF via Resend. (Webhook idempotency is enforced by checking if `pdf_ready` is already true).
7. **Upsell:** Once `pdf_ready = true`, the UI flips to a success state/download button. It immediately prompts the user to enter an **Email and Password**. This triggers `supabase.auth.updateUser({ email, password })`, upgrading the anonymous UID to a permanent user account, keeping the report history intact without migration.

## 4. Classification Logic
- **Prompting:** The LLM is given a dense summary of Article 5 (Prohibited) and Annex III (High Risk).
- **Dynamic Context:** A `{{VERIFIED_DATE}}` variable is injected into the system prompt at runtime.
- **Output:** The LLM outputs strictly structured JSON containing `{risk_tier, matched_category, matched_article, confidence, rationale, obligations, action_plan}`.
- **Privacy Enforcement:** The system prompt explicitly instructs the LLM to describe the *function* of the user's system in the `rationale`, avoiding quoting specifics verbatim.
- **Known Gap (V1):** There is currently no rate limiting on the free classification endpoint. For V2, implement an IP-based rate limit.

## 5. PDF Report Contents
The PDF is generated using the LLM's JSON output (which was saved to the DB in Step 2) and contains:
1. **Classification:** Risk tier + LLM rationale, citing the specific Article/Annex match.
2. **Obligations:** Applicable obligations for that tier (LLM-generated in Step 2).
3. **Action Plan:** Prioritized next-steps checklist (LLM-generated in Step 2).
4. **Disclaimer:** "Not legal advice" and "Last verified against the Act on [Date]".

## 6. Database Schema (`reports` table)
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users, Not Null - via anonymous sign-ins)
- `stripe_payment_intent_id` (Text, Nullable, UNIQUE for idempotency)
- `receipt_email` (Text, Nullable - Captured from Stripe webhook)
- `risk_tier` (Text, Check constraint: `Unacceptable | High | Limited | Minimal`)
- `matched_category` (Text)
- `matched_article` (Text)
- `confidence` (Text, Check constraint: `High | Medium | Low`)
- `rationale` (Text)
- `obligations` (JSONB)
- `action_plan` (JSONB)
- `is_saved` (Boolean, default FALSE)
- `expires_at` (Timestamptz)
- `pdf_ready` (Boolean, default FALSE)
- `pdf_storage_path` (Text, Nullable)
- `paid_at` (Timestamptz, Nullable)
- **RLS:** Users can only `SELECT` where `auth.uid() = user_id`.
- **Cleanup:** Hourly `pg_cron` deletes rows where `is_saved = FALSE AND paid_at IS NULL AND expires_at < NOW()`. (Storage bucket lifecycle rules or a unified cron function must handle orphaned PDFs).
- **Known Gap (V1):** Anonymous `auth.users` rows are never cleaned up. For V2, implement a cleanup job for orphaned anonymous users.
