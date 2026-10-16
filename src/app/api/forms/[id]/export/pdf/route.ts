import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { order: "asc" } },
        responses: {
          orderBy: { submittedAt: "desc" },
          include: { answers: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Formulir tidak ditemukan" }, { status: 404 });
    }

    // Create jsPDF in Landscape orientation for clear table
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Load and add official logo
    const logoPath = path.join(process.cwd(), "public", "logo-pln-indonesiapower.png");
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath).toString("base64");
      doc.addImage(`data:image/png;base64,${logoData}`, "PNG", 14, 10, 48, 14);
    }

    // Kop Surat Texts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 119, 158); // PLN IP Cyan
    doc.text("PT PLN INDONESIA POWER - UBP CILEGON", 68, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(113, 128, 150);
    doc.text("Sistem Informasi & Rekapitulasi Data Formulir Digital Internal", 68, 22);

    // Divider Line
    doc.setDrawColor(0, 119, 158);
    doc.setLineWidth(0.8);
    doc.line(14, 28, 283, 28);

    // Form Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(45, 55, 72);
    doc.text(`LAPORAN HASIL FORMULIR: ${form.title.toUpperCase()}`, 14, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(113, 128, 150);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} | Total Responden: ${form.responses.length}`,
      14,
      41
    );

    // Prepare table headers and rows
    const tableHeaders = ["No", "Waktu", ...form.fields.map((f) => f.label)];
    const tableRows = form.responses.map((resp, idx) => {
      const answersMap = new Map(resp.answers.map((a) => [a.fieldId, a.value]));
      return [
        idx + 1,
        new Date(resp.submittedAt).toLocaleString("id-ID", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        ...form.fields.map((f) => {
          const val = answersMap.get(f.id) || "-";
          if (f.type === "SIGNATURE") {
            return val.startsWith("data:image") ? "[Terverifikasi]" : "-";
          }
          return val;
        }),
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [tableHeaders],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [45, 55, 72],
      },
      headStyles: {
        fillColor: [0, 119, 158],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filename = `Laporan_${form.slug}_${Date.now()}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    return NextResponse.json({ error: "Gagal membuat dokumen PDF" }, { status: 500 });
  }
}
