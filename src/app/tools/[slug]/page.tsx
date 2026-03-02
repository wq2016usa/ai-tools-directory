import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

type ToolDetail = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  websiteUrl: string | null;
  pricingModel: string;
  platforms: string[];
  apiAvailable: boolean;
  openSource: boolean;
  pros: string[];
  cons: string[];
  categories: { category: { id: string; name: string; slug: string } }[];
  tags: { tag: { id: string; name: string; slug: string } }[];
};

interface ToolPageProps {
  params: { slug: string };
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(
    `${baseUrl}/api/tools/by-slug/${encodeURIComponent(params.slug)}`,
    { cache: "no-store" },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load tool.");
  }

  const json = (await res.json()) as { data: ToolDetail };
  const tool = json.data;

  if (!tool) {
    notFound();
  }

  const platforms = tool.platforms ?? [];
  const pros = tool.pros ?? [];
  const cons = tool.cons ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-6 text-xs">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800"
          >
            <span aria-hidden="true">←</span>
            Back to directory
          </Link>
        </div>

        <section className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <header className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">
                  {tool.name}
                </h1>
                {tool.tagline && (
                  <p className="mt-1 text-sm text-zinc-600">{tool.tagline}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
                  {tool.pricingModel.toLowerCase()}
                </span>
                {tool.websiteUrl && (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 hover:border-zinc-400"
                  >
                    Visit website
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tool.apiAvailable && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  API available
                </span>
              )}
              {tool.openSource && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                  Open source
                </span>
              )}
            </div>
          </header>

          {tool.description && (
            <p className="text-sm leading-relaxed text-zinc-700">
              {tool.description}
            </p>
          )}

          <section className="grid gap-4 border-t border-zinc-100 pt-4 text-sm text-zinc-700 md:grid-cols-2">
            {platforms.length > 0 && (
              <div>
                <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Platforms
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tool.categories.length > 0 && (
              <div>
                <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {tool.categories.map(({ category }) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tool.tags.length > 0 && (
              <div>
                <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {(pros.length > 0 || cons.length > 0) && (
            <section className="grid gap-6 border-t border-zinc-100 pt-4 text-sm text-zinc-700 md:grid-cols-2">
              {pros.length > 0 && (
                <div>
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Pros
                  </h2>
                  <ul className="space-y-1.5">
                    {pros.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cons.length > 0 && (
                <div>
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-rose-700">
                    Cons
                  </h2>
                  <ul className="space-y-1.5">
                    {cons.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

