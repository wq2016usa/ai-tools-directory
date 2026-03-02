import { PrismaClient, PricingModel } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

type ToolSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricingModel: PricingModel;
  platforms: string[];
  apiAvailable: boolean;
  openSource: boolean;
  pros: string[];
  cons: string[];
  categorySlugs: string[];
  tagSlugs: string[];
};

const categories = [
  { name: "Productivity", slug: "productivity" },
  { name: "Writing & Copy", slug: "writing-copy" },
  { name: "Code & Dev", slug: "code-dev" },
  { name: "Design & Image", slug: "design-image" },
  { name: "Search & Research", slug: "search-research" },
  { name: "Automation & Agents", slug: "automation-agents" },
] as const;

const tags = [
  { name: "ChatGPT", slug: "chatgpt" },
  { name: "Summarization", slug: "summarization" },
  { name: "Browser Extension", slug: "browser-extension" },
  { name: "VS Code", slug: "vs-code" },
  { name: "Docs", slug: "docs" },
  { name: "Email", slug: "email" },
  { name: "SEO", slug: "seo" },
  { name: "Image Generation", slug: "image-generation" },
  { name: "Agents", slug: "agents" },
  { name: "Automation", slug: "automation" },
  { name: "Analytics", slug: "analytics" },
  { name: "APIs", slug: "apis" },
] as const;

const tools: ToolSeed[] = [
  {
    slug: "focusflow-assistant",
    name: "FocusFlow Assistant",
    tagline: "AI coworker for deep work sessions.",
    description:
      "FocusFlow Assistant helps you plan deep work blocks, summarize what you worked on, and keep distractions out of your focus time.",
    websiteUrl: "https://example.com/focusflow",
    pricingModel: "FREEMIUM",
    platforms: ["web", "chrome"],
    apiAvailable: false,
    openSource: false,
    pros: ["Great for solo makers", "Minimal, distraction-free UI"],
    cons: ["No native mobile app yet"],
    categorySlugs: ["productivity"],
    tagSlugs: ["chatgpt", "summarization"],
  },
  {
    slug: "scribe-catalyst",
    name: "Scribe Catalyst",
    tagline: "Turn raw notes into polished content.",
    description:
      "Paste messy notes and Scribe Catalyst restructures them into clear articles, newsletters, or internal docs.",
    websiteUrl: "https://example.com/scribe-catalyst",
    pricingModel: "PAID",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Excellent long‑form editor", "Great markdown support"],
    cons: ["Limited collaboration features"],
    categorySlugs: ["writing-copy", "productivity"],
    tagSlugs: ["docs", "email"],
  },
  {
    slug: "refactor-genie",
    name: "Refactor Genie",
    tagline: "AI-assisted refactors for large codebases.",
    description:
      "Refactor Genie suggests safe refactoring plans, generates patches, and helps you keep large TypeScript and Python repos healthy.",
    websiteUrl: "https://example.com/refactor-genie",
    pricingModel: "ENTERPRISE",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Understands monorepos", "Integrates with CI"],
    cons: ["Geared toward larger teams"],
    categorySlugs: ["code-dev"],
    tagSlugs: ["vs-code", "apis"],
  },
  {
    slug: "pixelforge-studio",
    name: "PixelForge Studio",
    tagline: "Generate brand‑ready visuals in seconds.",
    description:
      "PixelForge Studio turns rough sketches and prompts into consistent marketing visuals and social media assets.",
    websiteUrl: "https://example.com/pixelforge",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: false,
    openSource: false,
    pros: ["Strong brand consistency controls", "Preset templates"],
    cons: ["Large exports locked to paid tier"],
    categorySlugs: ["design-image"],
    tagSlugs: ["image-generation"],
  },
  {
    slug: "queryglass",
    name: "QueryGlass",
    tagline: "AI search layer over your docs.",
    description:
      "QueryGlass connects to your wikis, tickets, and repos to answer questions in natural language with grounded citations.",
    websiteUrl: "https://example.com/queryglass",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Good citation quality", "Easy Slack integration"],
    cons: ["Limited on‑prem deployment options"],
    categorySlugs: ["search-research"],
    tagSlugs: ["docs", "analytics"],
  },
  {
    slug: "mailmind-inbox",
    name: "MailMind Inbox",
    tagline: "Triage and reply to email automatically.",
    description:
      "MailMind Inbox drafts replies, highlights urgent threads, and suggests quick actions so you can regain control of your inbox.",
    websiteUrl: "https://example.com/mailmind",
    pricingModel: "FREEMIUM",
    platforms: ["web", "gmail"],
    apiAvailable: false,
    openSource: false,
    pros: ["Smart prioritization", "Works with major providers"],
    cons: ["Advanced workflows require paid plan"],
    categorySlugs: ["productivity"],
    tagSlugs: ["email", "automation"],
  },
  {
    slug: "rankcraft-seo",
    name: "RankCraft SEO",
    tagline: "SEO briefs and drafts in minutes.",
    description:
      "RankCraft SEO generates content briefs, outlines, and first drafts based on your target keywords and SERP competitors.",
    websiteUrl: "https://example.com/rankcraft",
    pricingModel: "PAID",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Solid keyword clustering", "Team collaboration"],
    cons: ["Overkill for small blogs"],
    categorySlugs: ["writing-copy"],
    tagSlugs: ["seo", "analytics"],
  },
  {
    slug: "sketchlens",
    name: "SketchLens",
    tagline: "From whiteboard photo to clean diagrams.",
    description:
      "Snap a photo of a whiteboard and SketchLens recreates it as an editable diagram in your favorite design tools.",
    websiteUrl: "https://example.com/sketchlens",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: false,
    openSource: false,
    pros: ["Great for workshops", "Exports to SVG"],
    cons: ["Occasional mis‑detections on messy boards"],
    categorySlugs: ["design-image", "productivity"],
    tagSlugs: ["image-generation"],
  },
  {
    slug: "snippet-sage",
    name: "Snippet Sage",
    tagline: "Code snippet search for your team.",
    description:
      "Snippet Sage lets engineers search for internal code examples across repos using natural language queries.",
    websiteUrl: "https://example.com/snippet-sage",
    pricingModel: "OSS",
    platforms: ["self-hosted"],
    apiAvailable: true,
    openSource: true,
    pros: ["Self‑hostable", "Good permission model"],
    cons: ["Requires some infra setup"],
    categorySlugs: ["code-dev", "search-research"],
    tagSlugs: ["vs-code", "apis"],
  },
  {
    slug: "loomscribe",
    name: "LoomScribe",
    tagline: "Turn screen recordings into docs.",
    description:
      "LoomScribe watches your walkthrough videos and generates SOPs, FAQs, and onboarding docs automatically.",
    websiteUrl: "https://example.com/loomscribe",
    pricingModel: "FREEMIUM",
    platforms: ["web", "chrome"],
    apiAvailable: false,
    openSource: false,
    pros: ["Great for onboarding", "Good transcription quality"],
    cons: ["Long videos take time to process"],
    categorySlugs: ["productivity", "writing-copy"],
    tagSlugs: ["docs", "summarization"],
  },
  {
    slug: "briefbot-meetings",
    name: "BriefBot Meetings",
    tagline: "Concise meeting notes with action items.",
    description:
      "BriefBot joins your calls, summarizes decisions, and sends follow‑ups with assigned owners and due dates.",
    websiteUrl: "https://example.com/briefbot",
    pricingModel: "PAID",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Action‑item focused", "Calendar integration"],
    cons: ["Requires org‑wide rollout for best results"],
    categorySlugs: ["productivity"],
    tagSlugs: ["summarization", "analytics"],
  },
  {
    slug: "promptkit-playground",
    name: "PromptKit Playground",
    tagline: "Version control for prompts.",
    description:
      "PromptKit Playground lets you version, test, and benchmark prompts across models with your own datasets.",
    websiteUrl: "https://example.com/promptkit",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Diffing between versions", "Team workspaces"],
    cons: ["No local evaluation yet"],
    categorySlugs: ["code-dev"],
    tagSlugs: ["apis", "analytics"],
  },
  {
    slug: "flowgrid-automator",
    name: "FlowGrid Automator",
    tagline: "Visual AI workflows for ops teams.",
    description:
      "FlowGrid Automator lets you build data‑aware workflows that combine APIs, webhooks, and AI models in a visual canvas.",
    websiteUrl: "https://example.com/flowgrid",
    pricingModel: "PAID",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Good monitoring", "Plays well with CRMs"],
    cons: ["Advanced features can be complex"],
    categorySlugs: ["automation-agents"],
    tagSlugs: ["agents", "automation"],
  },
  {
    slug: "inbox-buddy-lite",
    name: "Inbox Buddy Lite",
    tagline: "Lightweight helper for newsletters.",
    description:
      "Inbox Buddy Lite summarizes newsletter subscriptions into a single digest so you can stay informed in minutes.",
    websiteUrl: "https://example.com/inbox-buddy",
    pricingModel: "FREE",
    platforms: ["gmail"],
    apiAvailable: false,
    openSource: false,
    pros: ["Completely free", "Great for newsletter hoarders"],
    cons: ["Gmail‑only"],
    categorySlugs: ["productivity"],
    tagSlugs: ["email", "summarization"],
  },
  {
    slug: "canvas-companion",
    name: "Canvas Companion",
    tagline: "AI design critiques in your browser.",
    description:
      "Canvas Companion analyzes your live Figma or web designs and suggests layout, hierarchy, and copy improvements.",
    websiteUrl: "https://example.com/canvas-companion",
    pricingModel: "FREEMIUM",
    platforms: ["browser-extension"],
    apiAvailable: false,
    openSource: false,
    pros: ["Inline suggestions", "Good for solo designers"],
    cons: ["Limited multi‑brand support"],
    categorySlugs: ["design-image"],
    tagSlugs: ["browser-extension"],
  },
  {
    slug: "research-radar",
    name: "Research Radar",
    tagline: "Track new papers on your topics.",
    description:
      "Research Radar monitors arXiv and major journals and summarizes new papers tailored to your interests.",
    websiteUrl: "https://example.com/research-radar",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Good topic filters", "Citation exports"],
    cons: ["UI is a bit dense"],
    categorySlugs: ["search-research"],
    tagSlugs: ["summarization", "analytics"],
  },
  {
    slug: "commit-coach",
    name: "Commit Coach",
    tagline: "Smarter commit messages in your editor.",
    description:
      "Commit Coach generates meaningful commit messages and changelog entries directly from your diffs.",
    websiteUrl: "https://example.com/commit-coach",
    pricingModel: "OSS",
    platforms: ["vs-code"],
    apiAvailable: false,
    openSource: true,
    pros: ["Great for teams", "Pluggable templates"],
    cons: ["Requires local setup"],
    categorySlugs: ["code-dev"],
    tagSlugs: ["vs-code"],
  },
  {
    slug: "leadlens-qualifier",
    name: "LeadLens Qualifier",
    tagline: "AI SDR for inbound leads.",
    description:
      "LeadLens Qualifier triages new leads, enriches them, and proposes next steps based on your playbooks.",
    websiteUrl: "https://example.com/leadlens",
    pricingModel: "ENTERPRISE",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Salesforce integration", "Strong analytics"],
    cons: ["Enterprise‑oriented pricing"],
    categorySlugs: ["automation-agents"],
    tagSlugs: ["agents", "automation", "analytics"],
  },
  {
    slug: "threadsmith",
    name: "Threadsmith",
    tagline: "Summarize and repackage long threads.",
    description:
      "Threadsmith converts messy chat threads into clean summaries, briefs, and follow‑up task lists.",
    websiteUrl: "https://example.com/threadsmith",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: false,
    openSource: false,
    pros: ["Great for Slack exports", "Good templates"],
    cons: ["No on‑prem option"],
    categorySlugs: ["productivity", "writing-copy"],
    tagSlugs: ["summarization", "docs"],
  },
  {
    slug: "workflow-weaver",
    name: "Workflow Weaver",
    tagline: "Low‑code AI automations for teams.",
    description:
      "Workflow Weaver lets non‑technical teams connect tools, define triggers, and add AI reasoning steps.",
    websiteUrl: "https://example.com/workflow-weaver",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Friendly builder", "Good template gallery"],
    cons: ["Rate limits on free tier"],
    categorySlugs: ["automation-agents"],
    tagSlugs: ["agents", "automation"],
  },
  {
    slug: "deckdraft",
    name: "DeckDraft",
    tagline: "AI‑generated slide decks from briefs.",
    description:
      "DeckDraft turns a one‑sentence idea into a first‑pass slide deck including talking points and visuals.",
    websiteUrl: "https://example.com/deckdraft",
    pricingModel: "PAID",
    platforms: ["web"],
    apiAvailable: false,
    openSource: false,
    pros: ["Solid layouts", "Exports to PPTX"],
    cons: ["Brand theming is basic"],
    categorySlugs: ["design-image", "writing-copy"],
    tagSlugs: ["image-generation", "docs"],
  },
  {
    slug: "yardstick-analytics",
    name: "Yardstick Analytics",
    tagline: "Ask questions about your product analytics.",
    description:
      "Yardstick Analytics connects to your warehouse and lets teams ask natural‑language questions about product usage.",
    websiteUrl: "https://example.com/yardstick",
    pricingModel: "ENTERPRISE",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Models over your metrics layer", "Strong governance features"],
    cons: ["Requires robust data stack"],
    categorySlugs: ["search-research"],
    tagSlugs: ["analytics", "apis"],
  },
  {
    slug: "pairpilot",
    name: "PairPilot",
    tagline: "Lightweight pair programmer in your editor.",
    description:
      "PairPilot suggests edits, tests, and refactors directly from your IDE without being overly intrusive.",
    websiteUrl: "https://example.com/pairpilot",
    pricingModel: "PAID",
    platforms: ["vs-code"],
    apiAvailable: false,
    openSource: false,
    pros: ["Good TypeScript support", "Understands project context"],
    cons: ["Limited language coverage outside JS/TS"],
    categorySlugs: ["code-dev"],
    tagSlugs: ["vs-code", "chatgpt"],
  },
  {
    slug: "outline-orbit",
    name: "Outline Orbit",
    tagline: "AI outlines for long‑form writing.",
    description:
      "Outline Orbit helps you structure essays, reports, and books with flexible, AI‑assisted outlining.",
    websiteUrl: "https://example.com/outline-orbit",
    pricingModel: "FREEMIUM",
    platforms: ["web"],
    apiAvailable: false,
    openSource: false,
    pros: ["Great for authors", "Exports to most editors"],
    cons: ["No real‑time collaboration"],
    categorySlugs: ["writing-copy"],
    tagSlugs: ["docs"],
  },
  {
    slug: "ops-orbit",
    name: "Ops Orbit",
    tagline: "24/7 AI on‑call assistant.",
    description:
      "Ops Orbit monitors alerts, suggests runbooks, and prepares human‑readable incident summaries.",
    websiteUrl: "https://example.com/ops-orbit",
    pricingModel: "ENTERPRISE",
    platforms: ["web"],
    apiAvailable: true,
    openSource: false,
    pros: ["Solid incident timelines", "Good integrations"],
    cons: ["Best suited for larger teams"],
    categorySlugs: ["automation-agents"],
    tagSlugs: ["agents", "analytics"],
  },
];

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        slug: category.slug,
        name: category.name,
      },
    });
  }
}

async function seedTags() {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: {
        slug: tag.slug,
        name: tag.name,
      },
    });
  }
}

async function seedTools() {
  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        pricingModel: tool.pricingModel,
        platforms: tool.platforms,
        apiAvailable: tool.apiAvailable,
        openSource: tool.openSource,
        pros: tool.pros,
        cons: tool.cons,
      },
      create: {
        slug: tool.slug,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        pricingModel: tool.pricingModel,
        platforms: tool.platforms,
        apiAvailable: tool.apiAvailable,
        openSource: tool.openSource,
        pros: tool.pros,
        cons: tool.cons,
        categories: {
          create: tool.categorySlugs.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
        tags: {
          create: tool.tagSlugs.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
    });
  }
}

export async function main() {
  console.log("Seeding database...");
  await seedCategories();
  await seedTags();
  await seedTools();
  console.log("Seeding complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

