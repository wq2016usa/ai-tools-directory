"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type PricingModel = "FREE" | "FREEMIUM" | "PAID" | "OSS" | "ENTERPRISE";

const PRICING_MODEL_OPTIONS: { value: PricingModel; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "FREEMIUM", label: "Freemium" },
  { value: "PAID", label: "Paid" },
  { value: "OSS", label: "Open Source" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

interface ToolForEdit {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  websiteUrl: string | null;
  pricingModel: PricingModel;
  platforms: string[];
  apiAvailable: boolean;
  openSource: boolean;
  pros: string[];
  cons: string[];
  categories: { category: { id: string; name: string; slug: string } }[];
  tags: { tag: { id: string; name: string; slug: string } }[];
}

interface AdminEditToolPageProps {
  params: { id: string };
}

export default function AdminEditToolPage({ params }: AdminEditToolPageProps) {
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("FREEMIUM");
  const [platforms, setPlatforms] = useState("");
  const [apiAvailable, setApiAvailable] = useState(false);
  const [openSource, setOpenSource] = useState(false);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [categorySlugs, setCategorySlugs] = useState("");
  const [tagSlugs, setTagSlugs] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTool() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/tools/${params.id}`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          setError("Tool not found.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || "Failed to load tool.");
        }

        const json = (await res.json()) as { data: ToolForEdit };
        const tool = json.data;

        setSlug(tool.slug);
        setName(tool.name);
        setTagline(tool.tagline ?? "");
        setDescription(tool.description ?? "");
        setWebsiteUrl(tool.websiteUrl ?? "");
        setPricingModel(tool.pricingModel);
        setPlatforms(tool.platforms.join(", "));
        setApiAvailable(tool.apiAvailable);
        setOpenSource(tool.openSource);
        setPros(tool.pros.join(", "));
        setCons(tool.cons.join(", "));
        setCategorySlugs(
          tool.categories.map((c) => c.category.slug).join(", "),
        );
        setTagSlugs(tool.tags.map((t) => t.tag.slug).join(", "));
        setInitialLoaded(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load tool.");
      } finally {
        setLoading(false);
      }
    }

    loadTool();

    return () => controller.abort();
  }, [params.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/tools/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: slug.trim(),
          name: name.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          pricingModel,
          platforms: splitCsv(platforms),
          apiAvailable,
          openSource,
          pros: splitCsv(pros),
          cons: splitCsv(cons),
          categorySlugs: splitCsv(categorySlugs),
          tagSlugs: splitCsv(tagSlugs),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: { errors?: string[] };
        };
        const details = data.details?.errors?.join(" ") ?? "";
        throw new Error(data.error || details || "Failed to update tool.");
      }

      setSuccess("Tool updated successfully.");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update tool.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Edit tool
            </h1>
            <p className="text-sm text-zinc-600">
              Update details for this tool.
            </p>
          </div>
          <Link
            href="/admin/tools"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to tools
          </Link>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          {loading && !initialLoaded && (
            <div className="text-sm text-zinc-500">Loading tool…</div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Pricing model
                  </label>
                  <select
                    value={pricingModel}
                    onChange={(e) =>
                      setPricingModel(e.target.value as PricingModel)
                    }
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 focus:border-zinc-900"
                  >
                    {PRICING_MODEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Platforms (comma separated)
                  </label>
                  <input
                    type="text"
                    value={platforms}
                    onChange={(e) => setPlatforms(e.target.value)}
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 text-xs text-zinc-700">
                    <input
                      type="checkbox"
                      checked={apiAvailable}
                      onChange={(e) => setApiAvailable(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900"
                    />
                    API available
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700">
                    <input
                      type="checkbox"
                      checked={openSource}
                      onChange={(e) => setOpenSource(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900"
                    />
                    Open source
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Pros (comma separated)
                  </label>
                  <input
                    type="text"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Cons (comma separated)
                  </label>
                  <input
                    type="text"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Category slugs (comma separated)
                  </label>
                  <input
                    type="text"
                    value={categorySlugs}
                    onChange={(e) => setCategorySlugs(e.target.value)}
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Tag slugs (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagSlugs}
                    onChange={(e) => setTagSlugs(e.target.value)}
                    className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 ring-offset-0 placeholder:text-zinc-400 focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

