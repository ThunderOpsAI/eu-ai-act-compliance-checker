export type RiskTier = 'Unacceptable' | 'High' | 'Limited' | 'Minimal';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface ObligationItem {
  title: string;
  article: string;
  description: string;
  mandatory: boolean;
}

export interface ActionPlanItem {
  step: number;
  title: string;
  timeframe: string;
  priority: 'Immediate' | 'Short-term' | 'Medium-term';
  details: string;
}

export type ComplianceReport = {
  id: string;
  user_id: string;
  stripe_payment_intent_id?: string | null;
  receipt_email?: string | null;
  risk_tier: RiskTier;
  matched_category: string;
  matched_article: string;
  confidence: ConfidenceLevel;
  rationale: string;
  obligations: ObligationItem[];
  action_plan: ActionPlanItem[];
  is_saved: boolean;
  expires_at: string;
  pdf_ready: boolean;
  pdf_storage_path?: string | null;
  paid_at?: string | null;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: ComplianceReport;
        Insert: Omit<ComplianceReport, 'id' | 'created_at' | 'pdf_ready' | 'is_saved'> & {
          id?: string;
          created_at?: string;
          pdf_ready?: boolean;
          is_saved?: boolean;
        };
        Update: Partial<ComplianceReport>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
