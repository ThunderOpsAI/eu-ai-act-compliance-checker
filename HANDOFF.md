# Handoff Document: EU AI Act Compliance Checker

## 1. Project Context & Current Status
- **Repository:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript.
- **Application:** EU AI Act Compliance Checker — a micro-SaaS that analyzes user system prompts/descriptions in volatile memory with Google Gemini, assigns a regulatory risk tier for free, and upsells a $29 comprehensive PDF audit report delivered via Stripe and Resend, with in-place anonymous-to-permanent Supabase account upgrading.
- **Verification State:** Architecture and implementation verified against [MVP_Spec.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/docs/MVP_Spec.md) and [AGENTS.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/docs/AGENTS.md). All unit, integration, and Playwright E2E suites passed locally.
- **Current Milestone:** Owner is executing [OWNER_INSTRUCTIONS.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/OWNER_INSTRUCTIONS.md) to provision accounts and deploy to Vercel.

---

## 2. Next Session Objective
Assist the owner with debugging and validating real production services as they transition from local/mock configuration to live third-party integrations:
- Supabase (Auth, RLS, Storage)
- Google Gemini API
- Stripe (Checkout & Webhooks)
- Resend (Transactional Email)
- Vercel Deployment

---

## 3. Key Architectural Files & Reference Map
Do not duplicate code; consult the following files:
- **Deployment Guide:** [OWNER_INSTRUCTIONS.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/OWNER_INSTRUCTIONS.md)
- **Database & Auth:**
  - Migration: [20260910000001_initial_schema.sql](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/supabase/migrations/20260910000001_initial_schema.sql)
  - Supabase Clients: `src/lib/supabase/` (`client.ts`, `server.ts`, `admin.ts`)
  - Auth Helpers: [auth-service.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/lib/auth/auth-service.ts)
- **AI Classification:**
  - Prompts & Schema: [prompts.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/lib/gemini/prompts.ts), [schema.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/lib/gemini/schema.ts)
  - Server Action: [analyze.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/actions/analyze.ts)
- **Payments, PDF & Fulfillment:**
  - Stripe Webhook: [route.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/app/api/webhooks/stripe/route.ts) (uses `@vercel/functions` `waitUntil`)
  - Fulfillment Engine: [fulfillment.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/lib/stripe/fulfillment.ts)
  - Shared PDF Generator: [generator.ts](file:///Users/thunderopsai/Documents/Workspace/01_Projects/eu-ai-act-compliance-checker/src/lib/pdf/generator.ts)
  - Direct Download Route: `src/app/api/reports/[id]/download/route.ts`
- **Tests:**
  - E2E: `tests/compliance-flow.spec.ts`, `tests/payments-fulfillment.spec.ts`
  - Integration: `tests/pdf.test.ts`, `tests/billing.test.ts`, `tests/gemini.test.ts`

---

## 4. Top Debugging Hotspots to Check First

If the user encounters errors during live deployment, check these common points:

1. **Supabase Anonymous Sign-ins:**
   - *Symptom:* `AuthApiError: Anonymous sign-ins are disabled`.
   - *Fix:* Must be enabled in Supabase Dashboard -> Authentication -> Providers -> Anonymous sign-ins.
2. **Stripe Webhook Signature Failure:**
   - *Symptom:* `Webhook signature verification failed: No signatures found matching the expected signature for payload`.
   - *Fix:* Ensure `STRIPE_WEBHOOK_SECRET` in Vercel matches the signing secret (`whsec_...`) from the Stripe endpoint listening to `https://<domain>/api/webhooks/stripe`. Also ensure Vercel was redeployed after updating env vars.
3. **Resend Email Domain Restriction:**
   - *Symptom:* `validation_error: You can only send testing emails to your own email address`.
   - *Fix:* In development/unverified domains, Resend restricts `to` addresses. For production, the user must verify their custom domain in Resend and set `RESEND_FROM_EMAIL`.
4. **Supabase Storage Upload 403/Bucket Not Found:**
   - *Symptom:* PDF upload fails in webhook.
   - *Fix:* Ensure `compliance-reports` bucket exists in Supabase Storage and `SUPABASE_SERVICE_ROLE_KEY` is correctly provided to the server environment.
5. **Vercel Hobby Timeout / Background PDF generation:**
   - Webhook uses `waitUntil()` to avoid the 10s synchronous timeout limit. Ensure `@vercel/functions` is installed and functions run in Node.js serverless runtime.

---

## 5. Suggested Skills for the Next Agent
- `diagnosing-bugs`: For structured root-cause isolation if live API calls or webhooks fail.
- `debug-issue`: For tracing server action or webhook errors across the codebase.
- `chrome-devtools`: For inspecting client-side network requests, Supabase auth cookies, and Stripe Elements iframe loading.
- `modern-web-guidance`: For any Next.js 16 App Router or Server Action troubleshooting.
