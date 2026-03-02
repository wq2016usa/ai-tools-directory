"use client";

import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
          <p className="text-sm text-zinc-600">
            Manage tools in the AI tools directory.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/tools"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400"
          >
            <h2 className="text-sm font-semibold text-zinc-900">Tools</h2>
            <p className="mt-1 text-sm text-zinc-600">
              View, edit, and delete tools in the directory.
            </p>
          </Link>

          <Link
            href="/admin/tools/new"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400"
          >
            <h2 className="text-sm font-semibold text-zinc-900">
              Add new tool
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Create a new AI tool entry.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

