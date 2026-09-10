## Destination

A build-ready spec for the EU AI Act Compliance Checker MVP — detailing the hybrid LLM classification logic, the in-memory text-paste data flow, the Stripe "freemium" paywall model, and the structured PDF report contents.

## Notes

- Regulation: EU AI Act (2024/1689). High-risk obligations formally apply from 2 Aug 2026; Digital Omnibus proposal may push some Annex III dates.
- Tech Stack: Next.js frontend/backend monolith, Supabase (auth/metadata). (Python API was dropped to reduce maintenance).
- V1 constraints: Text paste only, no data persistence by default, single LLM call.
- The "last verified" date and disclaimers must be configurable, not hardcoded into the build.

## Decisions so far

- [1-system-prompt-prototype.md](tickets/1-system-prompt-prototype.md) — Use a dense summary (not raw text) of Art 5/Annex III injected with a `{{VERIFIED_DATE}}` runtime variable to constrain cost/latency and enforce JSON structure.
- [2-paywall-state-management.md](tickets/2-paywall-state-management.md) — Use Option A (Stateful): store LLM JSON output temporarily in Supabase, pass session ID to Stripe, and fulfill the PDF via Stripe webhook.
- [3-pdf-generation-tooling.md](tickets/3-pdf-generation-tooling.md) — Use Next.js with `@react-pdf/renderer` for server-side PDF generation. Dropped the Python API to run everything as a Next.js monolith on Vercel.
- [4-supabase-schema.md](tickets/4-supabase-schema.md) — Single `reports` table for both temp/Pro state. Server-side writes/reads via `service_role`. `pg_cron` deletes unsaved rows after 24h.
- [5-nextjs-ui-flow.md](tickets/5-nextjs-ui-flow.md) — Use Option 3 (Micro-SaaS Upsell): Embedded Stripe checkout, email PDF fulfillment, and an immediate on-page upsell to create a password for a Pro account.

## Not yet specified

*(The fog has cleared. All items are ticketed.)*

## Out of scope

- Deterministic rules engine (V2).
- File uploads for data sources (V1 is text paste only).
- Enterprise sales/certification framing (self-serve, risk-indication aid only).
