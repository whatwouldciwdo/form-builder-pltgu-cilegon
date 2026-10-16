import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageOrientation,
  VerticalAlign,
  ImageRun,
  convertMillimetersToTwip,
} from "docx";

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
      return NextResponse.json(
        { error: "Formulir tidak ditemukan" },
        { status: 404 }
      );
    }

    // 1. Memuat Buffer Logo PLN Indonesia Power
    let logoImageBuffer: Buffer | null = null;
    const logoPath = path.join(process.cwd(), "public", "logo-pln-indonesiapower.png");
    if (fs.existsSync(logoPath)) {
      logoImageBuffer = fs.readFileSync(logoPath);
    }

    // 2. Kop Surat sebagai Header Dokumen Resmi
    const headerTableRows: TableRow[] = [];
    const headerCells: TableCell[] = [];

    if (logoImageBuffer) {
      headerCells.push(
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoImageBuffer,
                  transformation: { width: 140, height: 42 },
                } as any),
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
        })
      );
    }

    headerCells.push(
      new TableCell({
        width: { size: logoImageBuffer ? 78 : 100, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "PT PLN INDONESIA POWER",
                bold: true,
                size: 22, // 11pt
                color: "000000",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "UNIT BISNIS PEMBANGKITAN CILEGON",
                bold: true,
                size: 19, // 9.5pt
                color: "000000",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Jl. Raya Salira Indah, Desa Salira, Kec. Puloampel, Kab. Serang, Banten 42455",
                size: 15, // 7.5pt
                color: "000000",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Sistem Informasi Rekapitulasi & Manajemen Formulir Digital UBP Cilegon",
                italics: true,
                size: 14, // 7pt
                color: "000000",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
        ],
      })
    );

    headerTableRows.push(new TableRow({ children: headerCells }));

    const documentHeader = new Header({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: headerTableRows,
        }),
      ],
    });

    // 3. Footer Dokumen Resmi
    const documentFooter = new Footer({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "PT PLN Indonesia Power - UBP Cilegon | Dokumen Rekapitulasi Resmi",
                          size: 14,
                          italics: true,
                          color: "000000",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Halaman ", size: 14, color: "000000" }),
                        new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "000000" }),
                        new TextRun({ text: " dari ", size: 14, color: "000000" }),
                        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: "000000" }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // 4. Metadata Ringkasan Formulir
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const bodyElements: (Paragraph | Table)[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: "LAPORAN REKAPITULASI HASIL FORMULIR DIGITAL",
            bold: true,
            size: 24, // 12pt
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: form.title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),

      // Metadata Box
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Deskripsi: ", bold: true, size: 16, color: "000000" }),
                      new TextRun({ text: form.description || "-", size: 16, color: "000000" }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Tautan URL Form: ", bold: true, size: 16, color: "000000" }),
                      new TextRun({ text: `/f/${form.slug}`, size: 16, color: "000000" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Tanggal Cetak: ", bold: true, size: 16, color: "000000" }),
                      new TextRun({ text: formattedDate, size: 16, color: "000000" }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Total Respon Diterima: ", bold: true, size: 16, color: "000000" }),
                      new TextRun({ text: `${form.responses.length} Responden`, bold: true, size: 16, color: "000000" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      new Paragraph({ text: "", spacing: { after: 200 } }),
    ];

    // 5. Tabel Rekapitulasi Respon
    const totalFields = form.fields.length;
    // Hitung alokasi persentase kolom
    const noWidth = 4;
    const timeWidth = 11;
    const remainingWidth = 85;
    const fieldColWidth = totalFields > 0 ? Math.floor(remainingWidth / totalFields) : remainingWidth;

    const tableRows: TableRow[] = [];

    // Header Tabel Respon (Latar Hitam, Teks Putih)
    const headerRowCells: TableCell[] = [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "No", bold: true, size: 16, color: "FFFFFF" })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: noWidth, type: WidthType.PERCENTAGE },
        shading: { fill: "000000" },
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Waktu Pengisian", bold: true, size: 16, color: "FFFFFF" })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: timeWidth, type: WidthType.PERCENTAGE },
        shading: { fill: "000000" },
        verticalAlign: VerticalAlign.CENTER,
      }),
    ];

    form.fields.forEach((f) => {
      headerRowCells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: f.label, bold: true, size: 16, color: "FFFFFF" })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: fieldColWidth, type: WidthType.PERCENTAGE },
          shading: { fill: "000000" },
          verticalAlign: VerticalAlign.CENTER,
        })
      );
    });

    tableRows.push(
      new TableRow({
        children: headerRowCells,
        tableHeader: true,
      })
    );

    // Data Baris
    if (form.responses.length === 0) {
      // Baris kosong jika belum ada data respon
      const emptyRowCells: TableCell[] = [
        new TableCell({
          columnSpan: 2 + totalFields,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Belum ada respon yang dikirimkan untuk formulir ini.",
                  italics: true,
                  size: 16,
                  color: "000000",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 120 },
            }),
          ],
        }),
      ];
      tableRows.push(new TableRow({ children: emptyRowCells }));
    } else {
      form.responses.forEach((resp, idx) => {
        const answersMap = new Map(resp.answers.map((a) => [a.fieldId, a.value]));

        const rowCells: TableCell[] = [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${idx + 1}`, size: 16, color: "000000" })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: noWidth, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: new Date(resp.submittedAt).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }),
                    size: 15,
                    color: "000000",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: timeWidth, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];

        form.fields.forEach((f) => {
          const rawVal = answersMap.get(f.id);

          // Handle formatting nilai
          let displayContent: Paragraph;

          if (!rawVal || rawVal === "") {
            displayContent = new Paragraph({
              children: [new TextRun({ text: "-", size: 16, color: "000000" })],
              alignment: AlignmentType.CENTER,
            });
          } else if (f.type === "SIGNATURE") {
            if (rawVal.startsWith("data:image/")) {
              try {
                const base64Data = rawVal.replace(/^data:image\/\w+;base64,/, "");
                const signatureBuffer = Buffer.from(base64Data, "base64");
                displayContent = new Paragraph({
                  children: [
                    new ImageRun({
                      data: signatureBuffer,
                      transformation: { width: 85, height: 32 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                });
              } catch {
                displayContent = new Paragraph({
                  children: [new TextRun({ text: "[Tanda Tangan]", size: 15, color: "000000" })],
                  alignment: AlignmentType.CENTER,
                });
              }
            } else {
              displayContent = new Paragraph({
                children: [new TextRun({ text: "[Tanda Tangan]", size: 15, color: "000000" })],
                alignment: AlignmentType.CENTER,
              });
            }
          } else {
            // Cek apakah data berupa array JSON (contoh: checkbox)
            let textValue = String(rawVal);
            if (textValue.startsWith("[") && textValue.endsWith("]")) {
              try {
                const parsed = JSON.parse(textValue);
                if (Array.isArray(parsed)) {
                  textValue = parsed.join(", ");
                }
              } catch {
                // Biarkan format string aslinya jika bukan JSON valid
              }
            }

            displayContent = new Paragraph({
              children: [new TextRun({ text: textValue, size: 16, color: "000000" })],
              alignment:
                f.type === "NUMBER" || f.type === "DATE"
                  ? AlignmentType.CENTER
                  : AlignmentType.LEFT,
            });
          }

          rowCells.push(
            new TableCell({
              children: [displayContent],
              width: { size: fieldColWidth, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        });

        tableRows.push(new TableRow({ children: rowCells }));
      });
    }

    const responsesTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      },
      rows: tableRows,
    });

    bodyElements.push(responsesTable);

    // 6. Pembuatan Dokumen Word
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Arial",
              color: "000000",
            },
            paragraph: {
              spacing: { line: 260 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.LANDSCAPE,
              },
              margin: {
                top: convertMillimetersToTwip(34),
                bottom: convertMillimetersToTwip(20),
                left: convertMillimetersToTwip(20),
                right: convertMillimetersToTwip(20),
                header: convertMillimetersToTwip(10),
                footer: convertMillimetersToTwip(10),
              },
            },
          },
          headers: {
            default: documentHeader,
          },
          footers: {
            default: documentFooter,
          },
          children: bodyElements,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `Laporan_${form.slug}_${Date.now()}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export Word error:", error);
    return NextResponse.json(
      { error: "Gagal membuat dokumen Word" },
      { status: 500 }
    );
  }
}
