import { AnimatePresence, motion } from "framer-motion";
import {
  Check, Code2, Cpu, Eye, Play, ScanSearch, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { sliceTokens, tokenize } from "../lib/code";
import { HERO_RUNS, shuffledOrder, type Tone } from "../lib/heroRuns";
import { cn } from "../utils/cn";
import PreviewCanvas from "./hero/PreviewCanvas";

/* ============================================================
   A miniature, self-running version of the real build room.
   prompt -> spec -> pipeline + code -> verify -> live preview.

   Behaviour rules:
   • nothing runs until the visitor scrolls it into view
   • a run never restarts while it is on screen or hovered
   • it advances to a different build each time it re-enters view
   ============================================================ */

type Phase = "idle" | "prompt" | "spec" | "code" | "verify" | "preview";
type Tab = "code" | "preview";
type Line = { text: string; chars: number };
type LogItem = { id: number; tone: Tone; text: string };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const PHASE_LABEL: Record<Phase, string> = {
  idle: "waiting to start",
  prompt: "describing the idea",
  spec: "locking the spec",
  code: "writing files",
  verify: "verifying the build",
  preview: "preview ready",
};

const TONE_STYLE: Record<Tone, string> = {
  coder: "text-bone/75",
  reviewer: "text-[#8ad4ff]/90",
  ok: "text-volt/90",
  flag: "text-[#e9b872]",
  infra: "text-bone/60",
};

function ToneIcon({ tone }: { tone: Tone }) {
  const c = "h-3 w-3 shrink-0";
  if (tone === "ok") return <Check className={cn(c, "text-volt")} />;
  if (tone === "flag") return <TriangleAlert className={cn(c, "text-[#e9b872]")} />;
  if (tone === "reviewer") return <ScanSearch className={cn(c, "text-[#8ad4ff]")} />;
  if (tone === "infra") return <ShieldCheck className={cn(c, "text-bone/45")} />;
  return <Code2 className={cn(c, "text-volt/70")} />;
}

export default function HeroBuildRoom() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  const order = useRef<number[]>(shuffledOrder());
  const cursor = useRef(0);
  const [runIdx, setRunIdx] = useState(() => order.current[0]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [promptText, setPromptText] = useState("");
  const [fileIdx, setFileIdx] = useState(0);
  const [doc, setDoc] = useState<Line[]>([]);
  const [log, setLog] = useState<LogItem[]>([]);
  const [stageAt, setStageAt] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<Tab>("code");
  const [runSeq, setRunSeq] = useState(0);

  const manualTab = useRef(false);
  const hovered = useRef(false);
  const finished = useRef(false);
  const started = useRef(false);
  const token = useRef(0);
  const logId = useRef(0);
  const codeRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const run = HERO_RUNS[runIdx];
  const tokenized = useMemo(() => doc.map((l) => tokenize(l.text)), [doc]);

  /* advance to the next build in the shuffled order */
  const nextRun = useCallback(() => {
    cursor.current += 1;
    if (cursor.current >= order.current.length) {
      order.current = shuffledOrder();
      cursor.current = 0;
    }
    setRunIdx(order.current[cursor.current]);
    setRunSeq((s) => s + 1);
  }, []);

  /* ---------- start when scrolled into view; always a different build on re-entry ---------- */
  useEffect(() => {
    if (!inView) {
      // Leaving view ends the current run and queues a different build,
      // so returning to the section never replays the same thing.
      if (started.current) {
        started.current = false;
        finished.current = false;
        nextRun();
      }
      return;
    }
    started.current = true;
    setRunSeq((s) => s + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  /* ---------- the run sequence ---------- */
  useEffect(() => {
    if (!inView || runSeq === 0) return;

    const my = ++token.current;
    const alive = () => token.current === my;

    const addLog = (tone: Tone, text: string) => {
      logId.current += 1;
      setLog((prev) => [...prev.slice(-5), { id: logId.current, tone, text }]);
    };

    const typeCode = async (lines: string[], base: number, span: number) => {
      setDoc([]);
      await sleep(220);
      for (let i = 0; i < lines.length; i++) {
        if (!alive()) return;
        const text = lines[i];
        setDoc((prev) => (prev.length === i ? [...prev, { text, chars: 0 }] : prev));
        if (!text.trim()) {
          await sleep(42);
          continue;
        }
        // code lands fast — this is the machine working
        const step = text.length > 44 ? 4 : 3;
        for (let c = 0; c <= text.length; c += step) {
          if (!alive()) return;
          const chars = Math.min(text.length, c);
          setDoc((prev) => prev.map((l, k) => (k === i ? { ...l, chars } : l)));
          setProgress(base + ((i + chars / text.length) / lines.length) * span);
          const el = codeRef.current;
          if (el) el.scrollTop = el.scrollHeight;
          await sleep(9);
        }
        await sleep(34);
      }
    };

    (async () => {
      // reset
      setPhase("prompt");
      setPromptText("");
      setDoc([]);
      setLog([]);
      setStageAt(-1);
      setFileIdx(0);
      setProgress(0);
      setTab("code");
      manualTab.current = false;
      finished.current = false;

      await sleep(620);
      if (!alive()) return;

      /* 1 — a person typing, with human rhythm */
      const words = run.prompt.split(" ");
      let typed = "";
      for (let w = 0; w < words.length; w++) {
        const word = words[w] + (w < words.length - 1 ? " " : "");
        for (const ch of word) {
          if (!alive()) return;
          typed += ch;
          setPromptText(typed);
          setProgress((typed.length / run.prompt.length) * 7);
          await sleep(38 + Math.random() * 55);
        }
        // brief pause between words, longer mid-thought
        await sleep(w % 3 === 2 ? 240 : 90);
      }
      await sleep(700);
      if (!alive()) return;

      /* 2 — spec lock */
      setPhase("spec");
      addLog("coder", "goal locked · spec approved");
      setProgress(11);
      await sleep(1250);
      if (!alive()) return;

      /* 3 — pipeline + files */
      setPhase("code");
      const files = run.files;
      const stages = run.stages;
      const span = 76 / files.length;

      for (let f = 0; f < files.length; f++) {
        if (!alive()) return;
        setFileIdx(f);

        // advance the engineering pipeline alongside the code
        const upto = Math.floor(((f + 1) / files.length) * (stages.length - 1));
        for (let s = stageAtRef(f, stages.length, files.length); s <= upto; s++) {
          if (!alive()) return;
          setStageAt(s);
          await sleep(240);
        }

        const before = run.log[f * 2];
        if (before) addLog(before.tone, before.text);

        await typeCode(files[f].lines, 11 + f * span, span);
        if (!alive()) return;

        const after = run.log[f * 2 + 1];
        if (after) addLog(after.tone, after.text);
        await sleep(760);
      }

      /* 4 — verify */
      if (!alive()) return;
      setPhase("verify");
      setStageAt(run.stages.length - 1);
      const tail = run.log.slice(run.files.length * 2);
      for (const entry of tail) {
        if (!alive()) return;
        addLog(entry.tone, entry.text);
        await sleep(680);
      }
      for (let p = 88; p <= 100; p += 2) {
        if (!alive()) return;
        setProgress(p);
        await sleep(130);
      }
      addLog("ok", `build passed · ${run.spec.files} files · 0 errors`);
      await sleep(620);

      /* 5 — preview */
      if (!alive()) return;
      setPhase("preview");
      if (!manualTab.current) setTab("preview");
      finished.current = true;

      /* 6 — linger, then rotate (but never yank a build away from a reader) */
      await sleep(9000);
      while (alive() && hovered.current) await sleep(1200);
      if (!alive()) return;
      finished.current = false;
      nextRun();
    })();

    return () => {
      token.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runSeq, runIdx, inView]);

  /* preview auto-scroll: a slow read-through, then back to the top */
  useEffect(() => {
    if (phase !== "preview" || tab !== "preview") return;
    const el = previewRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.clientHeight;
    if (distance < 12) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 8600);
      const eased = p < 0.66 ? p / 0.66 : Math.max(0, 1 - (p - 0.66) / 0.34);
      el.scrollTop = distance * easeInOut(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, tab, runSeq]);

  const pickTab = (t: Tab) => {
    manualTab.current = true;
    setTab(t);
  };

  const activeFile = run.files[Math.min(fileIdx, run.files.length - 1)];
  const tokensUsed = ((progress * run.spec.files * 0.9) / 10).toFixed(1);
  const cost = ((progress / 100) * parseFloat(run.spec.cost.replace("$", ""))).toFixed(2);
  const passed = phase === "preview";

  return (
    <div
      ref={ref}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      className="relative overflow-hidden rounded-2xl border hairline bg-panel shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/50 to-transparent" />

      {/* ---------- title bar ---------- */}
      <div className="flex items-center gap-3 border-b hairline px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bone/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone/[0.12]" />
        </div>
        <p className="min-w-0 truncate font-mono text-[11px] text-mute">
          vibex <span className="text-faint">— {run.project}</span>
        </p>
        <span className="hidden shrink-0 rounded-md border hairline px-2 py-0.5 font-mono text-[10px] text-faint sm:block">
          {run.target}
        </span>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden font-mono text-[10px] text-faint lg:block">
            build {String((cursor.current % HERO_RUNS.length) + 1).padStart(2, "0")} / {HERO_RUNS.length}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-volt uppercase">
            <span className={cn("h-1.5 w-1.5 rounded-full bg-volt", !passed && phase !== "idle" && "animate-pulse-dot")} />
            {phase === "idle" ? "ready" : passed ? "done" : "live"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[266px_1fr]">
        {/* ---------- left rail ---------- */}
        <aside className="hidden flex-col border-r hairline p-4 lg:flex">
          <p className="font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">you asked for</p>
          <div className="mt-2 rounded-xl rounded-br-sm border border-volt/25 bg-volt/[0.06] px-3.5 py-3">
            <p className="text-[13.5px] leading-relaxed text-bone">
              {promptText || <span className="text-faint">…</span>}
              {phase === "prompt" && <span className="type-caret" />}
            </p>
          </div>

          <AnimatePresence>
            {phase !== "prompt" && phase !== "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center justify-between rounded-xl border hairline bg-coal/60 px-3 py-2.5">
                  <span className="font-mono text-[10.5px] text-mute">
                    {run.spec.files} files · {run.spec.time}
                  </span>
                  <span className="font-mono text-[10.5px] text-volt">{run.spec.cost}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* engineering pipeline */}
          <p className="mt-5 font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">pipeline</p>
          <div className="mt-2 space-y-[3px]">
            {run.stages.map((s, i) => {
              const state = i < stageAt ? "done" : i === stageAt ? "active" : "todo";
              return (
                <div
                  key={s.label}
                  className={cn(
                    "rounded-lg px-2 py-1.5 transition-colors duration-300",
                    state === "active" && "bg-volt/[0.07]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      {state === "done" ? (
                        <Check className="h-3 w-3 text-volt" />
                      ) : state === "active" ? (
                        <span className="spinner" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-bone/20" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "truncate text-[12px]",
                        state === "todo" ? "text-faint" : state === "active" ? "text-bone" : "text-mute",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  <AnimatePresence>
                    {state === "active" && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-[22px] font-mono text-[10px] text-faint"
                      >
                        {s.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex flex-wrap gap-1.5 border-t hairline pt-3">
            {run.stack.map((s) => (
              <span key={s} className="rounded border hairline px-2 py-0.5 font-mono text-[10px] text-faint">
                {s}
              </span>
            ))}
          </div>
        </aside>

        {/* ---------- stage ---------- */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2 border-b hairline px-3 py-2">
            <div className="flex rounded-lg border hairline bg-coal/60 p-0.5">
              {[
                { k: "code" as Tab, label: "Code", icon: Code2 },
                { k: "preview" as Tab, label: "Preview", icon: Eye },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => pickTab(t.k)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] transition-colors duration-200",
                    tab === t.k ? "bg-volt/[0.1] text-volt" : "text-faint hover:text-mute",
                  )}
                >
                  <t.icon className="h-3 w-3" />
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "code" ? (
              <span className="ml-1 min-w-0 truncate font-mono text-[10.5px] text-faint">
                {activeFile.path}
                <span className="text-mute">{activeFile.name}</span>
              </span>
            ) : (
              <span className="ml-1 flex min-w-0 items-center gap-1.5 truncate font-mono text-[10.5px] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                {run.project}.vibex.app
              </span>
            )}

            {phase !== "preview" && phase !== "idle" && (
              <span className="ml-auto hidden shrink-0 items-center gap-1.5 font-mono text-[10px] text-faint sm:flex">
                <span className="spinner" />
                {PHASE_LABEL[phase]}
              </span>
            )}
          </div>

          {/* taller stage */}
          <div className="relative h-[420px] overflow-hidden bg-coal/40 sm:h-[468px] lg:h-[496px]">
            <AnimatePresence mode="wait">
              {tab === "code" ? (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  ref={codeRef}
                  data-lenis-prevent
                  className="h-full overflow-y-auto py-3"
                >
                  {doc.length === 0 ? (
                    <p className="px-4 pt-2 font-mono text-[11px] text-faint">
                      {phase === "idle"
                        ? "// scroll here to start a build"
                        : phase === "prompt"
                          ? "// listening…"
                          : "// preparing workspace…"}
                    </p>
                  ) : (
                    <div className="font-mono text-[11.5px] leading-[1.85] whitespace-pre sm:text-[12.5px]">
                      {doc.map((l, i) => {
                        const typing = i === doc.length - 1 && l.chars < l.text.length;
                        return (
                          <div key={i} className="flex px-3">
                            <span className="w-8 shrink-0 text-right text-[10.5px] leading-[1.95] text-bone/20 select-none">
                              {i + 1}
                            </span>
                            <span className="w-3 shrink-0" />
                            <span className={cn(typing && "type-caret")}>
                              {l.text.trim() === ""
                                ? " "
                                : sliceTokens(tokenized[i], l.chars).map((tk, k) => (
                                    <span key={k} className={tk.c || undefined}>{tk.t}</span>
                                  ))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-full"
                >
                  {passed ? (
                    <div ref={previewRef} data-lenis-prevent className="h-full overflow-y-auto bg-coal/60">
                      <PreviewCanvas blocks={run.preview} />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                      <Cpu className="h-5 w-5 text-faint" />
                      <p className="text-[13.5px] text-mute">
                        The preview appears the moment the build passes.
                      </p>
                      <button
                        onClick={() => pickTab("code")}
                        className="font-mono text-[11px] text-volt underline-offset-4 hover:underline"
                      >
                        watch it being written →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* agent log — floats over the stage, always visible */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-coal via-coal/90 to-transparent px-3 pt-8 pb-2.5">
              <div className="space-y-1">
                <AnimatePresence initial={false}>
                  {log.slice(-2).map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <ToneIcon tone={l.tone} />
                      <span className={cn("truncate text-[12px]", TONE_STYLE[l.tone])}>{l.text}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {passed && tab === "preview" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-volt/30 bg-coal/90 px-3 py-1.5 font-mono text-[10px] text-volt backdrop-blur"
                >
                  <Check className="h-3 w-3" /> build passed
                </motion.div>
              )}
              {phase === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-coal/60"
                >
                  <Play className="h-5 w-5 text-volt" />
                  <p className="text-[13.5px] text-mute">Scroll into view to watch a real build</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* status bar */}
          <div className="flex items-center gap-4 border-t hairline px-4 py-2.5 font-mono text-[10px] text-mute">
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-volt" />
              {PHASE_LABEL[phase]}
            </span>
            <span className="hidden tabular-nums md:inline">{tokensUsed}k tokens</span>
            <span className="hidden tabular-nums text-faint md:inline">est. ${cost}</span>
            <div className="ml-auto flex items-center gap-2.5">
              <div className="h-[3px] w-24 overflow-hidden rounded-full bg-bone/[0.08] sm:w-40">
                <div
                  className="h-full rounded-full bg-volt transition-[width] duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-8 text-right tabular-nums text-volt">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function stageAtRef(fileIndex: number, stageCount: number, fileCount: number) {
  return fileIndex === 0 ? 0 : Math.floor((fileIndex / fileCount) * (stageCount - 1));
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
