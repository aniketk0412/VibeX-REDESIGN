import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, CircleDashed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { greeting, IDEA_PLACEHOLDERS } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";

const MODELS = ["claude sonnet 4.5", "gpt-5", "gemini 3 pro", "openrouter · free"];
const TARGETS = ["web", "api", "cli"];
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function CommandBar() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>(0);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [target, setTarget] = useState(TARGETS[0]);
  const [ph, setPh] = useState("");

  /* Slash focuses the idea field. Cmd/Ctrl+K is reserved for global search. */
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timerRef.current);
    };
  }, []);

  /* cycling typewriter placeholder */
  useEffect(() => {
    if (focused || value) return;
    let dead = false;
    (async () => {
      let i = 0;
      while (!dead) {
        const idea = IDEA_PLACEHOLDERS[i++ % IDEA_PLACEHOLDERS.length];
        for (let c = 1; c <= idea.length && !dead; c++) {
          setPh(idea.slice(0, c));
          await sleep(36);
        }
        await sleep(1600);
        for (let c = idea.length; c >= 0 && !dead; c -= 3) {
          setPh(idea.slice(0, Math.max(0, c)));
          await sleep(12);
        }
        setPh("");
      }
    })();
    return () => {
      dead = true;
    };
  }, [focused, value]);

  const submit = () => {
    const idea = value.trim();
    if (!idea || sent) return;
    const project = idea
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((word) => !["a", "an", "the", "with", "for", "my"].includes(word))
      .slice(0, 2)
      .join("-") || "new-project";
    try {
      sessionStorage.setItem("vibex:idea", idea);
      sessionStorage.setItem("vibex:model", model);
      sessionStorage.setItem("vibex:target", target);
      sessionStorage.setItem("vibex:project", project);
    } catch {
      /* The room still opens if browser storage is unavailable. */
    }
    setSent(true);
    timerRef.current = window.setTimeout(() => {
      window.location.hash = "#/app/new";
    }, 900);
  };

  return (
    <div>
      {/* greeting row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-tight font-medium tracking-[-0.01em] sm:text-[36px]">
            {greeting()}, {user?.name.split(" ")[0] ?? "builder"}.
          </h1>
          <p className="mt-1 text-[14.5px] text-mute">What are we shipping today?</p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex items-center gap-1.5 rounded-full border hairline px-3 py-1.5 font-mono text-[9.5px] tracking-[0.12em] text-mute uppercase">
            <Check className="h-3 w-3 text-volt" /> anthropic key connected
          </span>
          <span className="flex items-center gap-1.5 rounded-full border hairline px-3 py-1.5 font-mono text-[9.5px] tracking-[0.12em] text-mute uppercase">
            reviewer · opus 4.5
          </span>
        </div>
      </div>

      {/* command box */}
      <div
        className={cn(
          "relative mt-6 rounded-2xl border bg-panel transition-all duration-400",
          focused ? "border-volt/40 shadow-[0_0_50px_-12px_rgb(217_255_63/0.22)]" : "hairline",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-3 px-5 py-[22px]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-volt/15">
                <Check className="h-4 w-4 text-volt" />
              </span>
              <div>
                <p className="text-[14px] text-bone">Opening your build room…</p>
                <p className="mt-0.5 font-mono text-[10px] text-faint">
                  the interview is waiting for you inside
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 px-5 py-4"
            >
              <CircleDashed className={cn("h-4.5 w-4.5 shrink-0 transition-colors", focused ? "text-volt" : "text-faint")} strokeWidth={1.6} />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={focused ? "describe your next app — one sentence is enough" : ph || "describe your next app…"}
                className="w-full bg-transparent font-mono text-[13.5px] text-bone outline-none placeholder:text-faint"
                spellCheck={false}
              />
              <span className="hidden shrink-0 rounded border hairline bg-bone/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-faint sm:block">
                Enter
              </span>
              <button
                onClick={submit}
                disabled={!value.trim()}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  value.trim()
                    ? "bg-volt text-coal hover:scale-[1.06] active:scale-[0.95]"
                    : "border hairline text-faint",
                )}
                aria-label="Start build"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* chips row */}
        <div className="flex flex-wrap items-center gap-2 border-t hairline px-4 py-3">
          <span className="font-mono text-[9px] tracking-[0.2em] text-faint uppercase">model</span>
          {MODELS.map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10.5px] transition-colors duration-200",
                model === m
                  ? "border-volt/40 bg-volt/[0.08] text-volt"
                  : "hairline text-mute hover:text-bone",
              )}
            >
              {m}
            </button>
          ))}
          <span className="mx-1 hidden h-3.5 w-px bg-bone/10 sm:block" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-faint uppercase">target</span>
          {TARGETS.map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10.5px] transition-colors duration-200",
                target === t
                  ? "border-volt/40 bg-volt/[0.08] text-volt"
                  : "hairline text-mute hover:text-bone",
              )}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto hidden font-mono text-[10px] text-faint lg:block">
            est. cost $0.30–0.60 · you approve the spec first
          </span>
        </div>
      </div>
    </div>
  );
}
