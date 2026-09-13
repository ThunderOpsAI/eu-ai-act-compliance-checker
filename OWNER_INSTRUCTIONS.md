# Owner Deployment & Setup Instructions: Getting Online

This guide walks you step-by-step through setting up all third-party services and deploying the **EU AI Act Compliance Checker** to production.

---

## Table of Contents
1. [Overview & Prerequisites](#1-overview--prerequisites)
2. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
3. [Step 2: Supabase (Database, Auth, Storage)](#step-2-supabase-database-auth-storage)
4. [Step 3: Google Gemini API (AI Analysis)](#step-3-google-gemini-api-ai-analysis)
5. [Step 4: Resend (Transactional Email)](#step-4-resend-transactional-email)
6. [Step 5: Stripe (Payments & Webhooks)](#step-5-stripe-payments--webhooks)
7. [Step 6: Vercel (Production Deployment)](#step-6-vercel-production-deployment)
8. [Step 7: Finalize Stripe Production Webhook](#step-7-finalize-stripe-production-webhook)
9. [Step 8: End-to-End Live Verification](#step-8-end-to-end-live-verification)
10. [Environment Variable Reference Cheat Sheet](#10-environment-variable-reference-cheat-sheet)

---

## 1. Overview & Prerequisites

You will need accounts on:
- **[GitHub](https://github.com)** (Code hosting)
- **[Supabase](https://supabase.com)** (PostgreSQL database, anonymous authentication, and PDF storage)
- **[Google AI Studio](https://aistudio.google.com)** (Gemini LLM access)
- **[Resend](https://resend.com)** (Sending transactional PDF emails)
- **[Stripe](https://stripe.com)** (Accepting credit card payments)
- **[Vercel](https://vercel.com)** (Hosting Next.js App Router application)

---

## Step 1: Push Code to GitHub

1. Open your terminal in this project root directory.
2. Check git status:
   ```bash
   git status
   ```
3. If you haven't created a GitHub repository yet:
   - Go to [github.com/new](https://github.com/new).
   - Create a repository named `eu-ai-act-compliance-checker` (Private or Public).
   - Link and push your local branch:
     ```bash
     git remote add origin git@github.com:YOUR_USERNAME/eu-ai-act-compliance-checker.git
     git branch -M main
     git push -u origin main
     ```

---

## Step 2: Supabase (Database, Auth, Storage)

### A. Create a Project
1. Log in to [app.supabase.com](https://app.supabase.com).
2. Click **New Project**.
3. Select your Organization.
4. Set:
   - **Name**: `eu-ai-act-checker`
   - **Database Password**: Enter a strong password and save it in your password manager.
   - **Region**: Choose the region closest to your target audience (e.g. `Frankfurt (eu-central-1)` for EU compliance or `London / N. Virginia`).
5. Click **Create new project** and wait 1–2 minutes for provisioning.

### B. Run the Database Migration
1. In the left navigation menu, click the **SQL Editor** icon (`>_`).
2. Click **New query**.
3. Open the file `supabase/migrations/20260910000001_initial_schema.sql` from your project in your code editor.
4. Copy the entire contents of that file and paste it into the Supabase SQL Editor.
5. Click **Run** (green button or Cmd/Ctrl + Enter).
6. Verify output: It should display `Success. No rows returned`.
   *(This creates the `reports` table, security policies, storage bucket `compliance-reports`, and cron cleanup functions).*

### C. Enable Anonymous Sign-ins (CRITICAL)
1. In the left sidebar, click the **Authentication** icon (person icon).
2. Click **Providers** in the sub-menu.
3. Scroll down to find **Anonymous sign-ins**.
4. Toggle **Enable Anonymous sign-ins** to **ON**.
5. Click **Save**.

### D. Collect Supabase API Keys
1. In the left navigation bar, click the **Project Settings** (gear icon) at the bottom.
2. In the settings sub-menu, click **API**.
3. Copy and save these 3 values:
   - **Project URL**: (e.g., `https://abcdefghijklm.supabase.co`) -> `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys -> anon (public)**: -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API Keys -> service_role (secret)**: *(Click Reveal)* -> `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Google Gemini API (AI Analysis)

1. Go to [aistudio.google.com](https://aistudio.google.com).
2. Sign in with your Google account.
3. In the left sidebar or top bar, click **Get API key**.
4. Click **Create API key** (select a Google Cloud project or create a default one).
5. Copy the generated API key -> `GEMINI_API_KEY`.
6. Note your desired model:
   - Default recommended: `gemini-2.5-flash` or `gemini-1.5-flash` -> `GEMINI_MODEL=gemini-2.5-flash`.

---

## Step 4: Resend (Transactional Email)

1. Go to [resend.com](https://resend.com) and sign in.
2. In the left sidebar, click **API Keys**.
3. Click **Create API Key**.
   - Name: `EU AI Act Production`
   - Permission: `Full access`
4. Copy the key (starts with `re_...`) -> `RESEND_API_KEY`.
5. *(Optional for launch)* Under **Domains**, add and verify your custom sending domain.
   - If using a verified domain: Set `RESEND_FROM_EMAIL=EU AI Act Compliance <compliance@yourdomain.com>`.
   - If in testing before domain verification: You can use `onboarding@resend.dev` (only sends to your account email in test mode).

---

## Step 5: Stripe (Payments & Webhooks)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com).
2. Toggle the **Test mode** switch in the top right to start in Test Mode.
3. In the top navigation, click **Developers** -> **API keys**.
4. Copy:
   - **Publishable key** (`pk_test_...` or `pk_live_...`) -> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...` or `sk_live_...`) -> `STRIPE_SECRET_KEY`

*(Note: We will configure the Webhook Secret in Step 7 after getting your live Vercel URL).*

---

## Step 6: Vercel (Production Deployment)

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** in the top right -> **Project**.
3. In the "Import Git Repository" list, locate your `eu-ai-act-compliance-checker` repository and click **Import**.
4. In the configuration screen:
   - **Framework Preset**: Next.js (detected automatically)
   - **Root Directory**: `./` (leave default)
5. Expand the **Environment Variables** section and add the following variables:

| Key | Value Source | Example / Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings -> API | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings -> API | `eyJhbGciOi...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings -> API | `eyJhbGciOi...` (service_role secret) |
| `GEMINI_API_KEY` | Google AI Studio | `AIzaSy...` |
| `GEMINI_MODEL` | Constant | `gemini-2.5-flash` |
| `STRIPE_SECRET_KEY` | Stripe Developers -> API Keys | `sk_test_...` (or `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Developers -> API Keys | `pk_test_...` (or `pk_live_...`) |
| `REPORT_PRICE_CENTS` | Price in cents | `2900` ($29.00) |
| `RESEND_API_KEY` | Resend API Keys | `re_...` |
| `RESEND_FROM_EMAIL` | Resend Sender | `compliance@yourdomain.com` or `onboarding@resend.dev` |
| `NEXT_PUBLIC_APP_URL` | Temporary Placeholder | Put `https://localhost` for now (we'll update in Step 7) |
| `STRIPE_WEBHOOK_SECRET` | Temporary Placeholder | Put `whsec_placeholder` (we'll update in Step 7) |

6. Click **Deploy**.
7. Wait 1–2 minutes for the build to finish.
8. Once deployed, click **Continue to Dashboard** and copy your deployment domain (e.g., `https://eu-ai-act-compliance-checker.vercel.app` or your custom domain).

---

## Step 7: Finalize Stripe Production Webhook

Now that your app is live with an HTTPS URL:

1. Return to the **[Stripe Dashboard](https://dashboard.stripe.com)**.
2. Click **Developers** -> **Webhooks** in the left menu.
3. Click **Add an endpoint** (or **+ Add destination**).
4. Fill in the details:
   - **Endpoint URL**: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhooks/stripe`
   - **Description**: `Production Next.js Fulfillment Webhook`
   - **Select events to listen to**:
     - `payment_intent.succeeded`
     - `checkout.session.completed`
5. Click **Add endpoint**.
6. On the newly created webhook page, find the **Signing secret** section and click **Reveal**.
7. Copy the signing secret (starts with `whsec_...`).
8. Return to **Vercel**:
   - Go to your Project -> **Settings** -> **Environment Variables**.
   - Edit `STRIPE_WEBHOOK_SECRET` -> Paste your real `whsec_...` value -> Save.
   - Edit `NEXT_PUBLIC_APP_URL` -> Set to `https://YOUR-VERCEL-DOMAIN.vercel.app` -> Save.
9. In Vercel, go to the **Deployments** tab, click the three dots (`...`) on the latest deployment, and click **Redeploy** so the new environment variables take effect.

---

## Step 8: End-to-End Live Verification

1. Open your live Vercel URL in an Incognito / Private browser window.
2. **Test Free Analysis**:
   - Click one of the preset buttons (e.g. *"AI CV Screening"*).
   - Click **Run EU AI Act Compliance Audit**.
   - Verify that within a few seconds, the risk badge renders (e.g. **High Risk - Annex III**) with rationale and obligations teasers.
3. **Test Checkout**:
   - Click to proceed to checkout.
   - Enter your email address and Stripe test card details:
     - Card number: `4242 4242 4242 4242`
     - Exp: Any future date (e.g. `12/28`)
     - CVC: `123`
   - Click **Pay $29.00 & Generate Full Report**.
4. **Test Fulfillment & PDF**:
   - Verify the payment processes and the UI updates to show the download button.
   - Click **Download Official Compliance Audit (PDF)** and verify the generated PDF opens cleanly.
   - Check your email inbox to verify the Resend transactional email arrived with the PDF attachment.
5. **Test Account Upgrade**:
   - On the success screen, fill in an email and password in the account upgrade box.
   - Click **Create Permanent Account**.
   - Verify success message confirming your audit report is permanently linked to your account.

---

## 10. Environment Variable Reference Cheat Sheet

Save a copy of your `.env.local` locally for testing:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
REPORT_PRICE_CENTS=2900

# Resend Configuration
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=compliance@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

*Congratulations! Your EU AI Act Compliance Checker is fully configured and live!*
