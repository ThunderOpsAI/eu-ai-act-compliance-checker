import type { ComplianceReport } from '@/types/database';

export function getSenderEmailString(): string {
  const rawEnv = process.env.RESEND_FROM_EMAIL?.trim();
  
  if (!rawEnv) {
    return 'EU AI Pass Compliance Registry <compliance@euaipass.com>';
  }

  // If already formatted with <name@domain.com>, return as is
  if (rawEnv.includes('<') && rawEnv.includes('>')) {
    return rawEnv;
  }

  // If raw email only (e.g. "compliance@euaipass.com"), wrap with professional sender name
  return `EU AI Pass Compliance Registry <${rawEnv}>`;
}

export function buildFulfillmentEmailHtml(report: ComplianceReport): string {
  const isHighRisk = report.risk_tier.toLowerCase().includes('high');
  const isProhibited = report.risk_tier.toLowerCase().includes('prohibited');
  
  const badgeBg = isProhibited 
    ? '#fef2f2' 
    : isHighRisk 
    ? '#fffbeb' 
    : '#f0fdf4';
  const badgeBorder = isProhibited 
    ? '#fecaca' 
    : isHighRisk 
    ? '#fde68a' 
    : '#bbf7d0';
  const badgeText = isProhibited 
    ? '#b91c1c' 
    : isHighRisk 
    ? '#b45309' 
    : '#15803d';

  const downloadUrl = `https://euaipass.com/api/reports/${report.id}/download`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EU AI Act Statutory Audit Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #090e1a; padding: 28px 32px; border-bottom: 1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
                      Regulation (EU) 2024/1689 · Official Audit Record
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      EU AI Pass Regulatory Registry
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="display: inline-block; background-color: rgba(37, 99, 235, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; color: #93c5fd;">
                      AUDIT COMPLETE
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                Your Compliance Audit Report is Attached
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for your verification request. An automated statutory assessment of your AI system was conducted against the criteria of Regulation (EU) 2024/1689 (EU AI Act). Your comprehensive executive audit report has been compiled and is attached to this email.
              </p>

              <!-- Classification Callout Card -->
              <div style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 12px; border-bottom: 1px solid ${badgeBorder};">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${badgeText};">
                        Determined Risk Classification
                      </span>
                      <div style="font-size: 22px; font-weight: 800; color: ${badgeText}; margin-top: 4px;">
                        ${report.risk_tier} Risk
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 14px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                        <tr>
                          <td style="padding: 3px 0; color: #64748b; font-weight: 500; width: 140px;">Legal Citation:</td>
                          <td style="padding: 3px 0; color: #0f172a; font-weight: 600;">${report.matched_article || 'Regulation (EU) 2024/1689'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; color: #64748b; font-weight: 500;">Annex Scope:</td>
                          <td style="padding: 3px 0; color: #0f172a; font-weight: 600;">${report.matched_category || 'Automated Processing'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; color: #64748b; font-weight: 500;">Dossier ID:</td>
                          <td style="padding: 3px 0; font-family: monospace; font-size: 12px; color: #475569;">${report.id}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What's in the Report Checklist -->
              <div style="margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 10px;">
                  What is included in your official PDF:
                </div>
                <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; line-height: 1.8; color: #334155;">
                  <li><strong>Articles 9–17 Statutory Obligations Matrix:</strong> Risk management system, data governance, technical documentation, automatic record-keeping, and human oversight.</li>
                  <li><strong>Article 50 Transparency Obligations:</strong> Detailed instructions on end-user disclosure and synthetic content watermarking.</li>
                  <li><strong>Prioritized Remediation Roadmap:</strong> Clear 30, 60, and 90-day implementation milestones before commercial deployment.</li>
                  <li><strong>Executive Rationale Summary:</strong> Legal justification ready for your engineering leadership, compliance board, or prospective enterprise clients.</li>
                </ul>
              </div>

              <!-- Button CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                      Download PDF from Web Vault →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                A PDF copy is also directly attached to this email for immediate offline storage.
              </p>
            </td>
          </tr>

          <!-- Institutional Guarantee Bar -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 32px; border-top: 1px solid #e2e8f0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 12px; color: #475569; line-height: 1.5;">
                    <strong style="color: #0f172a;">🔒 Zero Data Retention Guarantee:</strong> Raw prompt descriptions and proprietary system logic were evaluated strictly in RAM and have already been purged from runtime memory.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; border-top: 1px solid #f1f5f9; font-size: 11px; line-height: 1.6; color: #94a3b8; text-align: center;">
              <p style="margin: 0 0 8px 0;">
                EU AI Pass · Regulation (EU) 2024/1689 Automated Compliance Intelligence
              </p>
              <p style="margin: 0 0 8px 0;">
                <a href="https://euaipass.com/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> · 
                <a href="https://euaipass.com/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a> · 
                <a href="mailto:support@euaipass.com" style="color: #64748b; text-decoration: underline;">support@euaipass.com</a>
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 10px;">
                Statutory Notice: This automated analysis provides regulatory risk mapping for informational purposes and does not constitute formal legal counsel. Official CE certification requires designated notified body audit.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
