import Footer from "../components/Footer";
import { motion, useReducedMotion } from "framer-motion";

const flowSteps = [
  {
    title: "Upload",
    body: "Admin sends one file at a time. The API validates it and reads EXIF.",
  },
  {
    title: "Store",
    body: "Thumb, preview and full WebP go to Supabase Storage. The photo row goes to Postgres.",
  },
  {
    title: "Caption",
    body: "A timer queues photos missing metadata. A worker calls Gemini and writes the caption and tags.",
  },
  {
    title: "Read",
    body: "Albums page in 24 photos. Search reads captions and tags. Images come from the CDN.",
  },
];

const decisions = [
  {
    decision: "Postgres queue",
    why: "No broker, and it survives restarts.",
    cost: "Captions arrive on the next run.",
  },
  {
    decision: "Sequential uploads",
    why: "Real progress, and one failure at a time.",
    cost: "Large batches take longer.",
  },
  {
    decision: "Three WebP sizes",
    why: "Each view downloads only what it shows.",
    cost: "More storage and encode time.",
  },
  {
    decision: "One API",
    why: "One contract for public and admin.",
    cost: "The API and storage bucket must agree on URL shape.",
  },
];

function DiagramNode({
  title,
  subtitle,
  detail,
  accent = false,
}: {
  title: string;
  subtitle: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className={`min-w-0 border p-3 ${accent ? "border-[#D9482B]/45 bg-[#D9482B]/[0.06]" : "border-white/12 bg-[#121110]"}`}>
      <p className="text-sm text-[#E9E2D6]">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{subtitle}</p>
      <p className={`mt-3 text-[10px] uppercase tracking-[0.18em] ${accent ? "text-[#D9482B]" : "text-white/35"}`}>
        {detail}
      </p>
    </div>
  );
}

const SoftwareEngineeringPage = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToSystem = () => {
    document.getElementById("system")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0B0B0C] text-[#E9E2D6]">
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
            <p>React, .NET 10, Postgres, Azure. A public gallery with a private admin.</p>
            <button
              type="button"
              onClick={scrollToSystem}
              className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              See the system ↓
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Overview</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#E9E2D6]">
              A photo archive with an admin side.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55">
              The public site shows albums, search and a short edit. The admin area uploads photos,
              edits metadata and controls what is published. The API is the only write path.
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

      <section id="system" className="border-t border-white/10 px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">System</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
            The pieces.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            The browser talks to the SPA, the SPA talks to the API, and the API owns the data.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <DiagramNode title="Browser" subtitle="Visitor or admin" detail="HTML, CSS, JS" />
            <DiagramNode title="React SPA" subtitle="Azure Static Web Apps" detail="CDN" />
            <DiagramNode title=".NET API" subtitle="Public + admin" detail="Only write path" />
            <DiagramNode title="Supabase" subtitle="Postgres + Storage" detail="Data + files" />
            <DiagramNode title="Gemini" subtitle="Background worker" detail="Captions" accent />
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
            The browser never holds database credentials. The API is the only way in.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Flow</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
            How a photo gets there.
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="border border-white/10 bg-[#121110] p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl text-[#D9482B]/60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-xl text-[#E9E2D6]">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Decisions</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
            Why these choices.
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {decisions.map((item) => (
              <div key={item.decision} className="border border-white/10 bg-[#121110] p-5">
                <h3 className="font-display text-xl text-[#E9E2D6]">{item.decision}</h3>
                <dl className="mt-2 space-y-1 text-sm leading-6">
                  <div>
                    <dt className="inline text-[10px] uppercase tracking-[0.18em] text-[#D9482B]/80">Why </dt>
                    <dd className="inline text-white/60">{item.why}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[10px] uppercase tracking-[0.18em] text-white/35">Cost </dt>
                    <dd className="inline text-white/50">{item.cost}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
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
      </section>

      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
