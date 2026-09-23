/**
 * @testFixtures: Canonical ComplianceReport fixtures matching src/types/database.ts exactly.
 * Used across all unit and E2E tests.
 */
import type { ComplianceReport } from '@/types/database';

export const HIGH_RISK_REPORT: ComplianceReport = {
  id: 'rep_123456789',
  user_id: 'user_123',
  risk_tier: 'High',
  matched_category: 'Employment and workers management',
  matched_article: 'Article 6(2) read with Annex III(4)',
  confidence: 'High',
  rationale:
    'This system is classified as High Risk because it is used to evaluate, rank, and screen job applicants for employment decisions, which falls squarely within Annex III, Category 4 of the EU AI Act.',
  obligations: [
    {
      title: 'Risk management system',
      article: 'Article 9',
      description: 'Establish and maintain a risk management system throughout the AI system lifecycle.',
      mandatory: true,
    },
    {
      title: 'Human oversight',
      article: 'Article 14',
      description: 'Ensure effective human oversight measures are built into the system design.',
      mandatory: true,
    },
  ],
  action_plan: [
    {
      step: 1,
      title: 'Establish risk management framework',
      timeframe: '30 days',
      priority: 'Immediate',
      details: 'Document all intended purposes, foreseeable misuses, and risk mitigation measures.',
    },
    {
      step: 2,
      title: 'Implement human oversight controls',
      timeframe: '60 days',
      priority: 'Short-term',
      details: 'Assign responsible persons and define override mechanisms.',
    },
  ],
  is_saved: false,
  expires_at: '2025-01-01T00:00:00Z',
  pdf_ready: false,
  stripe_payment_intent_id: null,
  paid_at: null,
  receipt_email: null,
  pdf_storage_path: null,
  created_at: '2024-01-01T00:00:00.000Z',
};

export const MINIMAL_RISK_REPORT: ComplianceReport = {
  ...HIGH_RISK_REPORT,
  id: 'rep_minimal',
  risk_tier: 'Minimal',
  matched_category: 'General purpose AI — content recommendation',
  matched_article: 'No specific article — voluntary code of conduct applies',
  confidence: 'High',
  rationale:
    'This system poses minimal risk under the EU AI Act. It recommends products to consumers and does not make consequential decisions about individuals.',
  obligations: [
    {
      title: 'Voluntary transparency measures',
      article: 'Recital 48',
      description: 'Consider applying voluntary codes of conduct for responsible AI development.',
      mandatory: false,
    },
  ],
  action_plan: [
    {
      step: 1,
      title: 'Document AI system in internal registry',
      timeframe: '90 days',
      priority: 'Medium-term',
      details: 'Maintain documentation for future regulatory changes.',
    },
  ],
};

export const PROHIBITED_REPORT: ComplianceReport = {
  ...HIGH_RISK_REPORT,
  id: 'rep_prohibited',
  risk_tier: 'Unacceptable',
  matched_category: 'Social scoring by public authorities',
  matched_article: 'Article 5(1)(c)',
  confidence: 'High',
  rationale:
    'This system constitutes a prohibited practice under Article 5(1)(c) as it assigns social scores to citizens based on behaviour, leading to detrimental or unfavourable treatment.',
  obligations: [
    {
      title: 'Immediate cessation required',
      article: 'Article 5',
      description: 'The deployment of this system is prohibited. Immediate discontinuation is required.',
      mandatory: true,
    },
  ],
  action_plan: [
    {
      step: 1,
      title: 'Immediately suspend system operation',
      timeframe: '30 days',
      priority: 'Immediate',
      details: 'Cease all processing activities and notify relevant supervisory authorities.',
    },
  ],
};

export const PAID_REPORT: ComplianceReport = {
  ...HIGH_RISK_REPORT,
  id: 'rep_paid',
  pdf_ready: true,
  stripe_payment_intent_id: 'pi_345_test',
  paid_at: '2024-01-02T00:00:00.000Z',
  receipt_email: 'test@example.com',
  pdf_storage_path: 'compliance-reports/user_123/rep_paid.pdf',
};
