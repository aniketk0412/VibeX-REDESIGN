import { useInView } from "framer-motion";
import { ArrowUpRight, Check, Lock, MessagesSquare, ScanSearch, Send, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Kicker, Reveal } from "./ui";

/* ---------------- step mocks ---------------- */

function PromptMock() {
  return (
    <div className="rounded-xl border hairline bg-coal/70 p-4">
      <div className="flex items-center gap-3 rounded-lg border hairline bg-panel px-4 py-3.5">
        <p className="flex-1 font-mono text-[12px] text-bone/85">
          a habit tracker with streaks and a dark UI
          <span className="type-caret" />
        </p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-volt">
          <Send className="h-3.5 w-3.5 text-coal" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["plain english", "no boilerplate", "no setup"].map((t) => (
          <span key={t} className="rounded-full border hairline px-3 py-1 font-mono text-[9.5px] tracking-[0.08em] text-faint uppercase">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function InterviewMock() {
  return (
    <div className="rounded-xl border hairline bg-coal/70 p-4">
      <div className="space-y-2.5">
        {[
          ["who's it for?", "just me, offline first"],
          ["data storage?", "local, sync later"],
        ].map(([q, a], i) => (
          <div key={q} className={cn("flex flex-wrap items-center gap-2", i === 1 && "pl-4")}>
            <span className="rounded-md bg-bone/[0.05] px-2.5 py-1 font-mono text-[10px] text-mute">{q}</span>
            <ArrowUpRight className="h-3 w-3 text-faint" />
            <span className="rounded-md border border-volt/25 bg-volt/[0.07] px-2.5 py-1 font-mono text-[10px] text-volt">
              {a}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex items-center justify-between rounded-lg border hairline bg-panel px-3.5 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[10px] text-bone/80">
          <Lock className="h-3 w-3 text-volt" />
          spec locked · ~7 files · est. $0.42
        </span>
        <span className="rounded-full bg-volt px-2.5 py-1 font-mono text-[9px] font-medium tracking-[0.1em] text-coal uppercase">
          approve
        </span>
      </div>
    </div>
  );
}

function LoopMock() {
  return (
    <div className="relative rounded-xl border hairline bg-coal/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 rounded-lg border border-volt/25 bg-volt/[0.05] px-3 py-2.5 text-center">
          <p className="font-mono text-[9px] tracking-[0.18em] text-volt uppercase">coder</p>
          <p className="mt-0.5 font-mono text-[10px] text-mute">writes file 3/7</p>
        </div>
        <svg viewBox="0 0 64 24" className="w-14 shrink-0" aria-hidden>
          <path d="M2 8 H62" stroke="#d9ff3f" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 10" className="animate-dash-flow" />
          <path d="M62 16 H2" stroke="#8ad4ff" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 10" className="animate-dash-flow" style={{ animationDirection: "reverse" }} />
        </svg>
        <div className="flex-1 rounded-lg border border-[#8ad4ff]/25 bg-[#8ad4ff]/[0.05] px-3 py-2.5 text-center">
          <p className="font-mono text-[9px] tracking-[0.18em] text-[#8ad4ff] uppercase">reviewer</p>
          <p className="mt-0.5 font-mono text-[10px] text-mute">verifying…</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 font-mono text-[10px]">
        {[
          "HabitGrid.tsx — 1 flag, auto-fixed",
          "sync.ts — clean",
        ].map((t) => (
          <div key={t} className="flex items-center gap-2 text-mute">
            <Check className="h-3 w-3 text-volt" /> {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- data ---------------- */

const STEPS = [
  {
    icon: MessagesSquare,
    title: "Describe it once",
    copy: "Tell Vibex what you want in plain language. No prompt engineering, no boilerplate, no setup ritual — one sentence is enough to start.",
    mock: <PromptMock />,
  },
  {
    icon: ScanSearch,
    title: "It locks the goal",
    copy: "A short, sharp interview fills the gaps, then Vibex locks a concrete spec and a cost estimate. You approve the plan before a single line is written.",
    mock: <InterviewMock />,
  },
  {
    icon: Workflow,
    title: "Coder + Reviewer build it",
    copy: "A Coder AI writes each file while a Reviewer AI checks imports, types and behavior — sending fixes back until it runs. Watch live, interrupt anytime.",
    mock: <LoopMock />,
  },
];

/* ---------------- step card ---------------- */

function StepCard({
  step,
  index,
  onActive,
}: {
  step: (typeof STEPS)[number];
  index: number;
  onActive: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-42% 0px -42% 0px" });

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  const Icon = step.icon;
  return (
    <div ref={ref}>
      <Reveal>
        <div className="group rounded-2xl border hairline bg-panel p-6 transition-colors duration-500 hover:border-volt/25 sm:p-8">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] tracking-[0.22em] text-faint">
              0{index + 1}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border hairline bg-coal text-volt transition-transform duration-500 group-hover:-translate-y-1">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
            </span>
          </div>
          <h3 className="mt-6 font-display text-[26px] font-medium tracking-tight sm:text-[30px]">
            {step.title}
          </h3>
          <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-mute">{step.copy}</p>
          <div className="mt-7">{step.mock}</div>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------------- section ---------------- */

export default function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" className="relative py-24 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        {/* sticky intro */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <Kicker index="01" label="how it works" />
            <h2 className="mt-6 font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] sm:text-[52px]">
              Three steps.
              <br />
              <em className="font-serif italic font-normal text-volt">Zero</em> prompts.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mute">
              From a sentence to running code without writing — or babysitting — a
              single prompt. The loop does the talking; you do the approving.
            </p>
          </Reveal>

          {/* progress readout */}
          <Reveal delay={0.15} className="mt-10 hidden lg:block">
            <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              <span className="text-volt">step 0{active + 1}</span>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-[3px] w-10 rounded-full transition-colors duration-500",
                      i <= active ? "bg-volt" : "bg-bone/10",
                    )}
                  />
                ))}
              </div>
              <span>of 03</span>
            </div>

            <div className="relative mt-6 h-28 overflow-hidden font-display text-[96px] leading-none font-medium text-bone/[0.06] select-none">
              <span
                className="block transition-transform duration-700"
                style={{ transform: `translateY(-${active * 7}rem)`, transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
              >
                <span className="block h-28">01</span>
                <span className="block h-28">02</span>
                <span className="block h-28">03</span>
              </span>
            </div>
          </Reveal>
        </div>

        {/* cards */}
        <div className="space-y-6 lg:space-y-10">
          {STEPS.map((s, i) => (
            <StepCard key={s.title} step={s} index={i} onActive={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}
