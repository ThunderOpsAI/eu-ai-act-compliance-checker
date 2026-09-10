import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt, formatUserPrompt } from './prompts';
import {
  complianceReportSchema,
  type ClassificationResult,
  type RiskTier,
  type ConfidenceLevel,
} from './schema';

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
 * Deterministic, intelligent mock classifier for testing and environments without an API key.
 * Analyzes keywords in the input prompt to accurately reflect EU AI Act risk categorizations.
 */
export function generateMockClassification(inputPrompt: string): ClassificationResult {
  const normalized = inputPrompt.toLowerCase();

  // 1. Check for Unacceptable Risk (Article 5 Prohibitions)
  const prohibitedTriggers = [
    'subliminal',
    'manipulat',
    'social scoring',
    'social score',
    'vulnerability exploitation',
    'exploit children',
    'racial categorization',
    'facial scraping',
    'untargeted scraping',
    'cctv scraping',
    'emotion recognition in workplace',
    'emotion recognition in school',
    'workplace emotion',
    'classroom emotion',
    'predict criminal offense',
    'pre-crime',
    'predict crime',
  ];

  const matchedProhibited = prohibitedTriggers.some((trigger) =>
    normalized.includes(trigger)
  );

  if (matchedProhibited) {
    return {
      risk_tier: 'Unacceptable',
      matched_category: 'Prohibited AI Practices (Article 5)',
      matched_article: 'Article 5(1)',
      confidence: 'High',
      rationale:
        "The evaluated system description includes functional characteristics that materially manipulate human behavior, perform prohibited biometric inferences, or implement social scoring. Under Article 5 of Regulation (EU) 2024/1689, deploying systems with these capabilities poses unacceptable fundamental rights risks and is strictly prohibited in the EU.",
      obligations: [
        {
          title: 'Prohibition from Placement on Market',
          article: 'Article 5',
          description:
            'The commercial deployment, placing on the market, or putting into service of this AI capability is strictly prohibited across all EU Member States.',
          mandatory: true,
        },
        {
          title: 'Immediate Cease and Decommission',
          article: 'Article 5',
          description:
            'Immediately discontinue development and operational use within EU jurisdiction to prevent severe statutory penalties of up to €35M or 7% of worldwide turnover.',
          mandatory: true,
        },
      ],
      action_plan: [
        {
          step: 1,
          title: 'Halt EU Market Deployment',
          timeframe: 'Immediate (0 - 7 days)',
          priority: 'Immediate',
          details:
            'Cease any live user-facing operations or EU marketing initiatives for this feature set to eliminate imminent regulatory enforcement exposure.',
        },
        {
          step: 2,
          title: 'Architectural & Feature De-scoping',
          timeframe: '7 - 30 days',
          priority: 'Immediate',
          details:
            'Perform a technical audit to strip out prohibited manipulation, social scoring, or unauthorized emotion recognition mechanisms from the application pipeline.',
        },
        {
          step: 3,
          title: 'Independent Fundamental Rights Audit',
          timeframe: '30 - 60 days',
          priority: 'Short-term',
          details:
            'Engage qualified EU AI regulatory counsel to conduct a formal compliance review on the re-architected system prior to any future release.',
        },
      ],
    };
  }

  // 2. Check for High Risk (Annex III Standalone Categories)
  const employmentTriggers = [
    'cv',
    'resume',
    'hiring',
    'recruitment',
    'job applicant',
    'screening candidates',
    'candidate selection',
    'promotion',
    'task allocation',
    'worker monitoring',
    'performance evaluation',
  ];
  const essentialServicesTriggers = [
    'creditworthiness',
    'credit score',
    'credit scoring',
    'loan underwriting',
    'life insurance',
    'health insurance',
    'emergency dispatch',
    'emergency call',
    'public assistance',
  ];
  const educationTriggers = [
    'admission',
    'student evaluation',
    'exam proctoring',
    'grading test',
    'educational assessment',
  ];
  const biometricsTriggers = [
    'remote biometric',
    'facial recognition',
    'biometric identification',
    'biometric categorization',
  ];
  const criticalInfraTriggers = [
    'critical infrastructure',
    'traffic control',
    'water supply',
    'power grid',
    'gas distribution',
  ];
  const lawEnforcementJusticeTriggers = [
    'law enforcement',
    'polygraph',
    'border control',
    'asylum application',
    'visa evaluation',
    'court',
    'sentencing',
    'judge',
  ];

  let highRiskCategory = '';
  if (employmentTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Employment & Workers Management (Annex III Point 4)';
  } else if (essentialServicesTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Essential Private & Public Services (Annex III Point 5)';
  } else if (educationTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Education & Vocational Training (Annex III Point 3)';
  } else if (biometricsTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Biometrics & Identification (Annex III Point 1)';
  } else if (criticalInfraTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Critical Infrastructure (Annex III Point 2)';
  } else if (lawEnforcementJusticeTriggers.some((t) => normalized.includes(t))) {
    highRiskCategory = 'Law Enforcement & Justice (Annex III Points 6-8)';
  }

  if (highRiskCategory) {
    return {
      risk_tier: 'High',
      matched_category: highRiskCategory,
      matched_article: 'Article 6(2) & Annex III',
      confidence: 'High',
      rationale:
        "The evaluated system automates profiling, ranking, or decision-making in a sensitive societal domain identified in Annex III. Pursuant to Article 6(2) of Regulation (EU) 2024/1689, AI systems operating in employment selection, essential service provision, or biometric identification are classified as High-Risk and subject to rigorous pre-market conformity requirements.",
      obligations: [
        {
          title: 'Risk Management System',
          article: 'Article 9',
          description:
            'Establish, implement, document, and maintain a continuous risk management system throughout the entire system lifecycle.',
          mandatory: true,
        },
        {
          title: 'Data Governance & Bias Controls',
          article: 'Article 10',
          description:
            'Ensure training, validation, and testing datasets meet high quality criteria, represent relevant target populations, and undergo statistical bias audits.',
          mandatory: true,
        },
        {
          title: 'Technical Documentation',
          article: 'Article 11',
          description:
            'Compile and maintain comprehensive technical documentation in accordance with Annex IV prior to market placement.',
          mandatory: true,
        },
        {
          title: 'Automatic Event Logging',
          article: 'Article 12',
          description:
            'Enable automatic recording of events (logging) during operation to maintain an auditable traceability trail.',
          mandatory: true,
        },
        {
          title: 'Transparency & User Information',
          article: 'Article 13',
          description:
            'Provide deployers with concise, clear, and comprehensive instructions for use, detailing system specifications and limitations.',
          mandatory: true,
        },
        {
          title: 'Human Oversight Controls',
          article: 'Article 14',
          description:
            'Incorporate human-in-the-loop interfaces enabling qualified operators to review, override, or halt automated recommendations.',
          mandatory: true,
        },
        {
          title: 'Accuracy, Robustness & Cybersecurity',
          article: 'Article 15',
          description:
            'Design the system to achieve consistent accuracy, resilience against adversarial manipulation, and cybersecurity protection.',
          mandatory: true,
        },
        {
          title: 'EU Database Registration',
          article: 'Article 49 & 71',
          description:
            'Complete mandatory registration of the high-risk AI system in the official EU centralized database before commercial operation.',
          mandatory: true,
        },
      ],
      action_plan: [
        {
          step: 1,
          title: 'Algorithmic Bias & Impact Audit',
          timeframe: '0 - 30 days',
          priority: 'Immediate',
          details:
            'Analyze underlying training datasets and scoring models for disparate impact or unintended demographic bias.',
        },
        {
          step: 2,
          title: 'Operationalize Article 9 Risk Management',
          timeframe: '30 - 60 days',
          priority: 'Immediate',
          details:
            'Document known risks, foreseeable misuse scenarios, and corresponding risk mitigation controls into a centralized compliance register.',
        },
        {
          step: 3,
          title: 'Build Human Oversight & Logging Architecture',
          timeframe: '60 - 90 days',
          priority: 'Short-term',
          details:
            'Implement reviewer override controls, explanation interfaces, and tamper-resistant audit event logs.',
        },
        {
          step: 4,
          title: 'Compile Annex IV Dossier & EU Registration',
          timeframe: '90 - 180 days',
          priority: 'Medium-term',
          details:
            'Finalize technical documentation dossier and complete registration in the EU high-risk AI database before entering the EU market.',
        },
      ],
    };
  }

  // 3. Check for Limited Risk (Article 50 Transparency Obligations)
  const limitedTriggers = [
    'chatbot',
    'conversational',
    'virtual assistant',
    'customer support bot',
    'support agent',
    'deepfake',
    'synthetic media',
    'synthetic voice',
    'voice clone',
    'avatar',
    'synthetic video',
    'content generation',
  ];

  const matchedLimited = limitedTriggers.some((trigger) =>
    normalized.includes(trigger)
  );

  if (matchedLimited) {
    return {
      risk_tier: 'Limited',
      matched_category: 'Conversational AI & Synthetic Media (Article 50)',
      matched_article: 'Article 50(1)',
      confidence: 'High',
      rationale:
        "The evaluated system interacts directly with natural persons or creates synthetic content without triggering high-risk or prohibited domains. Under Article 50 of the EU AI Act, transparency obligations mandate informing users that they are interacting with an AI system and providing clear synthetic content disclosures.",
      obligations: [
        {
          title: 'AI Interaction Disclosure',
          article: 'Article 50(1)',
          description:
            'Inform natural persons in a clear, visible, and timely manner that they are communicating directly with an artificial intelligence system.',
          mandatory: true,
        },
        {
          title: 'Synthetic Media Labelling',
          article: 'Article 50(2)',
          description:
            'Ensure all generated synthetic audio, image, or video outputs are marked in a machine-readable format and visibly disclosed as artificially produced.',
          mandatory: true,
        },
      ],
      action_plan: [
        {
          step: 1,
          title: 'Implement User Interface AI Disclosure',
          timeframe: '0 - 14 days',
          priority: 'Immediate',
          details:
            'Add explicit visual badges, initial conversational greetings, and modal disclaimers confirming the AI nature of the assistant.',
        },
        {
          step: 2,
          title: 'Machine-Readable Watermarking Integration',
          timeframe: '14 - 30 days',
          priority: 'Short-term',
          details:
            'Embed industry standard provenance metadata (such as C2PA) and visible watermarks into any generated synthetic media outputs.',
        },
        {
          step: 3,
          title: 'Update Terms of Service & Privacy Policy',
          timeframe: '30 - 60 days',
          priority: 'Medium-term',
          details:
            'Revise customer terms and service documentation to outline AI capabilities, limitations, and user interaction notices.',
        },
      ],
    };
  }

  // 4. Default: Minimal Risk
  return {
    risk_tier: 'Minimal',
    matched_category: 'General AI / Minimal Risk Application',
    matched_article: 'Article 69 / Voluntary Codes of Conduct',
    confidence: 'High',
    rationale:
      "The described system performs standard automated or computational tasks (such as filtering, data optimization, or internal analytics) that do not fall within Article 5 prohibitions, Annex III high-risk use cases, or Article 50 transparency mandates. It represents minimal to no risk to European citizens' safety or fundamental rights.",
    obligations: [
      {
        title: 'Organizational AI Literacy',
        article: 'Article 4',
        description:
          'Ensure technical and operational staff possess a baseline level of AI literacy considering their operational context.',
        mandatory: true,
      },
      {
        title: 'Voluntary Code of Conduct Adherence',
        article: 'Article 69',
        description:
          'Encouraged to voluntarily adhere to ethical AI codes of conduct fostering trustworthy and transparent artificial intelligence.',
        mandatory: false,
      },
    ],
    action_plan: [
      {
        step: 1,
        title: 'AI Literacy Staff Briefing',
        timeframe: '0 - 30 days',
        priority: 'Short-term',
        details:
          'Conduct internal briefings on basic AI literacy and data stewardship principles in accordance with Article 4 requirements.',
      },
      {
        step: 2,
        title: 'Periodic Feature Scope Monitoring',
        timeframe: '60 - 180 days',
        priority: 'Medium-term',
        details:
          'Establish periodic internal check-ins to ensure upcoming system updates or new integrations do not inadvertently expand into Annex III high-risk categories.',
      },
    ],
  };
}

/**
 * Normalizes risk tier values to enforce exact casing.
 */
function normalizeRiskTier(rawTier?: string): RiskTier {
  if (!rawTier) return 'Minimal';
  const lower = rawTier.toLowerCase();
  if (lower === 'unacceptable') return 'Unacceptable';
  if (lower === 'high') return 'High';
  if (lower === 'limited') return 'Limited';
  return 'Minimal';
}

/**
 * Normalizes confidence levels.
 */
function normalizeConfidence(rawConfidence?: string): ConfidenceLevel {
  if (!rawConfidence) return 'Medium';
  const lower = rawConfidence.toLowerCase();
  if (lower === 'high') return 'High';
  if (lower === 'low') return 'Low';
  return 'Medium';
}

/**
 * Classifies an AI system description against the EU AI Act using Google Gemini.
 * Falls back to deterministic mock classification when API keys are not provided or in testing.
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
        responseSchema: complianceReportSchema,
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);

    // Clear timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Check safety finish reason
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT'].includes(candidate.finishReason)) {
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
        `Failed to parse Gemini output as JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`
      );
    }

    // Sanitize and ensure full typed structure
    const result: ClassificationResult = {
      risk_tier: normalizeRiskTier(typeof parsed.risk_tier === 'string' ? parsed.risk_tier : undefined),
      matched_category: String(parsed.matched_category || 'General AI System'),
      matched_article: String(parsed.matched_article || 'Regulation (EU) 2024/1689'),
      confidence: normalizeConfidence(typeof parsed.confidence === 'string' ? parsed.confidence : undefined),
      rationale: String(parsed.rationale || 'Classification determined based on EU AI Act provisions.'),
      obligations: Array.isArray(parsed.obligations)
        ? (parsed.obligations as Record<string, unknown>[]).map((item) => ({
            title: String(item.title || 'Statutory Requirement'),
            article: String(item.article || 'EU AI Act'),
            description: String(item.description || ''),
            mandatory: Boolean(item.mandatory),
          }))
        : [],
      action_plan: Array.isArray(parsed.action_plan)
        ? (parsed.action_plan as Record<string, unknown>[]).map((item, idx) => ({
            step: typeof item.step === 'number' ? item.step : idx + 1,
            title: String(item.title || `Compliance Step ${idx + 1}`),
            timeframe: String(item.timeframe || '30 - 60 days'),
            priority:
              item.priority === 'Immediate' || item.priority === 'Short-term' || item.priority === 'Medium-term'
                ? item.priority
                : 'Short-term',
            details: String(item.details || ''),
          }))
        : [],
    };

    return result;
  } catch (err: unknown) {
    if (timeoutId) clearTimeout(timeoutId);
    // If it is already a descriptive error we created, rethrow
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Gemini classification error: ${String(err)}`);
  }
}
