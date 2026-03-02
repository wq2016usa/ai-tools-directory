import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const tool = await prisma.tool.findUnique({
      where: { slug: params.slug },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!tool) {
      return notFound("Tool not found.");
    }

    return NextResponse.json({ data: tool });
  } catch (error) {
    console.error("GET /api/tools/by-slug/[slug] error", error);
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 500 },
    );
  }
}

