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
 * Strict JSON Schema definition for @google/genai responseSchema.
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
