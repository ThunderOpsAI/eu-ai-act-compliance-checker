import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  createPaymentIntentAction,
  createPaymentIntent,
} from '../src/lib/stripe/actions';
import { fulfillComplianceReportPayment } from '../src/lib/stripe/fulfillment';
import {
  setMockReport,
  getMockReport,
  clearMockReports,
} from '../src/lib/stripe/mock-store';
import { POST as stripeWebhookHandler } from '../src/app/api/webhooks/stripe/route';
import { GET as downloadReportHandler } from '../src/app/api/reports/[id]/download/route';
import type { ComplianceReport } from '../src/types/database';

const sampleReport: ComplianceReport = {
  id: 'rep_test_billing_123',
  user_id: 'usr_billing_abc',
  risk_tier: 'High',
  matched_category: 'Annex III, Point 1 (Biometrics)',
  matched_article: 'Article 6(2) & Annex III',
  confidence: 'High',
  rationale:
    'The evaluated system employs real-time biometric identification in publicly accessible spaces. Under Annex III Point 1, this is classified as High Risk under the EU AI Act.',
  obligations: [
    {
      title: 'Risk Management System',
      article: 'Article 9',
      mandatory: true,
      description: 'Continuous risk management throughout system lifecycle.',
    },
    {
      title: 'Data Governance',
      article: 'Article 10',
      mandatory: true,
      description: 'Training and testing dataset bias testing and governance.',
    },
  ],
  action_plan: [
    {
      step: 1,
      title: 'Conduct Fundamental Rights Impact Assessment',
      timeframe: '0 - 30 days',
      priority: 'Immediate',
      details: 'Assess impact on natural persons subject to biometric screening.',
    },
  ],
  is_saved: false,
  expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
  pdf_ready: false,
  stripe_payment_intent_id: null,
  receipt_email: null,
  pdf_storage_path: null,
  paid_at: null,
  created_at: new Date().toISOString(),
};

async function runBillingTests() {
  console.log('--- Starting Phase 3 Billing & Webhook Integration Tests ---');
  clearMockReports();

  // Seed sample report into mock store
  setMockReport(sampleReport);

  // =========================================================================
  // TEST 1: createPaymentIntentAction - Validation and Creation
  // =========================================================================
  console.log('\n[1] Testing createPaymentIntentAction...');

  // 1a. Missing ID validation
  const emptyResult = await createPaymentIntentAction({ reportId: '' });
  assert.strictEqual(emptyResult.success, false);
  assert(
    'error' in emptyResult && emptyResult.error.includes('Valid report ID is required'),
    'Should return validation error when reportId is empty'
  );

  // 1b. Successful intent creation in mock mode
  const intentResult = await createPaymentIntentAction({ reportId: sampleReport.id });
  assert.strictEqual(intentResult.success, true);
  if (intentResult.success) {
    assert(intentResult.clientSecret.length > 0, 'Must provide clientSecret');
    assert(intentResult.paymentIntentId.length > 0, 'Must provide paymentIntentId');
    assert(
      intentResult.clientSecret.includes('secret_'),
      'Client secret must follow secret formatting'
    );
    console.log('✓ Payment intent created successfully:', {
      paymentIntentId: intentResult.paymentIntentId,
      clientSecretPrefix: intentResult.clientSecret.substring(0, 20) + '...',
    });

    // Check that the mock store was updated with stripe_payment_intent_id
    const updated = getMockReport(sampleReport.id);
    assert.strictEqual(
      updated?.stripe_payment_intent_id,
      intentResult.paymentIntentId,
      'Report in store must be updated with payment intent id'
    );
  }

  // 1c. Direct alias createPaymentIntent(reportId)
  const aliasResult = await createPaymentIntent(sampleReport.id);
  assert.strictEqual(aliasResult.success, true);
  console.log('✓ createPaymentIntent direct string alias test passed.');

  // =========================================================================
  // TEST 2: Webhook fulfillment background task
  // =========================================================================
  console.log('\n[2] Testing fulfillComplianceReportPayment background task...');
  const currentReport = getMockReport(sampleReport.id)!;
  const paymentIntentId = currentReport.stripe_payment_intent_id!;

  const fulfillmentResult = await fulfillComplianceReportPayment({
    paymentIntentId,
    reportId: currentReport.id,
    receiptEmail: 'compliance-auditor@example.eu',
  });

  assert.strictEqual(fulfillmentResult.success, true);
  assert.strictEqual(fulfillmentResult.reportId, currentReport.id);
  assert(
    fulfillmentResult.storagePath?.includes(`${currentReport.user_id}/${currentReport.id}.pdf`),
    `Storage path must follow {user_id}/{report_id}.pdf format (got ${fulfillmentResult.storagePath})`
  );

  // Verify updated status in report
  const fulfilledReport = getMockReport(sampleReport.id)!;
  assert.strictEqual(fulfilledReport.pdf_ready, true, 'Report pdf_ready must be true');
  assert(fulfilledReport.paid_at !== null, 'paid_at timestamp must be recorded');
  assert.strictEqual(
    fulfilledReport.receipt_email,
    'compliance-auditor@example.eu',
    'receipt_email must be recorded'
  );
  console.log('✓ Background fulfillment generated PDF and updated report record.');

  // =========================================================================
  // TEST 3: Webhook Idempotency Check
  // =========================================================================
  console.log('\n[3] Testing Webhook Idempotency on fulfilled report...');
  const idempotentResult = await fulfillComplianceReportPayment({
    paymentIntentId,
    reportId: currentReport.id,
    receiptEmail: 'duplicate-webhook@example.eu',
  });

  assert.strictEqual(idempotentResult.success, true);
  assert.strictEqual(
    idempotentResult.alreadyFulfilled,
    true,
    'Subsequent webhook invocations must return alreadyFulfilled without re-generation'
  );
  console.log('✓ Webhook Idempotency verified: re-triggering did not re-generate.');

  // =========================================================================
  // TEST 4: Stripe Webhook HTTP Route Handler
  // =========================================================================
  console.log('\n[4] Testing Stripe Webhook API Route (src/app/api/webhooks/stripe/route.ts)...');

  // Create a new fresh report for the webhook HTTP route test
  const webhookTestReport: ComplianceReport = {
    ...sampleReport,
    id: 'rep_webhook_http_456',
    user_id: 'usr_webhook_test',
    pdf_ready: false,
    paid_at: null,
  };
  setMockReport(webhookTestReport);

  const webhookPayload = {
    id: 'evt_test_pi_succeeded_123',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_webhook_intent_789',
        object: 'payment_intent',
        amount: 2900,
        currency: 'usd',
        receipt_email: 'buyer@example.eu',
        metadata: {
          report_id: webhookTestReport.id,
        },
      },
    },
  };

  const webhookReq = new NextRequest('http://localhost:3005/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookPayload),
  });

  const webhookRes = await stripeWebhookHandler(webhookReq);
  assert.strictEqual(webhookRes.status, 200, 'Webhook route must respond with 200 OK');

  const webhookBody = await webhookRes.json();
  assert.deepStrictEqual(
    webhookBody,
    { received: true },
    'Webhook route must respond immediately with { received: true }'
  );
  console.log('✓ Stripe Webhook route responded immediately with 200 OK and { received: true }');

  // Wait brief interval to allow async background task (waitUntil) to finish in Node
  await new Promise((resolve) => setTimeout(resolve, 500));

  // =========================================================================
  // TEST 5: Report Download Route Handler (src/app/api/reports/[id]/download/route.ts)
  // =========================================================================
  console.log('\n[5] Testing Report Download API Route...');

  // 5a. Existing Report Download
  const downloadReq = new NextRequest(
    `http://localhost:3005/api/reports/${sampleReport.id}/download`,
    { method: 'GET' }
  );

  const downloadRes = await downloadReportHandler(downloadReq, {
    params: Promise.resolve({ id: sampleReport.id }),
  });

  assert.strictEqual(downloadRes.status, 200, 'Download route must return HTTP 200');
  const contentType = downloadRes.headers.get('content-type');
  assert.strictEqual(
    contentType,
    'application/pdf',
    `Content-Type must be 'application/pdf', got '${contentType}'`
  );

  const contentDisposition = downloadRes.headers.get('content-disposition');
  assert(
    contentDisposition?.includes(`EU-AI-Act-Compliance-Report-${sampleReport.id}.pdf`),
    `Content-Disposition header must include filename, got: '${contentDisposition}'`
  );

  const pdfArrayBuffer = await downloadRes.arrayBuffer();
  const pdfBuffer = Buffer.from(pdfArrayBuffer);

  assert(pdfBuffer.length > 1000, `PDF size must be > 1000 bytes (got ${pdfBuffer.length})`);
  const header = pdfBuffer.subarray(0, 5).toString('utf-8');
  assert.strictEqual(header, '%PDF-', `File stream must begin with '%PDF-', got '${header}'`);
  console.log(`✓ Download route streamed valid PDF binary (${pdfBuffer.length} bytes) with attachment headers.`);

  // 5b. Non-existent Report (404)
  const notFoundReq = new NextRequest(
    'http://localhost:3005/api/reports/rep_nonexistent/download',
    { method: 'GET' }
  );
  const notFoundRes = await downloadReportHandler(notFoundReq, {
    params: Promise.resolve({ id: 'rep_nonexistent' }),
  });
  assert.strictEqual(notFoundRes.status, 404, 'Nonexistent report must return 404');
  console.log('✓ Download route correctly returned 404 for invalid report ID.');

  console.log('\n============================================================');
  console.log('✓ ALL BILLING & WEBHOOK INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runBillingTests().catch((err) => {
  console.error('\n✗ Billing test suite failed:', err);
  process.exit(1);
});
