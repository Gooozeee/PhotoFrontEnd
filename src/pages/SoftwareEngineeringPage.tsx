import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { useRef } from "react";

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];
  const systemFlow = [
    {
      title: "Public UI",
      description: "Reads published albums and photo pages from the backend.",
      detail: "Albums, photos, captions",
    },
    {
      title: "API Layer",
      description: "Handles fetches for gallery data and admin mutations.",
      detail: "/api/albums, /api/photos",
    },
    {
      title: "Auth + Guardrails",
      description: "Supabase GitHub OAuth plus backend allowlist checks.",
      detail: "Protected admin session",
    },
    {
      title: "Admin Actions",
      description: "Uploads, edits, and deletes flow back through live responses.",
      detail: "Syncs UI with server state",
    },
  ];
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#09090B]">
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer Shipping Backend-Connected Frontends"
        onScrollIndicatorClick={scrollToAbout}
      />
      <div
        id="about"
        className="pt-10 md:pt-12 flex flex-col items-center w-full px-4"
        ref={aboutRef}
      >
        <h1 
          className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          About Me
        </h1>
        <h2 
          className="text-white/60 text-base font-light text-center pt-3 pb-8 px-5 max-w-xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          I build systems that connect UI, auth, and APIs end to end.
        </h2>
        <div className="w-full max-w-4xl py-8 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2">
            <h2 
              className="text-white text-lg font-light mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
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
            <h2 
              className="text-white text-lg font-light mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
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
                <div
                  key={skill}
                  className="text-sm font-normal bg-[#27272A] text-white/80 px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#3F3F46] hover:text-white"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div id="projects" className="w-full flex flex-col items-center border-t border-white/[0.08] px-4">
        <div className="w-full max-w-4xl">
          <h1 
            className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center pt-10"
            style={{ fontFamily: "'Archivo', sans-serif" }}
          >
            Projects
          </h1>
        <h2 
          className="text-white/60 text-base font-light text-center pt-3 pb-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          One example of a frontend that is fully wired to a live backend.
        </h2>
      </div>
      <div className="w-full max-w-5xl px-4 pb-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-5">
            <div>
              <h2 className="text-white text-lg md:text-xl font-light" style={{ fontFamily: "'Archivo', sans-serif" }}>
                How it works
              </h2>
              <p className="text-white/55 text-sm md:text-base">
                A real path from browser to backend, auth, and protected content.
              </p>
            </div>
            <div className="text-white/40 text-xs uppercase tracking-[0.24em]">
              End-to-end flow
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {systemFlow.map((item, index) => (
              <div key={item.title} className="relative rounded-xl border border-white/10 bg-[#111114] p-4 min-h-[140px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black text-sm font-semibold">
                    0{index + 1}
                  </div>
                  {index < systemFlow.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                  )}
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
      <div className="w-full max-w-4xl gap-8 flex flex-col md:flex-row py-8 items-center">
        <div className="flex items-center justify-center w-full md:w-1/2">
          <ImageSwitcher images={images} />
          </div>
          <div className="w-full md:w-1/2">
            <h1 
              className="text-white font-light text-lg md:text-xl mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
              Photography Portfolio
            </h1>
            <p className="text-white/70 mb-4 leading-relaxed text-sm md:text-base">
              Custom website built in <span className="text-white font-medium">React TypeScript</span> and Vite, connected to a backend for live gallery data, authenticated admin access, and real asset management.
            </p>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              The public gallery reads published albums and album photos from the API, while the admin area uses Supabase GitHub OAuth and backend allowlist checks to protect uploads, edits, and deletions.
            </p>
          </div>
        </div>
        <h1 className="text-white/60 font-light text-center w-full max-w-xl px-4 pb-12 text-sm md:text-base">
          Built to show real product work, not just UI.
        </h1>
      </div>
      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
