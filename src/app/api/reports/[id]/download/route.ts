import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateCompliancePdfBuffer } from '@/lib/pdf/generator';
import { getMockReport } from '@/lib/stripe/mock-store';
import type { ComplianceReport } from '@/types/database';

function checkIsPlaceholderSupabase(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project') ||
    serviceRoleKey === 'your-service-role-key' ||
    serviceRoleKey.includes('placeholder') ||
    process.env.MOCK_SUPABASE === 'true'
  );
}

/**
 * Report Download API Route
 *
 * GET /api/reports/[id]/download
 *
 * Validates report existence, retrieves the compiled PDF from Supabase Storage
 * (or generates on-the-fly via generateCompliancePdfBuffer), and streams the PDF
 * attachment to the user.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ error: 'Report ID is required.' }, { status: 400 });
    }

    const reportId = id.trim();
    const isPlaceholderDb = checkIsPlaceholderSupabase();
    let report: ComplianceReport | null = null;

    // 1. Fetch report from Supabase
    if (!isPlaceholderDb) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!error && data) {
        report = data as unknown as ComplianceReport;
      }
    }

    // Fallback to mock store
    if (!report) {
      report = getMockReport(reportId) || null;
    }

    if (!report) {
      return NextResponse.json(
        { error: `Compliance report ${reportId} not found.` },
        { status: 404 }
      );
    }

    // 2. Fetch from Supabase Storage if available
    let pdfBuffer: Buffer | null = null;
    if (report.pdf_storage_path && !isPlaceholderDb) {
      try {
        const supabase = createAdminClient();
        const { data: fileData, error: storageErr } = await supabase.storage
          .from('compliance-reports')
          .download(report.pdf_storage_path);

        if (!storageErr && fileData) {
          pdfBuffer = Buffer.from(await fileData.arrayBuffer());
        }
      } catch (err) {
        console.warn(
          `[Report Download] Failed downloading stored PDF from ${report.pdf_storage_path}, falling back to generator:`,
          err
        );
      }
    }

    // 3. Fallback: generate PDF buffer dynamically
    if (!pdfBuffer) {
      pdfBuffer = await generateCompliancePdfBuffer(report);
    }

    // 4. Stream response with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EU-AI-Act-Compliance-Report-${report.id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, no-transform, max-age=3600',
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error generating download report.';
    console.error('[Report Download] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
