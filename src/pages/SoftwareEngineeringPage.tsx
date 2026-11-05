import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";

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
  notes: string[];
};

const deepDives: DeepDive[] = [
  {
    index: "01",
    id: "frontend",
    title: "Frontend",
    tagline: "React, paged reads, CDN images.",
    notes: ["fetch", "cache", "IntersectionObserver", "WebP variants"],
  },
  {
    index: "02",
    id: "backend",
    title: "Backend",
    tagline: "Hexagonal .NET 10.",
    notes: ["Domain", "Application", "Ports", "Adapters"],
  },
  {
    index: "03",
    id: "backend-api",
    title: "API",
    tagline: "One contract, two hosts.",
    notes: ["public reads", "admin writes", "JSON only", "CDN images"],
  },
  {
    index: "04",
    id: "security",
    title: "Auth",
    tagline: "Two gates before admin.",
    notes: ["Supabase OAuth", "Bearer token", "allowlist", "401 / 403"],
  },
  {
    index: "05",
    id: "images",
    title: "Images",
    tagline: "Three WebP sizes.",
    notes: ["validate", "EXIF", "WebP", "thumb / preview / full"],
  },
  {
    index: "06",
    id: "uploads",
    title: "Uploads",
    tagline: "A sequential queue.",
    notes: ["pick files", "one at a time", "XHR progress", "retry"],
  },
  {
    index: "07",
    id: "ai-worker",
    title: "AI captions",
    tagline: "A durable Postgres queue.",
    notes: ["enqueue", "throttle", "attempt cap", "admin reset"],
  },
  {
    index: "08",
    id: "search",
    title: "Search",
    tagline: "Debounced and URL-synced.",
    notes: ["350 ms", "captions + tags", "cache", "similar"],
  },
  {
    index: "09",
    id: "highlights",
    title: "Highlights",
    tagline: "Aspect-aware rows.",
    notes: ["ResizeObserver", "real W×H", "1-6 columns", "caption slot"],
  },
  {
    index: "10",
    id: "testing",
    title: "Tests",
    tagline: "Three backend suites.",
    notes: ["unit", "architecture", "Testcontainers", "deploy smoke"],
  },
];

const engineeringDecisions = [
  {
    title: "Queue in Postgres",
    body: "Survives restarts and scale-to-zero.",
  },
  {
    title: "Synchronous uploads",
    body: "25 MB cap, one at a time.",
  },
  {
    title: "Three WebP sizes",
    body: "Thumb, preview, full.",
  },
  {
    title: "Cache and dedup",
    body: "Five-minute TTL, one in-flight request.",
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
            <p>React, .NET, Postgres, Azure.</p>
            <button
              type="button"
              onClick={scrollToAbout}
              className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              See the diagrams ↓
            </button>
          </div>
        </div>
      </section>

      <section id="about" ref={aboutRef} className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">About</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#E9E2D6]">
              I built the whole thing.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55">
              Backend engineer at Simcorp. C# and .NET by day. This site is React, .NET, Postgres and Azure.
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

          <div className="border border-white/12 bg-[#121110] p-5 md:p-6 mt-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <ImageSwitcher images={images} />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="font-display text-2xl tracking-[-0.02em] text-[#E9E2D6]">What runs</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Public reads from the API. Admin uses Supabase OAuth plus an allowlist. Images on Supabase Storage.
                  Captions in the background.
                </p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <Chip accent="emerald">Gemini worker</Chip>
                  <Chip accent="sky">Search</Chip>
                  <Chip accent="amber">Uploads</Chip>
                  <Chip>Hexagonal core</Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Project sections" className="sticky top-[70px] z-30 -mx-5 border-y border-white/10 bg-[#0B0B0C] md:-mx-10">
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
                eyebrow="01 · System"
                title="The stack"
                subtitle="Four services and one worker."
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
                title="AI captions"
                subtitle="Timer, queue, Gemini."
              />
              <div className="mb-5 flex flex-col md:flex-row md:items-stretch">
                <DiagramNode title="Timer" subtitle="Hourly" detail="enqueue missing" />
                <FlowArrow />
                <DiagramNode title="Queue" subtitle="Postgres" detail="pending / failed" />
                <FlowArrow />
                <DiagramNode title="Gemini" subtitle="Throttled" detail="captions + tags" />
                <FlowArrow />
                <DiagramNode title="Photo" subtitle="Postgres" detail="caption / tags / rating" accent />
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
                      <span className="text-white/25 text-xs" aria-hidden="true">→ (attempts ≥ cap)</span>
                      <span className="border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-[11px] text-red-200">Failed + lastError</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Failed</span>
                      <span className="text-white/25 text-xs" aria-hidden="true">→ reset (admin)</span>
                      <span className="border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/70">Pending</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mt-3">
                      Postgres is the source of truth. A crash leaves the job in Processing; the next run reclaims it.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Guarantees</h3>
                  <ul className="space-y-2 text-sm leading-6 text-white/60">
                    <li className="border-b border-white/10 pb-2">Restart-safe. The queue is a table.</li>
                    <li className="border-b border-white/10 pb-2">A partial run resumes next tick.</li>
                    <li>Admin can enqueue or reset from the dashboard.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">03</p>
              <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
                The parts.
              </h2>
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
              </motion.section>
            ))}
          </div>

          <section id="decisions" className="scroll-mt-[130px]">
            <div className="border border-white/12 bg-[#121110] p-5 md:p-6">
              <SectionHeading
                eyebrow="04 · Trade-offs"
                title="Four choices."
                subtitle="Short version."
              />
              <div className="grid gap-3 md:grid-cols-2">
                {engineeringDecisions.map((item) => (
                  <div key={item.title} className="border border-white/10 bg-[#0F0E0D] p-4">
                    <h3 className="font-display text-lg text-[#E9E2D6] mb-1">{item.title}</h3>
                    <p className="text-sm leading-6 text-white/55">{item.body}</p>
                  </div>
                ))}
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
