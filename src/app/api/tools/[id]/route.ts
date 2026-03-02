import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const ALLOWED_PRICING_MODELS = [
  "FREE",
  "FREEMIUM",
  "PAID",
  "OSS",
  "ENTERPRISE",
] as const;

type PricingModel = (typeof ALLOWED_PRICING_MODELS)[number];

interface ToolUpdatePayload {
  slug?: string;
  name?: string;
  tagline?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  pricingModel?: string;
  platforms?: unknown;
  apiAvailable?: unknown;
  openSource?: unknown;
  pros?: unknown;
  cons?: unknown;
  categorySlugs?: unknown;
  tagSlugs?: unknown;
}

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 },
  );
}

function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

function ensureStringArray(
  value: unknown,
  fieldName: string,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new Error(`Field "${fieldName}" must be an array of strings.`);
  }
  return value as string[];
}

async function findToolWithRelations(id: string) {
  return prisma.tool.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tool = await findToolWithRelations(params.id);

    if (!tool) {
      return notFound("Tool not found.");
    }

    return NextResponse.json({ data: tool });
  } catch (error) {
    console.error("GET /api/tools/[id] error", error);
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  let body: ToolUpdatePayload;

  try {
    body = (await req.json()) as ToolUpdatePayload;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const id = params.id;

  try {
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Tool not found.");
    }

    const errors: string[] = [];
    const data: Prisma.ToolUpdateInput = {};

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string") {
        errors.push('Field "slug" must be a string when provided.');
      } else {
        data.slug = body.slug;
      }
    }

    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        errors.push('Field "name" must be a string when provided.');
      } else {
        data.name = body.name;
      }
    }

    if (body.tagline !== undefined) {
      if (
        typeof body.tagline !== "string" &&
        body.tagline !== null
      ) {
        errors.push('Field "tagline" must be a string or null.');
      } else {
        data.tagline = body.tagline;
      }
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" &&
        body.description !== null
      ) {
        errors.push('Field "description" must be a string or null.');
      } else {
        data.description = body.description;
      }
    }

    if (body.websiteUrl !== undefined) {
      if (
        typeof body.websiteUrl !== "string" &&
        body.websiteUrl !== null
      ) {
        errors.push('Field "websiteUrl" must be a string or null.');
      } else {
        data.websiteUrl = body.websiteUrl;
      }
    }

    let pricingModel: PricingModel | undefined;
    if (body.pricingModel !== undefined) {
      if (typeof body.pricingModel !== "string") {
        errors.push('Field "pricingModel" must be a string when provided.');
      } else {
        const upper = body.pricingModel.toUpperCase();
        if (!ALLOWED_PRICING_MODELS.includes(upper as PricingModel)) {
          errors.push(
            `Field "pricingModel" must be one of: ${ALLOWED_PRICING_MODELS.join(
              ", ",
            )}.`,
          );
        } else {
          pricingModel = upper as PricingModel;
          data.pricingModel = pricingModel;
        }
      }
    }

    if (body.platforms !== undefined) {
      if (
        !Array.isArray(body.platforms) ||
        !body.platforms.every((p) => typeof p === "string")
      ) {
        errors.push('Field "platforms" must be an array of strings.');
      } else {
        data.platforms = { set: body.platforms };
      }
    }

    if (body.apiAvailable !== undefined) {
      if (typeof body.apiAvailable !== "boolean") {
        errors.push('Field "apiAvailable" must be a boolean.');
      } else {
        data.apiAvailable = body.apiAvailable;
      }
    }

    if (body.openSource !== undefined) {
      if (typeof body.openSource !== "boolean") {
        errors.push('Field "openSource" must be a boolean.');
      } else {
        data.openSource = body.openSource;
      }
    }

    if (body.pros !== undefined) {
      if (
        !Array.isArray(body.pros) ||
        !body.pros.every((p) => typeof p === "string")
      ) {
        errors.push('Field "pros" must be an array of strings.');
      } else {
        data.pros = { set: body.pros };
      }
    }

    if (body.cons !== undefined) {
      if (
        !Array.isArray(body.cons) ||
        !body.cons.every((p) => typeof p === "string")
      ) {
        errors.push('Field "cons" must be an array of strings.');
      } else {
        data.cons = { set: body.cons };
      }
    }

    let categorySlugs: string[] | undefined;
    let tagSlugs: string[] | undefined;

    try {
      categorySlugs = ensureStringArray(body.categorySlugs, "categorySlugs");
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Invalid categorySlugs.");
    }

    try {
      tagSlugs = ensureStringArray(body.tagSlugs, "tagSlugs");
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Invalid tagSlugs.");
    }

    if (errors.length > 0) {
      return badRequest("Validation failed.", { errors });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.tool.update({
        where: { id },
        data,
      });

      if (categorySlugs) {
        await tx.toolCategory.deleteMany({ where: { toolId: id } });

        if (categorySlugs.length > 0) {
          const categories = await Promise.all(
            categorySlugs.map((slug) =>
              tx.category.upsert({
                where: { slug },
                update: {},
                create: { slug, name: slug },
              }),
            ),
          );

          await tx.toolCategory.createMany({
            data: categories.map((category) => ({
              toolId: id,
              categoryId: category.id,
            })),
          });
        }
      }

      if (tagSlugs) {
        await tx.toolTag.deleteMany({ where: { toolId: id } });

        if (tagSlugs.length > 0) {
          const tags = await Promise.all(
            tagSlugs.map((slug) =>
              tx.tag.upsert({
                where: { slug },
                update: {},
                create: { slug, name: slug },
              }),
            ),
          );

          await tx.toolTag.createMany({
            data: tags.map((tag) => ({
              toolId: id,
              tagId: tag.id,
            })),
          });
        }
      }

      return tx.tool.findUnique({
        where: { id },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      });
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/tools/[id] error", error);
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  try {
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Tool not found.");
    }

    await prisma.tool.delete({ where: { id } });

    return NextResponse.json(
      { message: "Tool deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/tools/[id] error", error);
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 },
    );
  }
}

