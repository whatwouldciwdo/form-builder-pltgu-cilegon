import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ExcelJS from "exceljs";

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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PLTGU Cilegon Form Builder";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Rekap Respon");

    // Title Row
    sheet.mergeCells("A1:G1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `REKAPITULASI RESPONS FORMULIR: ${form.title.toUpperCase()}`;
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF00779E" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:G2");
    const subCell = sheet.getCell("A2");
    subCell.value = `PT PLN INDONESIA POWER - UNIT BISNIS PEMBANGKITAN CILEGON | Total Respon: ${form.responses.length}`;
    subCell.font = { name: "Arial", size: 10, italic: true };
    subCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(2).height = 20;

    sheet.addRow([]); // Blank row

    // Table Headers
    const headers = ["No", "Waktu Pengiriman", ...form.fields.map((f) => f.label)];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 24;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00779E" },
      };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Populate Data
    form.responses.forEach((resp, index) => {
      const answersMap = new Map(resp.answers.map((a) => [a.fieldId, a.value]));
      const rowData = [
        index + 1,
        new Date(resp.submittedAt).toLocaleString("id-ID"),
        ...form.fields.map((f) => {
          const val = answersMap.get(f.id) || "-";
          if (f.type === "SIGNATURE") {
            return val.startsWith("data:image") ? "[Tanda Tangan Digital Terverifikasi]" : "-";
          }
          return val;
        }),
      ];

      const row = sheet.addRow(rowData);
      row.height = 20;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber === 1 || colNumber === 2 ? "center" : "left",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // Auto-fit column widths
    sheet.columns.forEach((col, idx) => {
      let maxLen = 15;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 4, 40);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `Respon_${form.slug}_${Date.now()}.xlsx`;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export Excel error:", error);
    return NextResponse.json({ error: "Gagal membuat dokumen Excel" }, { status: 500 });
  }
}
