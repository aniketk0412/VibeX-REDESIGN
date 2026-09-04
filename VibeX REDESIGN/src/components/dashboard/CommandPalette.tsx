import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BarChart3, Boxes, Gauge, KeyRound, LayoutDashboard,
  Plus, Rocket, Search, Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";

type Item = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: typeof Search;
  keywords?: string;
};

const BASE: Item[] = [
  { id: "new", label: "Start a new build", hint: "Create", href: "#/app/new", icon: Plus, keywords: "prompt idea app" },
  { id: "overview", label: "Overview", hint: "Page", href: "#/app", icon: LayoutDashboard },
  { id: "builds", label: "Builds", hint: "Page", href: "#/app/builds", icon: Boxes },
  { id: "deploys", label: "Deploys", hint: "Page", href: "#/app/deploys", icon: Rocket },
  { id: "analytics", label: "Analytics", hint: "Page", href: "#/app/analytics", icon: BarChart3, keywords: "traffic visitors tracking" },
  { id: "activity", label: "Activity", hint: "Page", href: "#/app/activity", icon: Activity },
  { id: "usage", label: "Usage and plan", hint: "Page", href: "#/app/usage", icon: Gauge, keywords: "tokens billing" },
  { id: "keys", label: "API keys", hint: "Page", href: "#/app/keys", icon: KeyRound },
  { id: "settings", label: "Settings", hint: "Page", href: "#/app/settings", icon: Settings },
  ...PROJECTS.map<Item>((p) => ({
    id: `project-${p.id}`,
    label: p.name,
    hint: "Project",
    href: "#/app/new",
    icon: Boxes,
    keywords: `${p.prompt} ${p.stack.join(" ")}`,
  })),
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BASE;
    return BASE.filter((item) =>
      `${item.label} ${item.hint} ${item.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const run = (item?: Item) => {
    if (!item) return;
    close();
    window.location.hash = item.href;
  };

  useEffect(() => {
    const show = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("vibex:cmdk", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("vibex:cmdk", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/65 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-bone/15 bg-panel-2 shadow-[0_30px_100px_-20px_rgb(0_0_0/0.95)]"
          >
            <div className="flex items-center gap-3 border-b hairline px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-volt" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => results.length ? Math.min(results.length - 1, i + 1) : 0);
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  }
                  if (e.key === "Enter") run(results[active]);
                }}
                placeholder="Search pages, projects, or start a build"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-bone outline-none placeholder:text-faint"
              />
              <span className="rounded-md border hairline px-2 py-1 font-mono text-[10px] text-faint">Esc</span>
            </div>

            <div data-lenis-prevent className="max-h-[420px] overflow-y-auto p-2">
              {results.length ? (
                results.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === active ? "bg-volt/[0.09]" : "hover:bg-bone/[0.035]",
                      )}
                    >
                      <span className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        i === active ? "border-volt/30 bg-volt/[0.06] text-volt" : "hairline text-faint",
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-bone/90">{item.label}</span>
                      <span className="font-mono text-[10.5px] text-faint">{item.hint}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-[14px] text-bone/80">No match for "{query}"</p>
                  <button
                    onClick={() => run(BASE[0])}
                    className="mt-3 font-mono text-[11.5px] text-volt"
                  >
                    Start a new build instead
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 border-t hairline px-4 py-2.5 font-mono text-[10px] text-faint">
              <span>Up/Down navigate</span>
              <span>Enter open</span>
              <span className="ml-auto">Cmd/Ctrl K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}