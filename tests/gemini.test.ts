import assert from 'node:assert/strict';
import { getSystemPrompt, formatUserPrompt, BASE_SYSTEM_PROMPT } from '../src/lib/gemini/prompts';
import { complianceReportSchema } from '../src/lib/gemini/schema';
import {
  classifySystemPrompt,
  isMockGeminiEnabled,
} from '../src/lib/gemini/service';
import { analyzeComplianceAction } from '../src/actions/analyze';

async function runGeminiIntegrationTests() {
  console.log('--- Starting Phase 2 Gemini Integration Tests ---');

  // ========================================================
  // Test Suite 1: Prompts & Dynamic Injection
  // ========================================================
  console.log('\n[1/4] Testing prompts and template formatting...');

  // Verification 1.1: Dynamic date injection
  const testDate = 'October 15, 2026';
  const customPrompt = getSystemPrompt(testDate);
  assert(
    customPrompt.includes(`**Current Date Context:** ${testDate}`),
    'getSystemPrompt should inject custom verified date'
  );
  assert(
    !customPrompt.includes('{{VERIFIED_DATE}}'),
    'Template variable {{VERIFIED_DATE}} must be replaced'
  );

  // Verification 1.2: Privacy instruction presence
  assert(
    BASE_SYSTEM_PROMPT.includes(
      'Describe the function and operational nature of the user\'s system in the rationale; DO NOT quote specifics verbatim from their input'
    ),
    'System prompt must include strict privacy non-verbatim quoting instruction'
  );

  // Verification 1.3: Regulatory coverage in prompt
  assert(BASE_SYSTEM_PROMPT.includes('Article 5'), 'System prompt must include Article 5');
  assert(BASE_SYSTEM_PROMPT.includes('Annex III'), 'System prompt must include Annex III');
  assert(BASE_SYSTEM_PROMPT.includes('Article 50'), 'System prompt must include Article 50');
  assert(BASE_SYSTEM_PROMPT.includes('Minimal / No Risk'), 'System prompt must include Minimal Risk');

  // Verification 1.4: Format user prompt
  const formattedUser = formatUserPrompt('My test resume parser');
  assert(
    formattedUser.includes('My test resume parser'),
    'formatUserPrompt must encapsulate user system description'
  );
  console.log('✓ Prompts and dynamic date injection verified.');

  // ========================================================
  // Test Suite 2: Schema Definitions
  // ========================================================
  console.log('\n[2/4] Testing responseSchema configuration...');

  assert.strictEqual(complianceReportSchema.type, 'OBJECT', 'Schema must be type OBJECT');
  assert(complianceReportSchema.properties, 'Schema must define properties');

  const props = complianceReportSchema.properties;
  assert(props.risk_tier, 'Schema must define risk_tier');
  assert(props.matched_category, 'Schema must define matched_category');
  assert(props.matched_article, 'Schema must define matched_article');
  assert(props.confidence, 'Schema must define confidence');
  assert(props.rationale, 'Schema must define rationale');
  assert(props.obligations, 'Schema must define obligations');
  assert(props.action_plan, 'Schema must define action_plan');

  assert.deepStrictEqual(
    props.risk_tier.enum,
    ['Unacceptable', 'High', 'Limited', 'Minimal'],
    'risk_tier must specify all 4 legal tiers'
  );

  assert.deepStrictEqual(
    props.confidence.enum,
    ['High', 'Medium', 'Low'],
    'confidence must specify High, Medium, Low'
  );

  assert(
    complianceReportSchema.required?.includes('risk_tier'),
    'risk_tier must be marked as required'
  );
  assert(
    complianceReportSchema.required?.includes('action_plan'),
    'action_plan must be marked as required'
  );
  console.log('✓ Strict responseSchema definitions verified.');

  // ========================================================
  // Test Suite 3: Gemini Service & Classification Logic
  // ========================================================
  console.log('\n[3/4] Testing classification service (mock & deterministic classifier)...');

  assert.strictEqual(
    typeof isMockGeminiEnabled(),
    'boolean',
    'isMockGeminiEnabled should return boolean'
  );

  // Verification 3.1: High Risk (Annex III Point 4 - Recruitment & CV screening)
  const highRiskResult = await classifySystemPrompt(
    'An automated candidate recruitment platform that parses CVs, screens resumes, and ranks job applicants for hiring decisions.'
  );
  assert.strictEqual(highRiskResult.risk_tier, 'High');
  assert(
    highRiskResult.matched_article.includes('Annex III') ||
      highRiskResult.matched_article.includes('Article 6'),
    `Expected Annex III / Article 6, got: ${highRiskResult.matched_article}`
  );
  assert(highRiskResult.obligations.length >= 4, 'High risk must provide at least 4 obligations');
  assert(highRiskResult.action_plan.length >= 3, 'High risk must provide at least 3 action items');
  assert(
    highRiskResult.obligations.some((o) => o.article.includes('Article 9')),
    'High risk obligations must include Article 9 Risk Management'
  );

  // Verification 3.2: Unacceptable Risk (Article 5 - Subliminal / Social Scoring)
  const unacceptableResult = await classifySystemPrompt(
    'Citizen social scoring platform that monitors social media behavior and penalizes low-scoring individuals.'
  );
  assert.strictEqual(unacceptableResult.risk_tier, 'Unacceptable');
  assert(
    unacceptableResult.matched_article.includes('Article 5'),
    `Expected Article 5, got: ${unacceptableResult.matched_article}`
  );
  assert(
    unacceptableResult.obligations.some((o) => o.article.includes('Article 5')),
    'Unacceptable risk must cite Article 5 obligations'
  );

  // Verification 3.3: Limited Risk (Article 50 - Customer Chatbot)
  const limitedResult = await classifySystemPrompt(
    'An e-commerce customer support chatbot that answers user questions about store hours and order status.'
  );
  assert.strictEqual(limitedResult.risk_tier, 'Limited');
  assert(
    limitedResult.matched_article.includes('Article 50'),
    `Expected Article 50, got: ${limitedResult.matched_article}`
  );
  assert(
    limitedResult.obligations.some((o) => o.article.includes('Article 50')),
    'Limited risk must cite Article 50 obligations'
  );

  // Verification 3.4: Minimal Risk (General non-critical AI)
  const minimalResult = await classifySystemPrompt(
    'An email spam filtering system and retail inventory stock level forecasting utility.'
  );
  assert.strictEqual(minimalResult.risk_tier, 'Minimal');

  // Verification 3.5: Input validation error handling
  await assert.rejects(
    async () => {
      await classifySystemPrompt('');
    },
    /System description must be a non-empty string/,
    'Empty input must be rejected'
  );

  await assert.rejects(
    async () => {
      await classifySystemPrompt('   ');
    },
    /System description must be a non-empty string/,
    'Whitespace-only input must be rejected'
  );

  await assert.rejects(
    async () => {
      await classifySystemPrompt('abc');
    },
    /System description is too short/,
    'Too short input must be rejected'
  );

  console.log('✓ Classification service and deterministic tier matching verified.');

  // ========================================================
  // Test Suite 4: Server Action (analyzeComplianceAction)
  // ========================================================
  console.log('\n[4/4] Testing analyzeComplianceAction server action...');

  // Verification 4.1: Validation failure on missing systemDescription
  const emptyRes = await analyzeComplianceAction({
    systemDescription: '',
    userId: 'user_123',
  });
  assert.strictEqual(emptyRes.success, false);
  assert(emptyRes.error.includes('System description is required'));

  // Verification 4.2: Validation failure on short systemDescription
  const shortRes = await analyzeComplianceAction({
    systemDescription: 'Short',
    userId: 'user_123',
  });
  assert.strictEqual(shortRes.success, false);
  assert(shortRes.error.includes('too short'));

  // Verification 4.3: Validation failure on missing userId
  const noUserRes = await analyzeComplianceAction({
    systemDescription: 'Valid description for a recruitment evaluation system.',
    userId: '',
  });
  assert.strictEqual(noUserRes.success, false);
  assert(noUserRes.error.includes('User ID is required'));

  // Verification 4.4: Success execution with object payload
  const actionRes = await analyzeComplianceAction({
    systemDescription:
      'AI-powered job candidate resume screening tool that ranks applicants based on their qualifications and past employment history.',
    userId: 'anon_test_user_789',
  });

  assert.strictEqual(actionRes.success, true, 'Server action should return success: true');
  if (actionRes.success) {
    const report = actionRes.report;
    assert.strictEqual(report.user_id, 'anon_test_user_789');
    assert.strictEqual(report.risk_tier, 'High');
    assert(report.rationale.length > 20, 'Report must contain rationale');
    assert(report.obligations.length > 0, 'Report must have obligations');
    assert(report.action_plan.length > 0, 'Report must have action plan');

    // In-memory privacy verification: raw systemDescription must NEVER be persisted in the report object
    assert(
      !('systemDescription' in report),
      'ComplianceReport must not store raw systemDescription'
    );
    assert(
      !('system_description' in report),
      'ComplianceReport must not store raw system_description'
    );
    assert.strictEqual(report.pdf_ready, false, 'Default pdf_ready should be false');
    assert.strictEqual(report.is_saved, false, 'Default is_saved should be false');
    assert(report.expires_at, 'Report must have expires_at timestamp');
  }

  // Verification 4.5: Success execution with positional arguments
  const positionalRes = await analyzeComplianceAction(
    'A live customer support conversational chatbot for resolving product FAQ queries.',
    'anon_test_user_999'
  );

  assert.strictEqual(positionalRes.success, true);
  if (positionalRes.success) {
    assert.strictEqual(positionalRes.report.risk_tier, 'Limited');
    assert.strictEqual(positionalRes.report.user_id, 'anon_test_user_999');
  }

  console.log('✓ Server action and in-memory privacy preservation verified.');

  console.log('\n=============================================');
  console.log('🎉 All EU AI Act Gemini integration tests passed!');
  console.log('=============================================');
}

runGeminiIntegrationTests().catch((err) => {
  console.error('\n❌ Gemini integration test failed:', err);
  process.exit(1);
});
