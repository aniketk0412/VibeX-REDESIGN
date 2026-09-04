import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight, Check, Copy, FileCode2, Folder, History,
  Lock, Monitor, Pencil, RefreshCw, Rocket, RotateCcw, Save, Search,
  Smartphone, Tablet, TerminalSquare, X, Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { sliceTokens, tokenize } from "../../lib/code";
import { LAST_FIX, TREE, VERSIONS, WS_FILES, type LogLevel } from "../../lib/workspace";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";
import { diffLines, useWorkspace } from "./store";

/* ================= interactive preview app ================= */

type Habit = { id: number; name: string; days: boolean[] };

const SEED_HABITS: Habit[] = [
  { id: 1, name: "Read 20 pages", days: [true, true, true, true, true, true, false] },
  { id: 2, name: "Ship code", days: [true, true, false, true, true, false, false] },
  { id: 3, name: "Morning run", days: [true, false, true, true, false, false, false] },
];

function MiniApp({ projectName }: { projectName: string }) {
  const isHabitApp = projectName.toLowerCase().includes("habit");
  const [habits, setHabits] = useState(() =>
    isHabitApp
      ? SEED_HABITS
      : [
          { id: 1, name: "Core experience", days: [true, true, true, true, false, false, false] },
          { id: 2, name: "Responsive states", days: [true, true, true, false, false, false, false] },
          { id: 3, name: "Production polish", days: [true, false, true, false, false, false, false] },
        ],
  );
  const [draft, setDraft] = useState("");

  const toggle = (id: number, d: number) =>
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, days: h.days.map((v, i) => (i === d ? !v : v)) } : h)),
    );

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    setHabits((prev) => [...prev, { id: Date.now(), name, days: Array(7).fill(false) }]);
    setDraft("");
  };

  const done = habits.flatMap((h) => h.days).filter(Boolean).length;
  const total = habits.length * 7;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* app header — fixed */}
      <div className="shrink-0 px-5 pt-6 pb-4 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">{projectName} · week 32</p>
            <h3 className="mt-1 font-display text-[24px] font-medium tracking-tight">
              {isHabitApp ? "Tonight's list" : "Working prototype"}
            </h3>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-volt/25 bg-volt/[0.07] px-3 py-1.5 font-mono text-[11px] text-volt">
            <Zap className="h-3 w-3" /> {isHabitApp ? "12-day streak" : "preview live"}
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bone/[0.07]">
          <motion.div
            className="h-full rounded-full bg-volt"
            animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-faint tabular-nums">
          {done}/{total} {isHabitApp ? "check-ins this week" : "interaction states ready"}
        </p>
      </div>

      {/* habit list — the ONLY scroller */}
      <div data-lenis-prevent className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-2 sm:px-8">
        <AnimatePresence initial={false}>
          {habits.map((h, i) => (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: EASE }}
              className="rounded-xl border hairline bg-panel p-3.5"
            >
              <p className="text-[13px] text-bone/90">{h.name}</p>
              <div className="mt-2.5 flex gap-1.5">
                {h.days.map((on, d) => (
                  <button
                    key={d}
                    onClick={() => toggle(h.id, d)}
                    title={`day ${d + 1}`}
                    className={cn(
                      "h-7 flex-1 rounded-md border transition-all duration-200 active:scale-95",
                      on
                        ? "border-volt/50 bg-volt/80 hover:bg-volt"
                        : "border-bone/10 bg-bone/[0.05] hover:border-bone/25 hover:bg-bone/[0.09]",
                    )}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* composer — fixed */}
      <div className="shrink-0 px-5 pt-3 pb-5 sm:px-8">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={isHabitApp ? "new habit, try it live..." : "add a prototype item..."}
            className="min-w-0 flex-1 rounded-xl border border-bone/10 bg-coal px-3.5 py-2.5 text-[13px] text-bone outline-none placeholder:text-faint focus:border-volt/40"
          />
          <button
            onClick={add}
            className="shrink-0 rounded-xl bg-volt px-4 font-mono text-[11.5px] font-medium text-coal transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= editable code view ================= */

function CodeView({ notify }: { notify: (m: string) => void }) {
  const { files, setFile, resetFile, diffs, markDiff, pushLog, bumpPreview } = useWorkspace();
  const [file, setActive] = useState(WS_FILES[1].name);
  const [showFix, setShowFix] = useState(true);
  const [treeOpen, setTreeOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const lines = files[file] ?? [];
  const meta = WS_FILES.find((f) => f.name === file) ?? WS_FILES[0];
  const tokens = useMemo(() => lines.map((l) => tokenize(l)), [lines]);
  const stat = diffs[file];

  const startEdit = () => {
    setDraft(lines.join("\n"));
    setEditing(true);
  };

  const save = () => {
    const next = draft.split("\n");
    const d = diffLines(lines, next);
    setFile(file, next);
    setEditing(false);
    if (d.added || d.removed) {
      markDiff(file, d);
      pushLog("info", `you: edited ${meta.path}${file} (+${d.added} -${d.removed})`);
      pushLog("ok", "hot reload applied — preview updated");
      bumpPreview();
      notify(`saved · +${d.added} -${d.removed}`);
    } else {
      notify("no changes to save");
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* file tree */}
      <AnimatePresence initial={false}>
        {treeOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 190, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="hidden shrink-0 overflow-hidden border-r hairline sm:block"
          >
            <div data-lenis-prevent className="h-full w-[190px] overflow-y-auto p-2.5">
              {TREE.map((t) => (
                <div key={t.dir} className="mb-1">
                  <p className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] text-faint">
                    <Folder className="h-3 w-3" /> {t.dir}
                  </p>
                  {t.files.map((f) => {
                    const known = Boolean(files[f]);
                    const d = diffs[f];
                    return (
                      <button
                        key={f}
                        disabled={!known}
                        onClick={() => {
                          setActive(f);
                          setEditing(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 pl-5 font-mono text-[11px] transition-colors",
                          file === f
                            ? "bg-volt/[0.08] text-volt"
                            : known
                              ? "text-mute hover:bg-bone/[0.04] hover:text-bone"
                              : "cursor-default text-faint/60",
                        )}
                      >
                        <FileCode2 className="h-3 w-3 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-left">{f}</span>
                        {d && (
                          <span className="shrink-0 font-mono text-[9.5px] text-volt">
                            +{d.added}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* code pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b hairline px-3 py-2">
          <select
            value={file}
            onChange={(e) => {
              setActive(e.target.value);
              setEditing(false);
            }}
            className="max-w-[150px] rounded-md border border-bone/10 bg-coal px-2 py-1.5 font-mono text-[10.5px] text-bone outline-none focus:border-volt/40 sm:hidden"
            aria-label="Select file"
          >
            {Object.keys(files).map((name) => (
              <option key={name} value={name} className="bg-coal">{name}</option>
            ))}
          </select>
          <button
            onClick={() => setTreeOpen((v) => !v)}
            className="hidden rounded-md px-1.5 py-1 font-mono text-[10px] text-faint transition-colors hover:bg-bone/[0.05] hover:text-bone sm:block"
          >
            {treeOpen ? "« files" : "files »"}
          </button>
          <span className="min-w-0 truncate font-mono text-[11px] text-mute">
            {meta.path}
            <span className="text-bone">{file}</span>
          </span>
          {stat && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border hairline px-2 py-0.5 font-mono text-[10px]">
              <span className="text-volt">+{stat.added}</span>
              <span className="text-[#ff8a8a]">-{stat.removed}</span>
            </span>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {file === LAST_FIX.file && !editing && (
              <button
                onClick={() => setShowFix((v) => !v)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] uppercase transition-colors",
                  showFix ? "border-volt/40 bg-volt/[0.08] text-volt" : "hairline text-faint hover:text-mute",
                )}
              >
                {showFix ? "fix shown" : "show fix"}
              </button>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md border hairline px-2.5 py-1.5 font-mono text-[10.5px] text-mute transition-colors hover:text-bone"
                >
                  cancel
                </button>
                <button
                  onClick={save}
                  className="flex items-center gap-1.5 rounded-md bg-volt px-2.5 py-1.5 font-mono text-[10.5px] font-medium text-coal transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Save className="h-3 w-3" /> save
                </button>
              </>
            ) : (
              <>
                {stat && (
                  <button
                    onClick={() => {
                      resetFile(file);
                      pushLog("info", `you: reverted ${file} to the agent version`);
                      bumpPreview();
                      notify("file reverted");
                    }}
                    className="rounded-md p-1.5 text-faint transition-colors hover:bg-bone/[0.05] hover:text-bone"
                    title="Revert file"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(lines.join("\n"));
                      notify("file copied");
                    } catch {
                      notify("copy blocked by browser");
                    }
                  }}
                  className="rounded-md p-1.5 text-faint transition-colors hover:bg-bone/[0.05] hover:text-volt"
                  title="Copy file"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 rounded-md border border-volt/30 bg-volt/[0.06] px-2.5 py-1.5 font-mono text-[10.5px] text-volt transition-colors hover:bg-volt/[0.12]"
                >
                  <Pencil className="h-3 w-3" /> edit
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Tab") {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const s = el.selectionStart;
                  const next = draft.slice(0, s) + "  " + draft.slice(el.selectionEnd);
                  setDraft(next);
                  requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
                }
              }}
              spellCheck={false}
              data-lenis-prevent
              className="min-h-0 flex-1 resize-none bg-coal/60 p-4 font-mono text-[12px] leading-[1.8] text-bone outline-none"
            />
            <p className="shrink-0 border-t hairline px-4 py-2 font-mono text-[10px] text-faint">
              editing live · ⌘S to save · tab inserts two spaces
            </p>
          </div>
        ) : (
          <div data-lenis-prevent className="min-h-0 flex-1 overflow-auto py-3">
            <div className="font-mono text-[12px] leading-[1.8] whitespace-pre">
              {lines.map((line, i) => {
                const fixed = showFix && file === LAST_FIX.file && i === LAST_FIX.line;
                return (
                  <div key={i} className={cn("flex px-3", fixed && "bg-volt/[0.08]")}>
                    <span className="w-8 shrink-0 text-right text-[11px] leading-[1.85] text-bone/20 select-none">
                      {i + 1}
                    </span>
                    <span className="w-3 shrink-0" />
                    <span className="flex-1">
                      {line.trim() === ""
                        ? " "
                        : sliceTokens(tokens[i], 9999).map((tk, k) => (
                            <span key={k} className={tk.c || undefined}>
                              {tk.t}
                            </span>
                          ))}
                    </span>
                    {fixed && (
                      <span className="ml-2 hidden shrink-0 font-mono text-[10px] leading-[1.85] text-volt lg:block">
                        ← {LAST_FIX.note}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= working console ================= */

const LEVEL_STYLE: Record<LogLevel, string> = {
  info: "text-mute",
  ok: "text-volt/90",
  warn: "text-[#e9b872]",
  err: "text-[#ff8a8a]",
  cmd: "text-bone",
};

const FILTERS = ["all", "info", "ok", "issues", "cmd"] as const;

function ConsoleView({ notify, projectName }: { notify: (m: string) => void; projectName: string }) {
  const { logs, pushLog, clearLogs, files, diffs, model, bumpPreview } = useWorkspace();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const shown = logs.filter((l) => {
    if (filter === "issues") return l.level === "warn" || l.level === "err";
    if (filter !== "all" && l.level !== filter) return false;
    return query ? l.text.toLowerCase().includes(query.toLowerCase()) : true;
  });

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, filter, query]);

  const run = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    pushLog("cmd", `$ ${input}`);
    setHistory((h) => [...h, input]);
    setHIdx(-1);
    setCmd("");

    const [base, ...args] = input.split(/\s+/);
    const fileNames = Object.keys(files);

    switch (base) {
      case "help":
        pushLog("info", "commands: help · ls · cat <file> · stat · build · test · deploy · model · clear");
        break;
      case "ls":
        pushLog("info", fileNames.join("   "));
        break;
      case "cat": {
        const name = args[0];
        const target = fileNames.find((f) => f === name || f.endsWith(`/${name}`));
        if (!target) pushLog("err", `cat: ${name ?? "<file>"}: no such file`);
        else files[target].slice(0, 14).forEach((l) => pushLog("info", l || " "));
        break;
      }
      case "stat": {
        const entries = Object.entries(diffs);
        if (!entries.length) pushLog("info", "no local changes");
        else
          entries.forEach(([f, d]) =>
            pushLog("info", `${f}  +${d.added}  -${d.removed}`),
          );
        break;
      }
      case "build":
      case "vite":
        pushLog("info", "building production bundle…");
        window.setTimeout(() => pushLog("ok", "built in 812ms — 0 errors, 0 warnings"), 700);
        break;
      case "test":
        pushLog("info", "running 14 tests…");
        window.setTimeout(() => pushLog("ok", "14 passed · 0 failed · 1.2s"), 800);
        break;
      case "deploy":
        pushLog("info", "deploying to the edge…");
        window.setTimeout(() => pushLog("ok", `live: https://${projectName}.vibex.app`), 900);
        break;
      case "model":
        pushLog("info", `active model: ${model}`);
        break;
      case "reload":
        bumpPreview();
        pushLog("ok", "preview reloaded");
        break;
      case "clear":
        clearLogs();
        break;
      default:
        pushLog("err", `command not found: ${base} — try "help"`);
        notify("unknown command");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b hairline px-3 py-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] uppercase transition-colors",
              filter === f ? "border-volt/40 bg-volt/[0.08] text-volt" : "hairline text-faint hover:text-mute",
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border hairline bg-coal px-2 py-1">
            <Search className="h-3 w-3 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter…"
              className="w-20 bg-transparent font-mono text-[11px] text-bone outline-none placeholder:text-faint"
            />
          </span>
          <button
            onClick={() => {
              clearLogs();
              setQuery("");
            }}
            className="font-mono text-[10px] tracking-[0.06em] text-faint uppercase transition-colors hover:text-bone"
          >
            clear
          </button>
        </div>
      </div>

      <div ref={boxRef} data-lenis-prevent className="min-h-0 flex-1 space-y-[5px] overflow-auto bg-coal/40 p-4">
        {shown.length === 0 && (
          <p className="font-mono text-[11px] text-faint">
            {logs.length === 0 ? '// console cleared — type "help"' : "// no lines match"}
          </p>
        )}
        {shown.map((l, i) => (
          <p key={i} className={cn("font-mono text-[11px] leading-relaxed break-words", LEVEL_STYLE[l.level])}>
            <span className="mr-2 text-faint/70 tabular-nums">{l.t}</span>
            {l.text}
          </p>
        ))}
      </div>

      {/* prompt */}
      <div className="flex shrink-0 items-center gap-2 border-t hairline bg-coal/60 px-3 py-2.5">
        <span className="font-mono text-[12px] text-volt">$</span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run(cmd);
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
              if (history[next] !== undefined) {
                setHIdx(next);
                setCmd(history[next]);
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (hIdx < 0) return;
              const next = hIdx + 1;
              if (next >= history.length) {
                setHIdx(-1);
                setCmd("");
              } else {
                setHIdx(next);
                setCmd(history[next]);
              }
            }
          }}
          placeholder='run a command — try "help"'
          spellCheck={false}
          className="flex-1 bg-transparent font-mono text-[11.5px] text-bone outline-none placeholder:text-faint"
        />
        <span className="hidden font-mono text-[10px] text-faint sm:block">↑ history</span>
      </div>
    </div>
  );
}

/* ================= deploy modal ================= */

const DEPLOY_STEPS = ["building production bundle", "optimizing assets", "deploying to the edge", "live"];

function DeployModal({ onClose, notify, projectName }: { onClose: () => void; notify: (m: string) => void; projectName: string }) {
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    DEPLOY_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), 900 * (i + 1)));
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const done = step >= DEPLOY_STEPS.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] overflow-hidden rounded-2xl border hairline bg-panel"
      >
        <div className="flex items-center justify-between border-b hairline px-5 py-3.5">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-faint uppercase">
            <Rocket className="h-3.5 w-3.5 text-volt" /> deploy to production
          </p>
          <button onClick={onClose} className="rounded-md p-1 text-faint hover:bg-bone/[0.05] hover:text-bone" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {DEPLOY_STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step && !done ? "active" : "todo";
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center">
                  {state === "done" ? (
                    <Check className="h-4 w-4 text-volt" />
                  ) : state === "active" ? (
                    <span className="spinner" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-bone/20" />
                  )}
                </span>
                <span className={cn("font-mono text-[12px]", state === "todo" ? "text-faint" : "text-bone")}>
                  {s}
                </span>
              </div>
            );
          })}

          <div className="h-1 overflow-hidden rounded-full bg-bone/[0.08]">
            <div
              className="h-full rounded-full bg-volt transition-[width] duration-500"
              style={{ width: `${(step / DEPLOY_STEPS.length) * 100}%` }}
            />
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-volt/25 bg-volt/[0.05] p-4"
              >
                <p className="flex items-center gap-2 font-mono text-[11.5px] text-volt">
                  <Lock className="h-3 w-3" /> https://{projectName}.vibex.app
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`https://${projectName}.vibex.app`);
                        notify("url copied — go show it off");
                      } catch {
                        notify("copy blocked by browser");
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-volt px-3 py-2 font-mono text-[11px] font-medium text-coal transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Copy className="h-3 w-3" /> copy url
                  </button>
                  <a
                    href="#/app/analytics"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border hairline px-3 py-2 font-mono text-[11px] text-bone transition-colors hover:border-bone/25"
                  >
                    analytics <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================= versions popover ================= */

function Versions({ notify }: { notify: (m: string) => void }) {
  const { restoreVersion } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("v3");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
          open ? "border-volt/30 bg-volt/[0.06] text-volt" : "hairline text-mute hover:text-bone",
        )}
      >
        <History className="h-3.5 w-3.5" /> {current}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute top-10 right-0 z-40 w-[272px] overflow-hidden rounded-xl border hairline bg-panel-2 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]"
          >
            <p className="border-b hairline px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
              version history
            </p>
            {VERSIONS.map((v) => (
              <div key={v.v} className="flex items-center gap-3 border-b hairline px-4 py-2.5 last:border-0 hover:bg-bone/[0.025]">
                <span className={cn("font-mono text-[11.5px]", v.v === current ? "text-volt" : "text-bone/80")}>
                  {v.v}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[12px] text-bone/80">{v.label}</p>
                  <p className="font-mono text-[10px] text-faint">{v.time}</p>
                </div>
                {v.v === current ? (
                  <span className="shrink-0 font-mono text-[9.5px] tracking-[0.12em] text-volt uppercase">live</span>
                ) : (
                  <button
                    onClick={() => {
                      setCurrent(v.v);
                      setOpen(false);
                      restoreVersion(v.v);
                      notify(`restored ${v.v} — preview + code updated`);
                    }}
                    className="shrink-0 font-mono text-[10.5px] text-mute transition-colors hover:text-volt"
                  >
                    restore
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= stage panel ================= */

type Tab = "preview" | "code" | "console";
type Device = "desktop" | "tablet" | "mobile";

const DEVICE_W: Record<Device, string> = {
  desktop: "max-w-none",
  tablet: "max-w-[760px]",
  mobile: "max-w-[390px]",
};

export default function StagePanel({ projectName, notify }: { projectName: string; notify: (m: string) => void }) {
  const { totals, previewKey, bumpPreview } = useWorkspace();
  const [tab, setTab] = useState<Tab>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [deploying, setDeploying] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const refreshTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(refreshTimer.current), []);

  const refresh = () => {
    if (spinning) return;
    setSpinning(true);
    bumpPreview();
    refreshTimer.current = window.setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b hairline px-3 py-2.5">
        <div className="flex rounded-lg border hairline bg-coal/60 p-0.5">
          {(
            [
              { k: "preview", label: "Preview" },
              { k: "code", label: "Code" },
              { k: "console", label: "Console", icon: TerminalSquare },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[11px] transition-all duration-200 sm:px-3",
                tab === t.k ? "bg-volt/[0.1] text-volt" : "text-faint hover:text-mute",
              )}
            >
              {"icon" in t && t.icon && <t.icon className="h-3 w-3" />}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "preview" && (
          <div className="hidden items-center gap-0.5 rounded-lg border hairline bg-coal/60 p-0.5 sm:flex">
            {(
              [
                { k: "desktop", icon: Monitor },
                { k: "tablet", icon: Tablet },
                { k: "mobile", icon: Smartphone },
              ] as const
            ).map((d) => (
              <button
                key={d.k}
                title={d.k}
                onClick={() => setDevice(d.k)}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === d.k ? "bg-bone/[0.08] text-volt" : "text-faint hover:text-mute",
                )}
              >
                <d.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* live change counter */}
        {totals.files > 0 && (
          <span className="hidden items-center gap-2 rounded-full border hairline px-2.5 py-1 font-mono text-[10.5px] md:flex">
            <span className="text-faint">{totals.files} files</span>
            <span className="text-volt">+{totals.added}</span>
            <span className="text-[#ff8a8a]">-{totals.removed}</span>
          </span>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {tab === "preview" && (
            <button
              onClick={refresh}
              className="rounded-lg border hairline p-2 text-mute transition-colors hover:border-bone/20 hover:text-bone"
              aria-label="Reload preview"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
            </button>
          )}
          <div className="hidden sm:block">
            <Versions notify={notify} />
          </div>
          <button
            onClick={() => setDeploying(true)}
            className="flex items-center gap-1.5 rounded-lg bg-volt px-3.5 py-2 font-mono text-[11px] font-medium text-coal transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </div>

      {/* url bar */}
      {tab === "preview" && (
        <div className="flex shrink-0 items-center gap-2 border-b hairline bg-coal/40 px-3 py-2">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-volt" />
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border hairline bg-panel px-2.5 py-1.5 font-mono text-[11px] text-mute">
            <Lock className="h-2.5 w-2.5 shrink-0 text-volt" />
            <span className="truncate">{projectName}.vibex.app</span>
          </span>
          <span className="hidden shrink-0 rounded border hairline px-2 py-1 font-mono text-[10px] text-faint sm:block">
            run #43
          </span>
        </div>
      )}

      {/* body — flex, never scrolls as a whole */}
      <div className="min-h-0 flex-1">
        {tab === "preview" && (
          <div className="dot-grid flex h-full min-h-0 justify-center bg-coal/30 p-0 sm:p-4">
            <div
              className={cn(
                "flex h-full min-h-0 w-full flex-col transition-all duration-500",
                DEVICE_W[device],
                device !== "desktop" && "overflow-hidden rounded-2xl border hairline bg-coal",
              )}
            >
              <MiniApp key={previewKey} projectName={projectName} />
            </div>
          </div>
        )}
        {tab === "code" && <CodeView notify={notify} />}
        {tab === "console" && <ConsoleView notify={notify} projectName={projectName} />}
      </div>

      <AnimatePresence>
        {deploying && <DeployModal onClose={() => setDeploying(false)} notify={notify} projectName={projectName} />}
      </AnimatePresence>
    </div>
  );
}
