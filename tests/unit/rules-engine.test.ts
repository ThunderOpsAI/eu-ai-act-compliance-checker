import { describe, it, expect } from 'vitest';
import {
  evaluateComplianceChecklist,
  normalizeChecklist,
} from '@/lib/rules/engine';
import {
  ARTICLE_5_KEYS,
  ANNEX_III_KEYS,
  ARTICLE_50_KEYS,
  type ComplianceChecklist,
} from '@/lib/gemini/schema';

describe('Deterministic Compliance Rules Engine', () => {
  const getEmptyChecklist = (): ComplianceChecklist => {
    return normalizeChecklist({});
  };

  describe('Unacceptable Risk (Article 5 Prohibitions)', () => {
    it.each(ARTICLE_5_KEYS)('triggers Unacceptable Risk for Article 5 key: %s', (key) => {
      const checklist = getEmptyChecklist();
      checklist[key] = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.confidence).toBe('High');
      expect(result.matched_article).toContain('Article 5');
      expect(result.rationale).toContain('Article 5 prohibitions');
      expect(result.obligations.length).toBeGreaterThanOrEqual(2);
      expect(result.obligations.some((o) => o.article === 'Article 5')).toBe(true);
      expect(result.action_plan.length).toBeGreaterThanOrEqual(3);
      expect(result.action_plan[0].priority).toBe('Immediate');
    });

    it('synthesizes multiple Article 5 violations accurately', () => {
      const checklist = getEmptyChecklist();
      checklist.article_5_social_scoring = true;
      checklist.article_5_subliminal_manipulation = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.matched_article).toContain('Article 5(1)(a)');
      expect(result.matched_article).toContain('Article 5(1)(c)');
      expect(result.matched_category).toContain('Social Scoring');
      expect(result.matched_category).toContain('Subliminal');
      expect(result.rationale).toContain('Subliminal or Manipulative Distortion');
      expect(result.rationale).toContain('Social Scoring Evaluation');
    });
  });

  describe('High Risk (Annex III Critical Domains)', () => {
    // Test a representative key for each of the 8 Annex III categories
    const categoryRepresentativeKeys: [string, keyof ComplianceChecklist, string][] = [
      ['Category 1: Biometrics', 'annex_iii_biometrics_remote_identification', 'Annex III Point 1'],
      ['Category 2: Critical Infrastructure', 'annex_iii_critical_infrastructure_safety_components', 'Annex III Point 2'],
      ['Category 3: Education', 'annex_iii_education_admission_assignment', 'Annex III Point 3'],
      ['Category 4: Employment', 'annex_iii_employment_recruitment_screening', 'Annex III Point 4'],
      ['Category 5: Essential Services', 'annex_iii_essential_services_credit_scoring', 'Annex III Point 5'],
      ['Category 6: Law Enforcement', 'annex_iii_law_enforcement_evidence_reliability', 'Annex III Point 6'],
      ['Category 7: Migration', 'annex_iii_migration_document_verification', 'Annex III Point 7'],
      ['Category 8: Administration of Justice', 'annex_iii_justice_judicial_assistance', 'Annex III Point 8'],
    ];

    it.each(categoryRepresentativeKeys)(
      'triggers High Risk for %s (%s)',
      (_domain, key, expectedAnnexCitation) => {
        const checklist = getEmptyChecklist();
        checklist[key] = true;

        const result = evaluateComplianceChecklist(checklist);

        expect(result.risk_tier).toBe('High');
        expect(result.confidence).toBe('High');
        expect(result.matched_article).toContain('Article 6(2)');
        expect(result.matched_article).toContain(expectedAnnexCitation);
        expect(result.obligations.length).toBeGreaterThanOrEqual(8);
        expect(result.obligations.some((o) => o.article === 'Article 9')).toBe(true);
        expect(result.obligations.some((o) => o.article === 'Article 10')).toBe(true);
        expect(result.obligations.some((o) => o.article === 'Article 14')).toBe(true);
        expect(result.action_plan.length).toBeGreaterThanOrEqual(5);
      }
    );

    it('aggregates multiple Annex III domains with deduplicated obligations', () => {
      const checklist = getEmptyChecklist();
      checklist.annex_iii_employment_recruitment_screening = true;
      checklist.annex_iii_biometrics_remote_identification = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('High');
      expect(result.matched_category).toContain('Employment & Workers Management');
      expect(result.matched_category).toContain('Biometrics & Identification');
      expect(result.matched_article).toContain('Annex III Point 4');
      expect(result.matched_article).toContain('Annex III Point 1');

      // Both domain-specific obligations should be included
      expect(result.obligations.some((o) => o.title.includes('Worker Information'))).toBe(true);
      expect(result.obligations.some((o) => o.title.includes('Biometric Verification'))).toBe(true);

      // Standard Article 9 obligation should appear only once (deduplicated)
      const article9Obligations = result.obligations.filter((o) => o.article === 'Article 9');
      expect(article9Obligations.length).toBe(1);
    });
  });

  describe('Limited Risk (Article 50 Transparency)', () => {
    it.each(ARTICLE_50_KEYS)('triggers Limited Risk for Article 50 key: %s', (key) => {
      const checklist = getEmptyChecklist();
      checklist[key] = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Limited');
      expect(result.confidence).toBe('High');
      expect(result.matched_article).toContain('Article 50');
      expect(result.obligations.length).toBeGreaterThanOrEqual(1);
      expect(result.obligations[0].article).toContain('Article 50');
      expect(result.action_plan.length).toBeGreaterThanOrEqual(2);
    });

    it('combines multiple Article 50 transparency triggers', () => {
      const checklist = getEmptyChecklist();
      checklist.article_50_conversational_chatbot = true;
      checklist.article_50_synthetic_media_deepfakes = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Limited');
      expect(result.matched_article).toContain('Article 50(1)');
      expect(result.matched_article).toContain('Article 50(2)');
      expect(result.obligations.some((o) => o.article === 'Article 50(1)')).toBe(true);
      expect(result.obligations.some((o) => o.article.includes('Article 50(2)'))).toBe(true);
    });
  });

  describe('Minimal Risk (Default Fallthrough)', () => {
    it('returns Minimal Risk when all checklist booleans are false', () => {
      const checklist = getEmptyChecklist();
      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Minimal');
      expect(result.confidence).toBe('High');
      expect(result.matched_article).toContain('Article 4');
      expect(result.obligations.some((o) => o.article === 'Article 4')).toBe(true);
      expect(result.action_plan.length).toBeGreaterThanOrEqual(2);
    });

    it('handles empty object or undefined/null gracefully', () => {
      const resultFromEmpty = evaluateComplianceChecklist({});
      expect(resultFromEmpty.risk_tier).toBe('Minimal');

      const resultFromNull = evaluateComplianceChecklist(null);
      expect(resultFromNull.risk_tier).toBe('Minimal');

      const resultFromUndefined = evaluateComplianceChecklist(undefined);
      expect(resultFromUndefined.risk_tier).toBe('Minimal');
    });
  });

  describe('Precedence Hierarchy & Multi-Tier Edge Cases', () => {
    it('enforces Unacceptable > High when both Article 5 and Annex III are active', () => {
      const checklist = getEmptyChecklist();
      checklist.article_5_social_scoring = true;
      checklist.annex_iii_employment_recruitment_screening = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.rationale).toContain('commercial deployment is entirely barred');
      expect(result.rationale).toContain('Annex III High-Risk operations');
      expect(result.obligations[0].article).toBe('Article 5');
    });

    it('enforces Unacceptable > Limited when both Article 5 and Article 50 are active', () => {
      const checklist = getEmptyChecklist();
      checklist.article_5_subliminal_manipulation = true;
      checklist.article_50_conversational_chatbot = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.rationale).toContain('Article 50 Transparency mechanisms');
    });

    it('enforces High > Limited when both Annex III and Article 50 are active', () => {
      const checklist = getEmptyChecklist();
      checklist.annex_iii_employment_recruitment_screening = true;
      checklist.article_50_conversational_chatbot = true;

      const result = evaluateComplianceChecklist(checklist);

      expect(result.risk_tier).toBe('High');
      expect(result.matched_category).toContain('Employment & Workers Management');
      expect(result.rationale).toContain('Article 50 transparency obligations');
      // Should include high-risk obligations AND the Article 50 disclosure obligation
      expect(result.obligations.some((o) => o.article === 'Article 9')).toBe(true);
      expect(result.obligations.some((o) => o.article === 'Article 50(1)')).toBe(true);
    });
  });
});
