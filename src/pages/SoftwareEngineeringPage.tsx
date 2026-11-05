import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FONT_HEADING = { fontFamily: "'Fraunces', Georgia, serif" } as const;

type NavSection = { id: string; label: string };

const navSections: NavSection[] = [
  { id: "system", label: "System" },
  { id: "ai-worker", label: "AI worker" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "security", label: "Security" },
  { id: "images", label: "Images" },
  { id: "uploads", label: "Uploads" },
  { id: "search", label: "Search" },
  { id: "decisions", label: "Decisions" },
];

type DeepDive = {
  index: string;
  id: string;
  title: string;
  tagline: string;
  body: string;
  notes: string[];
};

const deepDives: DeepDive[] = [
  {
    index: "01",
    id: "frontend",
    title: "Frontend architecture",
    tagline: "A data-driven React app, served from the edge.",
    body: "React 18 + Vite + TypeScript + Tailwind served from Azure Static Web Apps behind a CDN. The gallery fetches published albums, pages each album with offset/limit, and appends results through an IntersectionObserver sentinel for infinite scroll. Read responses are cached in memory with a 5-minute TTL and in-flight requests are de-duplicated, so a hot path — or a fast back-navigation — never fires the same request twice. Images render progressively from a small thumb, up to a preview, then the full variant when on screen.",
    notes: ["IntersectionObserver paging", "offset / limit", "5-min TTL cache", "in-flight dedup", "thumb → preview → full"],
  },
  {
    index: "02",
    id: "backend",
    title: "Backend — hexagonal .NET 10",
    tagline: "Business logic that doesn't depend on infrastructure.",
    body: "A modular monolith in C#/.NET 10 with a strict dependency rule. Core.Domain holds entities and value objects, Core.Application holds vertical-slice use-cases (commands, queries, validators, mappings) per feature, and Core.Abstractions defines the ports — repository, image processor, blob storage, unit of work. Adapters sit at the edge: EF Core on Supabase Postgres, Supabase Storage, and the HTTP host. Because the core only depends on ports, infrastructure is swappable — which is exactly what let the API move from a VM to serverless without touching business logic. Architecture tests enforce the dependency direction.",
    notes: ["ports & adapters", "vertical slices", "dependency rule", "architecture tests", "swappable infrastructure"],
  },
  {
    index: "03",
    id: "backend-api",
    title: "API surface & hosting",
    tagline: "One contract, portable across hosts.",
    body: "A .NET 10 minimal API with public read routes (published albums, paged photos, search, similar, highlights) and admin-only routes behind an auth gate. Public routes return JSON only — image bytes are served from the Supabase CDN, never relayed through the API. The same codebase has run on a self-hosted VM and now on Azure Functions (Windows Consumption), preserving the /api route prefix byte-for-byte, so the frontend never changed during the move.",
    notes: ["public vs admin routes", "JSON-only responses", "CDN-served images", "serverless host", "byte-for-byte contract"],
  },
  {
    index: "04",
    id: "security",
    title: "Authentication & security",
    tagline: "Two independent gates between a visitor and the admin area.",
    body: "Admins sign in with Supabase GitHub OAuth. The SPA holds the session and sends it as a Bearer token; every protected route validates that token against Supabase /auth/v1/user and only an allowlisted ADMIN_USER_ID with the GitHub provider passes. The client maps 401 to a sign-out plus an explainer banner, and 403 to a denied message, so auth failures are legible rather than silent. Secrets are injected through GitHub Actions and Azure app settings — the shipped bundle contains no keys.",
    notes: ["GitHub OAuth", "Bearer validation", "ADMIN_USER_ID allowlist", "401 / 403 semantics", "no client-side secrets"],
  },
  {
    index: "05",
    id: "images",
    title: "Image processing pipeline",
    tagline: "One upload, three CDN-served WebP variants.",
    body: "Uploads are multipart, capped at 25 MB, and processed synchronously so the request contract stays simple. The pipeline validates the file, extracts EXIF (taken date, location, camera model), re-encodes to WebP — roughly 30–50% smaller than JPEG — and writes three derived sizes (thumb 300px, preview 800px, full 1920px) into Supabase Storage under photos/{id}/. A single Postgres row references all three variants plus the real width and height, which the frontend uses to build distortion-free layouts.",
    notes: ["25 MB cap", "EXIF extraction", "WebP ~30–50% smaller", "thumb / preview / full", "real W×H stored"],
  },
  {
    index: "06",
    id: "uploads",
    title: "Bulk uploads with real progress",
    tagline: "A batch tool rather than a form.",
    body: "Pick any number of files, assign one album, and the client builds a live queue. Uploads run sequentially — one request at a time — to keep memory predictable on the app host. Each file drives an XMLHttpRequest whose upload.onprogress feeds byte-accurate progress bars for the current file, the batch, and every card in the queue. Statuses move queued → uploading → uploaded / failed, failures show their reason with a one-click retry, and a completed run deep-links into the photo manager at ?review=<ids> so you land exactly on what you just shipped.",
    notes: ["sequential queue", "XHR byte progress", "per-file status cards", "retry + clear", "review deep-link"],
  },
  {
    index: "07",
    id: "ai-worker",
    title: "AI metadata — the background worker",
    tagline: "Gemini runs in the background, without blocking the API.",
    body: "Captions, descriptions, and tags are generated in the background. The queue is a durable Postgres table (PhotoMetadataJobs) with Pending / Processing / Completed / Failed states, attempt counts, and lastError — there is no in-memory state, so nothing is lost on a restart or a scale-to-zero. An hourly timer enqueues photos missing metadata, then runs a drain-all loop: mark Processing, attempt++, call Gemini throttled to ~4 s, write the result, mark Completed. Failures record the reason and stop retrying past an attempt cap. The admin dashboard polls every 10 s and can enqueue missing or reset failed jobs from the UI.",
    notes: ["durable Postgres queue", "hourly timer + time budget", "Gemini throttle ~4 s", "attempt cap + lastError", "admin enqueue / reset"],
  },
  {
    index: "08",
    id: "search",
    title: "Smart search & discovery",
    tagline: "Search the collection like a search engine.",
    body: "The search box runs a debounced (350 ms, min 2 chars) live query against AI-generated captions, descriptions, tags, and places, cached by a normalized query string with the same 5-minute TTL. Results auto-open and are URL-synced, so a search is shareable and back-navigation restores state. A photo's lightbox pulls similar photos — neighbours chosen by shared tags and metadata — and the homepage highlights strip surfaces the top-rated work.",
    notes: ["debounced 350 ms", "normalized-query cache", "URL-synced results", "similar photos", "ratings-driven highlights"],
  },
  {
    index: "09",
    id: "highlights",
    title: "Highlights grid — no distortion",
    tagline: "Column count adapts to the screen.",
    body: "The homepage highlights strip uses a justified layout instead of a fixed column count. It measures its container with a ResizeObserver, then packs a variable number of photos per row — one to six depending on screen size and real aspect ratios — so every image's box stays within a few percent of its natural aspect ratio. Each photo record stores its real width and height, so the grid never guesses. Captions reserve a fixed two-line slot, so a long caption cannot cut off or shift the layout.",
    notes: ["ResizeObserver", "aspect-ratio-aware packing", "1–6 columns adaptive", "real W×H, no guessing", "caption-safe rows"],
  },
  {
    index: "10",
    id: "testing",
    title: "Testing & CI/CD",
    tagline: "Tests that catch real problems, deploys that check themselves.",
    body: "The backend has three test suites: unit tests in the core against in-memory ports (no mocking frameworks), architecture tests that assert the hexagonal dependency rule, and integration tests that spin up real Postgres in Docker via Testcontainers. The frontend runs 200+ vitest + Testing Library tests covering hooks, layouts, admin flows, and the adaptive grid. GitHub Actions builds, tests, deploys, and then health-checks the live site on every push to main.",
    notes: ["unit in core", "architecture tests", "Testcontainers Postgres", "200+ frontend tests", "build → test → deploy → health"],
  },
];

const engineeringDecisions = [
  {
    title: "Durable queue, not in-memory",
    body: "The metadata queue lives in PostgreSQL, so a restart or scale-to-zero never loses a job — the next run just resumes from the table.",
  },
  {
    title: "Throttled AI on a timer",
    body: "A ~4-second gap between Gemini calls respects the API's rate limits while the hourly drain-all clears the whole backlog in one bounded run.",
  },
  {
    title: "Synchronous uploads on purpose",
    body: "Admin-only, ≤25 MB, sequential — keeping processing in the request path preserves a simple contract and bounded memory.",
  },
  {
    title: "Justified layout, not fixed columns",
    body: "The highlights grid re-packs itself per screen size using real photo dimensions, eliminating distorted crops on every viewport.",
  },
  {
    title: "WebP ×3, served from a CDN",
    body: "Re-encoding to WebP and generating three sizes cuts payloads 30–50% and lets the browser ask for the smallest variant it needs.",
  },
  {
    title: "Read cache + dedup",
    body: "A 5-minute TTL with in-flight de-duplication means a hot gallery path and a fast back-navigation never fire the same request twice.",
  },
];

function Chip({ children, accent }: { children: React.ReactNode; accent?: "sky" | "emerald" | "amber" }) {
  return (
    <span className={`inline-flex border-b pb-0.5 text-[10px] uppercase tracking-[0.18em] ${accent ? "border-[#D9482B]/50 text-[#D9482B]" : "border-white/20 text-white/50"}`}>
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 border-b border-white/10 pb-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">{eyebrow}</p>
      <h2 className="mt-2 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.02] tracking-[-0.03em] text-[#E9E2D6]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{subtitle}</p>
    </div>
  );
}

function DiagramNode({ title, subtitle, detail, accent = false }: { title: string; subtitle: string; detail: string; accent?: boolean }) {
  return (
    <div className={`flex-1 min-w-[150px] border p-3 ${accent ? "border-[#D9482B]/45 bg-[#D9482B]/[0.06]" : "border-white/12 bg-[#121110]"}`}>
      <p className="text-sm text-[#E9E2D6]">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{subtitle}</p>
      <p className={`mt-3 text-[10px] uppercase tracking-[0.18em] ${accent ? "text-[#D9482B]" : "text-white/35"}`}>
        {detail}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-1 sm:px-2" aria-hidden="true">
      <span className="text-white/25 text-lg">▸</span>
    </div>
  );
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];
  const aboutRef = useRef<HTMLDivElement>(null);
  const active = useScrollSpy(navSections.map((section) => section.id));

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0B0B0C]">
      <section className="relative min-h-[82vh] overflow-hidden bg-[#0B0B0C]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_15%,rgba(217,72,43,0.12),transparent_55%)]" />
        <div className="relative flex min-h-[82vh] flex-col justify-end px-5 pb-12 pt-32 md:px-10 md:pb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Work</p>
          <motion.h1
            className="mt-5 font-display text-[clamp(3.2rem,10vw,9rem)] leading-[0.82] tracking-[-0.055em] text-[#E9E2D6]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            How I build
            <br />
            this site.
          </motion.h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4 text-sm text-white/55">
            <p>Full-stack engineering, in public.</p>
            <button
              type="button"
              onClick={scrollToAbout}
              className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Read the breakdown ↓
            </button>
          </div>
        </div>
      </section>

      <section id="about" ref={aboutRef} className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">About</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#E9E2D6]">
              I build systems that connect UI, auth and APIs.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55">
              Backend-focused developer at Simcorp. C# / ASP.NET Core, with enough frontend to care about the whole
              workflow.
            </p>
          </div>
          <div className="grid gap-6 self-end">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/35">Current</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">Senior software engineer at Simcorp.</p>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/35">Tools</h3>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                {["C#", "ASP.NET Core", "SQL", "Git", "Azure Service Bus", "RabbitMQ", "Serverless", "Kubernetes", "JavaScript", "React"].map((skill) => (
                  <li key={skill} className="border-b border-white/10 pb-1">{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div id="projects" className="w-full border-t border-white/10 px-5 md:px-10">
        <div className="mx-auto w-full max-w-[1500px] pt-16 pb-4 md:pt-20">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Portfolio project</p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] tracking-[-0.05em] text-[#E9E2D6]">
            Photography Portfolio
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            A full-stack product with AI, smart search and a hexagonal .NET 10 backend.
          </p>

          <div className="border border-white/12 bg-[#121110] p-5 md:p-6 mt-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <ImageSwitcher images={images} />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="font-display text-2xl tracking-[-0.02em] text-[#E9E2D6]">The live product</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  The public site reads published albums and discovery endpoints from the API, while the admin area uses
                  Supabase GitHub OAuth plus backend allowlist checks to protect uploads, edits, ratings, and deletions.
                </p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <Chip accent="emerald">Gemini AI worker</Chip>
                  <Chip accent="sky">Smart search</Chip>
                  <Chip accent="amber">Bulk uploads</Chip>
                  <Chip>Hexagonal core</Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Project sections" className="sticky top-[70px] z-30 -mx-5 border-y border-white/10 bg-[#0B0B0C]/90 backdrop-blur-xl md:-mx-10">
          <div className="mx-auto max-w-[1500px] overflow-x-auto px-5 md:px-10">
            <ul className="flex gap-6 py-1 min-w-max">
              {navSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`cursor-pointer border-b-2 px-0 py-3 text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                      active === section.id ? "border-[#D9482B] text-white" : "border-transparent text-white/45 hover:text-white"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-[1500px] py-10 space-y-4">
          <section id="system" className="scroll-mt-[130px]">
            <div className="border border-white/12 bg-[#121110] p-5 md:p-6">
              <SectionHeading
                eyebrow="01 · System architecture"
                title="The whole stack, back to front"
                subtitle="Four layers and one background AI worker."
              />
              <div className="flex flex-col md:flex-row md:items-stretch">
                <DiagramNode title="Browser" subtitle="Visitors & admin" detail="Desktop · mobile" />
                <FlowArrow />
                <DiagramNode title="React SPA" subtitle="Azure Static Web Apps · CDN" detail="Gallery, discovery, admin" />
                <FlowArrow />
                <DiagramNode title="REST API" subtitle=".NET 10 · hexagonal core" detail="Public + admin routes" />
                <FlowArrow />
                <DiagramNode title="Supabase" subtitle="PostgreSQL · Storage · Auth" detail="Photos, queue, OAuth" />
              </div>
              <div className="mt-3 flex flex-col md:flex-row md:items-stretch">
                <div className="flex items-center justify-center md:pl-[58%]" aria-hidden="true">
                  <span className="text-white/30 text-sm">▾</span>
                </div>
                <div className="w-full md:w-auto md:flex-1">
                  <DiagramNode title="Gemini AI" subtitle="Hourly background worker" detail="Captions · tags · descriptions" accent />
                </div>
              </div>
            </div>
          </section>

          <section id="ai-worker" className="scroll-mt-[130px]">
            <div className="border border-[#D9482B]/30 bg-[#D9482B]/[0.04] p-5 md:p-6">
              <SectionHeading
                eyebrow="02 · Background job"
                title="The AI metadata worker"
                subtitle="The most infrastructure-heavy part of the project — captions and tags arrive from Gemini in the background."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">State machine</h3>
                  <div className="border border-white/10 bg-[#0F0E0D] p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→</span>
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Processing</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→</span>
                      <span className="border border-[#D9482B]/30 bg-[#D9482B]/10 px-2.5 py-1 text-[11px] text-[#D9482B]">Completed</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Processing</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ (attempts ≥ cap)</span>
                      <span className="border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-[11px] text-red-200">Failed + lastError</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Failed</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ reset (admin)</span>
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mt-3">
                      The Postgres table is the source of truth. Mark Processing, attempt++, call Gemini, write the result, mark Completed. A crash mid-job leaves it in Processing, which the next run reclaims.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Why it's durable</h3>
                  <div className="space-y-3">
                    <p className="text-white/70 text-sm leading-relaxed">
                      An hourly timer enqueues photos missing metadata, then a drain-all loop works through the oldest pending jobs until the queue is empty or the 10-minute budget runs out — a partial run just resumes on the next tick.
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      The queue lives in PostgreSQL, so a restart or a scale-to-zero never loses a job. On serverless the timer only fires while the host is awake, and an overdue run fires on the next wake.
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      The admin dashboard polls every 10 s and can enqueue missing metadata or reset failed jobs from the UI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-[0.25em]">03 · Deep dives</p>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em] mt-1" style={FONT_HEADING}>
                  How each piece works
                </h2>
              </div>
              
            </div>
          </div>

          <div className="space-y-4">
            {deepDives.map((item) => (
              <section key={item.id} id={item.id} className="scroll-mt-[130px] border border-white/12 bg-[#121110] p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="font-display text-4xl text-[#D9482B]/60 md:w-16 md:shrink-0 md:pt-1" style={FONT_HEADING}>
                    {item.index}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-2xl text-[#E9E2D6]" style={FONT_HEADING}>
                      {item.title}
                    </h3>
                    <p className="text-white/45 text-sm mt-1">{item.tagline}</p>
                    <p className="text-white/70 leading-relaxed text-sm mt-3">{item.body}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.notes.map((note) => (
                        <span key={note} className="inline-flex border-b border-white/15 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section id="decisions" className="scroll-mt-[130px]">
            <div className="border border-white/12 bg-[#121110] p-5 md:p-6">
              <SectionHeading
                eyebrow="04 · Engineering decisions"
                title="A few choices that shaped the design"
                subtitle="The trade-offs behind how the pieces fit together."
              />
              <div className="grid gap-3 md:grid-cols-2">
                {engineeringDecisions.map((item) => (
                  <div key={item.title} className="border border-white/10 bg-[#0F0E0D] p-4">
                    <h3 className="font-display text-lg text-[#E9E2D6] mb-2">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-6 pb-10">
            <h1 className="font-display text-2xl text-white/45 text-center w-full max-w-xl mx-auto px-4">
              Thanks for reading.
            </h1>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
