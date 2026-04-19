// ============================================================
// Export API - CSV, PDF, Excel generation
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient, unauthorizedResponse, successResponse } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limit";
import { exportQuerySchema } from "@/lib/utils/validation";
import { exportToCSV, exportToPDF, generateInvoicePDF, transformForExport, calculateExportSummary } from "@/lib/utils/export";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function GET(request: Request) {
  // Rate limiting
  const rateLimit = await checkRateLimit(request, "export");
  if (!rateLimit.success) {
    return applyCORS(rateLimitResponse(rateLimit.remaining, rateLimit.reset), request);
  }

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  // Get profile with org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return applyCORS(
      NextResponse.json({ error: { message: "No workspace found" } }, { status: 403 }),
      request
    );
  }

  // Parse query params
  const { searchParams } = new URL(request.url);
  const validation = exportQuerySchema.safeParse({
    entity: searchParams.get("entity"),
    format: searchParams.get("format"),
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    status: searchParams.get("status") || undefined,
    clientId: searchParams.get("clientId") || undefined,
  });

  if (!validation.success) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Invalid parameters", errors: validation.error.issues } },
        { status: 400 }
      ),
      request
    );
  }

  const { entity, format, from, to, status, clientId } = validation.data;

  // Build query based on entity
  let query = supabase.from(entity).select("*").eq("org_id", profile.org_id);

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (status) query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;

  if (error) {
    return applyCORS(
      NextResponse.json({ error: { message: error.message } }, { status: 500 }),
      request
    );
  }

  // Transform data for export
  const exportData = transformForExport(entity, data || []);
  const summary = calculateExportSummary(entity, data || []);

  // Generate export based on format
  switch (format) {
    case "csv": {
      const { content, contentType, filename } = exportToCSV(
        exportData,
        `${entity}_export_${new Date().toISOString().split("T")[0]}`
      );

      const response = new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
      return applyCORS(applySecurityHeaders(response), request);
    }

    case "pdf": {
      const result = await exportToPDF(
        `${entity.charAt(0).toUpperCase() + entity.slice(1)} Report`,
        exportData,
        Object.keys(exportData[0] || {}).map((key) => ({ key, header: key })),
        summary
      );

const response = new NextResponse(result.content as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "text/html", // Can be converted to PDF
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
      return applyCORS(applySecurityHeaders(response), request);
    }

    case "xlsx":
      // For now, return CSV which can be opened in Excel
      const csvResult = exportToCSV(
        exportData,
        `${entity}_export_${new Date().toISOString().split("T")[0]}`
      );
      const xlsxResponse = new NextResponse(csvResult.content as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${csvResult.filename.replace(".csv", ".xlsx")}"`,
        },
      });
      return applyCORS(applySecurityHeaders(xlsxResponse), request);

    default:
      return applyCORS(
        NextResponse.json({ error: { message: "Unsupported format" } }, { status: 400 }),
        request
      );
  }
}

// Generate single invoice PDF
export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = await checkRateLimit(request, "export");
  if (!rateLimit.success) {
    return applyCORS(rateLimitResponse(rateLimit.remaining, rateLimit.reset), request);
  }

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  const body = await request.json();
  const { invoiceId, format = "pdf" } = body;

  if (!invoiceId) {
    return applyCORS(
      NextResponse.json({ error: { message: "Invoice ID required" } }, { status: 400 }),
      request
    );
  }

  // Get invoice with client details
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, client:clients(name, pan, address)")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    return applyCORS(
      NextResponse.json({ error: { message: "Invoice not found" } }, { status: 404 }),
      request
    );
  }

  // Get org details
  const { data: org } = await supabase
    .from("workspaces")
    .select("name, business_pan")
    .eq("id", invoice.org_id)
    .single();

  if (format === "pdf") {
    const result = await generateInvoicePDF(
      {
        ...invoice,
        client_name: invoice.client?.name,
        client_pan: invoice.client?.pan,
        client_address: invoice.client?.address,
      },
      {
        name: org?.name || "AFOCE",
        pan: org?.business_pan,
      }
    );

    const response = new NextResponse(result.content as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
    return applyCORS(applySecurityHeaders(response), request);
  }

  return applyCORS(
    NextResponse.json({ error: { message: "Unsupported format" } }, { status: 400 }),
    request
  );
}
