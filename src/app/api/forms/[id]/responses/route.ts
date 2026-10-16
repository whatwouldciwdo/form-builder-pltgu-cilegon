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
        responses: {
          orderBy: { submittedAt: "desc" },
          include: {
            answers: true,
          },
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
    console.error("GET responses error:", error);
    return NextResponse.json(
      { error: "Gagal memuat respon" },
      { status: 500 }
    );
  }
}
