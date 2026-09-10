"use server";

import { classifySystemPrompt } from '@/lib/gemini/service';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ComplianceReport, Database } from '@/types/database';

export interface AnalyzeComplianceInput {
  systemDescription: string;
  userId: string;
}

export type AnalyzeComplianceResult =
  | { success: true; report: ComplianceReport }
  | { success: false; error: string };

/**
 * Server Action: Analyzes an AI system description against the EU AI Act
 * and saves the classification results to Supabase.
 *
 * CRITICAL PRIVACY ASSURANCE:
 * The raw `systemDescription` is evaluated in-memory only and is NEVER persisted
 * to the database or storage logs. Only the resulting structured compliance report
 * is saved.
 *
 * Supports both signatures:
 * 1. analyzeComplianceAction({ systemDescription, userId })
 * 2. analyzeComplianceAction(systemDescription, userId)
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

    // 4. Prepare structured data for Supabase persistence
    // Retention period: 30 days expiry by default
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const insertPayload: Database['public']['Tables']['reports']['Insert'] = {
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

    // If explicit mock mode is set or Supabase URL/key is unconfigured placeholder
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const isPlaceholderSupabase =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project') ||
      serviceRoleKey === 'your-service-role-key' ||
      serviceRoleKey.includes('placeholder') ||
      process.env.MOCK_SUPABASE === 'true' ||
      process.env.NODE_ENV === 'test';

    if (isPlaceholderSupabase) {
      const mockReport: ComplianceReport = {
        id: `rep_${Math.random().toString(36).substring(2, 12)}`,
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
        created_at: new Date().toISOString(),
      };
      return { success: true, report: mockReport };
    }

    // 5. Persist to Supabase reports table using Admin Client (service role)
    const supabase = createAdminClient();
    const { data, error: dbError } = await supabase
      .from('reports')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertPayload as any)
      .select()
      .single();

    if (dbError) {
      return {
        success: false,
        error: `Failed to save compliance report: ${dbError.message}`,
      };
    }

    return {
      success: true,
      report: data as ComplianceReport,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred during compliance analysis.';
    return {
      success: false,
      error: message,
    };
  }
}
