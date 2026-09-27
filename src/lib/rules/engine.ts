import type {
  RiskTier,
  ConfidenceLevel,
  ObligationItem,
  ActionPlanItem,
} from '@/types/database';
import {
  ARTICLE_5_KEYS,
  ANNEX_III_KEYS,
  ARTICLE_50_KEYS,
  CHECKLIST_METADATA,
  type ComplianceChecklist,
  type ClassificationResult,
} from '@/lib/gemini/schema';
import {
  ARTICLE_5_DETAILS,
  ANNEX_III_DOMAINS,
  STANDARD_HIGH_RISK_OBLIGATIONS,
  STANDARD_HIGH_RISK_ACTION_PLAN,
  ARTICLE_50_DETAILS,
  MINIMAL_RISK_CONTENT,
} from './content';

/**
 * Normalizes a partial or incomplete checklist to a full boolean record where missing keys default to false.
 */
export function normalizeChecklist(
  partialChecklist: Partial<ComplianceChecklist> | null | undefined
): ComplianceChecklist {
  const result = {} as Record<keyof ComplianceChecklist, boolean>;
  const allKeys = Object.keys(CHECKLIST_METADATA) as (keyof ComplianceChecklist)[];

  for (const key of allKeys) {
    result[key] = Boolean(partialChecklist?.[key]);
  }

  return result as ComplianceChecklist;
}

/**
 * Evaluates an EU AI Act ComplianceChecklist deterministically against statutory risk tiers.
 * Hierarchy of precedence: Unacceptable (Art 5) > High (Annex III) > Limited (Art 50) > Minimal.
 *
 * @param inputChecklist Full or partial boolean checklist.
 * @returns Fully populated, regulation-grade ClassificationResult.
 */
export function evaluateComplianceChecklist(
  inputChecklist: Partial<ComplianceChecklist> | null | undefined
): ClassificationResult {
  const checklist = normalizeChecklist(inputChecklist);

  // 1. Collect all active triggers
  const activeArticle5Keys = ARTICLE_5_KEYS.filter((k) => checklist[k]);
  const activeAnnexIIIKeys = ANNEX_III_KEYS.filter((k) => checklist[k]);
  const activeArticle50Keys = ARTICLE_50_KEYS.filter((k) => checklist[k]);

  // -------------------------------------------------------------------------
  // Case A: Unacceptable Risk (Article 5 Prohibited AI Practices)
  // -------------------------------------------------------------------------
  if (activeArticle5Keys.length > 0) {
    return buildUnacceptableRiskResult(
      activeArticle5Keys,
      activeAnnexIIIKeys,
      activeArticle50Keys
    );
  }

  // -------------------------------------------------------------------------
  // Case B: High Risk (Annex III Critical Domains under Article 6(2))
  // -------------------------------------------------------------------------
  if (activeAnnexIIIKeys.length > 0) {
    return buildHighRiskResult(activeAnnexIIIKeys, activeArticle50Keys);
  }

  // -------------------------------------------------------------------------
  // Case C: Limited Risk (Article 50 Transparency Triggers)
  // -------------------------------------------------------------------------
  if (activeArticle50Keys.length > 0) {
    return buildLimitedRiskResult(activeArticle50Keys);
  }

  // -------------------------------------------------------------------------
  // Case D: Minimal Risk (No Statutory Triggers Active)
  // -------------------------------------------------------------------------
  return buildMinimalRiskResult();
}

/**
 * Builds the ClassificationResult for Unacceptable Risk violations.
 */
function buildUnacceptableRiskResult(
  activeArticle5Keys: (keyof ComplianceChecklist)[],
  activeAnnexIIIKeys: (keyof ComplianceChecklist)[],
  activeArticle50Keys: (keyof ComplianceChecklist)[]
): ClassificationResult {
  const violations = activeArticle5Keys.map(
    (k) => ARTICLE_5_DETAILS[k] || {
      key: k,
      article: CHECKLIST_METADATA[k]?.article || 'Article 5',
      category: CHECKLIST_METADATA[k]?.category || 'Prohibited Practice',
      name: k,
      rationaleSnippet: 'The system implements prohibited capabilities under Article 5 of Regulation (EU) 2024/1689.',
    }
  );

  const matchedArticles = Array.from(new Set(violations.map((v) => v.article))).join(', ');
  const matchedCategories = violations.map((v) => v.category).join(' | ');

  // Synthesize rationale
  let rationale = `The evaluated system description includes functional characteristics that fall under Article 5 prohibitions of Regulation (EU) 2024/1689. Specifically: ${violations
    .map((v) => `${v.name} (${v.article}): ${v.rationaleSnippet}`)
    .join(' ')} Placing on the market, putting into service, or using systems with these capabilities is strictly banned throughout the European Union.`;

  // Secondary notice if Annex III or Article 50 aspects are also present
  if (activeAnnexIIIKeys.length > 0 || activeArticle50Keys.length > 0) {
    const secondaryDomains: string[] = [];
    if (activeAnnexIIIKeys.length > 0) secondaryDomains.push('Annex III High-Risk operations');
    if (activeArticle50Keys.length > 0) secondaryDomains.push('Article 50 Transparency mechanisms');

    rationale += ` Note: While the system also implements capabilities in ${secondaryDomains.join(
      ' and '
    )}, commercial deployment is entirely barred due to the primary Article 5 prohibitions.`;
  }

  const obligations: ObligationItem[] = [
    {
      title: 'Prohibition from Placement on Market and Putting into Service',
      article: 'Article 5',
      description:
        'The deployment, marketing, licensing, or live operation of this AI capability is strictly prohibited across all EU Member States. No conformity assessment or certification can legalize prohibited practices.',
      mandatory: true,
    },
    {
      title: 'Immediate Cease, Decommissioning & Recall Mandate',
      article: 'Article 5 & Article 99',
      description:
        'Immediately discontinue development, testing, and operational deployment within EU jurisdiction. Continued deployment risks statutory penalties of up to €35,000,000 or 7% of total worldwide annual turnover.',
      mandatory: true,
    },
  ];

  const action_plan: ActionPlanItem[] = [
    {
      step: 1,
      title: 'Halt EU Market Deployment & Live Operations',
      timeframe: 'Immediate (0 - 7 days)',
      priority: 'Immediate',
      details:
        'Cease all live user-facing operations, EU marketing, or active beta deployments immediately to mitigate direct statutory enforcement and catastrophic liability exposure under Article 99.',
    },
    {
      step: 2,
      title: 'Architectural De-scoping & Removal of Prohibited Features',
      timeframe: '7 - 30 days',
      priority: 'Immediate',
      details: `Perform an immediate technical audit to permanently remove prohibited mechanisms (${violations
        .map((v) => v.name)
        .join(', ')}) from the codebase, training objectives, and operational workflows.`,
    },
    {
      step: 3,
      title: 'Independent Fundamental Rights & Legal Audit',
      timeframe: '30 - 60 days',
      priority: 'Short-term',
      details:
        'Engage qualified European regulatory counsel to verify complete elimination of prohibited techniques before considering any future release under high-risk or limited-risk regimes.',
    },
  ];

  return {
    risk_tier: 'Unacceptable',
    matched_category: matchedCategories,
    matched_article: matchedArticles,
    confidence: 'High',
    rationale,
    obligations,
    action_plan,
  };
}

/**
 * Builds the ClassificationResult for High Risk (Annex III) systems.
 */
function buildHighRiskResult(
  activeAnnexIIIKeys: (keyof ComplianceChecklist)[],
  activeArticle50Keys: (keyof ComplianceChecklist)[]
): ClassificationResult {
  // Find which of the 8 Annex III domains are active
  const activeDomains = Object.values(ANNEX_III_DOMAINS).filter((domain) =>
    domain.keys.some((key) => activeAnnexIIIKeys.includes(key))
  );

  const matchedCategories = activeDomains.map((d) => d.categoryName).join(' | ');

  const specificArticles = activeAnnexIIIKeys.map(
    (k) => CHECKLIST_METADATA[k]?.article || 'Article 6(2)'
  );
  const matchedArticles = ['Article 6(2)', ...Array.from(new Set(specificArticles))].join(', ');

  // Synthesize domain rationale
  const domainRationales = activeDomains
    .map((d) => `${d.categoryName}: ${d.rationaleSnippet}`)
    .join(' ');

  let rationale = `The evaluated AI system falls within high-risk standalone categories designated under Annex III pursuant to Article 6(2) of Regulation (EU) 2024/1689. Specifically: ${domainRationales} Prior to placement on the EU market or putting into service, deployers and providers must rigorously satisfy all Chapter III mandatory requirements.`;

  if (activeArticle50Keys.length > 0) {
    rationale += ` In addition, the system incorporates user-facing interactive or generative features triggering supplementary Article 50 transparency obligations.`;
  }

  // Deduplicated high-risk obligations
  const obligations: ObligationItem[] = [...STANDARD_HIGH_RISK_OBLIGATIONS];

  // Append domain-specific obligations
  for (const domain of activeDomains) {
    if (domain.domainObligation) {
      obligations.push(domain.domainObligation);
    }
  }

  // Append Article 50 obligations if applicable
  for (const key of activeArticle50Keys) {
    const detail = ARTICLE_50_DETAILS[key];
    if (detail) {
      obligations.push(detail.obligation);
    }
  }

  // Construct comprehensive action plan
  const action_plan: ActionPlanItem[] = [...STANDARD_HIGH_RISK_ACTION_PLAN];

  return {
    risk_tier: 'High',
    matched_category: matchedCategories,
    matched_article: matchedArticles,
    confidence: 'High',
    rationale,
    obligations,
    action_plan,
  };
}

/**
 * Builds the ClassificationResult for Limited Risk (Article 50) systems.
 */
function buildLimitedRiskResult(
  activeArticle50Keys: (keyof ComplianceChecklist)[]
): ClassificationResult {
  const activeDetails = activeArticle50Keys
    .map((k) => ARTICLE_50_DETAILS[k])
    .filter(Boolean);

  const matchedArticles = Array.from(new Set(activeDetails.map((d) => d.article))).join(', ');
  const matchedCategories = activeDetails.map((d) => d.title).join(' | ');

  const rationales = activeDetails.map((d) => d.rationaleSnippet).join(' ');
  const rationale = `The evaluated AI system qualifies as Limited Risk under Regulation (EU) 2024/1689. ${rationales} While not subject to the extensive pre-market conformity assessment of Annex III high-risk systems, the system must strictly comply with mandatory transparency notices.`;

  const obligations = activeDetails.map((d) => d.obligation);
  const action_plan = activeDetails.map((d, idx) => ({
    ...d.action,
    step: idx + 1,
  }));

  // Add final review step if needed
  if (action_plan.length < 3) {
    action_plan.push({
      step: action_plan.length + 1,
      title: 'Maintain Transparency Records & Change Governance',
      timeframe: '30 - 60 days',
      priority: 'Short-term',
      details:
        'Document implementation of transparency disclosures and establish triggers to re-audit if new automated decision-making or biometric capabilities are introduced.',
    });
  }

  return {
    risk_tier: 'Limited',
    matched_category: matchedCategories,
    matched_article: matchedArticles,
    confidence: 'High',
    rationale,
    obligations,
    action_plan,
  };
}

/**
 * Builds the default ClassificationResult for Minimal Risk systems.
 */
function buildMinimalRiskResult(): ClassificationResult {
  return {
    risk_tier: MINIMAL_RISK_CONTENT.tier,
    matched_category: MINIMAL_RISK_CONTENT.category,
    matched_article: MINIMAL_RISK_CONTENT.article,
    confidence: 'High' as ConfidenceLevel,
    rationale: MINIMAL_RISK_CONTENT.rationale,
    obligations: MINIMAL_RISK_CONTENT.obligations,
    action_plan: MINIMAL_RISK_CONTENT.action_plan,
  };
}
