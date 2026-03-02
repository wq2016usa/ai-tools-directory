import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parsePaginationParams } from "@/lib/pagination";
import type { Prisma } from "@/generated/prisma/client";

const ALLOWED_PRICING_MODELS = [
  "FREE",
  "FREEMIUM",
  "PAID",
  "OSS",
  "ENTERPRISE",
] as const;

type PricingModel = (typeof ALLOWED_PRICING_MODELS)[number];

interface ToolPayload {
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

function getSearchParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value ?? undefined;
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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const q = getSearchParam(searchParams, "q");
    const categorySlug = getSearchParam(searchParams, "category");
    const tagSlug = getSearchParam(searchParams, "tag");
    const pricingModelParam = getSearchParam(searchParams, "pricingModel");
    const platform = getSearchParam(searchParams, "platform");

    const { page, pageSize, skip } = parsePaginationParams({
      page: getSearchParam(searchParams, "page"),
      pageSize: getSearchParam(searchParams, "pageSize"),
    });

    let pricingModel: PricingModel | undefined;
    if (pricingModelParam) {
      const upper = pricingModelParam.toUpperCase();
      if (!ALLOWED_PRICING_MODELS.includes(upper as PricingModel)) {
        return badRequest("Invalid pricingModel", {
          allowed: ALLOWED_PRICING_MODELS,
        });
      }
      pricingModel = upper as PricingModel;
    }

    const where: Prisma.ToolWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (pricingModel) {
      where.pricingModel = pricingModel;
    }

    if (platform) {
      where.platforms = { has: platform };
    }

    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.tool.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          categories: {
            include: { category: true },
          },
          tags: {
            include: { tag: true },
          },
        },
      }),
      prisma.tool.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/tools error", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: ToolPayload;

  try {
    body = (await req.json()) as ToolPayload;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  try {
    const errors: string[] = [];

    if (!body.slug || typeof body.slug !== "string") {
      errors.push('Field "slug" is required and must be a string.');
    }

    if (!body.name || typeof body.name !== "string") {
      errors.push('Field "name" is required and must be a string.');
    }

    if (!body.pricingModel || typeof body.pricingModel !== "string") {
      errors.push(
        'Field "pricingModel" is required and must be a string enum value.',
      );
    }

    let pricingModel: PricingModel | undefined;
    if (body.pricingModel) {
      const upper = body.pricingModel.toUpperCase();
      if (!ALLOWED_PRICING_MODELS.includes(upper as PricingModel)) {
        errors.push(
          `Field "pricingModel" must be one of: ${ALLOWED_PRICING_MODELS.join(
            ", ",
          )}.`,
        );
      } else {
        pricingModel = upper as PricingModel;
      }
    }

    const platforms = body.platforms ?? [];
    if (
      platforms !== undefined &&
      (!Array.isArray(platforms) ||
        !platforms.every((p) => typeof p === "string"))
    ) {
      errors.push('Field "platforms" must be an array of strings.');
    }

    const pros = body.pros ?? [];
    if (pros !== undefined && (!Array.isArray(pros) || !pros.every((p) => typeof p === "string"))) {
      errors.push('Field "pros" must be an array of strings.');
    }

    const cons = body.cons ?? [];
    if (cons !== undefined && (!Array.isArray(cons) || !cons.every((p) => typeof p === "string"))) {
      errors.push('Field "cons" must be an array of strings.');
    }

    let categorySlugs: string[] = [];
    let tagSlugs: string[] = [];

    try {
      categorySlugs =
        ensureStringArray(body.categorySlugs, "categorySlugs") ?? [];
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Invalid categorySlugs.");
    }

    try {
      tagSlugs = ensureStringArray(body.tagSlugs, "tagSlugs") ?? [];
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Invalid tagSlugs.");
    }

    if (errors.length > 0) {
      return badRequest("Validation failed.", { errors });
    }

    const created = await prisma.$transaction(async (tx) => {
      const categories = await Promise.all(
        categorySlugs.map((slug) =>
          tx.category.upsert({
            where: { slug },
            update: {},
            create: { slug, name: slug },
          }),
        ),
      );

      const tags = await Promise.all(
        tagSlugs.map((slug) =>
          tx.tag.upsert({
            where: { slug },
            update: {},
            create: { slug, name: slug },
          }),
        ),
      );

      const tool = await tx.tool.create({
        data: {
          slug: body.slug!,
          name: body.name!,
          tagline:
            body.tagline === undefined ? null : (body.tagline as string | null),
          description:
            body.description === undefined
              ? null
              : (body.description as string | null),
          websiteUrl:
            body.websiteUrl === undefined
              ? null
              : (body.websiteUrl as string | null),
          pricingModel: pricingModel!,
          platforms: (platforms as string[]) ?? [],
          apiAvailable: Boolean(body.apiAvailable),
          openSource: Boolean(body.openSource),
          pros: (pros as string[]) ?? [],
          cons: (cons as string[]) ?? [],
        },
      });

      if (categories.length > 0) {
        await tx.toolCategory.createMany({
          data: categories.map((category) => ({
            toolId: tool.id,
            categoryId: category.id,
          })),
          skipDuplicates: true,
        });
      }

      if (tags.length > 0) {
        await tx.toolTag.createMany({
          data: tags.map((tag) => ({
            toolId: tool.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      return tx.tool.findUnique({
        where: { id: tool.id },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      });
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tools error", error);
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 },
    );
  }
}

