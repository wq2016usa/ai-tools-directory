"use client";

import { FormEvent, useState } from "react";
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

export default function AdminNewToolPage() {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
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
        throw new Error(data.error || details || "Failed to create tool.");
      }

      setSuccess("Tool created successfully.");
      setSlug("");
      setName("");
      setTagline("");
      setDescription("");
      setWebsiteUrl("");
      setPlatforms("");
      setApiAvailable(false);
      setOpenSource(false);
      setPros("");
      setCons("");
      setCategorySlugs("");
      setTagSlugs("");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create tool.");
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
              New tool
            </h1>
            <p className="text-sm text-zinc-600">
              Create a new tool in the directory.
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
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="awesome-ai-tool"
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
                placeholder="Short one-line description"
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
                placeholder="https://example.com"
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
                  placeholder="web, chrome, desktop"
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
                  placeholder="fast, easy to use"
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
                  placeholder="limited free tier"
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
                  placeholder="productivity, assistants"
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
                  placeholder="chatgpt, workflow"
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
                {submitting ? "Creating…" : "Create tool"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

