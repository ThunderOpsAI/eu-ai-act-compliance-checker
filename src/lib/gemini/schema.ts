import { z } from 'zod';
import { Type, type Schema } from '@google/genai';
import type {
  RiskTier,
  ConfidenceLevel,
  ObligationItem,
  ActionPlanItem,
} from '@/types/database';

export type { RiskTier, ConfidenceLevel, ObligationItem, ActionPlanItem };

export interface ClassificationResult {
  risk_tier: RiskTier;
  matched_category: string;
  matched_article: string;
  confidence: ConfidenceLevel;
  rationale: string;
  obligations: ObligationItem[];
  action_plan: ActionPlanItem[];
}

/**
 * Zod Schema for the Gemini Boolean Checklist.
 * Evaluates the user's AI system against Article 5 (Prohibited),
 * Annex III (High-Risk standalone domains), and Article 50 (Transparency triggers).
 * Every leaf property is strictly a boolean.
 */
export const complianceChecklistZodSchema = z.object({
  // =========================================================================
  // Article 5: Prohibited AI Practices (Unacceptable Risk)
  // =========================================================================
  article_5_subliminal_manipulation: z
    .boolean()
    .describe(
      'Deploys subliminal, manipulative, or deceptive techniques beyond conscious awareness to materially distort human behavior and impair informed decision-making, causing or likely causing significant physical or psychological harm (Art. 5(1)(a)).'
    ),
  article_5_vulnerability_exploitation: z
    .boolean()
    .describe(
      'Exploits vulnerabilities of specific persons or groups due to age, physical or mental disability, or specific socio-economic situation to materially distort behavior, causing or likely causing significant harm (Art. 5(1)(b)).'
    ),
  article_5_social_scoring: z
    .boolean()
    .describe(
      'Evaluates or classifies natural persons over time based on social behavior or personality traits, leading to detrimental treatment in unrelated contexts or disproportionate treatment (Art. 5(1)(c)).'
    ),
  article_5_criminal_risk_profiling: z
    .boolean()
    .describe(
      'Assesses or predicts the risk of a natural person committing criminal offenses based solely on profiling or assessing personality traits and characteristics (Art. 5(1)(d)).'
    ),
  article_5_untargeted_facial_scraping: z
    .boolean()
    .describe(
      'Creates or expands facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage (Art. 5(1)(e)).'
    ),
  article_5_workplace_education_emotion_recognition: z
    .boolean()
    .describe(
      'Infers emotions of natural persons in workplace environments or educational institutions, unless strictly for verified medical or safety reasons (Art. 5(1)(f)).'
    ),
  article_5_biometric_categorization_sensitive: z
    .boolean()
    .describe(
      'Categorizes natural persons based on biometric data to deduce sensitive personal traits such as race, political opinions, trade union membership, religious/philosophical beliefs, sex life, or sexual orientation (Art. 5(1)(g)).'
    ),
  article_5_real_time_remote_biometric_enforcement: z
    .boolean()
    .describe(
      'Uses real-time remote biometric identification in publicly accessible spaces for law enforcement purposes, without meeting narrow statutory exceptions (Art. 5(1)(h)).'
    ),

  // =========================================================================
  // Annex III: High-Risk AI Systems (Article 6(2))
  // =========================================================================

  // Category 1: Biometrics
  annex_iii_biometrics_remote_identification: z
    .boolean()
    .describe(
      'Remote biometric identification of natural persons (e.g. post/non-real-time identification, or non-prohibited remote biometric identification) (Annex III Point 1(a)).'
    ),
  annex_iii_biometrics_categorization: z
    .boolean()
    .describe(
      'Biometric categorization of natural persons according to sensitive or protected attributes, not prohibited under Article 5(1)(g) (Annex III Point 1(b)).'
    ),
  annex_iii_biometrics_emotion_recognition: z
    .boolean()
    .describe(
      'Emotion recognition of natural persons outside workplace and educational settings (Annex III Point 1(c)).'
    ),

  // Category 2: Critical Infrastructure
  annex_iii_critical_infrastructure_safety_components: z
    .boolean()
    .describe(
      'Safety component in the management or operation of critical digital infrastructure, road traffic, or the supply of water, gas, heating, or electricity (Annex III Point 2).'
    ),

  // Category 3: Education and Vocational Training
  annex_iii_education_admission_assignment: z
    .boolean()
    .describe(
      'Determines access, admission, or assignment of natural persons to educational and vocational training institutions (Annex III Point 3(a)).'
    ),
  annex_iii_education_learning_evaluation: z
    .boolean()
    .describe(
      'Evaluates learning outcomes, assesses students, or steers the learning process in educational and vocational training (Annex III Point 3(b)).'
    ),
  annex_iii_education_level_assessment: z
    .boolean()
    .describe(
      'Assesses the appropriate level of education that an individual will receive or access (Annex III Point 3(c)).'
    ),
  annex_iii_education_behavior_monitoring: z
    .boolean()
    .describe(
      'Monitors and detects prohibited behavior of students during tests or examinations (Annex III Point 3(d)).'
    ),

  // Category 4: Employment, Workers Management & Access to Self-Employment
  annex_iii_employment_recruitment_screening: z
    .boolean()
    .describe(
      'Recruitment or selection of natural persons, including advertising vacancies, screening/filtering applications, and evaluating candidates (Annex III Point 4(a)).'
    ),
  annex_iii_employment_workplace_decisions: z
    .boolean()
    .describe(
      'Makes decisions affecting terms of work relationships, promotion, or termination, or allocates tasks based on individual behavior, or monitors/evaluates worker performance (Annex III Point 4(b)).'
    ),

  // Category 5: Access to and Enjoyment of Essential Private & Public Services
  annex_iii_essential_services_public_benefits: z
    .boolean()
    .describe(
      'Evaluates eligibility of natural persons for public assistance benefits and services, or grants, reduces, revokes, or reclaims such benefits (Annex III Point 5(a)).'
    ),
  annex_iii_essential_services_credit_scoring: z
    .boolean()
    .describe(
      'Evaluates creditworthiness or establishes credit scores of natural persons, excluding financial fraud detection (Annex III Point 5(b)).'
    ),
  annex_iii_essential_services_emergency_dispatch: z
    .boolean()
    .describe(
      'Evaluates and classifies emergency calls by natural persons or dispatches priority emergency first aid, police, fire, or medical services (Annex III Point 5(c)).'
    ),
  annex_iii_essential_services_health_life_insurance: z
    .boolean()
    .describe(
      'Risk assessment and pricing in relation to natural persons for life and health insurance (Annex III Point 5(d)).'
    ),

  // Category 6: Law Enforcement
  annex_iii_law_enforcement_victim_risk_assessment: z
    .boolean()
    .describe(
      'Used by or on behalf of law enforcement to assess the risk of a natural person becoming a victim of criminal offences (Annex III Point 6(a)).'
    ),
  annex_iii_law_enforcement_polygraph: z
    .boolean()
    .describe(
      'Used by or on behalf of law enforcement as a polygraph or similar lie detection tool (Annex III Point 6(b)).'
    ),
  annex_iii_law_enforcement_evidence_reliability: z
    .boolean()
    .describe(
      'Used by or on behalf of law enforcement to evaluate the reliability of evidence in the course of criminal investigations (Annex III Point 6(c)).'
    ),
  annex_iii_law_enforcement_offending_risk_profiling: z
    .boolean()
    .describe(
      'Used by or on behalf of law enforcement to assess the risk of offending or re-offending based on objective facts (Annex III Point 6(d)).'
    ),
  annex_iii_law_enforcement_criminal_profiling: z
    .boolean()
    .describe(
      'Used by or on behalf of law enforcement for profiling natural persons in the course of detection, investigation, or prosecution of criminal offences (Annex III Point 6(e)).'
    ),

  // Category 7: Migration, Asylum & Border Control Management
  annex_iii_migration_polygraph: z
    .boolean()
    .describe(
      'Used by competent authorities as a polygraph or similar lie detection tool in migration, asylum, or border control (Annex III Point 7(a)).'
    ),
  annex_iii_migration_risk_assessment: z
    .boolean()
    .describe(
      'Used by competent authorities to assess security, irregular immigration, or health risks of natural persons entering or residing in EU territory (Annex III Point 7(b)).'
    ),
  annex_iii_migration_document_verification: z
    .boolean()
    .describe(
      'Used by competent authorities to verify the authenticity of travel documents and identity documentation or detect fraudulent documents (Annex III Point 7(c)).'
    ),
  annex_iii_migration_asylum_examination: z
    .boolean()
    .describe(
      'Used by competent authorities to assist in examining applications for asylum, visas, or residence permits and associated complaints (Annex III Point 7(d)).'
    ),

  // Category 8: Administration of Justice & Democratic Processes
  annex_iii_justice_judicial_assistance: z
    .boolean()
    .describe(
      'Used by a judicial authority or on its behalf to assist in researching and interpreting facts and the law, or applying the law to concrete facts, or in alternative dispute resolution (Annex III Point 8(a)).'
    ),
  annex_iii_justice_election_influencing: z
    .boolean()
    .describe(
      'Intended to influence the outcome of an election or referendum or the voting behavior of natural persons (Annex III Point 8(b)).'
    ),

  // =========================================================================
  // Article 50: Limited Risk Transparency Triggers
  // =========================================================================
  article_50_conversational_chatbot: z
    .boolean()
    .describe(
      'Intended to directly interact with natural persons, such as conversational chatbots, customer service agents, or voice assistants (Art. 50(1)).'
    ),
  article_50_synthetic_media_deepfakes: z
    .boolean()
    .describe(
      'Generates or manipulates image, audio, or video content that appreciably resembles existing persons, objects, places, or events (deepfakes or synthetic media) (Art. 50(2)).'
    ),
  article_50_emotion_biometric_notice: z
    .boolean()
    .describe(
      'Operates an emotion recognition or biometric categorization system permitted under EU law, requiring transparency notices to exposed individuals (Art. 50(3)).'
    ),
});

/**
 * TypeScript inferred type from the Zod boolean checklist schema.
 */
export type ComplianceChecklist = z.infer<typeof complianceChecklistZodSchema>;
export type BooleanChecklist = ComplianceChecklist;

/**
 * Key groupings for downstream rules engine and classification logic.
 */
export const ARTICLE_5_KEYS: (keyof ComplianceChecklist)[] = [
  'article_5_subliminal_manipulation',
  'article_5_vulnerability_exploitation',
  'article_5_social_scoring',
  'article_5_criminal_risk_profiling',
  'article_5_untargeted_facial_scraping',
  'article_5_workplace_education_emotion_recognition',
  'article_5_biometric_categorization_sensitive',
  'article_5_real_time_remote_biometric_enforcement',
];

export const ANNEX_III_KEYS: (keyof ComplianceChecklist)[] = [
  // Category 1: Biometrics
  'annex_iii_biometrics_remote_identification',
  'annex_iii_biometrics_categorization',
  'annex_iii_biometrics_emotion_recognition',
  // Category 2: Critical Infrastructure
  'annex_iii_critical_infrastructure_safety_components',
  // Category 3: Education & Vocational Training
  'annex_iii_education_admission_assignment',
  'annex_iii_education_learning_evaluation',
  'annex_iii_education_level_assessment',
  'annex_iii_education_behavior_monitoring',
  // Category 4: Employment
  'annex_iii_employment_recruitment_screening',
  'annex_iii_employment_workplace_decisions',
  // Category 5: Essential Services
  'annex_iii_essential_services_public_benefits',
  'annex_iii_essential_services_credit_scoring',
  'annex_iii_essential_services_emergency_dispatch',
  'annex_iii_essential_services_health_life_insurance',
  // Category 6: Law Enforcement
  'annex_iii_law_enforcement_victim_risk_assessment',
  'annex_iii_law_enforcement_polygraph',
  'annex_iii_law_enforcement_evidence_reliability',
  'annex_iii_law_enforcement_offending_risk_profiling',
  'annex_iii_law_enforcement_criminal_profiling',
  // Category 7: Migration
  'annex_iii_migration_polygraph',
  'annex_iii_migration_risk_assessment',
  'annex_iii_migration_document_verification',
  'annex_iii_migration_asylum_examination',
  // Category 8: Justice & Democracy
  'annex_iii_justice_judicial_assistance',
  'annex_iii_justice_election_influencing',
];

export const ARTICLE_50_KEYS: (keyof ComplianceChecklist)[] = [
  'article_50_conversational_chatbot',
  'article_50_synthetic_media_deepfakes',
  'article_50_emotion_biometric_notice',
];

export interface LegalMetadata {
  article: string;
  category: string;
  tier: RiskTier;
}

export const CHECKLIST_METADATA: Record<keyof ComplianceChecklist, LegalMetadata> = {
  // Article 5
  article_5_subliminal_manipulation: {
    article: 'Article 5(1)(a)',
    category: 'Prohibited Practices: Subliminal Manipulation',
    tier: 'Unacceptable',
  },
  article_5_vulnerability_exploitation: {
    article: 'Article 5(1)(b)',
    category: 'Prohibited Practices: Vulnerability Exploitation',
    tier: 'Unacceptable',
  },
  article_5_social_scoring: {
    article: 'Article 5(1)(c)',
    category: 'Prohibited Practices: Social Scoring',
    tier: 'Unacceptable',
  },
  article_5_criminal_risk_profiling: {
    article: 'Article 5(1)(d)',
    category: 'Prohibited Practices: Criminal Risk Profiling',
    tier: 'Unacceptable',
  },
  article_5_untargeted_facial_scraping: {
    article: 'Article 5(1)(e)',
    category: 'Prohibited Practices: Untargeted Facial Scraping',
    tier: 'Unacceptable',
  },
  article_5_workplace_education_emotion_recognition: {
    article: 'Article 5(1)(f)',
    category: 'Prohibited Practices: Workplace & Education Emotion Recognition',
    tier: 'Unacceptable',
  },
  article_5_biometric_categorization_sensitive: {
    article: 'Article 5(1)(g)',
    category: 'Prohibited Practices: Sensitive Biometric Categorization',
    tier: 'Unacceptable',
  },
  article_5_real_time_remote_biometric_enforcement: {
    article: 'Article 5(1)(h)',
    category: 'Prohibited Practices: Real-time Remote Biometric Identification',
    tier: 'Unacceptable',
  },

  // Annex III Category 1
  annex_iii_biometrics_remote_identification: {
    article: 'Annex III Point 1(a)',
    category: 'Biometrics: Remote Biometric Identification',
    tier: 'High',
  },
  annex_iii_biometrics_categorization: {
    article: 'Annex III Point 1(b)',
    category: 'Biometrics: Biometric Categorization',
    tier: 'High',
  },
  annex_iii_biometrics_emotion_recognition: {
    article: 'Annex III Point 1(c)',
    category: 'Biometrics: Emotion Recognition Systems',
    tier: 'High',
  },

  // Annex III Category 2
  annex_iii_critical_infrastructure_safety_components: {
    article: 'Annex III Point 2',
    category: 'Critical Infrastructure: Safety Components',
    tier: 'High',
  },

  // Annex III Category 3
  annex_iii_education_admission_assignment: {
    article: 'Annex III Point 3(a)',
    category: 'Education & Vocational Training: Admissions & Assignment',
    tier: 'High',
  },
  annex_iii_education_learning_evaluation: {
    article: 'Annex III Point 3(b)',
    category: 'Education & Vocational Training: Learning Evaluation',
    tier: 'High',
  },
  annex_iii_education_level_assessment: {
    article: 'Annex III Point 3(c)',
    category: 'Education & Vocational Training: Education Level Assessment',
    tier: 'High',
  },
  annex_iii_education_behavior_monitoring: {
    article: 'Annex III Point 3(d)',
    category: 'Education & Vocational Training: Test Behavior Monitoring',
    tier: 'High',
  },

  // Annex III Category 4
  annex_iii_employment_recruitment_screening: {
    article: 'Annex III Point 4(a)',
    category: 'Employment & Workers Management: Recruitment & Candidate Screening',
    tier: 'High',
  },
  annex_iii_employment_workplace_decisions: {
    article: 'Annex III Point 4(b)',
    category: 'Employment & Workers Management: Work Terms, Allocation & Performance Monitoring',
    tier: 'High',
  },

  // Annex III Category 5
  annex_iii_essential_services_public_benefits: {
    article: 'Annex III Point 5(a)',
    category: 'Essential Services: Public Assistance Benefits & Services',
    tier: 'High',
  },
  annex_iii_essential_services_credit_scoring: {
    article: 'Annex III Point 5(b)',
    category: 'Essential Services: Credit Scoring & Creditworthiness',
    tier: 'High',
  },
  annex_iii_essential_services_emergency_dispatch: {
    article: 'Annex III Point 5(c)',
    category: 'Essential Services: Emergency Services Dispatch & Call Prioritization',
    tier: 'High',
  },
  annex_iii_essential_services_health_life_insurance: {
    article: 'Annex III Point 5(d)',
    category: 'Essential Services: Life & Health Insurance Risk Assessment',
    tier: 'High',
  },

  // Annex III Category 6
  annex_iii_law_enforcement_victim_risk_assessment: {
    article: 'Annex III Point 6(a)',
    category: 'Law Enforcement: Victim Risk Assessment',
    tier: 'High',
  },
  annex_iii_law_enforcement_polygraph: {
    article: 'Annex III Point 6(b)',
    category: 'Law Enforcement: Polygraphs & Lie Detectors',
    tier: 'High',
  },
  annex_iii_law_enforcement_evidence_reliability: {
    article: 'Annex III Point 6(c)',
    category: 'Law Enforcement: Evidence Reliability Evaluation',
    tier: 'High',
  },
  annex_iii_law_enforcement_offending_risk_profiling: {
    article: 'Annex III Point 6(d)',
    category: 'Law Enforcement: Offending Risk Assessment & Personality Profiling',
    tier: 'High',
  },
  annex_iii_law_enforcement_criminal_profiling: {
    article: 'Annex III Point 6(e)',
    category: 'Law Enforcement: Criminal Profiling in Investigations',
    tier: 'High',
  },

  // Annex III Category 7
  annex_iii_migration_polygraph: {
    article: 'Annex III Point 7(a)',
    category: 'Migration, Asylum & Border Control: Polygraphs & Lie Detectors',
    tier: 'High',
  },
  annex_iii_migration_risk_assessment: {
    article: 'Annex III Point 7(b)',
    category: 'Migration, Asylum & Border Control: Security & Immigration Risk Assessment',
    tier: 'High',
  },
  annex_iii_migration_document_verification: {
    article: 'Annex III Point 7(c)',
    category: 'Migration, Asylum & Border Control: Document Verification & Fraud Detection',
    tier: 'High',
  },
  annex_iii_migration_asylum_examination: {
    article: 'Annex III Point 7(d)',
    category: 'Migration, Asylum & Border Control: Asylum & Visa Application Examination',
    tier: 'High',
  },

  // Annex III Category 8
  annex_iii_justice_judicial_assistance: {
    article: 'Annex III Point 8(a)',
    category: 'Administration of Justice: Judicial Fact & Law Interpretation Assistance',
    tier: 'High',
  },
  annex_iii_justice_election_influencing: {
    article: 'Annex III Point 8(b)',
    category: 'Democratic Processes: Election & Voting Behavior Influencing',
    tier: 'High',
  },

  // Article 50
  article_50_conversational_chatbot: {
    article: 'Article 50(1)',
    category: 'Transparency: Direct Human Interaction (Chatbots/Virtual Assistants)',
    tier: 'Limited',
  },
  article_50_synthetic_media_deepfakes: {
    article: 'Article 50(2)',
    category: 'Transparency: Synthetic Media & Deepfake Generation',
    tier: 'Limited',
  },
  article_50_emotion_biometric_notice: {
    article: 'Article 50(3)',
    category: 'Transparency: Permitted Emotion Recognition & Biometric Categorization Notice',
    tier: 'Limited',
  },
};

/**
 * Strict JSON Schema definition for @google/genai responseSchema.
 * Constrains Gemini to output ONLY boolean fields corresponding to EU AI Act compliance checks.
 */
export const complianceChecklistGenAiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // Article 5
    article_5_subliminal_manipulation: {
      type: Type.BOOLEAN,
      description:
        'Deploys subliminal, manipulative, or deceptive techniques beyond conscious awareness to materially distort human behavior and impair informed decision-making, causing or likely causing significant physical or psychological harm (Art. 5(1)(a)).',
    },
    article_5_vulnerability_exploitation: {
      type: Type.BOOLEAN,
      description:
        'Exploits vulnerabilities of specific persons or groups due to age, physical or mental disability, or specific socio-economic situation to materially distort behavior, causing or likely causing significant harm (Art. 5(1)(b)).',
    },
    article_5_social_scoring: {
      type: Type.BOOLEAN,
      description:
        'Evaluates or classifies natural persons over time based on social behavior or personality traits, leading to detrimental treatment in unrelated contexts or disproportionate treatment (Art. 5(1)(c)).',
    },
    article_5_criminal_risk_profiling: {
      type: Type.BOOLEAN,
      description:
        'Assesses or predicts the risk of a natural person committing criminal offenses based solely on profiling or assessing personality traits and characteristics (Art. 5(1)(d)).',
    },
    article_5_untargeted_facial_scraping: {
      type: Type.BOOLEAN,
      description:
        'Creates or expands facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage (Art. 5(1)(e)).',
    },
    article_5_workplace_education_emotion_recognition: {
      type: Type.BOOLEAN,
      description:
        'Infers emotions of natural persons in workplace environments or educational institutions, unless strictly for verified medical or safety reasons (Art. 5(1)(f)).',
    },
    article_5_biometric_categorization_sensitive: {
      type: Type.BOOLEAN,
      description:
        'Categorizes natural persons based on biometric data to deduce sensitive personal traits such as race, political opinions, trade union membership, religious/philosophical beliefs, sex life, or sexual orientation (Art. 5(1)(g)).',
    },
    article_5_real_time_remote_biometric_enforcement: {
      type: Type.BOOLEAN,
      description:
        'Uses real-time remote biometric identification in publicly accessible spaces for law enforcement purposes, without meeting narrow statutory exceptions (Art. 5(1)(h)).',
    },

    // Annex III Category 1
    annex_iii_biometrics_remote_identification: {
      type: Type.BOOLEAN,
      description:
        'Remote biometric identification of natural persons (e.g. post/non-real-time identification, or non-prohibited remote biometric identification) (Annex III Point 1(a)).',
    },
    annex_iii_biometrics_categorization: {
      type: Type.BOOLEAN,
      description:
        'Biometric categorization of natural persons according to sensitive or protected attributes, not prohibited under Article 5(1)(g) (Annex III Point 1(b)).',
    },
    annex_iii_biometrics_emotion_recognition: {
      type: Type.BOOLEAN,
      description:
        'Emotion recognition of natural persons outside workplace and educational settings (Annex III Point 1(c)).',
    },

    // Annex III Category 2
    annex_iii_critical_infrastructure_safety_components: {
      type: Type.BOOLEAN,
      description:
        'Safety component in the management or operation of critical digital infrastructure, road traffic, or the supply of water, gas, heating, or electricity (Annex III Point 2).',
    },

    // Annex III Category 3
    annex_iii_education_admission_assignment: {
      type: Type.BOOLEAN,
      description:
        'Determines access, admission, or assignment of natural persons to educational and vocational training institutions (Annex III Point 3(a)).',
    },
    annex_iii_education_learning_evaluation: {
      type: Type.BOOLEAN,
      description:
        'Evaluates learning outcomes, assesses students, or steers the learning process in educational and vocational training (Annex III Point 3(b)).',
    },
    annex_iii_education_level_assessment: {
      type: Type.BOOLEAN,
      description:
        'Assesses the appropriate level of education that an individual will receive or access (Annex III Point 3(c)).',
    },
    annex_iii_education_behavior_monitoring: {
      type: Type.BOOLEAN,
      description:
        'Monitors and detects prohibited behavior of students during tests or examinations (Annex III Point 3(d)).',
    },

    // Annex III Category 4
    annex_iii_employment_recruitment_screening: {
      type: Type.BOOLEAN,
      description:
        'Recruitment or selection of natural persons, including advertising vacancies, screening/filtering applications, and evaluating candidates (Annex III Point 4(a)).',
    },
    annex_iii_employment_workplace_decisions: {
      type: Type.BOOLEAN,
      description:
        'Makes decisions affecting terms of work relationships, promotion, or termination, or allocates tasks based on individual behavior, or monitors/evaluates worker performance (Annex III Point 4(b)).',
    },

    // Annex III Category 5
    annex_iii_essential_services_public_benefits: {
      type: Type.BOOLEAN,
      description:
        'Evaluates eligibility of natural persons for public assistance benefits and services, or grants, reduces, revokes, or reclaims such benefits (Annex III Point 5(a)).',
    },
    annex_iii_essential_services_credit_scoring: {
      type: Type.BOOLEAN,
      description:
        'Evaluates creditworthiness or establishes credit scores of natural persons, excluding financial fraud detection (Annex III Point 5(b)).',
    },
    annex_iii_essential_services_emergency_dispatch: {
      type: Type.BOOLEAN,
      description:
        'Evaluates and classifies emergency calls by natural persons or dispatches priority emergency first aid, police, fire, or medical services (Annex III Point 5(c)).',
    },
    annex_iii_essential_services_health_life_insurance: {
      type: Type.BOOLEAN,
      description:
        'Risk assessment and pricing in relation to natural persons for life and health insurance (Annex III Point 5(d)).',
    },

    // Annex III Category 6
    annex_iii_law_enforcement_victim_risk_assessment: {
      type: Type.BOOLEAN,
      description:
        'Used by or on behalf of law enforcement to assess the risk of a natural person becoming a victim of criminal offences (Annex III Point 6(a)).',
    },
    annex_iii_law_enforcement_polygraph: {
      type: Type.BOOLEAN,
      description:
        'Used by or on behalf of law enforcement as a polygraph or similar lie detection tool (Annex III Point 6(b)).',
    },
    annex_iii_law_enforcement_evidence_reliability: {
      type: Type.BOOLEAN,
      description:
        'Used by or on behalf of law enforcement to evaluate the reliability of evidence in the course of criminal investigations (Annex III Point 6(c)).',
    },
    annex_iii_law_enforcement_offending_risk_profiling: {
      type: Type.BOOLEAN,
      description:
        'Used by or on behalf of law enforcement to assess the risk of offending or re-offending based on objective facts (Annex III Point 6(d)).',
    },
    annex_iii_law_enforcement_criminal_profiling: {
      type: Type.BOOLEAN,
      description:
        'Used by or on behalf of law enforcement for profiling natural persons in the course of detection, investigation, or prosecution of criminal offences (Annex III Point 6(e)).',
    },

    // Annex III Category 7
    annex_iii_migration_polygraph: {
      type: Type.BOOLEAN,
      description:
        'Used by competent authorities as a polygraph or similar lie detection tool in migration, asylum, or border control (Annex III Point 7(a)).',
    },
    annex_iii_migration_risk_assessment: {
      type: Type.BOOLEAN,
      description:
        'Used by competent authorities to assess security, irregular immigration, or health risks of natural persons entering or residing in EU territory (Annex III Point 7(b)).',
    },
    annex_iii_migration_document_verification: {
      type: Type.BOOLEAN,
      description:
        'Used by competent authorities to verify the authenticity of travel documents and identity documentation or detect fraudulent documents (Annex III Point 7(c)).',
    },
    annex_iii_migration_asylum_examination: {
      type: Type.BOOLEAN,
      description:
        'Used by competent authorities to assist in examining applications for asylum, visas, or residence permits and associated complaints (Annex III Point 7(d)).',
    },

    // Annex III Category 8
    annex_iii_justice_judicial_assistance: {
      type: Type.BOOLEAN,
      description:
        'Used by a judicial authority or on its behalf to assist in researching and interpreting facts and the law, or applying the law to concrete facts, or in alternative dispute resolution (Annex III Point 8(a)).',
    },
    annex_iii_justice_election_influencing: {
      type: Type.BOOLEAN,
      description:
        'Intended to influence the outcome of an election or referendum or the voting behavior of natural persons (Annex III Point 8(b)).',
    },

    // Article 50
    article_50_conversational_chatbot: {
      type: Type.BOOLEAN,
      description:
        'Intended to directly interact with natural persons, such as conversational chatbots, customer service agents, or voice assistants (Art. 50(1)).',
    },
    article_50_synthetic_media_deepfakes: {
      type: Type.BOOLEAN,
      description:
        'Generates or manipulates image, audio, or video content that appreciably resembles existing persons, objects, places, or events (deepfakes or synthetic media) (Art. 50(2)).',
    },
    article_50_emotion_biometric_notice: {
      type: Type.BOOLEAN,
      description:
        'Operates an emotion recognition or biometric categorization system permitted under EU law, requiring transparency notices to exposed individuals (Art. 50(3)).',
    },
  },
  required: [
    'article_5_subliminal_manipulation',
    'article_5_vulnerability_exploitation',
    'article_5_social_scoring',
    'article_5_criminal_risk_profiling',
    'article_5_untargeted_facial_scraping',
    'article_5_workplace_education_emotion_recognition',
    'article_5_biometric_categorization_sensitive',
    'article_5_real_time_remote_biometric_enforcement',
    'annex_iii_biometrics_remote_identification',
    'annex_iii_biometrics_categorization',
    'annex_iii_biometrics_emotion_recognition',
    'annex_iii_critical_infrastructure_safety_components',
    'annex_iii_education_admission_assignment',
    'annex_iii_education_learning_evaluation',
    'annex_iii_education_level_assessment',
    'annex_iii_education_behavior_monitoring',
    'annex_iii_employment_recruitment_screening',
    'annex_iii_employment_workplace_decisions',
    'annex_iii_essential_services_public_benefits',
    'annex_iii_essential_services_credit_scoring',
    'annex_iii_essential_services_emergency_dispatch',
    'annex_iii_essential_services_health_life_insurance',
    'annex_iii_law_enforcement_victim_risk_assessment',
    'annex_iii_law_enforcement_polygraph',
    'annex_iii_law_enforcement_evidence_reliability',
    'annex_iii_law_enforcement_offending_risk_profiling',
    'annex_iii_law_enforcement_criminal_profiling',
    'annex_iii_migration_polygraph',
    'annex_iii_migration_risk_assessment',
    'annex_iii_migration_document_verification',
    'annex_iii_migration_asylum_examination',
    'annex_iii_justice_judicial_assistance',
    'annex_iii_justice_election_influencing',
    'article_50_conversational_chatbot',
    'article_50_synthetic_media_deepfakes',
    'article_50_emotion_biometric_notice',
  ],
};

/**
 * Aliases for compatibility across nomenclature conventions.
 */
export const complianceChecklistSchema = complianceChecklistGenAiSchema;

/**
 * Strict JSON Schema definition for @google/genai responseSchema (Full Report format).
 * Maintained for backward compatibility and multi-stage workflows.
 */
export const complianceReportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    risk_tier: {
      type: Type.STRING,
      enum: ['Unacceptable', 'High', 'Limited', 'Minimal'],
      description:
        'The classified regulatory risk tier under EU AI Act Regulation (EU) 2024/1689.',
    },
    matched_category: {
      type: Type.STRING,
      description:
        'The specific domain, Annex III category, or Article trigger identified for the system.',
    },
    matched_article: {
      type: Type.STRING,
      description:
        'Exact legal article or annex reference (e.g. Article 5(1)(c), Annex III Point 4(a), Article 50(1), Article 69).',
    },
    confidence: {
      type: Type.STRING,
      enum: ['High', 'Medium', 'Low'],
      description: 'Confidence level in the risk tier determination.',
    },
    rationale: {
      type: Type.STRING,
      description:
        "Concise 2-4 sentence explanation of why this risk tier applies. Describes the function of the user's system without quoting verbatim from their input.",
    },
    obligations: {
      type: Type.ARRAY,
      description:
        'List of regulatory compliance obligations applicable to this risk tier.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Name of the statutory obligation.',
          },
          article: {
            type: Type.STRING,
            description: 'Article citation in the EU AI Act (e.g. Article 9).',
          },
          description: {
            type: Type.STRING,
            description: 'Specific compliance requirements under this obligation.',
          },
          mandatory: {
            type: Type.BOOLEAN,
            description: 'Whether this obligation is legally mandatory.',
          },
        },
        required: ['title', 'article', 'description', 'mandatory'],
      },
    },
    action_plan: {
      type: Type.ARRAY,
      description: 'Prioritized actionable roadmap to achieve compliance.',
      items: {
        type: Type.OBJECT,
        properties: {
          step: {
            type: Type.INTEGER,
            description: 'Numerical sequence of the step (1, 2, 3, etc.).',
          },
          title: {
            type: Type.STRING,
            description: 'Title of the action plan step.',
          },
          timeframe: {
            type: Type.STRING,
            description: 'Recommended timeframe for completion (e.g. 0-30 days, 30-60 days).',
          },
          priority: {
            type: Type.STRING,
            enum: ['Immediate', 'Short-term', 'Medium-term'],
            description: 'Priority level for execution.',
          },
          details: {
            type: Type.STRING,
            description: 'Specific technical or operational guidance for implementation.',
          },
        },
        required: ['step', 'title', 'timeframe', 'priority', 'details'],
      },
    },
  },
  required: [
    'risk_tier',
    'matched_category',
    'matched_article',
    'confidence',
    'rationale',
    'obligations',
    'action_plan',
  ],
};
