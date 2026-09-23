# EU AI Act Compliance Checker: Launch & Business Playbook

**Document Date:** September 24, 2026  
**Application URL:** [https://eu-ai-act-compliance-checker-ten.vercel.app](https://eu-ai-act-compliance-checker-ten.vercel.app)  
**Target Repository:** `ThunderOpsAI/eu-ai-act-compliance-checker`

---

## 1. Executive Status & Infrastructure Overview

The application has been deployed live to production with the following architecture:

| Infrastructure Component | Provider / Technology | Status | Configuration Notes |
| :--- | :--- | :--- | :--- |
| **Hosting & Compute** | [Vercel](https://vercel.com) (Next.js 16 App Router) | **Live** | Aliased to production domain with edge middleware |
| **Database** | [Neon](https://neon.tech) Serverless PostgreSQL | **Active** | Tables `user`, `session`, `account`, `verification`, and `reports` with lookup indexes |
| **Authentication** | [Better Auth](https://www.better-auth.com) | **Active** | Anonymous session generation & email/password authentication |
| **AI Assessment Engine** | [Google Gemini](https://aistudio.google.com) (`gemini-2.5-flash`) | **Active** | Automated Annex III risk classification and statutory checklist generation |
| **PDF Storage** | [Vercel Blob](https://vercel.com/storage/blob) | **Active** | Dedicated Blob store `store_JvLrwoShv2Eg...` attached |
| **Payment Gateway** | [Stripe](https://stripe.com) (Live Mode) | **Active** | Live Keys (`pk_live_...` / `sk_live_...`) and webhook `whsec_ncdhSZhhM2BeQvrGJx0odxhtDwyGxcol` |
| **Transactional Email** | [Resend](https://resend.com) | **Active** | API Key configured; requires domain verification before public launch |

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
> **Caution:** Your application is currently configured with `RESEND_FROM_EMAIL=onboarding@resend.dev`. Resend's free sandbox **strictly restricts outbound email delivery to the single email address registered on your Resend account**. If an external paying customer completes an audit and enters `jane@mycompany.com`, Resend will return a `403 Forbidden` error.

1. Navigate to [resend.com/domains](https://resend.com/domains) and click **Add Domain** (e.g., `euaicomply.com`).
2. Add the 3 generated DNS records (`MX`, `TXT`, and `DKIM`) into your domain registrar (Namecheap, Cloudflare, GoDaddy, etc.).
3. Once verified, update the Vercel environment variable:
   ```bash
   npx vercel env add RESEND_FROM_EMAIL production,preview,development --value "reports@euaicomply.com" --force --yes
   ```

### Task 2: Connect a Branded Custom Domain
B2B tech decision-makers require trust before entering credit card details or describing proprietary AI architectures. A `.vercel.app` subdomain reduces conversion rates by 40–60% for legal tech products.
1. Purchase a dedicated domain (e.g., `euaicomply.com`, `complianceai.eu`, `checkeuaiact.com`) for ~$10–$15/year.
2. In the Vercel Dashboard under **Settings -> Domains**, add the domain.
3. Update `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` on Vercel to the new custom domain URL.

### Task 3: Conduct a Live End-to-End Smoke Test
Since live Stripe keys are configured:
1. Visit the live site and submit a real or test AI system description (e.g., an automated resume-screening chatbot).
2. Complete the Stripe checkout with a live credit card.
3. **Verify four pipeline steps:**
   - **Stripe Dashboard:** Confirm the Payment Intent marked as `succeeded`.
   - **Stripe Webhook:** Confirm delivery of `payment_intent.succeeded` with HTTP status `200 OK`.
   - **Vercel Blob:** Confirm the PDF uploaded successfully to Blob storage.
   - **Email Inbox:** Confirm receipt of the confirmation email with the compliance PDF attached.

### Task 4: Enable Analytics & Drop-off Tracking
1. In your Vercel Project Dashboard, open the **Analytics** tab and enable **Vercel Web Analytics** (free tier includes 2,500 events/month with 0-config).
2. Track two primary funnel metrics:
   - **Visitor-to-Assessment Completion Rate** (Target: > 15%)
   - **Assessment-to-Paid Report Conversion Rate** (Target: 3% – 6%)

---

## 3. Lean Business Plan (Lean Canvas)

### A. The Problem
* **Massive Regulatory Fines:** Violations of Regulation (EU) 2024/1689 incur penalties up to **€35,000,000 or 7% of worldwide annual turnover**.
* **Market Ambiguity:** Startup founders and enterprise CTOs do not know if their LLM agents, chatbots, or vision systems fall into **Prohibited**, **High-Risk (Annex III)**, **Limited**, or **Minimal** categories.
* **Prohibitive Legal Fees:** Boutique tech law firms and GRC consultancies charge $3,000–$10,000 for initial exploratory compliance audits.

### B. The Solution & Unique Value Proposition
* **The Solution:** A 3-minute self-serve assessment that runs the system description against statutory AI Act articles via Gemini 2.5 Flash, generating a downloadable, 10+ page audit-ready PDF compliance dossier.
* **Unique Value Proposition (UVP):** *"Instant Annex III EU AI Act classification and prioritized statutory action plan in 3 minutes for $29, instead of $5,000 in billable legal hours."*

### C. Revenue Streams & Monetization Tiers

| Tier | Price Point | Deliverable | Target Buyer | Value Driver |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Instant Audit ("Tripwire")** | **$29 – $49** *(one-time)* | Downloadable 10+ page PDF Report | Early-stage AI startups, indie developers | Immediate proof-of-compliance for investors or customers. Self-liquidates acquisition costs. |
| **Tier 2: Compliance Monitor (SaaS)** | **$99 – $199 / mo** | Cloud dashboard & registry | Scaling AI SaaS, mid-market IT | Up to 10 AI systems monitored, versioned re-evaluations, prompt diff tracking, trust page compliance badge. |
| **Tier 3: Legal White-Label** | **$1,500 – $4,999 / yr** | Branded intake portal & PDF exporter | Boutique law firms, GRC consultants | Law firms run initial client diagnostics under their own brand, eliminating manual intake overhead. |

### D. Cost Structure & Unit Economics
* **Google Gemini 2.5 Flash:** ~$0.002 per analysis
* **Neon PostgreSQL:** $0 (Free tier covers ~0.5 GB storage and active branching)
* **Vercel Hosting & Blob:** $0 (Hobby) / $20/month (Pro tier)
* **Resend:** $0 (Free tier includes 3,000 emails/month)
* **Stripe Transaction Fee:** 2.9% + $0.30 per sale (~$1.14 on a $29 transaction)
* **Gross Profit Margin:** **~96%**

---

## 4. Sales, Distribution & Advertising Strategy

### Where Are We Going to Sell It?
The primary point of sale is **direct web checkout** on your application. B2B legal compliance software does not sell via consumer marketplaces; prospective buyers search online, land directly on your tool, test their system, and purchase using a corporate credit card.

### Do We Need to Advertise?
> **Important:** Do NOT run Google Ads or Meta Ads for this product at launch.
> - **Prohibitive CPC:** Legal and compliance keywords (*"EU AI Act compliance"*, *"AI regulatory lawyer"*) cost **$8.00 to $25.00+ per click** on Google Search because international law firms bid aggressively on them.
> - **Negative Return at $29:** At $10/click and a healthy 5% conversion rate, you spend $200 in ad clicks to make a single $29 sale—losing $171 per transaction.
> - **When Ads Make Sense:** Only later, to retarget users who completed the free teaser form, or once you scale the $99/month subscription or $1,500/year enterprise tiers.

### The $0 Customer Acquisition Playbook

#### Strategy A: Direct Outbound to Funded European AI Startups (Fastest Revenue)
1. **Source:** Search Crunchbase or LinkedIn for European AI startups funded in the past 6 months (UK, Germany, France, Netherlands, Sweden).
2. **Contact:** Target Founders, CTOs, and Heads of Product.
3. **Outreach Script (LinkedIn / Email):**
   ```text
   Subject: Quick question re: [Company Name]'s EU AI Act classification

   Hi [First Name],

   Congrats on the recent launch of [Product Name].

   With the EU AI Act's Annex III high-risk enforcement deadlines approaching, most AI teams are struggling to determine whether their architecture triggers mandatory conformity assessments or prohibited classifications.

   We built a fast, 3-minute diagnostic checker that evaluates your system against the statutory articles and generates an audit-ready compliance roadmap:
   https://[your-domain].com

   Thought this might save your team a few thousand dollars in preliminary legal intake fees. Would love your feedback if you run your model through it!

   Best,
   [Your Name]
   ```

#### Strategy B: The Law Firm & Consultant "Trojan Horse"
Boutique IT and privacy law firms charge $300–$600/hour. They reject or waste time on early-stage startups that cannot afford a $10,000 retainer.
1. Connect with 15–20 boutique tech lawyers in EU hubs (Dublin, Berlin, Paris, Amsterdam, Tallinn).
2. Propose an intake partnership:
   > *"We provide an automated EU AI Act intake diagnostic. You can send prospective clients to this link before your consultation to automatically generate their technical risk dossier, saving your attorneys 2 hours of questionnaire intake."*
3. Offer a **25% affiliate commission** on paid reports or offer them a white-labeled intake portal.

#### Strategy C: AI Tool Directory Submissions
Submit the tool to curated directories where founders actively search for AI utilities:
- [Toolify.ai](https://www.toolify.ai)
- [Futurepedia.io](https://www.futurepedia.io)
- [There's An AI For That](https://theresanaiforthat.com)
- [FutureTools.io](https://www.futuretools.io)

---

## 5. Mobile App Store Strategy: Why Web-First Wins

| Dimension | Desktop Web App (Current) | Native Mobile App (iOS / Android) |
| :--- | :--- | :--- |
| **B2B User Ergonomics** | **Superior:** Pasting complex prompts, system architectures, and reading 10+ page PDFs occurs on desktop. | **Poor:** Multi-field compliance questionnaires are frustrating on 6-inch screens. |
| **Transaction Fees** | **~2.9% + 30¢ via Stripe** (You keep ~97% of revenue). | **15% – 30% Apple / Google Tax** via mandatory In-App Purchase (IAP). |
| **B2B Invoicing & EU VAT** | **Native:** Supports automated EU B2B reverse-charge invoices (Directive 2006/112/EC). | **Unsupported:** Purchases tied to personal Apple IDs; corporate expense reconciliation fails. |
| **Store Maintenance & Review** | **Instant:** Deploy updates in 30 seconds via Git / Vercel. | **High Overhead:** $99/yr Apple fee, $25 Google fee, weekly app review cycles, and risk of Guideline 4.2 rejections. |
| **Third-Party Publishing** | **Direct:** Fully owned by your domain. | **Prohibited:** Apple Guideline 4.2.6 explicitly forbids third-party agencies from hosting commercial business apps on their developer accounts. |

**Verdict:** Maintain 100% focus on the web app. If a mobile home-screen icon is ever requested, configure a lightweight Progressive Web App (PWA) manifest at zero additional cost.

---

## 6. Immediate 7-Day Launch Execution Roadmap

```
Day 1: Technical Hardening
├─ Add & verify domain in Resend
├─ Attach custom domain in Vercel
└─ Execute live $29 test checkout with real card

Day 2–3: Directory & Social Soft Launch
├─ Submit tool to Toolify.ai, Futurepedia, There's An AI For That
└─ Announce on X / LinkedIn ("Show HN: 3-minute EU AI Act checker")

Day 4–5: Direct Outbound
├─ Identify 50 European seed-stage AI startups on LinkedIn
└─ Send personalized direct message outreach

Day 6–7: Channel Partnerships & Review
├─ Contact 10 boutique tech law firms re: diagnostic intake
└─ Review funnel analytics and conversion rates
```
