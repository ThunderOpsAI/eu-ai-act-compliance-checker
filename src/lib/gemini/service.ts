import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt, formatUserPrompt } from './prompts';
import {
  complianceChecklistGenAiSchema,
  complianceChecklistZodSchema,
  CHECKLIST_METADATA,
  type ComplianceChecklist,
  type ClassificationResult,
  type RiskTier,
  type ConfidenceLevel,
} from './schema';
import {
  evaluateComplianceChecklist,
  normalizeChecklist,
} from '@/lib/rules/engine';

export type { ClassificationResult, RiskTier, ConfidenceLevel };

/**
 * Checks if mock Gemini mode is active (due to explicit env or missing/placeholder API key).
 */
export function isMockGeminiEnabled(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  const isPlaceholderKey =
    !apiKey ||
    apiKey === 'your-gemini-api-key' ||
    apiKey.startsWith('placeholder') ||
    apiKey.trim() === '';

  return process.env.MOCK_GEMINI === 'true' || isPlaceholderKey;
}

/**
 * Extracts a statutory boolean checklist deterministically from input text based on regulatory triggers.
 * Used for testing, offline evaluation, and fallback mock mode with 100% parity to the live engine.
 */
export function extractMockChecklist(inputPrompt: string): ComplianceChecklist {
  const normalized = inputPrompt.toLowerCase();
  const checklist = {} as Record<keyof ComplianceChecklist, boolean>;
  const allKeys = Object.keys(CHECKLIST_METADATA) as (keyof ComplianceChecklist)[];
  for (const k of allKeys) {
    checklist[k] = false;
  }

  // =========================================================================
  // Article 5: Prohibited Practices
  // =========================================================================
  if (normalized.includes('subliminal') || normalized.includes('manipulat')) {
    checklist.article_5_subliminal_manipulation = true;
  }
  if (
    normalized.includes('vulnerability exploitation') ||
    normalized.includes('exploit children') ||
    normalized.includes('exploit elderly') ||
    normalized.includes('exploit disability')
  ) {
    checklist.article_5_vulnerability_exploitation = true;
  }
  if (normalized.includes('social scoring') || normalized.includes('social score')) {
    checklist.article_5_social_scoring = true;
  }
  if (
    normalized.includes('predict criminal offense') ||
    normalized.includes('pre-crime') ||
    normalized.includes('predict crime') ||
    normalized.includes('criminal risk profiling')
  ) {
    checklist.article_5_criminal_risk_profiling = true;
  }
  if (
    normalized.includes('facial scraping') ||
    normalized.includes('untargeted scraping') ||
    normalized.includes('cctv scraping')
  ) {
    checklist.article_5_untargeted_facial_scraping = true;
  }
  if (
    normalized.includes('emotion recognition in workplace') ||
    normalized.includes('emotion recognition in school') ||
    normalized.includes('workplace emotion') ||
    normalized.includes('classroom emotion')
  ) {
    checklist.article_5_workplace_education_emotion_recognition = true;
  }
  if (
    normalized.includes('racial categorization') ||
    normalized.includes('political biometric') ||
    normalized.includes('sexual orientation biometric') ||
    normalized.includes('biometric categorization sensitive')
  ) {
    checklist.article_5_biometric_categorization_sensitive = true;
  }
  if (
    normalized.includes('real-time remote biometric') ||
    normalized.includes('public biometric identification') ||
    normalized.includes('cctv facial recognition')
  ) {
    checklist.article_5_real_time_remote_biometric_enforcement = true;
  }

  // =========================================================================
  // Annex III: High-Risk AI Systems
  // =========================================================================

  // Category 1: Biometrics
  if (
    normalized.includes('remote biometric') ||
    normalized.includes('facial recognition') ||
    normalized.includes('biometric identification')
  ) {
    if (!checklist.article_5_real_time_remote_biometric_enforcement) {
      checklist.annex_iii_biometrics_remote_identification = true;
    }
  }
  if (
    normalized.includes('biometric categorization') &&
    !checklist.article_5_biometric_categorization_sensitive
  ) {
    checklist.annex_iii_biometrics_categorization = true;
  }
  if (
    (normalized.includes('emotion recognition') || normalized.includes('face emotion')) &&
    !checklist.article_5_workplace_education_emotion_recognition
  ) {
    checklist.annex_iii_biometrics_emotion_recognition = true;
  }

  // Category 2: Critical Infrastructure
  if (
    normalized.includes('critical infrastructure') ||
    normalized.includes('traffic control') ||
    normalized.includes('water supply') ||
    normalized.includes('power grid') ||
    normalized.includes('gas distribution') ||
    normalized.includes('electricity grid')
  ) {
    checklist.annex_iii_critical_infrastructure_safety_components = true;
  }

  // Category 3: Education
  if (
    normalized.includes('admission') ||
    normalized.includes('assign student') ||
    normalized.includes('school application') ||
    normalized.includes('university entrance')
  ) {
    checklist.annex_iii_education_admission_assignment = true;
  }
  if (
    normalized.includes('student evaluation') ||
    normalized.includes('grading test') ||
    normalized.includes('learning outcome') ||
    normalized.includes('assess student')
  ) {
    checklist.annex_iii_education_learning_evaluation = true;
  }
  if (
    normalized.includes('education level') ||
    normalized.includes('vocational placement') ||
    normalized.includes('education assessment')
  ) {
    checklist.annex_iii_education_level_assessment = true;
  }
  if (
    normalized.includes('exam proctoring') ||
    normalized.includes('cheating detection') ||
    normalized.includes('proctoring') ||
    normalized.includes('behavior during test')
  ) {
    checklist.annex_iii_education_behavior_monitoring = true;
  }

  // Category 4: Employment
  if (
    normalized.includes('cv') ||
    normalized.includes('resume') ||
    normalized.includes('hiring') ||
    normalized.includes('recruitment') ||
    normalized.includes('job applicant') ||
    normalized.includes('screening candidate') ||
    normalized.includes('candidate selection')
  ) {
    checklist.annex_iii_employment_recruitment_screening = true;
  }
  if (
    normalized.includes('promotion') ||
    normalized.includes('task allocation') ||
    normalized.includes('worker monitoring') ||
    normalized.includes('performance evaluation') ||
    normalized.includes('workplace decision') ||
    normalized.includes('fire employee') ||
    normalized.includes('terminate employee')
  ) {
    checklist.annex_iii_employment_workplace_decisions = true;
  }

  // Category 5: Essential Services
  if (
    normalized.includes('public assistance') ||
    normalized.includes('social welfare benefit') ||
    normalized.includes('housing benefit')
  ) {
    checklist.annex_iii_essential_services_public_benefits = true;
  }
  if (
    normalized.includes('creditworthiness') ||
    normalized.includes('credit score') ||
    normalized.includes('credit scoring') ||
    normalized.includes('loan underwriting')
  ) {
    checklist.annex_iii_essential_services_credit_scoring = true;
  }
  if (
    normalized.includes('emergency dispatch') ||
    normalized.includes('emergency call') ||
    normalized.includes('911 dispatch') ||
    normalized.includes('112 dispatch') ||
    normalized.includes('ambulance dispatch')
  ) {
    checklist.annex_iii_essential_services_emergency_dispatch = true;
  }
  if (
    normalized.includes('life insurance') ||
    normalized.includes('health insurance') ||
    normalized.includes('insurance underwriting') ||
    normalized.includes('insurance pricing')
  ) {
    checklist.annex_iii_essential_services_health_life_insurance = true;
  }

  // Category 6: Law Enforcement
  if (
    normalized.includes('victim risk') ||
    normalized.includes('risk of victim')
  ) {
    checklist.annex_iii_law_enforcement_victim_risk_assessment = true;
  }
  if (
    normalized.includes('polygraph') ||
    normalized.includes('lie detector')
  ) {
    checklist.annex_iii_law_enforcement_polygraph = true;
  }
  if (
    normalized.includes('evidence reliability') ||
    normalized.includes('reliability of evidence')
  ) {
    checklist.annex_iii_law_enforcement_evidence_reliability = true;
  }
  if (
    normalized.includes('offending risk') ||
    normalized.includes('reoffending')
  ) {
    checklist.annex_iii_law_enforcement_offending_risk_profiling = true;
  }
  if (
    normalized.includes('criminal profiling') ||
    normalized.includes('law enforcement profiling')
  ) {
    checklist.annex_iii_law_enforcement_criminal_profiling = true;
  }

  // Category 7: Migration
  if (normalized.includes('border polygraph')) {
    checklist.annex_iii_migration_polygraph = true;
  }
  if (
    normalized.includes('border control') ||
    normalized.includes('migration risk') ||
    normalized.includes('irregular entry') ||
    normalized.includes('border security')
  ) {
    checklist.annex_iii_migration_risk_assessment = true;
  }
  if (
    normalized.includes('document verification') ||
    normalized.includes('passport verification') ||
    normalized.includes('travel document') ||
    normalized.includes('fake id detection')
  ) {
    checklist.annex_iii_migration_document_verification = true;
  }
  if (
    normalized.includes('asylum application') ||
    normalized.includes('visa evaluation') ||
    normalized.includes('residence permit') ||
    normalized.includes('asylum examination')
  ) {
    checklist.annex_iii_migration_asylum_examination = true;
  }

  // Category 8: Justice & Democracy
  if (
    normalized.includes('court') ||
    normalized.includes('judge') ||
    normalized.includes('sentencing') ||
    normalized.includes('dispute resolution') ||
    normalized.includes('judicial')
  ) {
    checklist.annex_iii_justice_judicial_assistance = true;
  }
  if (
    normalized.includes('election') ||
    normalized.includes('referendum') ||
    normalized.includes('voting behavior') ||
    normalized.includes('voter influencing')
  ) {
    checklist.annex_iii_justice_election_influencing = true;
  }

  // =========================================================================
  // Article 50: Limited Risk
  // =========================================================================
  if (
    normalized.includes('chatbot') ||
    normalized.includes('conversational') ||
    normalized.includes('virtual assistant') ||
    normalized.includes('voice assistant') ||
    normalized.includes('customer service bot') ||
    normalized.includes('support agent')
  ) {
    checklist.article_50_conversational_chatbot = true;
  }
  if (
    normalized.includes('deepfake') ||
    normalized.includes('synthetic media') ||
    normalized.includes('generate image') ||
    normalized.includes('generate video') ||
    normalized.includes('generate audio') ||
    normalized.includes('generative ai') ||
    normalized.includes('voice clone') ||
    normalized.includes('avatar')
  ) {
    checklist.article_50_synthetic_media_deepfakes = true;
  }
  if (
    normalized.includes('emotion notice') ||
    normalized.includes('biometric notice') ||
    (normalized.includes('emotion') &&
      !checklist.article_5_workplace_education_emotion_recognition &&
      !checklist.annex_iii_biometrics_emotion_recognition)
  ) {
    checklist.article_50_emotion_biometric_notice = true;
  }

  return checklist;
}

/**
 * Deterministic, intelligent mock classifier for testing and environments without an API key.
 * Extracts boolean checklist via deterministic rules and processes it with the legal rule engine.
 */
export function generateMockClassification(inputPrompt: string): ClassificationResult {
  const checklist = extractMockChecklist(inputPrompt);
  return evaluateComplianceChecklist(checklist);
}

/**
 * Classifies an AI system description against the EU AI Act using a robust two-step pipeline:
 * Step 1: Extract statutory boolean checklist from Gemini LLM using strict boolean responseSchema.
 * Step 2: Validate boolean checklist via Zod and pass into deterministic legal rule engine.
 *
 * @param inputPrompt The user's system prompt or functional architecture description.
 * @returns Structured ClassificationResult matching the EU AI Act risk tiers and obligations.
 */
export async function classifySystemPrompt(
  inputPrompt: string
): Promise<ClassificationResult> {
  // Input validation
  if (!inputPrompt || typeof inputPrompt !== 'string' || inputPrompt.trim().length === 0) {
    throw new Error('System description must be a non-empty string.');
  }

  if (inputPrompt.trim().length < 5) {
    throw new Error(
      'System description is too short. Please provide at least 5 characters detailing the system.'
    );
  }

  // Check for mock mode
  if (isMockGeminiEnabled()) {
    return generateMockClassification(inputPrompt);
  }

  const apiKey = process.env.GEMINI_API_KEY!;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const ai = new GoogleGenAI({ apiKey });

  // Timeout guard (30 seconds)
  const timeoutMs = 30000;
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Gemini API request timed out after ${timeoutMs / 1000}s. Please try again.`
        )
      );
    }, timeoutMs);
  });

  try {
    const apiPromise = ai.models.generateContent({
      model: modelName,
      contents: formatUserPrompt(inputPrompt),
      config: {
        systemInstruction: getSystemPrompt(),
        responseMimeType: 'application/json',
        responseSchema: complianceChecklistGenAiSchema,
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);

    // Clear timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Check safety finish reason
    const candidate = response.candidates?.[0];
    if (
      candidate?.finishReason &&
      ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT'].includes(candidate.finishReason)
    ) {
      throw new Error(
        `Analysis blocked by AI safety filters (${candidate.finishReason}). Please modify your system description to exclude sensitive terms.`
      );
    }

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new Error(
        'Empty response received from Gemini API. The model did not return any classification.'
      );
    }

    // Clean any potential markdown code wrapping
    const cleanJson = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleanJson) as Record<string, unknown>;
    } catch (parseErr) {
      throw new Error(
        `Failed to parse Gemini output as JSON: ${
          parseErr instanceof Error ? parseErr.message : String(parseErr)
        }`
      );
    }

    // Resilient validation: Validate with Zod schema, defaulting missing/invalid keys to false
    const parsedZod = complianceChecklistZodSchema.safeParse(parsed);
    const checklist: ComplianceChecklist = parsedZod.success
      ? parsedZod.data
      : normalizeChecklist(parsed as Partial<ComplianceChecklist>);

    // Deterministic Rule Engine evaluation
    return evaluateComplianceChecklist(checklist);
  } catch (err: unknown) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Gemini classification error: ${String(err)}`);
  }
}

/**
 * Backward compatibility alias for classifySystemPrompt.
 */
export const analyzeCompliance = classifySystemPrompt;

