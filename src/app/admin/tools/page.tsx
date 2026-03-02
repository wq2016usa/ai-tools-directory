"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PricingModel = "FREE" | "FREEMIUM" | "PAID" | "OSS" | "ENTERPRISE";

interface ToolListItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  pricingModel: PricingModel;
  createdAt: string;
}

interface ToolsMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ToolsResponse {
  data: ToolListItem[];
  meta: ToolsMeta;
}

export default function AdminToolsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<ToolsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTools() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        params.set("page", String(page));
        params.set("pageSize", "20");

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
  }, [search, page]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this tool? This cannot be undone.")) return;

    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to delete tool.");
      }

      setResponse((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((t) => t.id !== id),
              meta: {
                ...prev.meta,
                total: Math.max(0, prev.meta.total - 1),
              },
            }
          : prev,
      );
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete tool.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Tools (admin)
            </h1>
            <p className="text-sm text-zinc-600">
              Search, edit, and delete tools.
            </p>
          </div>
          <Link
            href="/admin/tools/new"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
          >
            New tool
          </Link>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <input
                type="search"
                placeholder="Search tools…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-400">
                ⌕
              </span>
            </div>

            <div className="text-xs text-zinc-500">
              {response?.meta.total ?? 0} tools
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Pricing</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-zinc-500"
                    >
                      Loading tools…
                    </td>
                  </tr>
                )}

                {!loading &&
                  (response?.data ?? []).map((tool) => (
                    <tr
                      key={tool.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="py-2 pr-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">
                            {tool.name}
                          </span>
                          {tool.tagline && (
                            <span className="text-xs text-zinc-500">
                              {tool.tagline}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs text-zinc-600">
                        {tool.slug}
                      </td>
                      <td className="py-2 pr-4 text-xs text-zinc-700">
                        {tool.pricingModel.toLowerCase()}
                      </td>
                      <td className="py-2 pr-4 text-xs text-zinc-500">
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 text-right text-xs">
                        <Link
                          href={`/admin/tools/${tool.id}`}
                          className="mr-3 text-zinc-800 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(tool.id)}
                          disabled={deletingId === tool.id}
                          className="text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === tool.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && (response?.data.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-zinc-500"
                    >
                      No tools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {response && response.meta.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
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
      </main>
    </div>
  );
}

