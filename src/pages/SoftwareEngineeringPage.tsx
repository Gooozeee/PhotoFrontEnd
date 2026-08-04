import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { useEffect, useRef, useState } from "react";

const FONT_HEADING = { fontFamily: "'Archivo', sans-serif" } as const;
const FONT_BODY = { fontFamily: "'Space Grotesk', sans-serif" } as const;

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
  const accents = {
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] ${accent ? accents[accent] : "border-white/10 bg-white/5 text-white/55"}`}>
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <p className="text-white/40 text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
      <h2 className="text-white text-xl md:text-2xl font-light mt-1" style={FONT_HEADING}>
        {title}
      </h2>
      <p className="text-white/55 text-sm md:text-base mt-2 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function DiagramNode({ title, subtitle, detail, accent = false }: { title: string; subtitle: string; detail: string; accent?: boolean }) {
  return (
    <div className={`flex-1 min-w-[150px] rounded-xl border p-3 ${accent ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-[#111114]"}`}>
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="mt-0.5 text-[11px] text-white/50 leading-snug">{subtitle}</p>
      <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${accent ? "bg-emerald-400/15 text-emerald-200" : "bg-white/5 text-white/55"}`}>
        {detail}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-1 sm:px-2" aria-hidden="true">
      <span className="text-white/30 text-lg">▸</span>
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
    <div className="bg-[#09090B]">
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer"
        onScrollIndicatorClick={scrollToAbout}
      />
      <div id="about" className="pt-10 md:pt-12 flex flex-col items-center w-full px-4" ref={aboutRef}>
        <h1 className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center" style={FONT_HEADING}>
          About Me
        </h1>
        <h2 className="text-white/60 text-base font-light text-center pt-3 pb-8 px-5 max-w-xl" style={FONT_BODY}>
          I build systems that connect UI, auth, and APIs end to end.
        </h2>
        <div className="w-full max-w-4xl py-8 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-white text-lg font-light mb-4" style={FONT_HEADING}>
              Get to Know Me!
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed text-sm md:text-base">
              I'm a <span className="text-white font-medium">Backend Focused Developer</span> currently working at Simcorp as a Senior software engineer.
            </p>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              I specialise in <span className="text-white font-medium">C# ASP .Net Core</span> backend development, and I like shaping the frontend around real production workflows.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-white text-lg font-light mb-4" style={FONT_HEADING}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "C#",
                "Asp.Net Core",
                "SQL",
                "Git",
                "Azure Service Bus",
                "RabbitMQ",
                "Serverless",
                "Kubernetes",
                "JavaScript",
                "React",
              ].map((skill) => (
                <div key={skill} className="text-sm font-normal bg-[#27272A] text-white/80 px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#3F3F46] hover:text-white">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="projects" className="w-full flex flex-col items-center border-t border-white/[0.08] px-4">
        <div className="w-full max-w-5xl pt-12 pb-4">
          <p className="text-white/40 text-xs uppercase tracking-[0.25em] text-center">Portfolio project</p>
          <h1 className="text-white font-light text-[clamp(2rem,6vw,3.25rem)] text-center mt-2" style={FONT_HEADING}>
            Photography Portfolio
          </h1>
          <h2 className="text-white/60 text-base font-light text-center pt-3 px-5 max-w-2xl mx-auto leading-relaxed" style={FONT_BODY}>
            A full-stack product with AI, smart search, and a hexagonal .NET 10 backend.
          </h2>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm mt-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <ImageSwitcher images={images} />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-white text-lg md:text-xl font-light" style={FONT_HEADING}>
                  The live product
                </h2>
                <p className="text-white/70 leading-relaxed text-sm md:text-base mt-3">
                  The public site reads published albums and discovery endpoints from the API, while the admin area uses Supabase GitHub OAuth plus backend allowlist checks to protect uploads, edits, ratings, and deletions.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Chip accent="emerald">Gemini AI worker</Chip>
                  <Chip accent="sky">Smart search</Chip>
                  <Chip accent="amber">Bulk uploads</Chip>
                  <Chip>Hexagonal core</Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Project sections" className="sticky top-[70px] z-30 w-screen border-y border-white/[0.08] bg-[#09090B]/85 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl overflow-x-auto px-4">
            <ul className="flex gap-1 py-2.5 min-w-max">
              {navSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 ${
                      active === section.id ? "bg-white text-black" : "text-white/55 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="w-full max-w-5xl py-10 space-y-4">
          <section id="system" className="scroll-mt-[130px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
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
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5 md:p-6 backdrop-blur-sm">
              <SectionHeading
                eyebrow="02 · Background job"
                title="The AI metadata worker"
                subtitle="The most infrastructure-heavy part of the project — captions and tags arrive from Gemini in the background."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-white text-sm font-medium uppercase tracking-[0.15em] mb-3">State machine</h3>
                  <div className="rounded-xl border border-white/10 bg-[#111114] p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→</span>
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">Processing</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→</span>
                      <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-200">Completed</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">Processing</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ (attempts ≥ cap)</span>
                      <span className="rounded-lg border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-[11px] text-red-200">Failed + lastError</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">Failed</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ reset (admin)</span>
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mt-3">
                      The Postgres table is the source of truth. Mark Processing, attempt++, call Gemini, write the result, mark Completed. A crash mid-job leaves it in Processing, which the next run reclaims.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium uppercase tracking-[0.15em] mb-3">Why it's durable</h3>
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
                <h2 className="text-white text-xl md:text-2xl font-light mt-1" style={FONT_HEADING}>
                  How each piece works
                </h2>
              </div>
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] hidden md:block">10 areas</p>
            </div>
          </div>

          <div className="space-y-4">
            {deepDives.map((item) => (
              <section key={item.id} id={item.id} className="scroll-mt-[130px] rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="text-3xl font-light text-white/20 md:w-16 md:shrink-0 md:pt-1" style={FONT_HEADING}>
                    {item.index}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-lg font-medium" style={FONT_HEADING}>
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm mt-0.5 italic">{item.tagline}</p>
                    <p className="text-white/70 leading-relaxed text-sm mt-3">{item.body}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.notes.map((note) => (
                        <span key={note} className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/55">
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
              <SectionHeading
                eyebrow="04 · Engineering decisions"
                title="A few choices that shaped the design"
                subtitle="The trade-offs behind how the pieces fit together."
              />
              <div className="grid gap-3 md:grid-cols-2">
                {engineeringDecisions.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-[#111114] p-4">
                    <h3 className="text-white text-sm font-medium mb-2">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-6 pb-10">
            <h1 className="text-white/50 font-light text-center w-full max-w-xl mx-auto px-4 text-sm md:text-base" style={FONT_BODY}>
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
