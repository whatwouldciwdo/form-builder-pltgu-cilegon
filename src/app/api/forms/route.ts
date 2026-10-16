import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            responses: true,
            fields: true,
          },
        },
      },
    });

    return NextResponse.json({ forms });
  } catch (error) {
    console.error("GET /api/forms error:", error);
    return NextResponse.json(
      { error: "Gagal memuat formulir" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Judul formulir wajib diisi" },
        { status: 400 }
      );
    }

    // Generate clean slug from title
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    if (!baseSlug) {
      baseSlug = "form";
    }

    // Check if slug already exists; if yes, append suffix
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.form.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const form = await prisma.form.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        slug,
        isPublished: true, // Default aktif agar langsung bisa diisi jika dibagikan
        fields: {
          create: [
            {
              type: "TEXT",
              label: "Nama Lengkap",
              placeholder: "Contoh: Budi Santoso",
              isRequired: true,
              order: 0,
            },
            {
              type: "TEXT",
              label: "Bagian / Divisi",
              placeholder: "Contoh: Operasi / Pemeliharaan",
              isRequired: true,
              order: 1,
            },
            {
              type: "SIGNATURE",
              label: "Tanda Tangan Digital Pengesahan",
              isRequired: true,
              order: 2,
            },
          ],
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    console.error("POST /api/forms error:", error);
    return NextResponse.json(
      { error: "Gagal membuat formulir baru" },
      { status: 500 }
    );
  }
}
