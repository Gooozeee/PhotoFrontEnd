import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { useRef } from "react";

type FlowStep = {
  title: string;
  description: string;
  detail: string;
};

type DeepDive = {
  index: string;
  title: string;
  tagline: string;
  body: string;
  notes: string[];
  miniFlow?: string[];
};

const flowSteps: FlowStep[] = [
  {
    title: "Public UI",
    description: "Reads published albums and pages through photos with infinite scroll.",
    detail: "offset / limit · WebP lazy-load",
  },
  {
    title: "Discovery",
    description: "Live search, similar photos, and a justified highlights strip over AI metadata.",
    detail: "search · similar · highlights",
  },
  {
    title: "API Layer",
    description: ".NET 10 minimal API with a hexagonal core and vertical-slice use-cases.",
    detail: "commands · queries · ports",
  },
  {
    title: "Auth + Guardrails",
    description: "Supabase GitHub OAuth with Bearer validation and an admin allowlist.",
    detail: "JWT · ADMIN_USER_ID",
  },
  {
    title: "Admin Actions",
    description: "Bulk uploads, ratings, and metadata edits flow back through live responses.",
    detail: "sequential upload queue",
  },
  {
    title: "Background AI",
    description: "An hourly worker drains a durable Postgres queue and calls Gemini.",
    detail: "throttled · retries · reset",
  },
];

const deepDives: DeepDive[] = [
  {
    index: "01",
    title: "Frontend architecture",
    tagline: "A real data-driven SPA, not a template.",
    body: "React 18 + Vite + TypeScript + Tailwind, served from Azure Static Web Apps with a CDN edge. The public gallery fetches published albums, pages each album with offset/limit, and appends results through an IntersectionObserver sentinel for infinite scroll. Every page is cached in memory with a 5-minute TTL and in-flight requests are de-duplicated so a hot path never fires twice.",
    notes: ["paged infinite scroll", "in-memory cache + TTL", "in-flight dedup", "lazy thumb → preview → full"],
  },
  {
    index: "02",
    title: "Smart search & discovery",
    tagline: "Search the collection like a search engine.",
    body: "The search box runs a debounced (350 ms) live query against AI-generated captions, descriptions, tags, and places, cached by normalized query. Results auto-open and are URL-synced so a search is shareable. A photo's lightbox pulls 'similar photos' — neighbours chosen by shared tags and metadata — and the homepage highlights strip surfaces the top-rated work.",
    notes: ["GET /api/photos/search", "GET /api/photos/{id}/similar", "GET /api/photos/highlights", "debounced + cached"],
  },
  {
    index: "03",
    title: "Highlights grid — no distortion",
    tagline: "Column count adapts to the screen, not the other way round.",
    body: "The highlights strip uses a justified layout instead of a fixed column count. It measures its container with a ResizeObserver, then packs a variable number of photos per row — one to six depending on screen size and aspect ratios — so each image's box stays within a few percent of its natural aspect ratio. Every photo record stores its real width and height, so the grid never has to guess.",
    notes: ["ResizeObserver", "aspect-ratio-aware packing", "1–6 columns adaptive", "object-cover only as fallback"],
  },
  {
    index: "04",
    title: "Backend — hexagonal .NET 10",
    tagline: "Business logic that does not know about infrastructure.",
    body: "A modular monolith in C#/.NET 10. Domain entities (Album, Photo, ImageMetadata) sit under vertical-slice use-cases (commands, queries, validators, mappings). The core depends only on ports — repository, image processor, blob storage, unit of work — so infrastructure is swappable. Adapters (EF Core on PostgreSQL, Supabase Storage, the minimal API) live at the edge. Integration tests run against real Postgres in Docker via Testcontainers, and architecture tests enforce the dependency direction.",
    notes: ["hexagonal · ports & adapters", "vertical slices", "Testcontainers integration tests", "architecture tests"],
  },
  {
    index: "05",
    title: "Authentication & security",
    tagline: "Two independent gates between a visitor and the admin area.",
    body: "Admins sign in with Supabase GitHub OAuth. The SPA holds the session and sends it as a Bearer token; every protected route validates the token against Supabase /auth/v1/user and only an allowlisted ADMIN_USER_ID from the GitHub provider passes. A 401/403 makes the client sign out and redirect home with an explainer banner. Secrets are injected through GitHub Actions and Azure app settings — never shipped in the bundle.",
    notes: ["GitHub OAuth", "Bearer validation", "ADMIN_USER_ID allowlist", "no client-side secrets"],
  },
  {
    index: "06",
    title: "Image processing pipeline",
    tagline: "One upload, three CDN-served WebP variants.",
    body: "Uploads are multipart, capped at 25 MB, and processed synchronously so the request contract stays simple. The pipeline validates the file, extracts EXIF (taken date, location, camera), re-encodes to WebP (~30–50% smaller than JPEG), and writes three derived sizes — thumb (300px), preview (800px), full (1920px) — into Supabase Storage under photos/{id}/. A single Postgres row references all variants.",
    notes: ["WebP encoding", "thumb / preview / full", "EXIF extraction", "CDN-served image bytes"],
    miniFlow: ["Validate", "Extract EXIF", "WebP ×3", "Supabase Storage", "Postgres row"],
  },
  {
    index: "07",
    title: "Bulk uploads",
    tagline: "A real batch tool with a live queue.",
    body: "Pick files, assign one album, and the client queues them and uploads sequentially — one request at a time to keep memory predictable on the app service. Every file gets a live status card (queued / uploading / uploaded / failed) with a preview, per-file retry, and batch clear. When the run finishes it deep-links into the photo manager with ?review=<ids>, landing exactly on what was just uploaded.",
    notes: ["sequential queue", "per-file live status", "retry failed", "deep-link review"],
  },
  {
    index: "08",
    title: "AI metadata — the background worker",
    tagline: "Gemini, on a free-tier budget, without blocking the API.",
    body: "Captions, descriptions, and tags are generated in the background. The queue is a durable Postgres table (PhotoMetadataJobs) with Pending / Processing / Completed / Failed states, attempt counts, and lastError — no in-memory state survives a restart or scale-to-zero. An hourly timer enqueues photos missing metadata, then runs a drain-all loop: mark Processing, attempt++, call Gemini throttled (~4 s) to respect the free tier, write the result, mark Completed; failures land with an attempt cap and a message. The admin dashboard polls every 10 s and can enqueue missing or reset failed jobs.",
    notes: ["durable Postgres queue", "hourly timer + time budget", "Gemini free-tier throttle", "attempt cap + lastError", "admin enqueue / reset"],
    miniFlow: ["Pending", "Processing", "Gemini", "Completed", "Failed"],
  },
];

const engineeringDecisions = [
  {
    title: "Durable queue, not in-memory",
    body: "The metadata queue lives in PostgreSQL, so a restart or scale-to-zero never loses a job — the next run just resumes.",
  },
  {
    title: "Justified layout, not fixed columns",
    body: "The highlights grid re-packs itself per screen size using real photo dimensions, eliminating the distorted crops.",
  },
  {
    title: "Throttled AI on a timer",
    body: "A 4-second gap between Gemini calls keeps the free tier happy while the hourly drain-all clears the whole backlog.",
  },
  {
    title: "≈$0 running cost by design",
    body: "Free tiers everywhere: Static Web Apps, the API, Supabase, Gemini. Budget alerts are the safety net, not the plan.",
  },
];

const deploymentStack = [
  { name: "Frontend", value: "Azure Static Web Apps", detail: "CDN · SPA fallback · security headers" },
  { name: "API", value: "Azure · .NET 10", detail: "Free tier · health-checked deploys" },
  { name: "Data", value: "Supabase", detail: "PostgreSQL · Storage · Auth" },
  { name: "AI", value: "Gemini", detail: "Free tier · throttled hourly worker" },
  { name: "CI/CD", value: "GitHub Actions", detail: "build → test → deploy → health check" },
];

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

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#09090B]">
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer"
        onScrollIndicatorClick={scrollToAbout}
      />
      <div id="about" className="pt-10 md:pt-12 flex flex-col items-center w-full px-4" ref={aboutRef}>
        <h1 className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center" style={{ fontFamily: "'Archivo', sans-serif" }}>
          About Me
        </h1>
        <h2 className="text-white/60 text-base font-light text-center pt-3 pb-8 px-5 max-w-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          I build systems that connect UI, auth, and APIs end to end.
        </h2>
        <div className="w-full max-w-4xl py-8 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-white text-lg font-light mb-4" style={{ fontFamily: "'Archivo', sans-serif" }}>
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
            <h2 className="text-white text-lg font-light mb-4" style={{ fontFamily: "'Archivo', sans-serif" }}>
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
        <div className="w-full max-w-5xl">
          <h1 className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center pt-10" style={{ fontFamily: "'Archivo', sans-serif" }}>
            Projects
          </h1>
          <h2 className="text-white/60 text-base font-light text-center pt-3 pb-8 px-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Photography Portfolio — a live full-stack product with AI, smart search, and a free-tier architecture.
          </h2>
        </div>

        <div className="w-full max-w-5xl pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-5">
              <div>
                <h2 className="text-white text-lg md:text-xl font-light" style={{ fontFamily: "'Archivo', sans-serif" }}>
                  System architecture
                </h2>
                <p className="text-white/55 text-sm md:text-base">
                  The whole stack, back to front: data, AI, API, auth, and the browser.
                </p>
              </div>
              <div className="text-white/40 text-xs uppercase tracking-[0.24em]">End-to-end flow</div>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch">
              <DiagramNode title="Browser" subtitle="Visitors & admin" detail="Desktop · mobile" />
              <FlowArrow />
              <DiagramNode title="React SPA" subtitle="Azure Static Web Apps · CDN" detail="Gallery, discovery, admin console" />
              <FlowArrow />
              <DiagramNode title="REST API" subtitle=".NET 10 · minimal API" detail="Hexagonal core, vertical slices" />
              <FlowArrow />
              <DiagramNode title="Supabase" subtitle="PostgreSQL · Storage · Auth" detail="Photos, jobs queue, OAuth" />
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
        </div>

        <div className="w-full max-w-5xl pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-5">
              <div>
                <h2 className="text-white text-lg md:text-xl font-light" style={{ fontFamily: "'Archivo', sans-serif" }}>
                  How the pieces fit
                </h2>
                <p className="text-white/55 text-sm md:text-base">
                  A real path from browser to backend, auth, and protected content.
                </p>
              </div>
              <div className="text-white/40 text-xs uppercase tracking-[0.24em]">End-to-end flow</div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {flowSteps.map((item, index) => (
                <div key={item.title} className="relative rounded-xl border border-white/10 bg-[#111114] p-4 min-h-[140px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black text-sm font-semibold">
                      0{index + 1}
                    </div>
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                  </div>
                  <h3 className="text-white text-base font-medium mb-2">{item.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-4">{item.description}</p>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl pb-4 space-y-4">
          {deepDives.map((item) => (
            <div key={item.index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                <div className="text-3xl font-light text-white/20 md:w-16 md:shrink-0 md:pt-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
                  {item.index}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white text-lg font-medium" style={{ fontFamily: "'Archivo', sans-serif" }}>
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
                  {item.miniFlow ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {item.miniFlow.map((step, index) => (
                        <div key={step} className="flex items-center gap-2">
                          <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">{step}</span>
                          {index < item.miniFlow!.length - 1 ? <span className="text-white/25 text-xs" aria-hidden="true">→</span> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-5xl pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
            <h2 className="text-white text-lg md:text-xl font-light mb-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
              Engineering decisions that matter
            </h2>
            <p className="text-white/55 text-sm md:text-base mb-5">
              The trade-offs behind the "wow" — picked because they hold up at portfolio scale.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {engineeringDecisions.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-[#111114] p-4">
                  <h3 className="text-white text-sm font-medium mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
            <h2 className="text-white text-lg md:text-xl font-light mb-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
              Deployment & cost
            </h2>
            <p className="text-white/55 text-sm md:text-base mb-5">
              Every layer runs on a free tier — the architecture is cost-shaped, not just cost-aware.
            </p>
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
              {deploymentStack.map((item, index) => (
                <div key={item.name} className="flex flex-col flex-1 min-w-0">
                  <div className="rounded-xl border border-white/10 bg-[#111114] p-4 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">{item.name}</p>
                    <p className="text-white text-sm font-medium mt-1">{item.value}</p>
                    <p className="text-white/50 text-xs mt-1 leading-snug">{item.detail}</p>
                  </div>
                  {index < deploymentStack.length - 1 ? (
                    <div className="flex items-center justify-center py-1 lg:rotate-0" aria-hidden="true">
                      <span className="text-white/25 text-sm lg:rotate-0">▾</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl gap-8 flex flex-col md:flex-row py-8 items-center">
          <div className="flex items-center justify-center w-full md:w-1/2">
            <ImageSwitcher images={images} />
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-white font-light text-lg md:text-xl mb-4" style={{ fontFamily: "'Archivo', sans-serif" }}>
              Photography Portfolio
            </h1>
            <p className="text-white/70 mb-4 leading-relaxed text-sm md:text-base">
              A full-stack product built in <span className="text-white font-medium">React TypeScript</span> with a <span className="text-white font-medium">.NET 10</span> backend: live galleries, smart search over AI metadata, ratings-driven highlights, bulk uploads, and a background Gemini pipeline.
            </p>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              The public site reads published albums and discovery endpoints from the API, while the admin area uses Supabase GitHub OAuth plus backend allowlist checks to protect uploads, edits, ratings, and deletions.
            </p>
          </div>
        </div>

        <h1 className="text-white/60 font-light text-center w-full max-w-xl px-4 pb-12 text-sm md:text-base">
          Built to show real product work — architecture, AI, and edge cases included.
        </h1>
      </div>
      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
