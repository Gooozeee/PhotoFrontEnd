import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import blueEscort from "../../assets/Rally/Blue Escort Kirkistown 2023.webp";
import fordFiesta from "../../assets/Rally/Ford Fiesta Kirkistown 2023.webp";
import toyotaStarlet from "../../assets/Rally/Toyota Starlet Kirkistown 2023.webp";
import yellowEscort from "../../assets/Rally/Yellow Escort Pan Kirkistown 2023.webp";
import yellowSlide from "../../assets/Rally/Yellow Slide Kirkistown 2023.webp";
import agadir from "../../assets/Cities/Agadir Medina 2024.webp";
import medina from "../../assets/Cities/Medina de Agadir 2024.webp";
import rathlin from "../../assets/Landscapes/Rathlin Island 2023.webp";
import rathlinSunset from "../../assets/Landscapes/Rathlin Island Sunset 2023.webp";
import dunluce from "../../assets/Landscapes/Dunluce Castle 2023.webp";
import northCoast from "../../assets/Landscapes/North Coast 2023.webp";
import paiCanyon from "../../assets/Landscapes/Pai Canyon Rain 2023.webp";
import paiCows from "../../assets/Landscapes/Thailand Pai Cows 2023.webp";
import kohTao from "../../assets/Landscapes/Koh Tao 2023.webp";
import phiPhi from "../../assets/Landscapes/Phi Phi Islands 2023.webp";
import essaouira from "../../assets/Landscapes/Essaouira 2023.webp";
import essaouiraSands from "../../assets/Landscapes/Essaouira Sands 2023.webp";
import robin from "../../assets/Birds/Robin Northern Ireland 2022.webp";
import seagull from "../../assets/Birds/Seagull Rathlin Island 2023.webp";
import birdsInWater from "../../assets/Birds/Birds in Water 2021.webp";
import gleno from "../../assets/Birds/Gleno Northern Ireland 2022.webp";

const HOUSE_EASE = [0.22, 1, 0.36, 1] as const;

type Series = {
  id: string;
  title: string;
  place: string;
  year: string;
  count: number;
  cover: string;
  caption: string;
  images: string[];
};

const SERIES: Series[] = [
  {
    id: "kirkistown",
    title: "Kirkistown",
    place: "Northern Ireland",
    year: "2023",
    count: 5,
    cover: blueEscort,
    caption: "Gravel, diesel and a 1/1000s shutter.",
    images: [blueEscort, yellowEscort, fordFiesta, toyotaStarlet, yellowSlide],
  },
  {
    id: "rathlin",
    title: "Rathlin",
    place: "Northern Ireland",
    year: "2023",
    count: 4,
    cover: rathlinSunset,
    caption: "The last light before the ferry.",
    images: [rathlinSunset, rathlin, dunluce, northCoast],
  },
  {
    id: "pai",
    title: "Pai, after rain",
    place: "Thailand",
    year: "2023",
    count: 5,
    cover: paiCanyon,
    caption: "Wet stone and a valley that won't sit still.",
    images: [paiCanyon, paiCows, kohTao, phiPhi, paiCanyon],
  },
  {
    id: "medina",
    title: "Medina",
    place: "Morocco",
    year: "2024",
    count: 4,
    cover: medina,
    caption: "Walls, shade and the sound of the souk.",
    images: [medina, agadir, essaouira, essaouiraSands],
  },
  {
    id: "birds",
    title: "Birds",
    place: "Northern Ireland",
    year: "2021—2023",
    count: 4,
    cover: robin,
    caption: "Small things, very close.",
    images: [robin, seagull, birdsInWater, gleno],
  },
];

const PRINT_POSITIONS = [
  { left: "2%", top: "2%", width: "30%", rotate: -3.2 },
  { left: "35%", top: "0%", width: "24%", rotate: 2.4 },
  { left: "63%", top: "7%", width: "28%", rotate: -1.6 },
  { left: "8%", top: "52%", width: "26%", rotate: 1.8 },
  { left: "42%", top: "50%", width: "34%", rotate: -2.1 },
];

const MOBILE_PRINT_ROTATIONS = [-2.4, 1.8, -1.2, 2.2, -1.8];

function useHeroPointer(enabled: boolean) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 70, damping: 18, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 70, damping: 18, mass: 0.5 });

  const imageX = useTransform(smoothX, [-1, 1], enabled ? [-12, 12] : [0, 0]);
  const imageY = useTransform(smoothY, [-1, 1], enabled ? [-9, 9] : [0, 0]);
  const textX = useTransform(smoothX, [-1, 1], enabled ? [5, -5] : [0, 0]);
  const textY = useTransform(smoothY, [-1, 1], enabled ? [3, -3] : [0, 0]);

  function update(event: React.PointerEvent<HTMLElement>) {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    y.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return { imageX, imageY, textX, textY, update, reset };
}

function CoverSheet({ reduceMotion, onDone }: { reduceMotion: boolean; onDone: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 overflow-hidden bg-[#0B0B0C]"
      initial={{ y: 0 }}
      animate={{ y: "-101%" }}
      transition={{ duration: reduceMotion ? 0 : 1.15, delay: reduceMotion ? 0 : 0.55, ease: HOUSE_EASE }}
      onAnimationComplete={onDone}
    >
      <div className="relative h-full w-full px-5 py-5 md:px-10 md:py-8">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>Contact sheet</span>
          <span>36 exposures</span>
        </div>
        <div className="mt-5 grid h-[calc(100%-2.75rem)] grid-cols-6 grid-rows-6 gap-1.5 opacity-40">
          {Array.from({ length: 36 }).map((_, index) => (
            <div key={index} className="relative border border-white/10 bg-white/[0.015]">
              <span className="absolute left-1 top-1 text-[8px] text-white/20">{String(index + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/15" />
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/35 md:inset-x-10 md:bottom-8">
          <span>De Goose</span>
          <span>Loading light</span>
        </div>
      </div>
    </motion.div>
  );
}

function Print({
  series,
  index,
  onOpen,
}: {
  series: Series;
  index: number;
  onOpen: () => void;
}) {
  const position = PRINT_POSITIONS[index % PRINT_POSITIONS.length];
  const isFeature = index === 0;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${series.title} series`}
      className={`group absolute cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-8 focus-visible:ring-offset-[#E9E2D6] ${
        isFeature ? "z-20" : "z-10 hover:z-30"
      }`}
      style={{ left: position.left, top: position.top, width: position.width }}
      initial={{ rotate: position.rotate, y: 0 }}
      whileHover={{ y: -16, rotate: 0, scale: 1.025 }}
      whileFocus={{ y: -16, rotate: 0, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <motion.div
        className="overflow-hidden bg-white p-2 shadow-[0_18px_50px_rgba(18,14,8,0.18)]"
        whileHover={{ boxShadow: "0 42px 90px rgba(18,14,8,0.3)" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >
        <img
          src={series.cover}
          alt={`${series.title} — ${series.place}`}
          className={`w-full object-cover ${isFeature ? "aspect-[4/3]" : "aspect-[3/2]"}`}
        />
      </motion.div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-[clamp(1.1rem,1.6vw,1.7rem)] leading-none tracking-[-0.02em]">{series.title}</span>
        <span className="text-[11px] tabular-nums text-black/40">{series.count} frames</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-black/45">
        <span>{series.place} · {series.year}</span>
        <span className="translate-x-[-4px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">Open →</span>
      </div>
    </motion.button>
  );
}

function MobilePrint({ series, index, onOpen }: { series: Series; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${series.title} series`}
      className="group w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-8 focus-visible:ring-offset-[#E9E2D6]"
      initial={{ rotate: MOBILE_PRINT_ROTATIONS[index % MOBILE_PRINT_ROTATIONS.length] }}
      whileTap={{ scale: 0.985, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <div className="overflow-hidden bg-white p-2 shadow-[0_18px_50px_rgba(18,14,8,0.18)]">
        <img src={series.cover} alt={`${series.title} — ${series.place}`} className="aspect-[4/3] w-full object-cover" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl leading-none tracking-[-0.02em]">{series.title}</span>
        <span className="text-[11px] tabular-nums text-black/40">{series.count} frames</span>
      </div>
      <p className="mt-1 text-[11px] text-black/45">{series.place} · {series.year}</p>
    </motion.button>
  );
}

function SeriesViewer({ series, onClose }: { series: Series; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const images = series.images;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + images.length) % images.length);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${series.title} series`}
      className="fixed inset-0 z-[100] bg-[#0B0B0C] text-white"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.75, ease: HOUSE_EASE }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index]}
            src={images[index]}
            alt={`${series.title} — frame ${index + 1}`}
            className="absolute inset-0 h-full w-full object-contain p-3 md:p-8"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.4, ease: HOUSE_EASE }}
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent p-5 md:p-8">
          <div>
            <p className="font-display text-2xl leading-none tracking-[-0.02em]">{series.title}</p>
            <p className="mt-2 text-xs text-white/45">{series.place} · {series.year}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md text-sm leading-6 text-white/60">{series.caption}</p>
            <p className="text-sm tabular-nums text-white/60">{index + 1} / {images.length}</p>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {images.map((source, imageIndex) => (
              <button
                key={`${source}-${imageIndex}`}
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Go to frame ${imageIndex + 1}`}
                className={`h-14 w-20 shrink-0 cursor-pointer overflow-hidden border transition ${
                  imageIndex === index ? "border-white opacity-100" : "border-white/15 opacity-45 hover:opacity-100"
                }`}
              >
                <img src={source} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LightTablePoc() {
  const reduceMotion = Boolean(useReducedMotion());
  const [introDone, setIntroDone] = useState(false);
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { imageX, imageY, textX, textY, update, reset } = useHeroPointer(!reduceMotion);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroRotateX = useTransform(scrollYProgress, [0.5, 1], [0, -6]);
  const heroLift = useTransform(scrollYProgress, [0.5, 1], [0, -36]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const titleOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0]);

  const tableX = useMotionValue(0);
  const tableY = useMotionValue(0);
  const tableRotateX = useSpring(useTransform(tableY, [-1, 1], [1.4, -1.4]), { stiffness: 100, damping: 20 });
  const tableRotateY = useSpring(useTransform(tableX, [-1, 1], [-1.4, 1.4]), { stiffness: 100, damping: 20 });

  const seriesCount = useMemo(() => SERIES.length, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "The Light Table — POC";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (introDone) return;
    const timer = window.setTimeout(() => setIntroDone(true), reduceMotion ? 0 : 1900);
    return () => window.clearTimeout(timer);
  }, [introDone, reduceMotion]);

  function updateTable(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tableX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    tableY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function resetTable() {
    tableX.set(0);
    tableY.set(0);
  }

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-[#E9E2D6]">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0B0B0C]/55 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">POC</span>
          <span className="h-3 w-px bg-white/15" />
          <span className="text-sm text-white/80">The Light Table</span>
        </div>
        <Link to="/" className="text-sm text-white/55 transition-colors hover:text-white">
          Back to site
        </Link>
      </header>

      <section ref={heroRef} className="relative h-[145vh] bg-[#0B0B0C]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            data-testid="hero-surface"
            style={{ scale: heroScale, y: heroY, rotateX: heroRotateX, transformPerspective: 1400 }}
            onPointerMove={update}
            onPointerLeave={reset}
          >
            <motion.img
              src={paiCanyon}
              alt="Pai Canyon after rain, Thailand"
              className="h-full w-full object-cover"
              style={{ x: imageX, y: imageY, scale: 1.045 }}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1.045 }}
              transition={{ duration: reduceMotion ? 0 : 1.6, delay: reduceMotion ? 0 : 0.35, ease: HOUSE_EASE }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
          </motion.div>

          {!introDone ? <CoverSheet reduceMotion={reduceMotion} onDone={() => setIntroDone(true)} /> : null}

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-10 md:px-10 md:pb-14"
            style={{ y: titleY, opacity: titleOpacity, x: textX }}
          >
            <motion.div style={{ y: textY }}>
              <p className="mb-4 text-sm text-white/60">Photographer, Software Engineer</p>
              <h1 className="font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.82] tracking-[-0.055em] text-white">
                Michal
                <br />
                Guzy
              </h1>
              <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4 text-sm text-white/55">
                <p>Landscapes, cities, birds, rally.</p>
                <p className="tabular-nums">Pai Canyon · Thailand · 2023</p>
              </div>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/35 md:flex md:right-10">
            <span style={{ writingMode: "vertical-rl" }}>Scroll</span>
            <motion.span
              className="block h-10 w-px bg-white/30"
              animate={reduceMotion ? undefined : { scaleY: [0.4, 1, 0.4], originY: 0 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#E9E2D6] px-5 pb-24 pt-24 text-[#0B0B0C] md:px-10 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.9),transparent_62%)]" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex items-end justify-between gap-6 border-b border-black/10 pb-6">
            <h2 className="font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-none tracking-[-0.045em]">Selected work</h2>
            <p className="pb-2 text-sm tabular-nums text-black/45">2021—2026 · {seriesCount} series</p>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-xl text-sm leading-6 text-black/60">
              Five series, five speeds. Hover a print to pick it up. Click to open the sequence.
            </p>
            <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">The light table</p>
          </div>

          <div
            className="relative mt-14 hidden h-[72vh] min-h-[640px] md:block"
            data-testid="light-table"
            onPointerMove={updateTable}
            onPointerLeave={resetTable}
          >
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: tableRotateX, rotateY: tableRotateY, transformStyle: "preserve-3d", transformPerspective: 1400 }}
            >
              {SERIES.map((series, index) => (
                <Print key={series.id} series={series} index={index} onOpen={() => setActiveSeries(series)} />
              ))}
            </motion.div>
            <p className="absolute bottom-0 left-0 text-[11px] text-black/35">Move across the table</p>
          </div>

          <div className="mt-10 grid gap-8 md:hidden">
            {SERIES.map((series, index) => (
              <MobilePrint key={series.id} series={series} index={index} onOpen={() => setActiveSeries(series)} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0C] px-5 py-24 text-[#E9E2D6] md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <h2 className="font-display text-[clamp(2.8rem,6.5vw,6.4rem)] leading-[0.92] tracking-[-0.05em]">
            Sometimes 1/4s.
            <br />
            Sometimes 1/1000s.
          </h2>
          <div className="max-w-md space-y-5 self-end text-sm leading-6 text-white/55">
            <p>Landscapes, cities, birds and rally cars. Mostly Northern Ireland, Thailand and Morocco.</p>
            <p>
              I photograph the moment before the weather changes, the half-second of a car mid-slide, and the bird that
              won't sit still long enough to be framed.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-white/80 transition-colors hover:border-white hover:text-white">
              Back to the real site <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-[72vh] overflow-hidden bg-[#0B0B0C]">
        <img src={rathlinSunset} alt="Rathlin Island at sunset" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/30 to-transparent" />
        <div className="relative flex min-h-[72vh] flex-col justify-end p-5 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">End of roll · 36 / 36</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2 className="font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em] text-white">
              Let's make something worth printing.
            </h2>
            <div className="flex flex-wrap gap-5 pb-2 text-sm text-white/60">
              <a href="mailto:michalguzym@gmail.com" className="transition-colors hover:text-white">Email</a>
              <a href="https://github.com/Gooozeee" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">GitHub</a>
              <a href="https://www.linkedin.com/in/michal-guzy/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.25em] text-white/30">
            <span>Michal Guzy</span>
            <span>Light table POC</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeSeries ? <SeriesViewer series={activeSeries} onClose={() => setActiveSeries(null)} /> : null}
      </AnimatePresence>
    </main>
  );
}
