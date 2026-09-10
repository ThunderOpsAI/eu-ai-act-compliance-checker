## Question

**Which stack/tooling are we using to generate the PDF report?**

- The PDF requires specific sections (Rationale, Obligations, Checklist, Disclaimer).
- Is it generated server-side in the Python API (e.g., ReportLab, WeasyPrint) or in the Next.js frontend (e.g., React-pdf)?

**Type**: `wayfinder:grilling`
**Assignee**: antigravity

## Resolution

- **Strategy:** Next.js with `@react-pdf/renderer`.
- The Stripe webhook will be handled by a Next.js Route Handler, which will read the JSON from Supabase and generate the PDF server-side using React components.
- **Stack Change:** Because Next.js is handling the webhook and PDF, the LLM call will also be moved to Next.js (via standard API routes or server actions). The planned Python API is completely eliminated to reduce hosting costs and maintenance overhead, resulting in a single Next.js monolith.

*Status: Closed*
