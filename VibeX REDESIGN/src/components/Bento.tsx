import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Download, Eye, FolderGit2, KeyRound, Pause, Rocket, Timer, Workflow,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { EASE, Kicker, Reveal } from "./ui";

/* ============================================================
   "What you get" — an interactive grid.
   Each tile is a live, hoverable demonstration rather than a
   static icon-and-paragraph card.
   ============================================================ */

function Tile({
  className,
  children,
  icon: Icon,
  title,
  copy,
  index,
  active,
  onEnter,
}: {
  className?: string;
  children?: ReactNode;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  copy: string;
  index: number;
  active: boolean;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // subtle 3d tilt toward the cursor
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 180, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
    el.style.setProperty("--sx", `${px * 100}%`);
    el.style.setProperty("--sy", `${py * 100}%`);
  };

  return (
    <Reveal delay={index * 0.06} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className={cn(
          "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-panel p-6 transition-colors duration-500",
          active ? "border-volt/35" : "hairline",
        )}
      >
        {/* cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(340px circle at var(--sx,50%) var(--sy,50%), rgb(217 255 63 / 0.07), transparent 70%)",
          }}
        />
        {/* animated edge on hover */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-volt/60 to-transparent transition-transform duration-700 group-hover:scale-x-100" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border bg-coal transition-all duration-500",
                active ? "border-volt/35 text-volt" : "hairline text-volt/80",
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <span className="font-mono text-[11px] tracking-[0.2em] text-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-5 font-display text-[21px] leading-snug font-medium tracking-tight">
            {title}
          </h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{copy}</p>
        </div>

        {children && <div className="relative mt-6">{children}</div>}
      </motion.div>
    </Reveal>
  );
}

/* ---------------- live demo: the dual-agent loop ---------------- */

const LOOP_STEPS = [
  { who: "coder", text: "writes HabitGrid.tsx", tone: "volt" },
  { who: "reviewer", text: "flags stale dep array", tone: "amber" },
  { who: "coder", text: "patches the dep list", tone: "volt" },
  { who: "reviewer", text: "verified · 0 issues", tone: "cyan" },
];

function LoopDemo({ active }: { active: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % LOOP_STEPS.length), active ? 1400 : 2600);
    return () => clearInterval(t);
  }, [active]);

  const step = LOOP_STEPS[i];
  return (
    <div className="rounded-xl border hairline bg-coal p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-md border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-300",
            step.who === "coder"
              ? "border-volt/40 bg-volt/[0.09] text-volt"
              : "hairline text-faint",
          )}
        >
          coder
        </span>
        <div className="relative h-px flex-1 overflow-hidden bg-bone/10">
          <motion.div
            key={i}
            initial={{ x: step.who === "coder" ? "-100%" : "100%" }}
            animate={{ x: step.who === "coder" ? "100%" : "-100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-volt to-transparent"
          />
        </div>
        <span
          className={cn(
            "rounded-md border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-300",
            step.who === "reviewer"
              ? "border-[#8ad4ff]/40 bg-[#8ad4ff]/[0.09] text-[#8ad4ff]"
              : "hairline text-faint",
          )}
        >
          reviewer
        </span>
      </div>

      <div className="mt-3 h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "text-center text-[12.5px]",
              step.tone === "amber" ? "text-[#e9b872]" : step.tone === "cyan" ? "text-[#8ad4ff]" : "text-bone/80",
            )}
          >
            {step.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- live demo: rolling window ---------------- */

function WindowDemo() {
  const [value, setValue] = useState(18);
  const [paused, setPaused] = useState(false);
  const [resumeIn, setResumeIn] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused) {
        setValue((v) => {
          if (v >= 100) {
            setPaused(true);
            setResumeIn(3);
            return 100;
          }
          return v + 5;
        });
      } else {
        setResumeIn((r) => {
          if (r <= 1) {
            setPaused(false);
            setValue(6);
            return 3;
          }
          return r - 1;
        });
      }
    }, 600);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.1em] uppercase">
        <span className="text-faint">5-hour window</span>
        <span className={paused ? "text-[#e9b872]" : "text-volt"}>
          {paused ? `paused · resumes 0:0${resumeIn}` : `${value}% used`}
        </span>
      </div>
      <div className="relative mt-2 h-8 overflow-hidden rounded-lg border hairline bg-coal">
        <motion.div
          className={cn("h-full", paused ? "bg-[#e9b872]/70" : "bg-volt/80")}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        {paused && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.14em] text-coal uppercase">
            saved — resuming
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-faint">
        hits the cap, saves, resumes itself — you lose nothing
      </p>
    </div>
  );
}

/* ---------------- live demo: preview + console ---------------- */

function PreviewDemo() {
  const [tab, setTab] = useState<"app" | "console">("app");

  useEffect(() => {
    const t = setInterval(() => setTab((v) => (v === "app" ? "console" : "app")), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border hairline bg-coal">
      <div className="flex items-center gap-2 border-b hairline px-3 py-2">
        {(["app", "console"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors",
              tab === t ? "bg-volt/[0.1] text-volt" : "text-faint hover:text-mute",
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-faint">localhost:5173</span>
      </div>

      <div className="relative h-[104px] overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "app" ? (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="p-3"
            >
              <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">habits</p>
              <div className="mt-2 space-y-1.5">
                {[7, 5, 4].map((n, i) => (
                  <div key={i} className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, d) => (
                      <motion.span
                        key={d}
                        initial={{ scaleY: 0.4, opacity: 0.4 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ delay: (i * 7 + d) * 0.02 }}
                        className={cn("h-4 flex-1 rounded", d < n ? "bg-volt/80" : "bg-bone/[0.07]")}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="console"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-1 p-3 font-mono text-[10.5px]"
            >
              <p className="text-[#8ad4ff]">$ vite build</p>
              <p className="text-mute">transforming 42 modules…</p>
              <p className="text-volt">✓ built in 812ms — 0 errors</p>
              <p className="text-faint">preview deployed to sandbox</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- live demo: deploy ---------------- */

function DeployDemo() {
  return (
    <div>
      <svg viewBox="0 0 400 70" className="w-full" aria-hidden>
        <path
          id="ship-arc"
          d="M10 60 C 130 6, 270 6, 390 48"
          fill="none"
          stroke="#d9ff3f"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeDasharray="2 8"
          strokeLinecap="round"
        />
        <g>
          <circle r="4" fill="#d9ff3f" />
          <circle r="10" fill="#d9ff3f" opacity="0.18" />
          <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#ship-arc" />
          </animateMotion>
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {["vercel", "netlify", "stackblitz"].map((p) => (
          <span
            key={p}
            className="flex items-center gap-1.5 rounded-full border hairline bg-coal px-3.5 py-1.5 font-mono text-[11px] text-bone/75 transition-colors duration-300 hover:border-volt/35 hover:text-volt"
          >
            <span className="h-1 w-1 rounded-full bg-volt" />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- live demo: export ---------------- */

const FILES = ["src/App.tsx", "src/components/HabitGrid.tsx", "src/lib/sync.ts"];

function ExportDemo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % FILES.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-1.5">
      {FILES.map((f, k) => (
        <div
          key={f}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-[11px] transition-colors duration-300",
            k === i ? "border-volt/30 bg-volt/[0.06] text-bone" : "hairline text-mute",
          )}
        >
          <span className="truncate">{f}</span>
          <FolderGit2 className={cn("h-3 w-3 shrink-0", k === i ? "text-volt" : "text-faint")} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- section ---------------- */

export default function Bento() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <Kicker index="02" label="what you get" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-xl font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] sm:text-[52px]">
              Everything between
              <br />
              idea and <em className="font-serif italic font-normal text-volt">shipped.</em>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-mute">
              Hover any panel — each one is running the real thing, not a
              screenshot. A Coder writes, a Reviewer verifies, and you get
              working code.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Tile
            className="sm:col-span-2 lg:col-span-4"
            icon={Eye}
            title="Watch it run, then edit it right there"
            copy="A live preview renders as files land. Flip to the console, tweak the code, and see the change instantly — without leaving the page."
            index={0}
            active={active === 0}
            onEnter={() => setActive(0)}
          >
            <PreviewDemo />
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={Workflow}
            title="The dual-AI loop"
            copy="Coder drafts. Reviewer rejects what doesn't hold up. It repeats until every file passes."
            index={1}
            active={active === 1}
            onEnter={() => setActive(1)}
          >
            <LoopDemo active={active === 1} />
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={Timer}
            title="Rolling usage windows"
            copy="Limits are time-based, never credit top-ups. Hit one and the run saves itself, then picks up where it stopped."
            index={2}
            active={active === 2}
            onEnter={() => setActive(2)}
          >
            <WindowDemo />
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={KeyRound}
            title="Keys stay sealed"
            copy="Bring Anthropic, OpenAI, Google or OpenRouter keys. Encrypted with AES-256, server-side only."
            index={3}
            active={active === 3}
            onEnter={() => setActive(3)}
          >
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 64 64" className="absolute inset-0 animate-spin-slow" aria-hidden>
                  <circle cx="32" cy="32" r="29" fill="none" stroke="#d9ff3f" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 7" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-volt" strokeWidth={1.7} />
                </div>
              </div>
              <div className="font-mono text-[11px] leading-[1.9] text-mute">
                <p>key ····3f</p>
                <p>at rest <span className="text-volt">aes-256</span></p>
                <p>browser never</p>
              </div>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={Download}
            title="Your code, portable"
            copy="A real file tree, a downloadable .zip, and one-click export to a fresh GitHub repo — on every plan."
            index={4}
            active={active === 4}
            onEnter={() => setActive(4)}
          >
            <ExportDemo />
          </Tile>

          <Tile
            className="sm:col-span-2 lg:col-span-4"
            icon={Rocket}
            title="Deploy before the coffee cools"
            copy="Push straight to Vercel or Netlify, or open the project in StackBlitz — finished build to public URL in one click."
            index={5}
            active={active === 5}
            onEnter={() => setActive(5)}
          >
            <DeployDemo />
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={Pause}
            title="Interrupt anytime"
            copy="Steer mid-build without losing the thread. Correct course and the loop folds it in."
            index={6}
            active={active === 6}
            onEnter={() => setActive(6)}
          >
            <div className="rounded-xl border hairline bg-coal p-3.5">
              <p className="text-[12.5px] text-bone/80">"make the streaks weekly"</p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-volt">
                <span className="h-1 w-1 rounded-full bg-volt animate-pulse-dot" />
                folded in at file 4 — no restart
              </p>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
