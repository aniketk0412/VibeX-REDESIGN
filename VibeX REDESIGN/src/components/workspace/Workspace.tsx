import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight, Eye, GitBranch, MessagesSquare, MonitorPlay, PanelLeft, Share2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fmtTokens } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE, Logomark } from "../ui";
import ChatPanel from "./ChatPanel";
import StagePanel from "./StagePanel";
import { WorkspaceProvider, useWorkspace } from "./store";

const SPLIT_KEY = "vibex:split";
const DEFAULT_SPLIT = 38;
const MIN_SPLIT = 26;
const MAX_SPLIT = 58;
/** Dragging the handle past this point pushes the chat panel closed. */
const COLLAPSE_AT = 19;

type Toast = { id: number; msg: string };
type MobileTab = "chat" | "stage";

function BuildStateBadge() {
  const { runStatus } = useWorkspace();
  const label = runStatus === "idle" ? "ready" : runStatus;
  const tone = runStatus === "paused" ? "text-[#e9b872] border-[#e9b872]/25 bg-[#e9b872]/[0.06]" : "text-volt border-volt/25 bg-volt/[0.06]";
  return (
    <span className={cn("hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] uppercase md:flex", tone)}>
      <span className={cn("h-1 w-1 rounded-full", runStatus === "paused" ? "bg-[#e9b872]" : "bg-volt", runStatus === "building" && "animate-pulse-dot")} />
      {label}
    </span>
  );
}

function ChangeStatus() {
  const { totals } = useWorkspace();
  if (!totals.files) return <span className="hidden sm:inline">no local changes</span>;
  return (
    <span className="hidden items-center gap-1.5 sm:flex">
      <span>{totals.files} changed</span>
      <span className="text-volt">+{totals.added}</span>
      <span className="text-[#ff8a8a]">-{totals.removed}</span>
    </span>
  );
}

/* ================= status bar bits ================= */

function useElapsed() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function useTokens() {
  const [t, setT] = useState(18_400);
  useEffect(() => {
    const i = setInterval(() => {
      setT((v) => (v >= 26_900 ? 18_400 : v + Math.floor(Math.random() * 160) + 40));
    }, 2000);
    return () => clearInterval(i);
  }, []);
  return t;
}

/* ================= workspace ================= */

export default function Workspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startPct: number } | null>(null);
  const toastId = useRef(0);
  const toastTimers = useRef<number[]>([]);

  const [idea] = useState<string | null>(() => {
    try {
      const v = sessionStorage.getItem("vibex:idea");
      return v && v.trim() ? v : null;
    } catch {
      return null;
    }
  });
  const [project] = useState(() => {
    try {
      return sessionStorage.getItem("vibex:project") || "habitly";
    } catch {
      return "habitly";
    }
  });
  const [target] = useState(() => {
    try {
      return sessionStorage.getItem("vibex:target") || "web";
    } catch {
      return "web";
    }
  });

  const [split, setSplit] = useState<number>(() => {
    try {
      const v = parseFloat(localStorage.getItem(SPLIT_KEY) ?? "");
      return Number.isFinite(v) ? Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, v)) : DEFAULT_SPLIT;
    } catch {
      return DEFAULT_SPLIT;
    }
  });
  const [dragging, setDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const elapsed = useElapsed();
  const tokens = useTokens();
  const { user } = useAuth();

  /* Persist the latest value, including pointer drags that finish between renders. */
  useEffect(() => {
    try {
      localStorage.setItem(SPLIT_KEY, String(split));
    } catch {
      /* Layout persistence is optional. */
    }
  }, [split]);

  const notify = useCallback((msg: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, msg }]);
    toastTimers.current.push(
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600),
    );
  }, []);

  useEffect(() => () => toastTimers.current.forEach(window.clearTimeout), []);

  /* ---------- drag logic ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startPct: collapsed ? 0 : split };
    setDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = containerRef.current;
    if (!d || !el) return;
    const w = el.getBoundingClientRect().width;
    if (w <= 0) return;
    const raw = d.startPct + ((e.clientX - d.startX) / w) * 100;

    // Push the panel shut when dragged past the collapse point, and pull it
    // back open as soon as the handle clears that point again.
    if (raw < COLLAPSE_AT) {
      if (!collapsed) setCollapsed(true);
      return;
    }
    if (collapsed) setCollapsed(false);
    setSplit(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, raw)));
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  const onHandleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const goingRight = e.key === "ArrowRight";
      if (collapsed) {
        if (goingRight) {
          setCollapsed(false);
          setSplit(MIN_SPLIT);
        }
        return;
      }
      if (!goingRight && split <= MIN_SPLIT) {
        setCollapsed(true);
        return;
      }
      setSplit((s) => Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, s + (goingRight ? 2 : -2))));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      setCollapsed(false);
      setSplit(DEFAULT_SPLIT);
      notify("layout reset");
    }
  };

  return (
    <WorkspaceProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-coal text-bone">
      {/* ---------- top bar ---------- */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b hairline bg-panel/80 px-3 backdrop-blur-xl sm:px-4">
        <a
          href="#/app"
          className="flex h-8 w-8 items-center justify-center rounded-lg border hairline text-mute transition-colors hover:border-bone/20 hover:text-bone"
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </a>
        <Logomark className="hidden h-5 w-5 sm:block" />
        <div className="leading-tight">
          <p className="max-w-[150px] truncate font-display text-[15px] font-medium tracking-tight">{project}</p>
          <p className="hidden font-mono text-[9px] text-faint sm:block">run #43 · {target}</p>
        </div>
        <BuildStateBadge />

        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] transition-colors lg:flex",
            collapsed ? "border-volt/30 bg-volt/[0.06] text-volt" : "hairline text-mute hover:text-bone",
          )}
          title={collapsed ? "Show chat panel" : "Hide chat panel"}
        >
          <PanelLeft className="h-3.5 w-3.5" />
          chat
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`https://vibex.app/share/${project}-r43`);
                notify("share link copied");
              } catch {
                notify("copy blocked by browser");
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border hairline px-3 py-2 font-mono text-[10.5px] text-mute transition-colors hover:border-bone/20 hover:text-bone"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">share</span>
          </button>
          <a
            href="#/app/settings"
            title="Account"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-volt to-[#8ad4ff] font-mono text-[10px] font-semibold text-coal transition-transform hover:scale-105"
          >
            {user?.initials ?? "VX"}
          </a>
        </div>
      </header>

      {/* ---------- mobile tab switcher ---------- */}
      <div className="flex shrink-0 gap-1.5 border-b hairline bg-panel/60 px-3 py-2 lg:hidden">
        {(
          [
            { k: "chat", label: "Chat", icon: MessagesSquare },
            { k: "stage", label: "Preview & code", icon: MonitorPlay },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setMobileTab(t.k)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] transition-colors",
              mobileTab === t.k ? "bg-volt/[0.1] text-volt" : "text-faint",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- split body ---------- */}
      <div ref={containerRef} className="flex min-h-0 flex-1">
        {/* left: chat */}
        <section
          aria-label="Build chat"
          style={{ "--chat-width": `${split}%` } as React.CSSProperties}
          className={cn(
            "min-h-0 shrink-0 flex-col border-r border-bone/[0.14] bg-[#131317] shadow-[8px_0_24px_-16px_rgb(0_0_0/0.9)]",
            mobileTab === "chat" ? "flex w-full border-r-0" : "hidden",
            collapsed ? "lg:hidden" : "lg:flex lg:w-[var(--chat-width)] lg:border-r",
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b hairline px-4 py-2.5">
            <MessagesSquare className="h-3.5 w-3.5 text-volt" />
            <span className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">build chat</span>
            <span className="ml-auto flex items-center gap-1 font-mono text-[9px] text-faint">
              <Eye className="h-3 w-3" /> you + 2 agents
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel initialIdea={idea} projectName={project} notify={notify} />
          </div>
        </section>

        {/* drag handle — stays mounted while collapsed so it can be pulled back out */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={collapsed ? "Expand chat panel" : "Resize panels"}
          aria-valuenow={collapsed ? 0 : Math.round(split)}
          tabIndex={0}
          onKeyDown={onHandleKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => {
            setCollapsed(false);
            setSplit(DEFAULT_SPLIT);
            notify("layout reset");
          }}
          title={collapsed ? "Drag right or double-click to reopen chat" : "Drag to resize · drag fully left to collapse · double-click to reset"}
          className={cn(
            "group relative hidden shrink-0 cursor-col-resize touch-none items-center justify-center outline-none focus-visible:bg-volt/20 lg:flex",
            collapsed ? "w-4 border-r hairline bg-panel/60" : "w-2",
          )}
        >
          {collapsed ? (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                dragging ? "text-volt" : "text-faint group-hover:text-volt",
              )}
            />
          ) : (
            <span
              className={cn(
                "rounded-full transition-all duration-200",
                dragging ? "h-16 w-[3px] bg-volt" : "h-10 w-[3px] bg-bone/10 group-hover:h-14 group-hover:bg-volt/60",
              )}
            />
          )}
        </div>

        {/* right: stage */}
        <section
          aria-label="Preview and code"
          className={cn("min-h-0 min-w-0 flex-1 flex-col", mobileTab === "stage" ? "flex" : "hidden lg:flex")}
        >
          <StagePanel projectName={project} notify={notify} />
        </section>
      </div>

      {/* ---------- status bar ---------- */}
      <footer className="flex h-8 shrink-0 items-center gap-4 border-t hairline bg-panel/80 px-3 font-mono text-[9.5px] text-faint sm:px-4">
        <span className="flex items-center gap-1.5">
          <GitBranch className="h-3 w-3" /> main
        </span>
        <ChangeStatus />
        <span className="hidden items-center gap-1.5 md:flex">
          <Check className="h-3 w-3 text-volt" /> synced
        </span>
        <span className="ml-auto tabular-nums">{fmtTokens(tokens)} tokens</span>
        <span className="hidden tabular-nums sm:inline">est. ${(tokens * 0.0000075).toFixed(2)}</span>
        <span className="tabular-nums">{elapsed}</span>
      </footer>

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed bottom-12 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-2 rounded-full border border-volt/25 bg-panel-2/95 px-4 py-2 font-mono text-[11px] text-bone shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur"
            >
              <Check className="h-3 w-3 text-volt" />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </div>
    </WorkspaceProvider>
  );
}
