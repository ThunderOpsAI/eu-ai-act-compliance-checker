## Question

**How do we persist the LLM output across the Stripe checkout flow?**

- The raw input is discarded, but if a user pays to unlock the PDF, we need the `rationale` and `matched_article` to generate it.
- Do we store the LLM JSON output in Supabase against an anonymous session ID, pass that session ID to Stripe checkout metadata, and then generate the PDF on the webhook?
- Or do we encrypt the JSON payload into a JWT and pass it in the Stripe checkout session?

**Type**: `wayfinder:grilling`
**Assignee**: antigravity
**Blocks**: Not yet specified (Supabase schema)

## Resolution

- **Strategy:** Option A (Temporary Database). 
- We will store the LLM JSON output (but NOT the raw user prompt/input) in a Supabase table (e.g., `temporary_reports`) keyed by a UUID `session_id`.
- The `session_id` is passed to Stripe Checkout via metadata.
- A Stripe webhook will listen for `checkout.session.completed`, retrieve the JSON by `session_id`, generate the PDF, and handle fulfillment (e.g., emailing it via Resend or generating a signed download link).
- We will need a cleanup mechanism (like a cron job or Supabase edge function) to purge expired temporary reports.

*Status: Closed*
