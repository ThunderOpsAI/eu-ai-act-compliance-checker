# EU AI Act Compliance Checker: Launch & Business Playbook

**Document Date:** September 24, 2026  
**Application URL:** [https://eu-ai-act-compliance-checker-ten.vercel.app](https://eu-ai-act-compliance-checker-ten.vercel.app)  
**Target Repository:** `ThunderOpsAI/eu-ai-act-compliance-checker`

---

## 1. Executive Status & Infrastructure Overview

The application has been deployed live to production with the following architecture, updated to reflect the V1 zero-retention hybrid classification model:

| Infrastructure Component | Provider / Technology | Status | Configuration Notes |
| :--- | :--- | :--- | :--- |
| **Hosting & Compute** | [Vercel](https://vercel.com) (Next.js 16 App Router) | **Live** | Aliased to production domain with edge middleware. |
| **Database** | [Neon](https://neon.tech) Serverless PostgreSQL | **Active** | Only output metadata (risk tier, matched category, timestamp, optional hash) is persisted. "Save report history" is disabled by default and restricted to an opt-in Pro feature. |
| **Data Handling** | In-Memory RAM Processing | **Active** | UI input is strictly text-paste only for V1, processed in-memory, and raw inputs are immediately discarded to ensure a strict "zero retention" policy. |
| **AI Assessment Engine** | [Google Gemini](https://aistudio.google.com) (`gemini-2.5-flash`) | **Active** | A single LLM call is executed with a system prompt encoding the four risk tiers, the Article 5 prohibited list, and the Annex III category list. It forces structured JSON output containing `risk_tier`, `matched_category`, `matched_article`, `confidence`, and `rationale`. |
| **Dynamic Configuration** | Environment / Server Config | **Active** | Variables for a "last verified against the Act" date and a Digital Omnibus disclaimer are dynamically injected into the system prompt to allow updates without redeploying. |
| **Payment Gateway** | [Stripe](https://stripe.com) (Live Mode) | **Active** | Live Keys (`pk_live_...` / `sk_live_...`) and webhook `whsec_ncdhSZhhM2BeQvrGJx0odxhtDwyGxcol`. |
| **Transactional Email** | [Resend](https://resend.com) | **Active** | API Key configured; requires domain verification before public launch. |

---

## 2. Pre-Launch Operational Checklist (Must-Do Before Driving Traffic)

Before sending paid or public traffic to the application, execute these four operational tasks:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       PRE-LAUNCH ACTION CHECKLIST                          │
├────────────────────────────────────────────────────────────────────────────┤
│ [ ] 1. Verify Custom Domain in Resend (Critical for Public Deliverability) │
│ [ ] 2. Connect a Branded Custom Domain in Vercel                           │
│ [ ] 3. Run a Live $1 – $29 End-to-End Smoke Test Checkout                  │
│ [ ] 4. Enable Analytics (Vercel Web Analytics or PostHog)                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Task 1: Verify Custom Domain in Resend (CRITICAL)
> **Caution:** Your application is currently configured with `RESEND_FROM_EMAIL=onboarding@resend.dev`. Resend's free sandbox strictly restricts outbound email delivery to the single email address registered on your Resend account.

1. Navigate to [resend.com/domains](https://resend.com/domains) and click **Add Domain** (e.g., `euaicomply.com`).
2. Add the 3 generated DNS records (`MX`, `TXT`, and `DKIM`) into your domain registrar (Namecheap, Cloudflare, GoDaddy, etc.).
3. Once verified, update the Vercel environment variable:
   ```bash
   npx vercel env add RESEND_FROM_EMAIL production,preview,development --value "reports@euaicomply.com" --force --yes
   ```

### Task 2: Connect a Branded Custom Domain
B2B tech decision-makers require trust before entering credit card details or describing proprietary AI architectures. A `.vercel.app` subdomain reduces conversion rates by 40–60% for legal tech products.
1. Purchase a dedicated domain (e.g., `euaicomply.com`, `complianceai.eu`, `checkeuaiact.com`).
2. In the Vercel Dashboard under **Settings -> Domains**, add the domain.
3. Update `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` on Vercel to the new custom domain URL.

### Task 3: Conduct a Live End-to-End Smoke Test
Since live Stripe keys are configured:
1. Visit the live site and paste a real or test AI system description into the text field (no file uploads).
2. Confirm the free tier successfully displays the high-level risk tier badge (e.g., *"High Risk — Annex III"*).
3. Complete the Stripe checkout with a live credit card to test the paywall unlock.
4. **Verify downstream pipeline steps:**
   - **Stripe Dashboard:** Confirm the Payment Intent marked as `succeeded`.
   - **Database (Neon):** Confirm output metadata was logged while verifying the raw input prompt was correctly discarded.
   - **Email/UI Delivery:** Confirm the detailed PDF (including the rationale and mitigation steps) is successfully delivered and unlocked.

### Task 4: Enable Analytics & Drop-off Tracking
In your Vercel Project Dashboard, open the **Analytics** tab and enable **Vercel Web Analytics**.

Track two primary funnel metrics:
- **Visitor-to-Free Tier Badge Completion Rate** (Target: > 15%)
- **Assessment-to-Paid PDF Conversion Rate** (Target: 3% – 6%)

---

## 3. Lean Business Plan (Lean Canvas)

### A. The Problem
* **Massive Regulatory Fines:** Violations of Regulation (EU) 2024/1689 incur penalties up to **€35,000,000 or 7% of worldwide annual turnover**.
* **Market Ambiguity:** Startup founders and enterprise CTOs do not know if their LLM agents, chatbots, or vision systems fall into Prohibited, High-Risk (Annex III), Limited, or Minimal categories.
* **Prohibitive Legal Fees:** Boutique tech law firms and GRC consultancies charge $3,000–$10,000 for initial exploratory compliance audits.

### B. The Solution & Unique Value Proposition
* **The Solution:** A two-step hybrid compliance pipeline. Users paste their system description, processed entirely in-memory for complete data privacy. A free check provides top-of-funnel validation via a risk tier badge. A Stripe paywall then unlocks a detailed PDF report.
* **The Core Value Prop (The PDF):** The true value proposition is the PDF's actionability and gap analysis. The document strictly features:
  - The assigned risk tier and rationale, citing the specific matching Article or Annex.
  - The applicable statutory obligations mapped to that tier, drawn from Articles 9–17 and 49 (covering risk management, data governance, technical docs, logging, transparency, human oversight, conformity assessment, and EU database registration).
  - A prioritized checklist of next steps outlining rough timelines and assessment types.
  - A visible disclaimer stating the document is not legal advice.
* **Unique Value Proposition (UVP):** *"A zero-retention, 3-minute instant Annex III EU AI Act classification and prioritized statutory action plan for $29, instead of $5,000 in billable legal hours."*

### C. Revenue Streams & Monetization Tiers

| Tier | Price Point | Deliverable | Target Buyer | Value Driver |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Instant Audit ("Tripwire")** | **$29 – $49** *(one-time)* | Free badge validation, paid unlock for the detailed PDF report containing rationale and mitigation steps. | Early-stage AI startups, indie developers | Immediate proof-of-compliance checklist. Self-liquidates acquisition costs. |
| **Tier 2: Compliance Monitor (SaaS)** | **$99 – $199 / mo** | Cloud dashboard & registry | Scaling AI SaaS, mid-market IT | Up to 10 AI systems monitored, opt-in "save report history", prompt diff tracking. |
| **Tier 3: Legal White-Label** | **$1,500 – $4,999 / yr** | Branded intake portal & PDF exporter | Boutique law firms, GRC consultants | Law firms run initial client diagnostics under their own brand, eliminating manual intake overhead. |

### D. Cost Structure & Unit Economics
* **Google Gemini 2.5 Flash:** ~$0.002 per analysis
* **Neon PostgreSQL Database:** $0 (Free tier covers initial active branching and metadata storage)
* **Vercel Hosting:** $0 (Hobby) / $20/month (Pro tier)
* **Resend:** $0 (Free tier includes 3,000 emails/month)
* **Stripe Transaction Fee:** 2.9% + $0.30 per sale (~$1.14 on a $29 transaction)
* **Gross Profit Margin:** **~95%**

---

## 4. Sales, Distribution & Advertising Strategy

### Where Are We Going to Sell It?
The primary point of sale is **direct web checkout** on your application. B2B legal compliance software does not sell via consumer marketplaces; prospective buyers search online, land directly on your tool, test their system for free to see the risk badge, and purchase using a corporate credit card to access the full mitigation roadmap.

### Do We Need to Advertise?
> **Important:** Do NOT run Google Ads or Meta Ads for this product at launch.
> - **Prohibitive CPC:** Legal and compliance keywords cost $8.00 to $25.00+ per click on Google Search because international law firms bid aggressively on them.
> - **Negative Return at $29:** At $10/click and a healthy 5% conversion rate, you spend $200 in ad clicks to make a single $29 sale.

### The $0 Customer Acquisition Playbook

#### Strategy A: Direct Outbound to Funded European AI Startups
* **Source:** Search Crunchbase or LinkedIn for European AI startups funded in the past 6 months.
* **Contact:** Target Founders, CTOs, and Heads of Product.
* **Message Focus:** Highlight the "zero-retention" privacy guarantee—startups do not want to risk leaking proprietary architecture.

#### Strategy B: The Law Firm & Consultant "Trojan Horse"
* Connect with 15–20 boutique tech lawyers in EU hubs.
* Propose an intake partnership where they send prospective clients to the free tier of the tool to generate the initial technical risk dossier, saving the attorneys hours of manual intake.
* Offer a **25% affiliate commission** on paid PDF unlocks or a white-labeled portal.

#### Strategy C: AI Tool Directory Submissions
Submit the tool to curated directories:
- [Toolify.ai](https://www.toolify.ai)
- [Futurepedia.io](https://www.futurepedia.io)
- [There's An AI For That](https://theresanaiforthat.com)

---

## 5. Mobile App Store Strategy: Why Web-First Wins

| Dimension | Desktop Web App (Current) | Native Mobile App (iOS / Android) |
| :--- | :--- | :--- |
| **B2B User Ergonomics** | **Superior:** Pasting complex prompts, system architectures, and reading 10+ page PDFs occurs on desktop. | **Poor:** Multi-field compliance questionnaires are frustrating on 6-inch screens. |
| **Transaction Fees** | **~2.9% + 30¢ via Stripe** (You keep ~97% of revenue). | **15% – 30% Apple / Google Tax** via mandatory In-App Purchase (IAP). |
| **B2B Invoicing & EU VAT** | **Native:** Supports automated EU B2B reverse-charge invoices. | **Unsupported:** Purchases tied to personal Apple IDs; corporate expense reconciliation fails. |
| **Store Maintenance & Review** | **Instant:** Deploy updates in 30 seconds via Git / Vercel. | **High Overhead:** $99/yr Apple fee, $25 Google fee, weekly app review cycles. |

**Verdict:** Maintain 100% focus on the web app. If a mobile home-screen icon is ever requested, configure a lightweight Progressive Web App (PWA) manifest at zero additional cost.

---

## 6. Immediate 7-Day Launch Execution Roadmap

```
Day 1: Technical Hardening
├─ Add & verify domain in Resend
├─ Attach custom domain in Vercel
└─ Execute live $29 test checkout with real card to test the PDF paywall unlock

Day 2–3: Directory & Social Soft Launch
├─ Submit tool to Toolify.ai, Futurepedia, There's An AI For That
└─ Announce on X / LinkedIn ("Show HN: 3-minute EU AI Act checker, zero data retention")

Day 4–5: Direct Outbound
├─ Identify 50 European seed-stage AI startups on LinkedIn
└─ Send personalized direct message outreach

Day 6–7: Channel Partnerships & Review
├─ Contact 10 boutique tech law firms re: diagnostic intake
└─ Review funnel analytics and conversion rates
```