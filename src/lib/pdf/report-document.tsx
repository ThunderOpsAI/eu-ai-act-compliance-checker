import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  ComplianceReport,
  RiskTier,
  ObligationItem,
  ActionPlanItem,
} from '@/types/database';

// ----------------------------------------------------------------------
// Color Palette & Design Tokens
// ----------------------------------------------------------------------
const COLORS = {
  primary: '#003399', // European Flag Blue
  primaryDark: '#002266',
  primaryLight: '#E8EEF9',
  navy: '#0F172A',
  slateDark: '#1E293B',
  slateMedium: '#475569',
  slateLight: '#64748B',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  surfaceLight: '#F8FAFC',
  white: '#FFFFFF',
  
  // Risk Tiers
  unacceptable: {
    bg: '#FEF2F2',
    border: '#F87171',
    text: '#991B1B',
    badge: '#DC2626',
    badgeText: '#FFFFFF',
  },
  high: {
    bg: '#FFF7ED',
    border: '#FB923C',
    text: '#9A3412',
    badge: '#EA580C',
    badgeText: '#FFFFFF',
  },
  limited: {
    bg: '#FFFBEB',
    border: '#FBBF24',
    text: '#92400E',
    badge: '#D97706',
    badgeText: '#FFFFFF',
  },
  minimal: {
    bg: '#F0FDF4',
    border: '#4ADE80',
    text: '#166534',
    badge: '#16A34A',
    badgeText: '#FFFFFF',
  },

  // Priorities
  priorityImmediate: {
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FCA5A5',
  },
  priorityShort: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FCD34D',
  },
  priorityMedium: {
    bg: '#E0F2FE',
    text: '#075985',
    border: '#BAE6FD',
  },
};

// ----------------------------------------------------------------------
// Stylesheet
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.slateDark,
    backgroundColor: COLORS.white,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
  
  // Header section
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 14,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTitleBlock: {
    maxWidth: '65%',
  },
  documentSuperTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  documentTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 3,
  },
  documentSubtitle: {
    fontSize: 9,
    color: COLORS.slateMedium,
  },
  metadataCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 8,
    minWidth: 160,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  metadataLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.slateLight,
    textTransform: 'uppercase',
  },
  metadataValue: {
    fontSize: 7.5,
    color: COLORS.slateDark,
    fontFamily: 'Helvetica',
  },

  // Risk Tier Banner
  tierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
  },
  tierBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tierBadgeText: {
    color: COLORS.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierHeadline: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  tierSubtext: {
    fontSize: 8,
    color: COLORS.slateMedium,
    marginTop: 1,
  },

  // Section Headers
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCounter: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.slateLight,
  },

  // Classification Overview Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 8,
  },
  metricLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.slateLight,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  metricSub: {
    fontSize: 7.5,
    color: COLORS.slateMedium,
    marginTop: 2,
  },

  // Rationale Callout
  calloutBox: {
    backgroundColor: COLORS.surfaceLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  calloutText: {
    fontSize: 8.5,
    color: COLORS.slateDark,
    lineHeight: 1.45,
  },

  // Obligations Table/Cards
  obligationItem: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 9,
    marginBottom: 6,
  },
  obligationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  obligationTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  obligationTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    flex: 1,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  articlePill: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  articlePillText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },
  mandatoryPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  mandatoryPillText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  obligationDescription: {
    fontSize: 8,
    color: COLORS.slateMedium,
    lineHeight: 1.4,
  },

  // Action Plan Checklist
  actionItem: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 9,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkboxBox: {
    width: 13,
    height: 13,
    borderWidth: 1.2,
    borderColor: COLORS.slateLight,
    borderRadius: 2,
    marginTop: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  actionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    borderWidth: 0.5,
  },
  priorityBadgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  actionDetails: {
    fontSize: 8,
    color: COLORS.slateMedium,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  timeframeText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.slateLight,
  },

  // Disclaimer Box
  disclaimerBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  disclaimerTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#991B1B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 7.5,
    color: '#7F1D1D',
    lineHeight: 1.4,
  },

  // Footer (Fixed across pages)
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.slateLight,
  },
  footerPageNumber: {
    fontSize: 7,
    color: COLORS.slateLight,
    fontFamily: 'Helvetica-Bold',
  },
});

// ----------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------
function getTierStyle(tier: RiskTier) {
  switch (tier) {
    case 'Unacceptable':
      return COLORS.unacceptable;
    case 'High':
      return COLORS.high;
    case 'Limited':
      return COLORS.limited;
    case 'Minimal':
    default:
      return COLORS.minimal;
  }
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'Immediate':
      return COLORS.priorityImmediate;
    case 'Short-term':
      return COLORS.priorityShort;
    case 'Medium-term':
    default:
      return COLORS.priorityMedium;
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ----------------------------------------------------------------------
// Main Document Component
// ----------------------------------------------------------------------
export interface ComplianceReportDocumentProps {
  report: ComplianceReport;
  verifiedDate?: string;
}

export const ComplianceReportDocument: React.FC<ComplianceReportDocumentProps> = ({
  report,
  verifiedDate = 'August 2024 / Regulation (EU) 2024/1689',
}) => {
  const tierStyle = getTierStyle(report.risk_tier);
  const formattedGeneratedDate = formatDate(report.created_at);

  return (
    <Document
      title={`EU AI Act Compliance Report - ${report.id}`}
      author="EU AI Act Compliance Checker"
      subject={`EU AI Act Compliance Assessment: ${report.risk_tier} Risk`}
      keywords="EU AI Act, Compliance, Artificial Intelligence, Regulation (EU) 2024/1689"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* ================= HEADER ================= */}
        <View style={styles.headerContainer} wrap={false}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.documentSuperTitle}>Regulatory Assessment Report</Text>
              <Text style={styles.documentTitle}>EU AI Act Compliance Assessment</Text>
              <Text style={styles.documentSubtitle}>
                Official analysis against Regulation (EU) 2024/1689 (Artificial Intelligence Act)
              </Text>
            </View>

            <View style={styles.metadataCard}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Report ID:</Text>
                <Text style={styles.metadataValue}>{report.id ? report.id.substring(0, 8) + '...' : 'N/A'}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Generated:</Text>
                <Text style={styles.metadataValue}>{formattedGeneratedDate}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Act Verified:</Text>
                <Text style={styles.metadataValue}>{verifiedDate}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Status:</Text>
                <Text style={[styles.metadataValue, { fontFamily: 'Helvetica-Bold', color: '#166534' }]}>
                  {report.paid_at ? 'Official Paid Assessment' : 'Verified Report'}
                </Text>
              </View>
            </View>
          </View>

          {/* Risk Tier Badge Banner */}
          <View
            style={[
              styles.tierBanner,
              { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
            ]}
          >
            <View style={styles.tierBannerLeft}>
              <View style={[styles.tierBadge, { backgroundColor: tierStyle.badge }]}>
                <Text style={styles.tierBadgeText}>{report.risk_tier} Risk</Text>
              </View>
              <View>
                <Text style={[styles.tierHeadline, { color: tierStyle.text }]}>
                  EU AI Act Classification: {report.risk_tier} Tier System
                </Text>
                <Text style={styles.tierSubtext}>
                  System evaluated pursuant to Title II & Title III statutory criteria
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= SECTION 1: CLASSIFICATION & RISK TIER ================= */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Section 1: Classification & Risk Assessment</Text>
            <Text style={styles.sectionCounter}>Part 1 of 4</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Matched Article</Text>
              <Text style={styles.metricValue}>{report.matched_article || 'Article Analysis'}</Text>
              <Text style={styles.metricSub}>Statutory Basis</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Annex Category</Text>
              <Text style={styles.metricValue}>{report.matched_category || 'General Classification'}</Text>
              <Text style={styles.metricSub}>Categorical Scope</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Confidence Level</Text>
              <Text
                style={[
                  styles.metricValue,
                  {
                    color:
                      report.confidence === 'High'
                        ? '#166534'
                        : report.confidence === 'Medium'
                        ? '#92400E'
                        : '#991B1B',
                  },
                ]}
              >
                {report.confidence || 'Medium'} Confidence
              </Text>
              <Text style={styles.metricSub}>Classification Certainty</Text>
            </View>
          </View>

          {/* Executive Rationale Box */}
          <View style={styles.calloutBox}>
            <Text style={styles.calloutTitle}>Executive Summary & Rationale</Text>
            <Text style={styles.calloutText}>{report.rationale}</Text>
          </View>
        </View>

        {/* ================= SECTION 2: STATUTORY OBLIGATIONS ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow} wrap={false}>
            <Text style={styles.sectionTitle}>Section 2: Statutory Obligations</Text>
            <Text style={styles.sectionCounter}>
              {report.obligations ? report.obligations.length : 0} Mandatory & Conditional Requirements
            </Text>
          </View>

          {report.obligations && report.obligations.length > 0 ? (
            report.obligations.map((item: ObligationItem, index: number) => (
              <View key={index} style={styles.obligationItem} wrap={false}>
                <View style={styles.obligationHeaderRow}>
                  <View style={styles.obligationTitleBlock}>
                    <Text style={styles.obligationTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {item.article ? (
                      <View style={styles.articlePill}>
                        <Text style={styles.articlePillText}>{item.article}</Text>
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.mandatoryPill,
                        {
                          backgroundColor: item.mandatory ? '#FEE2E2' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mandatoryPillText,
                          {
                            color: item.mandatory ? '#991B1B' : '#475569',
                          },
                        ]}
                      >
                        {item.mandatory ? 'Mandatory' : 'Conditional'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.obligationDescription}>{item.description}</Text>
              </View>
            ))
          ) : (
            <View style={styles.obligationItem}>
              <Text style={styles.obligationDescription}>
                No explicit statutory obligations identified under current classification parameters.
              </Text>
            </View>
          )}
        </View>

        {/* ================= SECTION 3: PRIORITIZED ACTION PLAN ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow} wrap={false}>
            <Text style={styles.sectionTitle}>Section 3: Prioritized Action Plan & Checklist</Text>
            <Text style={styles.sectionCounter}>
              {report.action_plan ? report.action_plan.length : 0} Recommended Actions
            </Text>
          </View>

          {report.action_plan && report.action_plan.length > 0 ? (
            report.action_plan.map((action: ActionPlanItem, index: number) => {
              const priorityStyle = getPriorityStyle(action.priority);
              return (
                <View key={index} style={styles.actionItem} wrap={false}>
                  <View style={styles.checkboxBox} />
                  <View style={styles.actionContent}>
                    <View style={styles.actionHeader}>
                      <Text style={styles.actionTitle}>
                        Step {action.step || index + 1}: {action.title}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: priorityStyle.bg,
                            borderColor: priorityStyle.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: priorityStyle.text },
                          ]}
                        >
                          {action.priority || 'Standard'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.actionDetails}>{action.details}</Text>
                    {action.timeframe ? (
                      <Text style={styles.timeframeText}>Timeframe: {action.timeframe}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.actionItem}>
              <Text style={styles.actionDetails}>No immediate action items specified.</Text>
            </View>
          )}
        </View>

        {/* ================= SECTION 4: MANDATORY LEGAL DISCLAIMER ================= */}
        <View style={styles.disclaimerBox} wrap={false}>
          <Text style={styles.disclaimerTitle}>
            Mandatory Legal Disclaimer & Regulatory Notice
          </Text>
          <Text style={styles.disclaimerText}>
            NOT LEGAL ADVICE — This report is generated by an automated AI compliance tool for informational
            purposes only. It does not constitute formal legal counsel, regulatory conformity assessment, or a binding
            certification of compliance with Regulation (EU) 2024/1689 of the European Parliament and of the Council.
            Last verified against the EU AI Act on {verifiedDate}. Organizations developing, placing on the market, or
            putting into service AI systems in the European Union must consult qualified legal and technical specialists
            to perform formal conformity assessments as required by Union harmonisation legislation.
          </Text>
        </View>

        {/* ================= FIXED FOOTER ================= */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            EU AI Act Compliance Checker • Regulation (EU) 2024/1689 Assessment • Confidential
          </Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};
