import { describe, it, expect } from 'vitest';
import { Type } from '@google/genai';
import {
  complianceChecklistZodSchema,
  complianceChecklistGenAiSchema,
  complianceChecklistSchema,
  complianceReportSchema,
  ARTICLE_5_KEYS,
  ANNEX_III_KEYS,
  ARTICLE_50_KEYS,
  CHECKLIST_METADATA,
  type ComplianceChecklist,
  type BooleanChecklist,
} from '@/lib/gemini/schema';

describe('Compliance Checklist Schema & Types', () => {
  const buildMockChecklist = (overrides: Partial<ComplianceChecklist> = {}): ComplianceChecklist => {
    const keys = Object.keys(complianceChecklistZodSchema.shape) as (keyof ComplianceChecklist)[];
    const base = keys.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<keyof ComplianceChecklist, boolean>);

    return {
      ...base,
      ...overrides,
    } as ComplianceChecklist;
  };

  it('validates a well-formed boolean checklist using Zod schema', () => {
    const mockData = buildMockChecklist({
      article_5_social_scoring: true,
      annex_iii_employment_recruitment_screening: true,
      article_50_conversational_chatbot: true,
    });

    const parsed = complianceChecklistZodSchema.safeParse(mockData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.article_5_social_scoring).toBe(true);
      expect(parsed.data.annex_iii_employment_recruitment_screening).toBe(true);
      expect(parsed.data.article_50_conversational_chatbot).toBe(true);
      expect(parsed.data.article_5_subliminal_manipulation).toBe(false);
    }
  });

  it('rejects non-boolean values in Zod schema', () => {
    const invalidData = buildMockChecklist();
    // @ts-expect-error Testing runtime invalid type
    invalidData.article_5_social_scoring = 'true';

    const parsed = complianceChecklistZodSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('rejects missing fields in Zod schema', () => {
    const incompleteData = buildMockChecklist();
    // @ts-expect-error Testing missing key
    delete incompleteData.article_5_social_scoring;

    const parsed = complianceChecklistZodSchema.safeParse(incompleteData);
    expect(parsed.success).toBe(false);
  });

  it('guarantees GenAI schema specifies only Type.BOOLEAN for all checklist properties', () => {
    expect(complianceChecklistGenAiSchema.type).toBe(Type.OBJECT);
    expect(complianceChecklistGenAiSchema.properties).toBeDefined();

    const properties = complianceChecklistGenAiSchema.properties!;
    const keys = Object.keys(properties);

    expect(keys.length).toBeGreaterThanOrEqual(30);

    for (const key of keys) {
      const prop = properties[key];
      expect(prop.type).toBe(Type.BOOLEAN);
      expect(prop.description).toBeDefined();
      expect(prop.description?.length).toBeGreaterThan(10);
    }
  });

  it('ensures all GenAI schema properties are declared in required array', () => {
    const properties = Object.keys(complianceChecklistGenAiSchema.properties || {});
    const required = complianceChecklistGenAiSchema.required || [];

    expect(required.sort()).toEqual(properties.sort());
  });

  it('matches Zod schema keys exactly with GenAI schema keys', () => {
    const zodKeys = Object.keys(complianceChecklistZodSchema.shape).sort();
    const genAiKeys = Object.keys(complianceChecklistGenAiSchema.properties || {}).sort();

    expect(zodKeys).toEqual(genAiKeys);
  });

  it('verifies Article 5 covers all key prohibited domains', () => {
    expect(ARTICLE_5_KEYS).toContain('article_5_subliminal_manipulation');
    expect(ARTICLE_5_KEYS).toContain('article_5_vulnerability_exploitation');
    expect(ARTICLE_5_KEYS).toContain('article_5_social_scoring');
    expect(ARTICLE_5_KEYS).toContain('article_5_criminal_risk_profiling');
    expect(ARTICLE_5_KEYS).toContain('article_5_untargeted_facial_scraping');
    expect(ARTICLE_5_KEYS).toContain('article_5_workplace_education_emotion_recognition');
    expect(ARTICLE_5_KEYS).toContain('article_5_biometric_categorization_sensitive');
    expect(ARTICLE_5_KEYS).toContain('article_5_real_time_remote_biometric_enforcement');
    expect(ARTICLE_5_KEYS.length).toBe(8);
  });

  it('verifies Annex III covers ALL 8 categories', () => {
    // 1. Biometrics
    expect(ANNEX_III_KEYS).toContain('annex_iii_biometrics_remote_identification');
    expect(ANNEX_III_KEYS).toContain('annex_iii_biometrics_categorization');
    expect(ANNEX_III_KEYS).toContain('annex_iii_biometrics_emotion_recognition');

    // 2. Critical Infrastructure
    expect(ANNEX_III_KEYS).toContain('annex_iii_critical_infrastructure_safety_components');

    // 3. Education
    expect(ANNEX_III_KEYS).toContain('annex_iii_education_admission_assignment');
    expect(ANNEX_III_KEYS).toContain('annex_iii_education_learning_evaluation');
    expect(ANNEX_III_KEYS).toContain('annex_iii_education_level_assessment');
    expect(ANNEX_III_KEYS).toContain('annex_iii_education_behavior_monitoring');

    // 4. Employment
    expect(ANNEX_III_KEYS).toContain('annex_iii_employment_recruitment_screening');
    expect(ANNEX_III_KEYS).toContain('annex_iii_employment_workplace_decisions');

    // 5. Essential Services
    expect(ANNEX_III_KEYS).toContain('annex_iii_essential_services_public_benefits');
    expect(ANNEX_III_KEYS).toContain('annex_iii_essential_services_credit_scoring');
    expect(ANNEX_III_KEYS).toContain('annex_iii_essential_services_emergency_dispatch');
    expect(ANNEX_III_KEYS).toContain('annex_iii_essential_services_health_life_insurance');

    // 6. Law Enforcement
    expect(ANNEX_III_KEYS).toContain('annex_iii_law_enforcement_victim_risk_assessment');
    expect(ANNEX_III_KEYS).toContain('annex_iii_law_enforcement_polygraph');
    expect(ANNEX_III_KEYS).toContain('annex_iii_law_enforcement_evidence_reliability');
    expect(ANNEX_III_KEYS).toContain('annex_iii_law_enforcement_offending_risk_profiling');
    expect(ANNEX_III_KEYS).toContain('annex_iii_law_enforcement_criminal_profiling');

    // 7. Migration
    expect(ANNEX_III_KEYS).toContain('annex_iii_migration_polygraph');
    expect(ANNEX_III_KEYS).toContain('annex_iii_migration_risk_assessment');
    expect(ANNEX_III_KEYS).toContain('annex_iii_migration_document_verification');
    expect(ANNEX_III_KEYS).toContain('annex_iii_migration_asylum_examination');

    // 8. Justice & Democracy
    expect(ANNEX_III_KEYS).toContain('annex_iii_justice_judicial_assistance');
    expect(ANNEX_III_KEYS).toContain('annex_iii_justice_election_influencing');
  });

  it('verifies Article 50 covers chatbots, synthetic media/deepfakes, and emotion notice', () => {
    expect(ARTICLE_50_KEYS).toContain('article_50_conversational_chatbot');
    expect(ARTICLE_50_KEYS).toContain('article_50_synthetic_media_deepfakes');
    expect(ARTICLE_50_KEYS).toContain('article_50_emotion_biometric_notice');
    expect(ARTICLE_50_KEYS.length).toBe(3);
  });

  it('verifies partition completeness: every key belongs to exactly one category group', () => {
    const allKeys = Object.keys(complianceChecklistZodSchema.shape);
    const combined = [...ARTICLE_5_KEYS, ...ANNEX_III_KEYS, ...ARTICLE_50_KEYS];

    expect(combined.length).toBe(allKeys.length);
    expect(new Set(combined).size).toBe(allKeys.length);
    expect(combined.sort()).toEqual(allKeys.sort());
  });

  it('verifies metadata map has an entry with statutory citation for each key', () => {
    const allKeys = Object.keys(complianceChecklistZodSchema.shape) as (keyof ComplianceChecklist)[];

    for (const key of allKeys) {
      const meta = CHECKLIST_METADATA[key];
      expect(meta).toBeDefined();
      expect(meta.article).toBeDefined();
      expect(meta.category).toBeDefined();
      expect(meta.tier).toBeDefined();
    }
  });

  it('maintains compatibility aliases and legacy report schema', () => {
    expect(complianceChecklistSchema).toBe(complianceChecklistGenAiSchema);
    expect(complianceReportSchema).toBeDefined();
    expect(complianceReportSchema.properties?.risk_tier).toBeDefined();
  });
});
