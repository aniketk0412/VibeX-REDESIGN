import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { fmtClock, RUN_SCRIPTS } from "../../lib/mock";
import { cn } from "../../utils/cn";

const HOLD_AFTER_PASS = 8; // seconds to linger on "passed"

const KIND_COLOR: Record<string, string> = {
  cmd: "text-bone/90",
  dim: "text-faint",
  ok: "text-volt/90",
  flag: "text-[#e9b872]",
  note: "text-[#8ad4ff]/90",
};

function stageOf(elapsed: number, end: number): number {
  if (elapsed >= end) return 4;
  if (elapsed >= end - 4.4) return 3;
  if (elapsed >= 13.5) return 2;
  return 1;
}

export default function LiveRun() {
  const [elapsed, setElapsed] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);

  const script = RUN_SCRIPTS[cycle % RUN_SCRIPTS.length];
  const next = RUN_SCRIPTS[(cycle + 1) % RUN_SCRIPTS.length];
  const passed = elapsed >= script.end;

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused) setElapsed((e) => e + 0.25);
    }, 250);
    return () => clearInterval(t);
  }, [paused]);

  /* rollover → swap to the next scripted run */
  useEffect(() => {
    if (elapsed >= script.end + HOLD_AFTER_PASS) {
      setCycle((c) => c + 1);
      setElapsed(0);
    }
  }, [elapsed, script.end]);

  const progress = Math.min(100, (elapsed / script.end) * 100);
  const tokens = Math.round(26_000 + elapsed * 245);
  const cost = (tokens * 0.0000075).toFixed(2);
  const visible = script.lines.filter((l) => l.at <= elapsed).slice(-8);
  const stage = stageOf(elapsed, script.end);

  const controlRun = () => {
    if (passed) {
      setCycle((c) => c + 1);
      setElapsed(0);
      setPaused(false);
      return;
    }
    setPaused((p) => !p);
  };

  const steps = [
    { label: "spec locked", state: "done" },
    { label: "scaffold", state: "done" },
    { label: "write components", state: passed || stage > 1 ? "done" : "active" },
    { label: "review pass", state: stage > 2 ? "done" : stage === 2 ? "active" : "todo" },
    { label: "build & verify", state: passed ? "done" : stage === 3 ? "active" : "todo" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border hairline bg-panel">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/40 to-transparent" />

      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b hairline px-4 py-3 sm:px-5">
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.18em] uppercase",
            paused ? "text-[#e9b872]" : "text-volt",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", paused ? "bg-[#e9b872]" : "bg-volt animate-pulse-dot")} />
          {paused ? "paused" : passed ? "passed" : "live"}
        </span>
        <p className="font-mono text-[12px] text-bone">
          {script.project} <span className="text-faint">— {script.run}</span>
        </p>
        <span className="font-mono text-[11px] text-mute tabular-nums">{fmtClock(elapsed)}</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={controlRun}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10.5px] transition-colors duration-300",
              paused
                ? "border-volt/40 bg-volt/[0.08] text-volt"
                : "hairline text-mute hover:border-bone/20 hover:text-bone",
            )}
          >
            {paused || passed ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {passed ? "run next" : paused ? "resume" : "interrupt"}
          </button>
          <a
            href="#/app/new"
            onClick={() => {
              try {
                sessionStorage.setItem("vibex:project", script.project);
                sessionStorage.setItem("vibex:idea", script.goal);
              } catch {
                /* The workspace still opens. */
              }
            }}
            className="group flex items-center gap-1.5 rounded-lg bg-volt px-3 py-1.5 font-mono text-[10.5px] font-medium text-coal transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            open sandbox
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* body */}
      <div className="grid lg:grid-cols-[268px_1fr]">
        {/* meta column */}
        <div className="hidden flex-col justify-between border-r hairline p-5 lg:flex">
          <div>
            <p className="font-mono text-[9px] tracking-[0.22em] text-faint uppercase">goal</p>
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-bone/85">
              “{script.goal}”
            </p>

            <div className="mt-5 space-y-[3px]">
              {steps.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 py-[3px]">
                  <span className="flex h-3.5 w-3.5 items-center justify-center">
                    {s.state === "done" ? (
                      <Check className="h-3 w-3 text-volt" />
                    ) : s.state === "active" ? (
                      <span className="spinner" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-bone/20" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10.5px]",
                      s.state === "done" ? "text-mute" : s.state === "active" ? "text-bone" : "text-faint",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* loop visual */}
          <div className="mt-6 border-t hairline pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md border border-volt/25 bg-volt/[0.06] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] text-volt uppercase">
                coder
              </span>
              <svg viewBox="0 0 64 20" className="w-14" aria-hidden>
                <path d="M2 6 H62" stroke="#d9ff3f" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="4 10" className="animate-dash-flow" />
                <path d="M62 15 H2" stroke="#8ad4ff" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="4 10" className="animate-dash-flow" style={{ animationDirection: "reverse" }} />
              </svg>
              <span className="rounded-md border border-[#8ad4ff]/25 bg-[#8ad4ff]/[0.06] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] text-[#8ad4ff] uppercase">
                reviewer
              </span>
            </div>
            <p className="mt-3 text-center font-mono text-[9px] text-faint">
              sonnet 4.5 · opus 4.5
            </p>
          </div>
        </div>

        {/* log */}
        <div className="flex min-h-[248px] flex-col justify-end overflow-hidden bg-coal/40 p-4 sm:p-5">
          <div className="space-y-[7px]">
            <AnimatePresence initial={false}>
              {visible.map((l) => (
                <motion.p
                  key={`${cycle}-${l.at}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={cn("truncate font-mono text-[11px] leading-relaxed", KIND_COLOR[l.kind])}
                >
                  {l.text}
                </motion.p>
              ))}
            </AnimatePresence>
            {!passed && (
              <p className="font-mono text-[11px] text-volt/80">
                <span className="type-caret">&nbsp;</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t hairline px-4 py-3 font-mono text-[10px] text-mute sm:px-5">
        <div className="flex flex-1 min-w-[180px] items-center gap-3">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-bone/[0.08]">
            <div
              className={cn("h-full rounded-full transition-[width] duration-300 ease-out", paused ? "bg-[#e9b872]" : "bg-volt")}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-9 text-right text-volt tabular-nums">{Math.floor(progress)}%</span>
        </div>
        <span className="tabular-nums">{(tokens / 1000).toFixed(1)}k tokens</span>
        <span className="text-faint tabular-nums">est. ${cost}</span>
        <span className="ml-auto hidden text-faint xl:block">
          queued next: {next.project} — {next.run}
        </span>
      </div>
    </div>
  );
}
