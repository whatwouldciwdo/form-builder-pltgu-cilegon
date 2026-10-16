import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
        fields: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulir tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("GET /api/forms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail formulir" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, slug: customSlug, description, isPublished, isAcceptingResponse, successMessage, fields } = body;

    // Validate and format slug if provided
    let finalSlug: string | undefined = undefined;
    if (customSlug) {
      let formattedSlug = customSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      // Check if another form is using this slug
      const existingFormWithSlug = await prisma.form.findFirst({
        where: {
          slug: formattedSlug,
          NOT: { id },
        },
      });

      if (existingFormWithSlug) {
        return NextResponse.json(
          { error: `Slug "/f/${formattedSlug}" sudah digunakan oleh formulir lain.` },
          { status: 400 }
        );
      }
      finalSlug = formattedSlug;
    }

    // Update form properties
    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        title,
        ...(finalSlug ? { slug: finalSlug } : {}),
        description,
        isPublished,
        isAcceptingResponse,
        successMessage,
      },
    });

    // If fields payload exists, update fields (transactionally replace or upsert)
    if (fields && Array.isArray(fields)) {
      // Delete existing fields and re-create for order consistency
      await prisma.$transaction(async (tx) => {
        await tx.formField.deleteMany({ where: { formId: id } });
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await tx.formField.create({
            data: {
              formId: id,
              type: f.type,
              label: f.label || "Untitled Field",
              placeholder: f.placeholder || null,
              helpText: f.helpText || null,
              isRequired: Boolean(f.isRequired),
              order: i,
              options: f.options || null,
            },
          });
        }
      });
    }

    const fullForm = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ form: fullForm });
  } catch (error) {
    console.error("PUT /api/forms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan formulir" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.form.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Formulir dihapus" });
  } catch (error) {
    console.error("DELETE /api/forms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus formulir" },
      { status: 500 }
    );
  }
}
