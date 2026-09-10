import assert from 'node:assert/strict';
import { generateCompliancePdfBuffer } from '../src/lib/pdf/generator';
import { ComplianceReport } from '../src/types/database';

const mockReport: ComplianceReport = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  user_id: 'user_test_123',
  risk_tier: 'High',
  matched_category: 'Annex III, Point 4 (Employment, Workers Management)',
  matched_article: 'Article 6(2) & Annex III',
  confidence: 'High',
  rationale:
    'The evaluated AI system performs automated screening and ranking of job applicant resumes to filter candidates. Under Annex III, Point 4(a), AI systems intended to be used for recruitment or selection of natural persons are classified as High-Risk AI systems.',
  obligations: [
    {
      title: 'Risk Management System',
      article: 'Article 9',
      mandatory: true,
      description:
        'Establish, implement, document, and maintain a continuous risk management system throughout the entire lifecycle of the high-risk AI system.',
    },
    {
      title: 'Data Governance & Management',
      article: 'Article 10',
      mandatory: true,
      description:
        'Ensure training, validation, and testing datasets meet quality criteria, are relevant, representative, and appropriately vetted for bias.',
    },
    {
      title: 'Technical Documentation',
      article: 'Article 11',
      mandatory: true,
      description:
        'Draft and maintain comprehensive technical documentation demonstrating compliance prior to placing the system on the EU market.',
    },
    {
      title: 'Human Oversight & Logging',
      article: 'Articles 12 & 14',
      mandatory: true,
      description:
        'Design the system to enable effective human oversight by natural persons and automatic recording of events (logging) during operation.',
    },
  ],
  action_plan: [
    {
      step: 1,
      title: 'Conduct Fundamental Rights & Bias Audit',
      priority: 'Immediate',
      timeframe: '0 - 30 days',
      details:
        'Analyze applicant screening algorithms and candidate feature sets for disparate impact, proxy discrimination, and historical bias.',
    },
    {
      step: 2,
      title: 'Implement Continuous Risk Management Workflow',
      priority: 'Immediate',
      timeframe: '30 - 60 days',
      details:
        'Formalize Article 9 risk management protocols, identify foreseeable misuse, and document risk mitigation interventions.',
    },
    {
      step: 3,
      title: 'Establish Human-in-the-Loop Oversight Procedures',
      priority: 'Short-term',
      timeframe: '60 - 90 days',
      details:
        'Ensure human recruiters have override authority and clear operational guidelines to review AI-generated candidate rankings.',
    },
    {
      step: 4,
      title: 'Compile Annex IV Technical Documentation',
      priority: 'Medium-term',
      timeframe: '90 - 180 days',
      details:
        'Assemble technical documentation dossier for EU conformity assessment and register the system in the EU database pursuant to Article 71.',
    },
  ],
  is_saved: true,
  expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
  pdf_ready: true,
  paid_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

async function testPdfGeneration() {
  console.log('Testing EU AI Act Compliance PDF report generation...');
  
  const startTime = Date.now();
  const buffer = await generateCompliancePdfBuffer(mockReport);
  const elapsed = Date.now() - startTime;

  console.log(`Generated buffer of size: ${buffer.length} bytes in ${elapsed}ms`);

  // Verification 1: Buffer must be a Node.js Buffer
  assert(Buffer.isBuffer(buffer), 'Output must be a Node.js Buffer instance');

  // Verification 2: Buffer length > 1000 bytes
  assert(
    buffer.length > 1000,
    `Buffer length must be greater than 1000 bytes (got ${buffer.length})`
  );

  // Verification 3: Buffer starts with '%PDF-'
  const header = buffer.subarray(0, 5).toString('utf-8');
  assert.strictEqual(
    header,
    '%PDF-',
    `Buffer must start with PDF header '%PDF-', got: '${header}'`
  );

  // Verification 4: Test with different risk tiers
  const tiers = ['Unacceptable', 'Limited', 'Minimal'] as const;
  for (const tier of tiers) {
    const tierReport: ComplianceReport = {
      ...mockReport,
      id: `test-${tier.toLowerCase()}-id`,
      risk_tier: tier,
    };
    const tierBuffer = await generateCompliancePdfBuffer(tierReport);
    assert(Buffer.isBuffer(tierBuffer), `Output for tier ${tier} must be a Buffer`);
    assert(
      tierBuffer.length > 1000,
      `Buffer for tier ${tier} must be > 1000 bytes (got ${tierBuffer.length})`
    );
    assert.strictEqual(
      tierBuffer.subarray(0, 5).toString('utf-8'),
      '%PDF-',
      `Buffer for tier ${tier} must start with '%PDF-'`
    );
  }

  console.log('✓ All PDF generation tests passed successfully!');
}

testPdfGeneration().catch((err) => {
  console.error('✗ PDF generation test failed:', err);
  process.exit(1);
});
