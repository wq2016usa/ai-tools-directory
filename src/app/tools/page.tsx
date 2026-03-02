"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PricingModel = "FREE" | "FREEMIUM" | "PAID" | "OSS" | "ENTERPRISE";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  pricingModel: PricingModel;
  categories: { category: Category }[];
  tags: { tag: Tag }[];
}

interface ToolsMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ToolsResponse {
  data: Tool[];
  meta: ToolsMeta;
}

type Filters = {
  q: string;
  category: string;
  tag: string;
  pricingModel: "" | PricingModel;
  platform: string;
};

const PRICING_MODEL_OPTIONS: { value: "" | PricingModel; label: string }[] = [
  { value: "", label: "Any" },
  { value: "FREE", label: "Free" },
  { value: "FREEMIUM", label: "Freemium" },
  { value: "PAID", label: "Paid" },
  { value: "OSS", label: "Open Source" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

const INITIAL_FILTERS: Filters = {
  q: "",
  category: "",
  tag: "",
  pricingModel: "",
  platform: "",
};

export default function ToolsPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<ToolsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasActiveFilters = useMemo(
    () =>
      activeFilters.q ||
      activeFilters.category ||
      activeFilters.tag ||
      activeFilters.pricingModel ||
      activeFilters.platform,
    [activeFilters],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadTools() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (activeFilters.q) params.set("q", activeFilters.q);
        if (activeFilters.category) params.set("category", activeFilters.category);
        if (activeFilters.tag) params.set("tag", activeFilters.tag);
        if (activeFilters.pricingModel) {
          params.set("pricingModel", activeFilters.pricingModel);
        }
        if (activeFilters.platform) params.set("platform", activeFilters.platform);

        params.set("page", String(page));

        const res = await fetch(`/api/tools?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || "Failed to fetch tools.");
        }

        const data = (await res.json()) as ToolsResponse;
        setResponse(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadTools();

    return () => controller.abort();
  }, [activeFilters, page]);

  function handleApplyFilters() {
    setActiveFilters(filters);
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">
            AI Tools Directory
          </h1>
          <p className="text-sm text-zinc-600">
            Discover AI tools by category, pricing, platform, and more.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-[260px,1fr]">
          <aside className="space-y-6 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-zinc-700"
                >
                  Category slug
                </label>
                <input
                  id="category"
                  type="text"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g. productivity"
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="tag"
                  className="block text-xs font-medium text-zinc-700"
                >
                  Tag slug
                </label>
                <input
                  id="tag"
                  type="text"
                  value={filters.tag}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      tag: e.target.value,
                    }))
                  }
                  placeholder="e.g. chatgpt"
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="pricingModel"
                  className="block text-xs font-medium text-zinc-700"
                >
                  Pricing model
                </label>
                <select
                  id="pricingModel"
                  value={filters.pricingModel}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      pricingModel: e.target.value as Filters["pricingModel"],
                    }))
                  }
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 focus:border-zinc-900"
                >
                  {PRICING_MODEL_OPTIONS.map((option) => (
                    <option key={option.value || "any"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="platform"
                  className="block text-xs font-medium text-zinc-700"
                >
                  Platform
                </label>
                <input
                  id="platform"
                  type="text"
                  value={filters.platform}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  placeholder="e.g. web, chrome"
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
            >
              Apply filters
            </button>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <input
                  type="search"
                  placeholder="Search tools…"
                  value={filters.q}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, q: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleApplyFilters();
                    }
                  }}
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-400">
                  ⌕
                </span>
              </div>

              <div className="text-xs text-zinc-500">
                {response?.meta.total ?? 0} tools
                {hasActiveFilters && " (filtered)"}
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="min-h-[200px] rounded-lg border border-zinc-200 bg-white p-4">
              {loading && (
                <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                  Loading tools…
                </div>
              )}

              {!loading && (response?.data.length ?? 0) === 0 && (
                <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                  No tools found. Try adjusting your filters.
                </div>
              )}

              {!loading && (response?.data.length ?? 0) > 0 && (
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {response!.data.map((tool) => (
                    <li
                      key={tool.id}
                      className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/tools/${tool.slug}`}
                              className="text-sm font-semibold text-zinc-900 hover:underline"
                            >
                              {tool.name}
                            </Link>
                            {tool.tagline && (
                              <p className="mt-1 text-xs text-zinc-600">
                                {tool.tagline}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700">
                            {tool.pricingModel.toLowerCase()}
                          </span>
                        </div>

                        {tool.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.map(({ tag }) => (
                              <span
                                key={tag.id}
                                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {response && response.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-1 text-xs text-zinc-600">
                <div>
                  Page {response.meta.page} of {response.meta.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={
                      loading ||
                      response.meta.totalPages === 0 ||
                      page >= response.meta.totalPages
                    }
                    onClick={() =>
                      setPage((p) =>
                        response.meta.totalPages
                          ? Math.min(response.meta.totalPages, p + 1)
                          : p + 1,
                      )
                    }
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

