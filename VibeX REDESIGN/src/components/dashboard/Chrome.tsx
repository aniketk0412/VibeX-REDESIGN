import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, Bell, Boxes, ChartLine, Check, ChevronsUpDown, Gauge, KeyRound,
  LayoutDashboard, LogOut, Menu, Plus, Rocket, Search, Settings, TriangleAlert, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useResetClock } from "../../hooks/useResetClock";
import { USAGE } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE, Logomark } from "../ui";

/* ============================ nav model ============================ */

const NAV = [
  {
    section: "build",
    items: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "builds", label: "Builds", icon: Boxes, count: 7 },
      { key: "deploys", label: "Deploys", icon: Rocket, count: 5 },
      { key: "analytics", label: "Analytics", icon: ChartLine },
      { key: "activity", label: "Activity", icon: Activity },
    ],
  },
  {
    section: "account",
    items: [
      { key: "usage", label: "Usage & plan", icon: Gauge },
      { key: "keys", label: "API keys", icon: KeyRound },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export type NavKey = (typeof NAV)[number]["items"][number]["key"];

/* ============================ sidebar body ============================ */

function SidebarBody({
  active,
  onSelect,
  variant,
}: {
  active: NavKey;
  onSelect: (k: NavKey) => void;
  variant: "desktop" | "mobile";
}) {
  const { clock } = useResetClock();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* logo + workspace */}
      <div className="p-4">
        <a href="#/" className="group flex items-center gap-2.5">
          <Logomark className="h-6 w-6 transition-transform duration-500 group-hover:rotate-[360deg]" />
          <span className="font-display text-[17px] font-medium tracking-tight">vibex</span>
          <span className="rounded-full border border-volt/25 bg-volt/[0.07] px-2 py-0.5 font-mono text-[8.5px] tracking-[0.14em] text-volt uppercase">
            beta
          </span>
        </a>

        <a
          href="#/app/new"
          onClick={() => {
            try {
              sessionStorage.removeItem("vibex:idea");
              sessionStorage.setItem("vibex:project", "new-project");
            } catch {
              /* The room still opens. */
            }
          }}
          className="group/btn mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-volt px-3 py-2.5 text-[13.5px] font-medium text-coal transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-90" />
          New build
        </a>

        <a
          href="#/app/settings"
          title="Workspace settings"
          className="mt-4 flex w-full items-center gap-2.5 rounded-xl border hairline bg-coal/60 px-3 py-2.5 text-left transition-colors duration-300 hover:border-bone/20"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-volt font-mono text-[10px] font-semibold text-coal">
            {(user?.name ?? "V")[0].toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-bone/85">
            {(user?.name ?? "your").split(" ")[0].toLowerCase()}'s workspace
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-faint" />
        </a>
      </div>

      {/* nav — data-lenis-prevent keeps smooth-scroll from stealing wheel events */}
      <nav data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.section} className="mt-4 first:mt-1">
            <p className="px-2.5 pb-2 font-mono text-[9px] tracking-[0.24em] text-faint uppercase">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors duration-200",
                      isActive ? "text-bone" : "text-mute hover:text-bone",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`nav-active-${variant}`}
                        className="absolute inset-0 rounded-lg border border-volt/20 bg-volt/[0.06]"
                        transition={{ duration: 0.35, ease: EASE }}
                      />
                    )}
                    <Icon
                      className={cn("relative h-4 w-4", isActive ? "text-volt" : "text-faint group-hover:text-mute")}
                      strokeWidth={1.7}
                    />
                    <span className="relative flex-1 text-left">{item.label}</span>
                    {"count" in item && item.count !== undefined && (
                      <span className="relative rounded-md border hairline px-1.5 py-0.5 font-mono text-[9.5px] text-faint">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* window meter + user */}
      <div className="border-t hairline p-4">
        <div className="rounded-xl border hairline bg-coal/60 p-3.5">
          <div className="flex items-baseline justify-between font-mono text-[9px] tracking-[0.16em] uppercase">
            <span className="text-faint">5-hour window</span>
            <span className="text-volt tabular-nums">{USAGE.window.pct}%</span>
          </div>
          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-bone/[0.07]">
            <div className="h-full rounded-full bg-volt/85" style={{ width: `${USAGE.window.pct}%` }} />
          </div>
          <p className="mt-2 font-mono text-[9px] text-faint">
            resets in <span className="text-mute tabular-nums">{clock}</span>
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2.5 px-1 pt-1">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-volt to-[#8ad4ff] font-mono text-[10px] font-semibold text-coal">
            {user?.initials ?? "VX"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] text-bone/90">{user?.name ?? "guest"}</p>
            <p className="font-mono text-[9px] text-faint">{user?.plan ?? "free"} plan</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-bone/[0.05] hover:text-[#ff8a8a]"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ desktop sidebar ============================ */

export function Sidebar({ active, onSelect }: { active: NavKey; onSelect: (k: NavKey) => void }) {
  return (
    <aside
      data-lenis-prevent
      className="fixed inset-y-0 left-0 z-40 hidden w-[248px] overflow-y-auto overscroll-contain border-r hairline bg-panel lg:block"
    >
      <SidebarBody active={active} onSelect={onSelect} variant="desktop" />
    </aside>
  );
}

/* ============================ mobile drawer ============================ */

export function MobileDrawer({
  open,
  onClose,
  active,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  active: NavKey;
  onSelect: (k: NavKey) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <motion.div
            data-lenis-prevent
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-y-0 left-0 w-[288px] overflow-y-auto overscroll-contain border-r hairline bg-panel"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-md p-1.5 text-mute hover:bg-bone/[0.05] hover:text-bone"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody
              active={active}
              onSelect={(k) => {
                onSelect(k);
                onClose();
              }}
              variant="mobile"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ============================ notifications ============================ */

const NOTIFS = [
  { icon: Check, tone: "text-volt", title: "run #42 passed", sub: "habitly · 0 errors · $0.38", time: "4m", href: "#/app/builds" },
  { icon: Rocket, tone: "text-volt", title: "deploy live", sub: "pulseboard.vibex.app", time: "3h", href: "#/app/deploys" },
  { icon: TriangleAlert, tone: "text-[#e9b872]", title: "window reset soon", sub: "builds auto-resume · nothing lost", time: "5h", href: "#/app/usage" },
];

function Notifications() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-300",
          open ? "border-volt/30 bg-volt/[0.06] text-volt" : "hairline text-mute hover:text-bone",
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {!read && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-volt" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute right-0 top-11 z-50 w-[300px] overflow-hidden rounded-xl border hairline bg-panel-2 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]"
          >
            <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">notifications</span>
              <button
                onClick={() => setRead((v) => !v)}
                className="font-mono text-[9.5px] text-mute transition-colors hover:text-volt"
              >
                {read ? "show updates" : "mark all read"}
              </button>
            </div>
            {read ? (
              <div className="px-4 py-8 text-center">
                <Check className="mx-auto h-4 w-4 text-volt" />
                <p className="mt-2 text-[12.5px] text-bone/80">You are all caught up.</p>
              </div>
            ) : NOTIFS.map((n) => (
              <a
                href={n.href}
                onClick={() => setOpen(false)}
                key={n.title}
                className="flex items-start gap-3 border-b hairline px-4 py-3 last:border-0 hover:bg-bone/[0.025]"
              >
                <n.icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", n.tone)} />
                <div className="flex-1">
                  <p className="text-[12.5px] text-bone/90">{n.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-faint">{n.sub}</p>
                </div>
                <span className="font-mono text-[9.5px] text-faint">{n.time}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================ top bar ============================ */

export function TopBar({ onMenu, active }: { onMenu: () => void; active: NavKey }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b hairline bg-coal/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg border hairline text-bone lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <nav className="flex items-center gap-2 font-mono text-[11.5px]">
        <a href="#/" className="text-faint transition-colors hover:text-mute">vibex</a>
        <span className="text-faint">/</span>
        <span className="text-bone/90">{active}</span>
      </nav>

      <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-volt/25 bg-volt/[0.06] px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-volt uppercase md:flex">
        <span className="h-1 w-1 rounded-full bg-volt animate-pulse-dot" />
        run #43 live
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("vibex:cmdk"))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border hairline text-mute transition-colors hover:border-bone/20 hover:text-bone sm:hidden"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("vibex:cmdk"))}
          className="group hidden items-center gap-2.5 rounded-lg border hairline px-3 py-2 transition-colors duration-300 hover:border-bone/20 sm:flex"
        >
          <Search className="h-3.5 w-3.5 text-faint" />
          <span className="font-mono text-[11px] text-faint group-hover:text-mute">search or describe…</span>
          <span className="rounded border hairline bg-bone/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-faint">
            ⌘K
          </span>
        </button>
        <Notifications />
        <a
          href="#/app/settings"
          aria-label="Account settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-volt to-[#8ad4ff] font-mono text-[10.5px] font-semibold text-coal transition-transform hover:scale-105 lg:hidden"
        >
          {user?.initials ?? "VX"}
        </a>
      </div>
    </header>
  );
}
