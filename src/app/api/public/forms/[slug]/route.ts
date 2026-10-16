import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const form = await prisma.form.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulir tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!form.isPublished) {
      return NextResponse.json(
        { error: "Formulir ini belum dipublikasikan oleh administrator." },
        { status: 403 }
      );
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("GET public form error:", error);
    return NextResponse.json(
      { error: "Gagal memuat formulir." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { answers } = body; // Array: [{ fieldId, value }]

    const form = await prisma.form.findUnique({
      where: { slug },
      include: { fields: true },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulir tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!form.isAcceptingResponse) {
      return NextResponse.json(
        { error: "Pengumpulan jawaban untuk formulir ini telah ditutup." },
        { status: 400 }
      );
    }

    // Validation: check required fields
    for (const field of form.fields) {
      if (field.isRequired) {
        const found = (answers || []).find(
          (a: { fieldId: string; value: string }) => a.fieldId === field.id
        );
        if (!found || !found.value || found.value.trim() === "") {
          return NextResponse.json(
            { error: `Kolom "${field.label}" wajib diisi / ditandatangani.` },
            { status: 400 }
          );
        }
      }
    }

    // Save response & answers transactionally
    const newResponse = await prisma.$transaction(async (tx) => {
      const response = await tx.formResponse.create({
        data: {
          formId: form.id,
        },
      });

      if (answers && Array.isArray(answers)) {
        for (const ans of answers) {
          if (ans.value !== undefined && ans.value !== null) {
            await tx.formAnswer.create({
              data: {
                responseId: response.id,
                fieldId: ans.fieldId,
                value: String(ans.value),
              },
            });
          }
        }
      }

      return response;
    });

    return NextResponse.json({
      success: true,
      responseId: newResponse.id,
      message: form.successMessage,
    });
  } catch (error) {
    console.error("POST public response error:", error);
    return NextResponse.json(
      { error: "Gagal mengirimkan respon formulir." },
      { status: 500 }
    );
  }
}
