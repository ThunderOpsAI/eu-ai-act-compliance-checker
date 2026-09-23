import { NextRequest, NextResponse } from 'next/server';
import { generateCompliancePdfBuffer } from '@/lib/pdf/generator';
import type { ComplianceReport } from '@/types/database';

/**
 * Direct PDF Generation API Route
 *
 * POST /api/reports/generate-pdf
 * Accepts a full ComplianceReport object and compiles it directly into a
 * structured PDF binary using @react-pdf/renderer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report: ComplianceReport = body?.report;

    if (!report || !report.risk_tier || !report.id) {
      return NextResponse.json(
        { error: 'Valid report object with id and risk_tier is required.' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateCompliancePdfBuffer(report);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EU-AI-Act-Compliance-Report-${report.risk_tier.toLowerCase()}-${report.id.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate PDF document.';
    console.error('[Generate PDF API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
