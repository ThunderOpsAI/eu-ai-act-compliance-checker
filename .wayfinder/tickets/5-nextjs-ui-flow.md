## Question

**What is the exact Next.js UI flow from text paste to PDF delivery?**

- User lands on home page. Are they required to log in to run a free check?
- They paste text into a textarea and click "Check".
- Loading state: Does it show a spinner, or stream a fake progress UI to manage wait times (LLM calls can take 3-10s)?
- Result state: The "Free Tier Badge" is revealed (e.g., "High Risk - Annex III").
- Paywall: They see a blurred PDF preview or a lock icon with a "Pay $X to unlock full rationale & mitigation steps" button.
- Fulfillment: After paying, they land on a success page. Do we show them the PDF directly, or just say "Check your email"?

**Type**: `wayfinder:prototype`
**Assignee**: antigravity
**Blocks**: None

## Resolution

- **Strategy:** Option 3 (The "Micro-SaaS Upsell").
- **Landing:** Open text area, no login required.
- **Result:** Risk Tier badge is shown for free.
- **Checkout:** Embedded Stripe payment element (no redirect) to buy the PDF.
- **Fulfillment & Upsell:** Once payment clears, the PDF is emailed asynchronously (via the webhook), and the UI flips to an upsell screen prompting the user to create a password to convert their session into a Pro account to save history.
- **Asset:** [ui-flow-prototypes.md](../assets/ui-flow-prototypes.md)

*Status: Closed*
