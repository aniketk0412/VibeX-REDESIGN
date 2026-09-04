import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowUp, Check, ChevronDown, Copy, FileCode2, FilePlus2,
  MessagesSquare, Paperclip, ScanSearch, Square, Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BUILD_SCRIPT, SPEC, STEER_REPLIES, now,
  type AgentKind, type ChatMsg, type FileEdit, type ScriptStep,
} from "../../lib/workspace";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";
import { MODELS, useWorkspace } from "./store";

/* ---------- Claude-Code style edit chip ---------- */
function EditChip({ edit }: { edit: FileEdit }) {
  const Icon = edit.action === "create" ? FilePlus2 : edit.action === "fix" ? Wrench : FileCode2;
  const verb = edit.action === "create" ? "created" : edit.action === "fix" ? "fixed" : "updated";
  return (
    <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border hairline bg-coal px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-volt" />
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-bone/85">
        <span className="text-faint">{edit.path}</span>
        {edit.file}
      </span>
      <span className="shrink-0 font-mono text-[10.5px] text-faint">{verb}</span>
      <span className="shrink-0 font-mono text-[10.5px] text-volt">+{edit.added}</span>
      <span className="shrink-0 font-mono text-[10.5px] text-[#ff8a8a]">-{edit.removed}</span>
    </div>
  );
}

/* ---------- model picker ---------- */
function ModelPicker() {
  const { model, setModel } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
          open ? "border-volt/40 bg-volt/[0.07] text-volt" : "border-bone/10 text-mute hover:text-bone",
        )}
      >
        <span className="max-w-[120px] truncate sm:max-w-[150px]">{model}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute bottom-10 left-0 z-50 w-[290px] overflow-hidden rounded-xl border hairline bg-panel-2 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]"
          >
            <p className="border-b hairline px-3.5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
              build model
            </p>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setModel(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 border-b hairline px-3.5 py-2.5 text-left transition-colors last:border-0",
                  model === m.id ? "bg-volt/[0.06]" : "hover:bg-bone/[0.03]",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-mono text-[11.5px]", model === m.id ? "text-volt" : "text-bone/85")}>
                    {m.id}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-faint">
                    {m.vendor} · {m.note}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-mute">{m.cost}</span>
                {model === m.id && <Check className="h-3.5 w-3.5 shrink-0 text-volt" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const AGENT_META: Record<AgentKind, { label: string; icon: typeof MessagesSquare; tone: string }> = {
  interviewer: { label: "vibex", icon: MessagesSquare, tone: "text-volt" },
  coder: { label: "coder", icon: FileCode2, tone: "text-volt" },
  reviewer: { label: "reviewer", icon: ScanSearch, tone: "text-[#8ad4ff]" },
};

const QUICK = ["just me · offline-first", " streaks + dark UI ", "add weekly summary"];

function TypingDots({ agent }: { agent: AgentKind }) {
  const meta = AGENT_META[agent];
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md border hairline bg-coal">
        <meta.icon className={cn("h-3 w-3", meta.tone)} />
      </span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-mute"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </span>
    </div>
  );
}

export default function ChatPanel({
  initialIdea,
  projectName,
  notify,
}: {
  initialIdea: string | null;
  projectName: string;
  notify: (msg: string) => void;
}) {
  const idRef = useRef(0);
  const runToken = useRef(0);
  const pendingSteer = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState<AgentKind | null>(null);
  const [busy, setBusy] = useState(false); // script running
  const [specShown, setSpecShown] = useState(false);
  const [approved, setApproved] = useState(false);
  const [pausedMid, setPausedMid] = useState(false);
  const [draft, setDraft] = useState("");
  const [jump, setJump] = useState(false);

  const { pushLog, markDiff, bumpPreview, model, setRunStatus } = useWorkspace();

  const push = (m: Omit<ChatMsg, "id" | "time">) => {
    idRef.current += 1;
    setMessages((prev) => [...prev, { ...m, id: idRef.current, time: now() }]);

    // mirror agent work into the console + diff tracker
    if (m.edit) {
      markDiff(m.edit.file, { added: m.edit.added, removed: m.edit.removed });
      pushLog(
        m.edit.action === "fix" ? "warn" : "info",
        `${m.agent ?? "coder"}: ${m.edit.action} ${m.edit.path}${m.edit.file} (+${m.edit.added} -${m.edit.removed})`,
      );
      bumpPreview();
    } else if (m.role === "agent" && m.agent === "reviewer") {
      pushLog("ok", `reviewer: ${m.text?.slice(0, 68)}`);
    } else if (m.role === "system" && m.text) {
      pushLog("info", m.text);
    }
  };

  /* ---------- script runner (cancellable) ---------- */
  const runSteps = async (steps: ScriptStep[], onDone?: () => void) => {
    const token = ++runToken.current;
    setBusy(true);
    setPausedMid(false);
    for (const s of steps) {
      if (runToken.current !== token) return; // stopped
      if (s.kind === "typing") {
        setTyping(s.agent);
        await sleep(s.ms);
        if (runToken.current !== token) return;
        setTyping(null);
      } else {
        push(s.msg);
        await sleep(950);
      }
    }
    if (runToken.current !== token) return;
    setBusy(false);
    onDone?.();
  };

  /* ---------- mount: seed the thread ---------- */
  useEffect(() => {
    let target = "web";
    try {
      target = sessionStorage.getItem("vibex:target") || "web";
    } catch {
      /* Keep the default target. */
    }
    const idea = initialIdea?.trim();
    (async () => {
      const token = ++runToken.current;
      // Delay the first mutation so React StrictMode's probe mount stays side-effect free.
      await sleep(120);
      if (runToken.current !== token) return;
      push({ role: "system", text: `build room opened · ${projectName} · ${target} · ${model} + reviewer` });
      await sleep(480);
      if (runToken.current !== token) return;
      if (idea) {
        push({ role: "user", text: idea });
        await sleep(700);
        if (runToken.current !== token) return;
      }
      setTyping("interviewer");
      await sleep(1200);
      if (runToken.current !== token) return;
      setTyping(null);
      push({
        role: "agent",
        agent: "interviewer",
        text: idea
          ? "Got it. Two quick locks before I write anything — who is this for, and where should the data live?"
          : "What are we building? One sentence is enough — I'll ask two quick questions, then lock the spec.",
      });
    })();
    return () => {
      runToken.current += 1; // cancel on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- auto-scroll ---------- */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (nearBottom.current) el.scrollTop = el.scrollHeight;
    else setJump(true);
  }, [messages, typing]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom.current) setJump(false);
  };

  const jumpDown = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    nearBottom.current = true;
    setJump(false);
  };

  /* ---------- actions ---------- */
  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    push({ role: "user", text });
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    if (!specShown) {
      setSpecShown(true);
      runSteps([
        { kind: "typing", agent: "interviewer", ms: 1100 },
        {
          kind: "msg",
          msg: {
            role: "agent",
            agent: "interviewer",
            text: "Locked. Here's the plan — approve it and the loop takes over. Nothing is written until you say go.",
            spec: true,
          },
        },
      ]);
    } else if (!approved) {
      // nudge toward approval
      runSteps([
        { kind: "typing", agent: "interviewer", ms: 900 },
        {
          kind: "msg",
          msg: {
            role: "agent",
            agent: "interviewer",
            text: "Noted — folded into the spec above. Hit approve whenever you're ready and we start writing.",
          },
        },
      ]);
    } else if (busy) {
      // a step is mid-flight — queue the steer instead of colliding loops
      pendingSteer.current += 1;
      push({ role: "system", text: "queued — folds in when this step lands" });
    } else {
      setRunStatus("building");
      runSteps(
        [
          { kind: "typing", agent: "coder", ms: 1000 },
          { kind: "msg", msg: STEER_REPLIES[0] },
          { kind: "typing", agent: "reviewer", ms: 900 },
          { kind: "msg", msg: STEER_REPLIES[1] },
          {
            kind: "msg",
            msg: { role: "system", text: "steer applied — preview updated on the right" },
          },
        ],
        () => {
          setRunStatus("passed");
          flushSteer();
        },
      );
    }
  };

  const flushSteer = () => {
    // Steers only enter this queue after approval, so avoid a stale state closure.
    if (pendingSteer.current === 0) return;
    pendingSteer.current = 0;
    setRunStatus("building");
    runSteps(
      [
        { kind: "typing", agent: "coder", ms: 1000 },
        { kind: "msg", msg: STEER_REPLIES[0] },
        { kind: "typing", agent: "reviewer", ms: 900 },
        { kind: "msg", msg: STEER_REPLIES[1] },
        {
          kind: "msg",
          msg: { role: "system", text: "queued steer applied — preview updated" },
        },
      ],
      () => setRunStatus("passed"),
    );
  };

  const approve = () => {
    if (approved || busy) return;
    setApproved(true);
    setRunStatus("building");
    push({ role: "system", text: "spec approved — coder + reviewer loop started" });
    runSteps(BUILD_SCRIPT, () => {
      setRunStatus("passed");
      flushSteer();
    });
  };

  const stop = () => {
    runToken.current += 1;
    setTyping(null);
    setBusy(false);
    if (approved) {
      setRunStatus("paused");
      setPausedMid(true);
      push({ role: "system", text: "paused by you — checkpoint saved, nothing lost" });
    } else {
      push({ role: "system", text: "stopped — say the word and we pick it back up" });
    }
  };

  const resume = () => {
    setRunStatus("building");
    setPausedMid(false);
    push({ role: "system", text: "resumed — picking up from the checkpoint" });
    runSteps([
      { kind: "typing", agent: "reviewer", ms: 1000 },
      {
        kind: "msg",
        msg: {
          role: "agent",
          agent: "reviewer",
          text: "Checkpoint verified — all prior files still green. Coder, finish it.",
        },
      },
      { kind: "typing", agent: "coder", ms: 1100 },
      {
        kind: "msg",
        msg: {
          role: "agent",
          agent: "coder",
          text: "Done — remaining files written, build passing.",
        },
      },
      {
        kind: "msg",
        msg: { role: "system", text: "run #43 complete — 9 files · 0 errors · preview updated" },
      },
    ], () => {
      setRunStatus("passed");
      flushSteer();
    });
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("copied to clipboard");
    } catch {
      notify("copy blocked by browser");
    }
  };

  const attach = async (file: File) => {
    const kb = Math.max(1, Math.round(file.size / 1024));
    const isText = file.type.startsWith("text/") || /\.(tsx?|jsx?|css|json|md|txt)$/i.test(file.name);
    let code: ChatMsg["code"];
    if (isText && file.size <= 100_000) {
      try {
        const body = (await file.text()).slice(0, 1800);
        code = { file: file.name, body };
      } catch {
        /* The attachment can still be represented without a preview. */
      }
    }
    push({
      role: "user",
      text: `Attached ${file.name} (${kb} KB)`,
      code,
    });
    pushLog("info", `attachment added: ${file.name} (${kb} KB)`);
    notify(`${file.name} attached`);
  };

  const autogrow = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  /* ---------- render helpers ---------- */

  const renderMsg = (m: ChatMsg) => {
    if (m.role === "system") {
      return (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex justify-center px-4 pt-1"
        >
          <span className="rounded-full border hairline bg-coal/70 px-3.5 py-1.5 text-center font-mono text-[9.5px] leading-relaxed tracking-[0.04em] text-faint">
            {m.text}
          </span>
        </motion.div>
      );
    }

    if (m.role === "user") {
      return (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex justify-end px-4"
        >
          <div className="max-w-[85%] rounded-2xl rounded-br-md border border-volt/25 bg-volt/[0.07] px-4 py-2.5 text-[13.5px] leading-relaxed text-bone">
            {m.text}
            {m.code && (
              <pre className="mt-2.5 max-h-36 overflow-auto rounded-lg border border-volt/15 bg-coal/70 p-3 font-mono text-[10.5px] leading-relaxed text-bone/75 whitespace-pre-wrap">
                {m.code.body}
              </pre>
            )}
          </div>
        </motion.div>
      );
    }

    const meta = AGENT_META[m.agent ?? "coder"];
    return (
      <motion.div
        key={m.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="px-4"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border hairline bg-coal">
            <meta.icon className={cn("h-3 w-3", meta.tone)} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">{meta.label}</span>
          <span className="font-mono text-[9px] text-faint">{m.time}</span>
        </div>
        <div className="mt-1.5 ml-8 max-w-[92%] rounded-2xl rounded-tl-md border hairline bg-panel-2 px-4 py-3 text-[13.5px] leading-relaxed text-bone/85">
          {m.text}
          {m.code && (
            <div className="mt-2.5 overflow-hidden rounded-lg border hairline bg-coal">
              <div className="flex items-center justify-between border-b hairline px-3 py-1.5">
                <span className="font-mono text-[9.5px] text-mute">{m.code.file}</span>
                <button
                  onClick={() => copy(m.code!.body)}
                  className="flex items-center gap-1 font-mono text-[9px] text-faint transition-colors hover:text-volt"
                >
                  <Copy className="h-2.5 w-2.5" /> copy
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[10.5px] leading-relaxed text-bone/80 whitespace-pre">
                {m.code.body}
              </pre>
            </div>
          )}
          {m.edit && <EditChip edit={m.edit} />}
          {m.spec && (
            <div className="mt-3 rounded-xl border border-volt/20 bg-coal/60 p-3.5">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[9px] tracking-[0.2em] text-faint uppercase">locked spec</p>
                <p className="font-mono text-[10px] text-volt">
                  {SPEC.files} files · {SPEC.cost} · {SPEC.time}
                </p>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {SPEC.rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 font-mono text-[10.5px]">
                    <span className="text-faint">{k}</span>
                    <span className="truncate text-bone/85">{v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={approve}
                disabled={approved}
                className={cn(
                  "mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-mono text-[11px] font-medium transition-all duration-300",
                  approved
                    ? "border border-volt/30 bg-volt/[0.08] text-volt"
                    : "bg-volt text-coal hover:scale-[1.01] active:scale-[0.99]",
                )}
              >
                {approved ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> approved — loop running
                  </>
                ) : (
                  "Approve spec & start build"
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* thread */}
      <div ref={listRef} onScroll={onScroll} data-lenis-prevent className="relative min-h-0 flex-1 space-y-4 overflow-y-auto py-5">
        {messages.map(renderMsg)}
        {typing && (
          <div className="px-4">
            <TypingDots agent={typing} />
          </div>
        )}

        <AnimatePresence>
          {jump && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={jumpDown}
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border hairline bg-panel-2/95 px-3.5 py-1.5 font-mono text-[10px] text-mute shadow-lg backdrop-blur transition-colors hover:text-volt"
            >
              <ArrowDown className="h-3 w-3" /> latest
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* quick chips (pre-spec) */}
      {!specShown && !busy && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 rounded-full border hairline px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-mute transition-colors duration-200 hover:border-volt/30 hover:text-volt"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* resume (after manual stop) */}
      {pausedMid && (
        <div className="px-4 pb-2">
          <button
            onClick={resume}
            className="w-full rounded-xl border border-[#e9b872]/30 bg-[#e9b872]/[0.06] px-3 py-2.5 font-mono text-[11px] text-[#e9b872] transition-colors hover:bg-[#e9b872]/[0.1]"
          >
            resume from checkpoint
          </button>
        </div>
      )}

      {/* composer */}
      <div className="border-t hairline p-3.5">
        <div
          className={cn(
            "rounded-xl border bg-coal/70 transition-colors duration-300",
            "focus-within:border-volt/40",
            "border-bone/10",
          )}
        >
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autogrow();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder={approved ? "steer the build — it folds in live…" : "answer, or ask anything…"}
            className="max-h-[140px] w-full resize-none bg-transparent px-3.5 pt-3 pb-1 text-[13.5px] leading-relaxed text-bone outline-none placeholder:text-faint"
          />
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".ts,.tsx,.js,.jsx,.css,.json,.md,.txt,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void attach(file);
                e.currentTarget.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-md p-1.5 text-faint transition-colors hover:bg-bone/[0.05] hover:text-bone"
              aria-label="Attach a reference file"
              title="Attach a reference file"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            <ModelPicker />
            <div className="ml-auto flex items-center gap-2">
              {busy && (
                <button
                  onClick={stop}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e9b872]/40 px-3 py-1.5 font-mono text-[10.5px] text-[#e9b872] transition-colors hover:bg-[#e9b872]/[0.08]"
                >
                  <Square className="h-2.5 w-2.5 fill-current" /> stop
                </button>
              )}
              <button
                onClick={() => send(draft)}
                disabled={!draft.trim() || !!typing}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                  draft.trim() && !typing
                    ? "bg-volt text-coal hover:scale-105 active:scale-95"
                    : "border hairline text-faint",
                )}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-[8.5px] tracking-[0.08em] text-faint">
          enter to send · shift+enter for a new line · running on {model}
        </p>
      </div>
    </div>
  );
}
