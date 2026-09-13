"use server";

import { classifySystemPrompt } from '@/lib/gemini/service';
import { insertReport } from '@/lib/db/reports';
import type { ComplianceReport } from '@/types/database';

export interface AnalyzeComplianceInput {
  systemDescription: string;
  userId: string;
}

export type AnalyzeComplianceResult =
  | { success: true; report: ComplianceReport }
  | { success: false; error: string };

/**
 * Server Action: Analyzes an AI system description against the EU AI Act
 * and saves the classification results to Neon Database.
 *
 * CRITICAL PRIVACY ASSURANCE:
 * The raw `systemDescription` is evaluated in-memory only and is NEVER persisted
 * to the database or storage logs. Only the resulting structured compliance report
 * is saved.
 */
export async function analyzeComplianceAction(
  inputOrDescription: AnalyzeComplianceInput | string,
  optionalUserId?: string
): Promise<AnalyzeComplianceResult> {
  try {
    // 1. Resolve arguments
    let systemDescription = '';
    let userId = '';

    if (typeof inputOrDescription === 'object' && inputOrDescription !== null) {
      systemDescription = inputOrDescription.systemDescription;
      userId = inputOrDescription.userId || optionalUserId || '';
    } else if (typeof inputOrDescription === 'string') {
      systemDescription = inputOrDescription;
      userId = optionalUserId || '';
    }

    // 2. Validate inputs
    if (!systemDescription || typeof systemDescription !== 'string') {
      return {
        success: false,
        error: 'System description is required and must be text.',
      };
    }

    const trimmedDescription = systemDescription.trim();
    if (trimmedDescription.length < 10) {
      return {
        success: false,
        error:
          'System description is too short (minimum 10 characters). Please provide more context regarding system inputs, outputs, and intended purpose.',
      };
    }

    if (trimmedDescription.length > 10000) {
      return {
        success: false,
        error:
          'System description exceeds the maximum allowed length of 10,000 characters.',
      };
    }

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return {
        success: false,
        error: 'User ID is required to associate the compliance report.',
      };
    }

    const cleanUserId = userId.trim();

    // 3. Classify the system in memory via Gemini service
    const classification = await classifySystemPrompt(trimmedDescription);

    // 4. Prepare structured data for persistence
    // Retention period: 30 days expiry by default
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const reportPayload: Omit<ComplianceReport, 'id' | 'created_at'> = {
      user_id: cleanUserId,
      risk_tier: classification.risk_tier,
      matched_category: classification.matched_category,
      matched_article: classification.matched_article,
      confidence: classification.confidence,
      rationale: classification.rationale,
      obligations: classification.obligations,
      action_plan: classification.action_plan,
      is_saved: false,
      expires_at: expiresAt,
      pdf_ready: false,
      stripe_payment_intent_id: null,
      receipt_email: null,
      pdf_storage_path: null,
      paid_at: null,
    };

    // If in test environment without DATABASE_URL
    if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'test') {
      const mockReport: ComplianceReport = {
        id: `rep_${Math.random().toString(36).substring(2, 12)}`,
        ...reportPayload,
        created_at: new Date().toISOString(),
      };
      return { success: true, report: mockReport };
    }

    // 5. Persist to Neon DB
    const savedReport = await insertReport(reportPayload);

    return {
      success: true,
      report: savedReport,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred during compliance analysis.';
    console.error('analyzeComplianceAction error:', err);
    return {
      success: false,
      error: message,
    };
  }
}
