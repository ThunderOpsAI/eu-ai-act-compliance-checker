import type {
  ObligationItem,
  ActionPlanItem,
  RiskTier,
} from '@/types/database';
import type { ComplianceChecklist } from '@/lib/gemini/schema';

export interface RuleViolationDetail {
  key: keyof ComplianceChecklist;
  article: string;
  category: string;
  name: string;
  rationaleSnippet: string;
}

export interface DomainHighRiskDetail {
  categoryName: string;
  annexPoint: string;
  keys: (keyof ComplianceChecklist)[];
  rationaleSnippet: string;
  domainObligation?: ObligationItem;
  domainAction?: ActionPlanItem;
}

export const ARTICLE_5_DETAILS: Record<string, RuleViolationDetail> = {
  article_5_subliminal_manipulation: {
    key: 'article_5_subliminal_manipulation',
    article: 'Article 5(1)(a)',
    category: 'Prohibited Practices: Subliminal & Deceptive Manipulation',
    name: 'Subliminal or Manipulative Distortion',
    rationaleSnippet:
      'The system deploys subliminal, manipulative, or deceptive techniques operating beyond human consciousness to materially distort behavior and impair informed decision-making, causing or likely causing significant harm.',
  },
  article_5_vulnerability_exploitation: {
    key: 'article_5_vulnerability_exploitation',
    article: 'Article 5(1)(b)',
    category: 'Prohibited Practices: Vulnerability Exploitation',
    name: 'Exploitation of Vulnerabilities',
    rationaleSnippet:
      'The system exploits specific vulnerabilities of individuals or groups (due to age, disability, or socio-economic situation) to materially distort behavior, causing or likely causing significant physical or psychological harm.',
  },
  article_5_social_scoring: {
    key: 'article_5_social_scoring',
    article: 'Article 5(1)(c)',
    category: 'Prohibited Practices: Social Scoring',
    name: 'Social Scoring Evaluation',
    rationaleSnippet:
      'The system evaluates or classifies natural persons over time based on social behavior or personality traits, resulting in detrimental or disproportionate treatment in unrelated social contexts.',
  },
  article_5_criminal_risk_profiling: {
    key: 'article_5_criminal_risk_profiling',
    article: 'Article 5(1)(d)',
    category: 'Prohibited Practices: Criminal Risk Profiling',
    name: 'Individual Criminal Risk Prediction',
    rationaleSnippet:
      'The system assesses or predicts the likelihood of natural persons committing criminal offenses based solely on profiling or assessing personality traits, which is strictly prohibited under EU law.',
  },
  article_5_untargeted_facial_scraping: {
    key: 'article_5_untargeted_facial_scraping',
    article: 'Article 5(1)(e)',
    category: 'Prohibited Practices: Untargeted Facial Scraping',
    name: 'Untargeted Facial Image Scraping',
    rationaleSnippet:
      'The system creates or expands facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage.',
  },
  article_5_workplace_education_emotion_recognition: {
    key: 'article_5_workplace_education_emotion_recognition',
    article: 'Article 5(1)(f)',
    category: 'Prohibited Practices: Workplace & Educational Emotion Recognition',
    name: 'Workplace or Educational Emotion Inference',
    rationaleSnippet:
      'The system infers emotions of natural persons in workplace or educational environments without qualifying for strict medical or safety exemptions.',
  },
  article_5_biometric_categorization_sensitive: {
    key: 'article_5_biometric_categorization_sensitive',
    article: 'Article 5(1)(g)',
    category: 'Prohibited Practices: Sensitive Biometric Categorization',
    name: 'Sensitive Biometric Categorization',
    rationaleSnippet:
      'The system categorizes natural persons using biometric data to deduce sensitive protected traits such as race, political opinions, trade union membership, religious beliefs, sex life, or sexual orientation.',
  },
  article_5_real_time_remote_biometric_enforcement: {
    key: 'article_5_real_time_remote_biometric_enforcement',
    article: 'Article 5(1)(h)',
    category: 'Prohibited Practices: Real-Time Remote Biometric Identification',
    name: 'Public Real-Time Remote Biometric Identification',
    rationaleSnippet:
      'The system deploys real-time remote biometric identification in publicly accessible spaces for law enforcement purposes without meeting strict judicial authorization and statutory exemption thresholds.',
  },
};

/**
 * Standard High-Risk Obligations (Articles 9 - 15, 49) under Chapter III, Section 2.
 */
export const STANDARD_HIGH_RISK_OBLIGATIONS: ObligationItem[] = [
  {
    title: 'Continuous Risk Management System',
    article: 'Article 9',
    description:
      'Establish, implement, document, and maintain a continuous iterative risk management system throughout the entire AI lifecycle, identifying foreseeable risks to health, safety, and fundamental rights.',
    mandatory: true,
  },
  {
    title: 'Data Governance & Bias Mitigation',
    article: 'Article 10',
    description:
      'Ensure training, validation, and testing datasets meet strict statistical quality, representation, and validation criteria, including rigorous audits for discriminatory bias.',
    mandatory: true,
  },
  {
    title: 'Technical Documentation (Annex IV)',
    article: 'Article 11 & Annex IV',
    description:
      'Draft and maintain detailed technical documentation demonstrating statutory compliance before placing on the EU market, kept up-to-date for at least 10 years.',
    mandatory: true,
  },
  {
    title: 'Automated Record-Keeping & Event Logging',
    article: 'Article 12',
    description:
      'Equip system with automated logging capabilities that record system events throughout operation to ensure traceability, post-market monitoring, and incident investigation.',
    mandatory: true,
  },
  {
    title: 'Transparency & Instructions for Deployers',
    article: 'Article 13',
    description:
      'Provide comprehensive, clear, and usable instructions for deployers detailing operational specifications, known limitations, input specifications, and intended purpose.',
    mandatory: true,
  },
  {
    title: 'Human Oversight Architecture',
    article: 'Article 14',
    description:
      'Design technical interfaces that enable natural persons to oversee operations, detect operational anomalies, intervene, and activate an immediate override or emergency stop mechanism.',
    mandatory: true,
  },
  {
    title: 'Accuracy, Robustness & Cybersecurity',
    article: 'Article 15',
    description:
      'Ensure high levels of accuracy, technical robustness against system failures or adversarial attacks, and implement state-of-the-art cybersecurity safeguards.',
    mandatory: true,
  },
  {
    title: 'EU Database Registration & CE Conformity Marking',
    article: 'Articles 49 & 71',
    description:
      'Complete formal conformity assessment, register the high-risk AI system in the official EU Database prior to deployment, and affix the CE conformity mark.',
    mandatory: true,
  },
];

/**
 * High-Risk Action Plan roadmap.
 */
export const STANDARD_HIGH_RISK_ACTION_PLAN: ActionPlanItem[] = [
  {
    step: 1,
    title: 'Conformity Assessment & Gap Audit',
    timeframe: '0 - 30 days',
    priority: 'Immediate',
    details:
      'Conduct a formal gap analysis against Annex III requirements and Chapter III obligations (Articles 9-15) to identify non-compliant components and technical seams.',
  },
  {
    step: 2,
    title: 'Technical Documentation & Data Governance Dossier',
    timeframe: '30 - 60 days',
    priority: 'Immediate',
    details:
      'Compile the comprehensive Annex IV technical documentation file and perform statistical bias and representativeness audits on all training, validation, and benchmark datasets.',
  },
  {
    step: 3,
    title: 'Human Oversight & Logging Interface Implementation',
    timeframe: '60 - 90 days',
    priority: 'Short-term',
    details:
      'Implement automated event-logging pipelines meeting Article 12 standards and build dedicated human-in-the-loop review dashboards with operational override controls.',
  },
  {
    step: 4,
    title: 'Cybersecurity Hardening & Robustness Stress-Testing',
    timeframe: '90 - 120 days',
    priority: 'Short-term',
    details:
      'Execute adversarial testing, jailbreak resilience benchmarks, and data poisoning defense audits to fulfill Article 15 cybersecurity and robustness mandates.',
  },
  {
    step: 5,
    title: 'EU Database Registration & CE Marking Declaration',
    timeframe: '120 - 180 days',
    priority: 'Medium-term',
    details:
      'Register the finalized system in the EU high-risk database, issue the formal EU Declaration of Conformity, and affix the CE marking prior to EU market deployment.',
  },
];

/**
 * Annex III Domain Information (8 Categories).
 */
export const ANNEX_III_DOMAINS: Record<number, DomainHighRiskDetail> = {
  1: {
    categoryName: 'Biometrics & Identification (Annex III Point 1)',
    annexPoint: 'Annex III Point 1',
    keys: [
      'annex_iii_biometrics_remote_identification',
      'annex_iii_biometrics_categorization',
      'annex_iii_biometrics_emotion_recognition',
    ],
    rationaleSnippet:
      'The system operates in the domain of biometric identification, categorization, or emotion recognition outside workplace and educational institutions.',
    domainObligation: {
      title: 'Biometric Verification & Fundamental Rights Safeguards',
      article: 'Annex III Point 1 & Article 10',
      description:
        'Enforce biometric accuracy thresholds across diverse demographics, implement strict false-match rate monitoring, and prevent demographic performance disparities.',
      mandatory: true,
    },
  },
  2: {
    categoryName: 'Critical Infrastructure (Annex III Point 2)',
    annexPoint: 'Annex III Point 2',
    keys: ['annex_iii_critical_infrastructure_safety_components'],
    rationaleSnippet:
      'The system serves as a safety component in the management or operation of critical digital infrastructure, road traffic, or essential utilities (water, gas, heating, electricity).',
    domainObligation: {
      title: 'Fail-Safe Resilience in Critical Operations',
      article: 'Annex III Point 2 & Article 15',
      description:
        'Implement fail-safe architecture, redundant physical safety overrides, and real-time physical telemetry monitoring to prevent infrastructure disruption.',
      mandatory: true,
    },
  },
  3: {
    categoryName: 'Education & Vocational Training (Annex III Point 3)',
    annexPoint: 'Annex III Point 3',
    keys: [
      'annex_iii_education_admission_assignment',
      'annex_iii_education_learning_evaluation',
      'annex_iii_education_level_assessment',
      'annex_iii_education_behavior_monitoring',
    ],
    rationaleSnippet:
      'The system determines admissions, evaluates learning outcomes, assesses appropriate educational levels, or monitors student behavior in educational and vocational training.',
    domainObligation: {
      title: 'Educational Fairness & Anti-Bias Auditing',
      article: 'Annex III Point 3 & Article 10',
      description:
        'Audit evaluation and scoring algorithms for discriminatory bias across socio-economic, racial, and neurodivergent groups, maintaining human oversight over all grade/admission decisions.',
      mandatory: true,
    },
  },
  4: {
    categoryName: 'Employment & Workers Management (Annex III Point 4)',
    annexPoint: 'Annex III Point 4',
    keys: [
      'annex_iii_employment_recruitment_screening',
      'annex_iii_employment_workplace_decisions',
    ],
    rationaleSnippet:
      'The system automates or assists in job recruitment, candidate screening, promotion, termination, task allocation, or worker performance and behavior monitoring.',
    domainObligation: {
      title: 'Worker Information & Non-Discrimination Protections',
      article: 'Annex III Point 4 & Article 26(11)',
      description:
        'Prior to putting into service, inform worker representatives and affected workers that they will be subject to the AI system, and conduct recurring hiring fairness audits.',
      mandatory: true,
    },
  },
  5: {
    categoryName: 'Essential Private & Public Services (Annex III Point 5)',
    annexPoint: 'Annex III Point 5',
    keys: [
      'annex_iii_essential_services_public_benefits',
      'annex_iii_essential_services_credit_scoring',
      'annex_iii_essential_services_emergency_dispatch',
      'annex_iii_essential_services_health_life_insurance',
    ],
    rationaleSnippet:
      'The system evaluates eligibility for public assistance benefits, assesses creditworthiness, dispatches emergency first responders, or calculates risk/pricing in health and life insurance.',
    domainObligation: {
      title: 'Equal Access & Financial/Health Non-Discrimination',
      article: 'Annex III Point 5 & Article 10',
      description:
        'Mitigate historical bias in credit, insurance, or emergency dispatch models, ensuring equitable service access without unlawful socio-economic discrimination.',
      mandatory: true,
    },
  },
  6: {
    categoryName: 'Law Enforcement (Annex III Point 6)',
    annexPoint: 'Annex III Point 6',
    keys: [
      'annex_iii_law_enforcement_victim_risk_assessment',
      'annex_iii_law_enforcement_polygraph',
      'annex_iii_law_enforcement_evidence_reliability',
      'annex_iii_law_enforcement_offending_risk_profiling',
      'annex_iii_law_enforcement_criminal_profiling',
    ],
    rationaleSnippet:
      'The system assists law enforcement authorities in risk assessment of victims, lie detection, evidence evaluation, offending risk evaluation, or investigative profiling.',
    domainObligation: {
      title: 'Judicial Accountability & Evidentiary Integrity',
      article: 'Annex III Point 6 & Article 14',
      description:
        'Ensure human investigative oversight, audit chain-of-custody logging, and strictly prohibit automated conviction or punitive actions without judicial validation.',
      mandatory: true,
    },
  },
  7: {
    categoryName: 'Migration, Asylum & Border Control (Annex III Point 7)',
    annexPoint: 'Annex III Point 7',
    keys: [
      'annex_iii_migration_polygraph',
      'annex_iii_migration_risk_assessment',
      'annex_iii_migration_document_verification',
      'annex_iii_migration_asylum_examination',
    ],
    rationaleSnippet:
      'The system assists competent border authorities with polygraphs, security/irregular immigration risk assessment, document verification, or asylum and visa application processing.',
    domainObligation: {
      title: 'Asylum Seeker Rights & Document Authenticity Verification',
      article: 'Annex III Point 7 & Article 14',
      description:
        'Preserve fundamental rights of migrants and asylum seekers, requiring independent human review of all adverse immigration determinations and document verification rejections.',
      mandatory: true,
    },
  },
  8: {
    categoryName: 'Administration of Justice & Democratic Processes (Annex III Point 8)',
    annexPoint: 'Annex III Point 8',
    keys: [
      'annex_iii_justice_judicial_assistance',
      'annex_iii_justice_election_influencing',
    ],
    rationaleSnippet:
      'The system assists judicial authorities in researching and interpreting legal facts and law, or is intended to influence voter behavior and outcomes in elections or referenda.',
    domainObligation: {
      title: 'Judicial Independence & Democratic Integrity',
      article: 'Annex III Point 8 & Article 14',
      description:
        'Safeguard judicial autonomy by ensuring AI recommendations remain strictly advisory, and enforce algorithmic neutrality in democratic civic processes.',
      mandatory: true,
    },
  },
};

/**
 * Article 50 Limited Risk Content.
 */
export const ARTICLE_50_DETAILS: Record<
  string,
  {
    article: string;
    title: string;
    rationaleSnippet: string;
    obligation: ObligationItem;
    action: ActionPlanItem;
  }
> = {
  article_50_conversational_chatbot: {
    article: 'Article 50(1)',
    title: 'Conversational AI / Natural Person Interaction',
    rationaleSnippet:
      'The evaluated system is intended to interact directly with natural persons (such as a conversational chatbot, virtual assistant, or voice agent). Under Article 50(1), providers must ensure natural persons are informed that they are interacting with an AI system, unless obvious from the context.',
    obligation: {
      title: 'Mandatory AI Identity Disclosure',
      article: 'Article 50(1)',
      description:
        'Inform natural persons in a timely, clear, and intelligible manner that they are interacting with an artificial intelligence system, unless obvious from the circumstances.',
      mandatory: true,
    },
    action: {
      step: 1,
      title: 'Deploy User-Facing AI Interaction Notices',
      timeframe: 'Immediate (0 - 14 days)',
      priority: 'Immediate',
      details:
        'Add a clear visual label and introductory message in the chat/voice interface explicitly notifying users that responses are generated by an AI assistant.',
    },
  },
  article_50_synthetic_media_deepfakes: {
    article: 'Article 50(2) & 50(4)',
    title: 'Synthetic Media & Generative AI Content',
    rationaleSnippet:
      'The evaluated system generates or manipulates synthetic image, audio, or video content resembling real persons, objects, or events (deepfakes/synthetic media) or generates public-facing text. Under Article 50(2) & 50(4), providers must visibly disclose synthetic origin and embed machine-readable watermarks.',
    obligation: {
      title: 'Machine-Readable Watermarking & Visible Disclosure',
      article: 'Article 50(2) & 50(4)',
      description:
        'Mark all generated audio, image, video, and text content in a machine-readable format (e.g. C2PA metadata watermarks) and prominently disclose that the content has been artificially generated or manipulated.',
      mandatory: true,
    },
    action: {
      step: 2,
      title: 'Implement Cryptographic / Machine-Readable Watermarking',
      timeframe: '14 - 30 days',
      priority: 'Immediate',
      details:
        'Integrate cryptographic provenance markers (such as C2PA metadata) and visual/auditory watermarks on all generated media outputs to comply with Article 50(2).',
    },
  },
  article_50_emotion_biometric_notice: {
    article: 'Article 50(3)',
    title: 'Permitted Emotion Recognition / Biometric Notice',
    rationaleSnippet:
      'The system operates an emotion recognition or biometric categorization system where permitted under EU law. Under Article 50(3), deployers must inform exposed natural persons of the operation of the system prior to or at the time of exposure.',
    obligation: {
      title: 'Exposure Notification to Natural Persons',
      article: 'Article 50(3)',
      description:
        'Invert or present clear disclosures to natural persons exposed to emotion recognition or biometric categorization, detailing the processing purpose and statutory legal basis.',
      mandatory: true,
    },
    action: {
      step: 3,
      title: 'Publish Real-Time Exposure Notices & GDPR Alignment',
      timeframe: '14 - 30 days',
      priority: 'Immediate',
      details:
        'Install visible physical signage or digital prompts notifying exposed individuals of emotion/biometric tracking prior to processing, accompanied by updated GDPR privacy disclosures.',
    },
  },
};

/**
 * Minimal Risk Content (Default Fallthrough).
 */
export const MINIMAL_RISK_CONTENT = {
  tier: 'Minimal' as RiskTier,
  category: 'General AI Application (Minimal / No Statutory Risk)',
  article: 'Article 4 & Article 95 (Voluntary Codes of Conduct)',
  rationale:
    'The evaluated AI system does not implement any prohibited practices under Article 5, does not fall within the standalone critical domains of Annex III, and does not trigger the specific transparency obligations of Article 50. Consequently, it is classified as Minimal / No Risk under Regulation (EU) 2024/1689. Providers may deploy without pre-market authorization or mandatory technical documentation.',
  obligations: [
    {
      title: 'Staff AI Literacy Requirements',
      article: 'Article 4',
      description:
        'Ensure that personnel and teams responsible for operating and monitoring the AI system possess a sufficient level of AI literacy, taking into account their technical knowledge and context of use.',
      mandatory: true,
    },
    {
      title: 'Voluntary Codes of Conduct Adherence',
      article: 'Article 95',
      description:
        'Providers of non-high-risk AI systems are encouraged to draw up or adhere to voluntary Union-level codes of conduct demonstrating environmental sustainability and trustworthy AI principles.',
      mandatory: false,
    },
  ] as ObligationItem[],
  action_plan: [
    {
      step: 1,
      title: 'Conduct Internal AI Literacy Training',
      timeframe: '30 - 60 days',
      priority: 'Short-term' as const,
      details:
        'Provide team members interacting with the AI system with foundational training covering operational boundaries, hallucination risks, and data hygiene under Article 4.',
    },
    {
      step: 2,
      title: 'Establish Change Management & Feature Monitoring',
      timeframe: '60 - 90 days',
      priority: 'Medium-term' as const,
      details:
        'Implement an internal review trigger to re-evaluate regulatory classification if the system is expanded to process biometric data, employment evaluations, or customer credit checks.',
    },
    {
      step: 3,
      title: 'Voluntary Code of Conduct Alignment',
      timeframe: '90 - 180 days',
      priority: 'Medium-term' as const,
      details:
        'Benchmark internal governance against voluntary EU AI Office codes of conduct to ensure industry-leading ethical and transparent AI deployment.',
    },
  ] as ActionPlanItem[],
};
