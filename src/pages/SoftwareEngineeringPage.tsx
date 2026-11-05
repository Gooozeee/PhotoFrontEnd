import Footer from "../components/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";

type NavSection = { id: string; label: string };

const navSections: NavSection[] = [
  { id: "system", label: "Containers" },
  { id: "ai-worker", label: "Worker" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "backend-api", label: "API" },
  { id: "security", label: "Auth" },
  { id: "images", label: "Images" },
  { id: "uploads", label: "Uploads" },
  { id: "search", label: "Search" },
  { id: "highlights", label: "Best rated" },
  { id: "testing", label: "Tests" },
  { id: "decisions", label: "Trade-offs" },
];

type DeepDive = {
  index: string;
  id: string;
  title: string;
  tagline: string;
  notes: string[];
  body: string;
  tradeoff: string;
};

const deepDives: DeepDive[] = [
  {
    index: "01",
    id: "frontend",
    title: "Frontend",
    tagline: "React, paged reads, CDN images.",
    notes: ["fetch", "cache", "IntersectionObserver", "WebP variants"],
    body:
      "A React single page app renders the gallery, search and admin screens. Album grids request 24 photos at a time and load the next page as you scroll. Images come from the CDN at the size the layout needs.",
    tradeoff:
      "Paging keeps the first paint small, but a very large album still needs another round trip while you scroll.",
  },
  {
    index: "02",
    id: "backend",
    title: "Backend",
    tagline: "Hexagonal .NET 10.",
    notes: ["Domain", "Application", "Ports", "Adapters"],
    body:
      "The API is .NET 10 split into domain, application, ports and adapters. Controllers translate HTTP into use cases. The core does not know about HTTP, Postgres or Supabase.",
    tradeoff:
      "The extra layers add indirection and boilerplate, but the rules can be tested without a database or a web server.",
  },
  {
    index: "03",
    id: "backend-api",
    title: "API",
    tagline: "One contract, two hosts.",
    notes: ["public reads", "admin writes", "JSON only", "image URLs"],
    body:
      "Public reads and admin writes use the same REST contract. The API returns JSON and image URLs, not image bytes. Photos are served by Supabase Storage behind a CDN.",
    tradeoff:
      "One contract keeps both clients simple, but the API and the storage bucket have to agree on the URL shape.",
  },
  {
    index: "04",
    id: "security",
    title: "Auth",
    tagline: "Two gates before admin.",
    notes: ["Supabase OAuth", "bearer token", "allowlist", "401 / 403"],
    body:
      "Admin signs in with Supabase OAuth. The API validates the bearer token, then checks the email against an allowlist. A missing or invalid token gets 401. A valid token without access gets 403.",
    tradeoff:
      "Two checks cost a little work per request, but a stolen token is not enough on its own without an allowlisted account.",
  },
  {
    index: "05",
    id: "images",
    title: "Images",
    tagline: "Three WebP sizes.",
    notes: ["validate", "read EXIF", "write WebP", "thumb / preview / full"],
    body:
      "Each upload is validated and its EXIF is read before the file is written as WebP at thumb, preview and full sizes. Grids use preview, thumbnails use thumb, and the lightbox uses full.",
    tradeoff:
      "Three files take more storage and encode time, but every layout downloads only the pixels it shows.",
  },
  {
    index: "06",
    id: "uploads",
    title: "Uploads",
    tagline: "A sequential queue.",
    notes: ["pick files", "one at a time", "XHR progress", "retry"],
    body:
      "The admin picks files and the browser uploads them one at a time. XHR keeps progress accurate. A failed file can be retried without restarting the whole batch.",
    tradeoff:
      "One at a time is slower for large batches, but memory use and failure handling stay predictable.",
  },
  {
    index: "07",
    id: "ai-worker",
    title: "AI captions",
    tagline: "A durable Postgres queue.",
    notes: ["enqueue", "throttle", "attempt cap", "admin reset"],
    body:
      "A timer enqueues photos that are missing metadata. A worker claims one row, calls Gemini with a throttle, and writes the caption and tags back to the photo. Attempts are capped so a bad photo cannot loop forever.",
    tradeoff:
      "Processing later keeps uploads fast, but new photos can appear without captions until the next run.",
  },
  {
    index: "08",
    id: "search",
    title: "Search",
    tagline: "Debounced and cached.",
    notes: ["350 ms", "captions + tags", "five-minute cache", "similar"],
    body:
      "Typing waits 350 ms, then queries captions and tags through the API. A query parameter can pre-fill the search, and responses are cached for five minutes. The same photo metadata also powers the similar-photo endpoint.",
    tradeoff:
      "The debounce cuts requests and the cache cuts repeats, but results can lag slightly behind the last keystroke.",
  },
  {
    index: "09",
    id: "highlights",
    title: "Best rated",
    tagline: "Rating-led discovery.",
    notes: ["rating", "contact sheet", "more like this", "five-minute cache"],
    body:
      "The highlights endpoint returns the highest rated photos. The homepage picks a spread across series and shows them as a contact sheet. Each one opens in the lightbox with a more-like-this strip beside the caption.",
    tradeoff:
      "A rating-led edit is predictable and easy to explain, but it repeats the same strong frames and rarely surfaces a new favourite.",
  },
  {
    index: "10",
    id: "testing",
    title: "Tests",
    tagline: "Three backend suites.",
    notes: ["unit", "architecture", "Testcontainers", "deploy smoke"],
    body:
      "The backend has unit tests, architecture tests that enforce the dependency direction, and integration tests with Testcontainers. The frontend uses Vitest and Testing Library, and every deploy gets a smoke test.",
    tradeoff:
      "Integration tests are slower and need Docker, but they catch wiring problems that unit tests cannot see.",
  },
];

type Tradeoff = {
  decision: string;
  why: string;
  cost: string;
};

const engineeringDecisions: Tradeoff[] = [
  {
    decision: "Queue in Postgres",
    why: "The photos already live in Postgres. A table survives restarts and scale-to-zero, so there is no broker to run or pay for.",
    cost: "A scheduled worker polling a table is less immediate than a dedicated queue.",
  },
  {
    decision: "Synchronous uploads",
    why: "The browser sends one file at a time, so progress is real and a failure only affects that file.",
    cost: "Large batches take longer and the admin tab has to stay open.",
  },
  {
    decision: "Three WebP sizes",
    why: "Thumb, preview and full let each view download only the pixels it needs.",
    cost: "Every photo uses more storage and takes longer to encode.",
  },
  {
    decision: "Cache and dedup",
    why: "The client caches discovery responses for five minutes and shares one in-flight request for the same data.",
    cost: "An edit can take up to five minutes to appear, and a failed request waits for the retry window.",
  },
];

const knownLimits = [
  "Uploads stop at 25 MB per file, and the admin tab must stay open until the batch finishes.",
  "Search is a database contains query, not a dedicated search index.",
  "Caption generation runs on a timer, so a new photo can be uncaptioned for a while.",
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

function DiagramNode({
  title,
  subtitle,
  detail,
  note,
  accent = false,
}: {
  title: string;
  subtitle: string;
  detail: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className={`flex-1 min-w-[150px] border p-3 ${accent ? "border-[#D9482B]/45 bg-[#D9482B]/[0.06]" : "border-white/12 bg-[#121110]"}`}>
      <p className="text-sm text-[#E9E2D6]">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{subtitle}</p>
      {note ? <p className="mt-2 text-[11px] leading-snug text-white/40">{note}</p> : null}
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
  const aboutRef = useRef<HTMLDivElement>(null);
  const active = useScrollSpy(navSections.map((section) => section.id));
  const shouldReduceMotion = useReducedMotion();

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
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            How this site
            <br />
            works.
          </motion.h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4 text-sm text-white/55">
            <p>React, .NET 10, Postgres, Azure. A public gallery, a private admin, and a caption worker.</p>
            <button
              type="button"
              onClick={scrollToAbout}
              className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Read the diagrams ↓
            </button>
          </div>
        </div>
      </section>

      <section id="about" ref={aboutRef} className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">About</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#E9E2D6]">
              A photo archive with an admin side.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55">
              The public site shows albums, search and the best rated frames. The admin area uploads photos,
              edits metadata and controls what is published. Both talk to the same API.
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
            This site.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            React, .NET 10, Postgres, Supabase Storage, Azure Functions.
          </p>
        </div>

        <nav aria-label="Project sections" className="sticky top-[80px] z-30 -mx-5 border-y border-white/10 bg-[#0B0B0C] md:-mx-10">
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
                eyebrow="01 · Containers"
                title="The pieces that run"
                subtitle="This is a C4 container view. Each box is something that runs or is deployed, not a class in the code."
              />
              <div className="flex flex-col md:flex-row md:items-stretch">
                <DiagramNode
                  title="Browser"
                  subtitle="Visitor or admin"
                  detail="HTML, CSS, JS"
                  note="Holds no database credentials. Only the API is called."
                />
                <FlowArrow />
                <DiagramNode
                  title="React SPA"
                  subtitle="Azure Static Web Apps"
                  detail="CDN + client routing"
                  note="Renders the gallery, search and admin screens."
                />
                <FlowArrow />
                <DiagramNode
                  title="REST API"
                  subtitle=".NET 10"
                  detail="Public and admin routes"
                  note="Validates input and enforces access."
                />
                <FlowArrow />
                <DiagramNode
                  title="Supabase"
                  subtitle="Postgres + Storage + Auth"
                  detail="Managed services"
                  note="Photos, metadata, queue and sessions."
                />
              </div>
              <div className="mt-3 flex flex-col md:flex-row md:items-stretch">
                <div className="flex items-center justify-center md:pl-[58%]" aria-hidden="true">
                  <span className="text-white/30 text-sm">▾</span>
                </div>
                <div className="w-full md:w-auto md:flex-1">
                  <DiagramNode
                    title="Gemini"
                    subtitle="Background worker"
                    detail="Timer, not request"
                    note="Writes captions after the upload returns."
                    accent
                  />
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/50">
                Why this shape: the browser only needs JSON and image URLs, so the database stays private and
                the API is the only place that enforces access. The cost is one network hop for every read and
                a second service to deploy.
              </p>
            </div>
          </section>

          <section id="ai-worker" className="scroll-mt-[130px]">
            <div className="border border-[#D9482B]/30 bg-[#D9482B]/[0.04] p-5 md:p-6">
              <SectionHeading
                eyebrow="02 · Background worker"
                title="Captions leave the request path"
                subtitle="A timer moves the AI work out of upload, without losing it."
              />
              <div className="mb-5 flex flex-col md:flex-row md:items-stretch">
                <DiagramNode title="Upload" subtitle="Admin" detail="returns immediately" note="Photo and metadata are saved first." />
                <FlowArrow />
                <DiagramNode title="Queue" subtitle="Postgres" detail="pending / failed" note="A table, not a broker." />
                <FlowArrow />
                <DiagramNode title="Worker" subtitle="Hourly timer" detail="claims one row" note="Restart-safe and throttled." />
                <FlowArrow />
                <DiagramNode title="Gemini" subtitle="Caption model" detail="caption + tags" note="Runs outside the request." />
                <FlowArrow />
                <DiagramNode title="Photo" subtitle="Postgres" detail="updated in place" note="Visible on the next read." accent />
              </div>
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
                      <span className="text-white/25 text-xs" aria-hidden="true">→ attempts at cap</span>
                      <span className="border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-[11px] text-red-200">Failed + last error</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Failed</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ admin reset</span>
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mt-3">
                      Postgres is the source of truth. A crash leaves the row in Processing, and the next run
                      reclaims it.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Why, then the cost</h3>
                  <ul className="space-y-2 text-sm leading-6 text-white/60">
                    <li className="border-b border-white/10 pb-2">
                      Why: no extra broker to run, and the queue survives restarts and scale-to-zero.
                    </li>
                    <li className="border-b border-white/10 pb-2">
                      Why: a partial run resumes on the next tick, and an admin can reset a failed photo.
                    </li>
                    <li>
                      Cost: captions arrive later, and a scheduled poll is less immediate than a dedicated queue.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">03</p>
              <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
                The parts, one at a time.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                Each card says what the part does, how it works, and what the choice costs.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {deepDives.map((item) => (
              <motion.section
                key={item.id}
                id={item.id}
                className="scroll-mt-[130px] border border-white/10 bg-[#121110] p-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl text-[#D9482B]/60">{item.index}</span>
                  <h3 className="font-display text-2xl text-[#E9E2D6]">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm text-white/45">{item.tagline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.notes.map((note, noteIndex) => (
                    <Fragment key={note}>
                      {noteIndex > 0 ? <span className="text-white/20" aria-hidden="true">→</span> : null}
                      <span className="border border-white/10 bg-[#0F0E0D] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                        {note}
                      </span>
                    </Fragment>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-white/60">{item.body}</p>
                <p className="mt-3 border-l border-[#D9482B]/40 pl-3 text-sm leading-6 text-white/45">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#D9482B]/80">Trade-off </span>
                  {item.tradeoff}
                </p>
              </motion.section>
            ))}
          </div>

          <section id="decisions" className="scroll-mt-[130px]">
            <div className="border border-white/12 bg-[#121110] p-5 md:p-6">
              <SectionHeading
                eyebrow="04 · Trade-offs"
                title="Decision, reason, cost"
                subtitle="Each choice below shows why it exists and what it gives up."
              />
              <div className="grid gap-3 md:grid-cols-2">
                {engineeringDecisions.map((item) => (
                  <div key={item.decision} className="border border-white/10 bg-[#0F0E0D] p-4">
                    <h3 className="font-display text-lg text-[#E9E2D6] mb-3">{item.decision}</h3>
                    <dl className="space-y-2 text-sm leading-6">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-[#D9482B]/80">Why</dt>
                        <dd className="mt-1 text-white/60">{item.why}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-white/35">Cost</dt>
                        <dd className="mt-1 text-white/50">{item.cost}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/35">Known limits</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/50 md:grid-cols-3">
                  {knownLimits.map((limit) => (
                    <li key={limit} className="border-l border-white/15 pl-3">{limit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="pt-6 pb-10 text-center">
            <a
              href="https://github.com/Gooozeee/PersonalBackEnd"
              target="_blank"
              rel="noreferrer"
              className="font-display text-2xl text-white/50 border-b border-white/15 pb-1 transition-colors hover:border-white/50 hover:text-white"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
