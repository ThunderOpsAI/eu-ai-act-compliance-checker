const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../../src/actions/analyze.ts');
let content = fs.readFileSync(file, 'utf8');

// First remove any existing mock block (which we injected earlier)
const existingMockMatch = content.match(/const descString =.*?return \{ success: true, report: mockReport as any \};\s*\}/s);
if (existingMockMatch) {
  content = content.replace(existingMockMatch[0], '');
}

if (!content.includes('import { cookies }')) {
  content = content.replace('import type { ComplianceReport } from \'@/types/database\';', 'import type { ComplianceReport } from \'@/types/database\';\nimport { cookies } from \'next/headers\';');
}

const mockBlock = `
  const cookieStore = await cookies();
  const mockTierCookie = cookieStore.get('MOCK_TIER');
  if (mockTierCookie) {
    const tier = mockTierCookie.value;
    if (tier === 'ERROR') throw new Error('Mock API Error');
    const mockReport = {
      id: 'mock-report-123',
      user_id: typeof inputOrDescription === 'string' ? optionalUserId || 'anon' : inputOrDescription.userId || 'anon',
      system_name: 'Mock System',
      risk_tier: tier,
      matched_article: 'Article X',
      description_summary: 'Mock summary',
      executive_summary: 'Mock exec summary',
      key_obligations: [{ obligation: 'Mock ob', is_mandatory: true, article_reference: 'X' }],
      prohibited_reason: tier === 'Prohibited' ? 'Mock reason' : null,
      pdf_ready: tier === 'paid' || (inputOrDescription as any)?.pdf_ready ? true : false,
      stripe_payment_intent_id: 'pi_mock',
      receipt_email: null,
      pdf_storage_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paid_at: null
    };
    if (tier === 'paid') mockReport.pdf_ready = true;
    return { success: true, report: mockReport as any };
  }
`;

if (!content.includes('mockTierCookie')) {
  content = content.replace('try {', 'try {' + mockBlock);
}
fs.writeFileSync(file, content);
