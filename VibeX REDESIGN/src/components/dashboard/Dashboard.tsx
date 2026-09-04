import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EASE } from "../ui";
import Analytics from "./Analytics";
import { MobileDrawer, Sidebar, TopBar, type NavKey } from "./Chrome";
import CommandPalette from "./CommandPalette";
import CommandBar from "./CommandBar";
import LiveRun from "./LiveRun";
import {
  ActivityPage, BuildsPage, DeploysPage, KeysPage, SettingsPage, UsagePage,
} from "./Pages";
import Projects from "./Projects";
import { ActivityFeed, UsagePanel } from "./SidePanels";
import Stats from "./Stats";

type Toast = { id: number; msg: string };

function Section({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.05 + i * 0.06, ease: EASE }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ---------------- overview ---------------- */

function Overview({ notify }: { notify: (m: string) => void }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Section i={0}><CommandBar /></Section>
      <Section i={1}><LiveRun /></Section>
      <Section i={2}><Stats /></Section>
      <Section i={3}><Projects notify={notify} /></Section>
      <div className="grid items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Section i={4}><ActivityFeed /></Section>
        <Section i={5}><UsagePanel /></Section>
      </div>
    </div>
  );
}

/* ---------------- shell ---------------- */

const HASH_FOR: Partial<Record<NavKey, string>> = {
  overview: "#/app",
  analytics: "#/app/analytics",
  builds: "#/app/builds",
  deploys: "#/app/deploys",
  activity: "#/app/activity",
  usage: "#/app/usage",
  keys: "#/app/keys",
  settings: "#/app/settings",
};

function keyFromHash(): NavKey {
  const h = window.location.hash.replace("#/app", "").replace(/^\//, "");
  const known: NavKey[] = ["overview", "analytics", "builds", "deploys", "activity", "usage", "keys", "settings"];
  return (known.find((k) => k === h) ?? "overview") as NavKey;
}

export default function Dashboard() {
  const [active, setActive] = useState<NavKey>(keyFromHash);
  const [menu, setMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const toastTimers = useRef<number[]>([]);

  /* keep tab in sync with the url (back/forward friendly) */
  useEffect(() => {
    const onHash = () => setActive(keyFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => () => toastTimers.current.forEach(window.clearTimeout), []);

  const select = useCallback((k: NavKey) => {
    setActive(k);
    const target = HASH_FOR[k] ?? "#/app";
    if (window.location.hash !== target) window.location.hash = target;
  }, []);

  const notify = useCallback((msg: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, msg }]);
    toastTimers.current.push(
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600),
    );
  }, []);

  const page = (() => {
    switch (active) {
      case "analytics": return <Analytics />;
      case "builds": return <BuildsPage />;
      case "deploys": return <DeploysPage notify={notify} />;
      case "activity": return <ActivityPage />;
      case "usage": return <UsagePage />;
      case "keys": return <KeysPage notify={notify} />;
      case "settings": return <SettingsPage notify={notify} />;
      default: return <Overview notify={notify} />;
    }
  })();

  return (
    <div className="min-h-screen bg-coal text-bone">
      <Sidebar active={active} onSelect={select} />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} active={active} onSelect={select} />
      <CommandPalette />

      <div className="lg:pl-[248px]">
        <TopBar onMenu={() => setMenu(true)} active={active} />

        <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {page}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-8 border-t hairline pt-6 pb-4 text-center">
            <p className="font-mono text-[10.5px] tracking-[0.16em] text-faint uppercase">
              vibex beta · describe once, ship working — the reviewer never sleeps
            </p>
          </footer>
        </main>
      </div>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-2 rounded-full border border-volt/25 bg-panel-2/95 px-4 py-2 font-mono text-[11.5px] text-bone shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur"
            >
              <Check className="h-3 w-3 text-volt" />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
