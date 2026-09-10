# Multi-Agent Architecture for EU AI Act Compliance Checker

## Overview
This document outlines the multi-agent architecture required to build the MVP specified in `MVP_Spec.md`. The workflow is designed to be executed by an Orchestrator Agent managing a team of specialized subagents.

## 1. Orchestrator Agent (The Tech Lead)
- **Role:** Coordinates the build process, sequences tasks, and delegates to specialized subagents.
- **Responsibilities:**
  - Initialize the Next.js project.
  - Review `docs/MVP_Spec.md` and keep the team aligned.
  - Trigger subagents for specific vertical slices (Database, UI, LLM, Payments) using agentic delegation.
  - Resolve integration issues between subagents (e.g., wiring the Next.js client to the Supabase backend).

## 2. Backend & Auth Agent
- **Role:** Supabase Expert.
- **Responsibilities:**
  - Write SQL migrations for the `reports` table according to the schema.
  - Configure Row Level Security (RLS) for anonymous users.
  - Implement Supabase Auth (Anonymous sign-ins & Email/Password upgrades).
  - Set up `pg_cron` cleanup scripts and Storage bucket configurations.

## 3. Frontend & UI Agent
- **Role:** Next.js & Tailwind UI Developer.
- **Responsibilities:**
  - Build the landing page, result badge, and upsell UI following the Micro-SaaS flow.
  - Implement the PDF report rendering logic using `@react-pdf/renderer`.
  - Handle client-side state, polling for `pdf_ready`, and error boundaries (e.g., LLM safety rejections).
  - Ensure UI disclaimers are visible on the web view.

## 4. LLM Integration Agent
- **Role:** AI & Prompt Engineer.
- **Responsibilities:**
  - Integrate `@google/genai` SDK via Next.js Server Actions.
  - Implement the system prompt with dynamic context (`{{VERIFIED_DATE}}`) based on Act summaries.
  - Enforce strict JSON Schema output for Risk Tier, Rationale, Obligations, and Action Plan.

## 5. Billing & Webhook Agent
- **Role:** Stripe & Resend Integration Specialist.
- **Responsibilities:**
  - Create the Next.js API route to generate the Stripe Payment Intent.
  - Build the Stripe webhook handler to fulfill the PDF (generate PDF, upload to Supabase Storage, send email via Resend).
  - Handle webhook idempotency and extract `receipt_email`.
