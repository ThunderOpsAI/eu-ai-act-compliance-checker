# UI Flow Prototypes

Here are 3 different ways we can structure the user journey from landing page to PDF delivery.

## Option 1: The "Simple Lead Magnet" (Fastest to build)
*Optimizes for the absolute simplest implementation.*

1. **Landing Page:** A massive text area ("Paste your system prompt & use case"). No login required.
2. **Loading State:** A basic spinner: *"Analyzing against EU AI Act (2024/1689)..."* (takes 3-10s).
3. **Result Page:** Shows a clean UI with the Risk Tier Badge (e.g., 🔴 **High Risk - Annex III**). Below it is a blurred-out image of a PDF and a prominent Stripe checkout button: *"Unlock Full Rationale & Compliance Checklist - $49"*.
4. **Stripe Checkout:** User pays.
5. **Success Page:** Redirects to a static success page: *"Success! We're generating your PDF and emailing it to the address you provided at checkout. It should arrive in 2 minutes."*

## Option 2: The "Instant Gratification" (Highest Conversion)
*Optimizes for making the user feel the value of the tool before and immediately after paying.*

1. **Landing Page:** Text area. No login.
2. **Loading State:** A "stepper" UI that changes every 2 seconds to make the wait feel valuable: *"Scanning Article 5 Prohibited list..."* -> *"Checking Annex III High-Risk categories..."* -> *"Drafting mitigation steps..."*.
3. **Result Page:** Shows the Risk Tier Badge **AND** a teaser (e.g., the first 100 characters of the LLM's rationale). Call to action: *"Download the full PDF for $49"*.
4. **Stripe Checkout:** User pays.
5. **Success Page:** Redirects to a `/success?session_id=123` page. This page polls Supabase. As soon as the Stripe webhook fires and marks the row as paid, the Next.js page instantly renders the PDF in the browser using `@react-pdf/renderer` so they can view/download it immediately without waiting for an email. 

## Option 3: The "Micro-SaaS Upsell" (Best for long-term LTV)
*Optimizes for capturing accounts for the "Pro" tier.*

1. **Landing Page:** Text area. No login.
2. **Loading State:** Simple spinner.
3. **Result Page:** Shows the Risk Tier Badge. The call to action is an email input field side-by-side with a Stripe payment element embedded directly on the page (no redirect). 
4. **Stripe Checkout:** They pay directly on the page. 
5. **Success Page:** The page flips to a success state saying *"PDF emailed!"*. Below it, a new CTA appears: *"Want to save this report and run unlimited checks? Set a password to upgrade to the $15/mo Pro plan."* (This turns a one-off buyer into a recurring subscriber by capturing them while their wallet is out).
