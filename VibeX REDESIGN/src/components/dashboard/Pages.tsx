import { motion } from "framer-motion";
import {
  ArrowUpRight, Copy, Eye, EyeOff, KeyRound, Loader2,
  Plus, RotateCcw, Trash2, TriangleAlert, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { BUILDS, DEPLOYS, KEYS, type BuildRow, type DeployRow } from "../../lib/appdata";
import { ACTIVITY } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";
import { ActivityFeed, UsagePanel } from "./SidePanels";

/* ---------------- shared bits ---------------- */

export function PageHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight sm:text-[32px]">{title}</h1>
        <p className="mt-1 text-[14px] text-mute">{sub}</p>
      </div>
      {right}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border hairline bg-panel", className)}>{children}</div>;
}

const STATUS_TONE: Record<string, string> = {
  passed: "text-volt border-volt/30 bg-volt/[0.07]",
  ready: "text-volt border-volt/30 bg-volt/[0.07]",
  building: "text-[#8ad4ff] border-[#8ad4ff]/30 bg-[#8ad4ff]/[0.07]",
  paused: "text-[#e9b872] border-[#e9b872]/30 bg-[#e9b872]/[0.07]",
  failed: "text-[#ff8a8a] border-[#ff8a8a]/30 bg-[#ff8a8a]/[0.07]",
  error: "text-[#ff8a8a] border-[#ff8a8a]/30 bg-[#ff8a8a]/[0.07]",
};

function Pill({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] uppercase", STATUS_TONE[status])}>
      {status}
    </span>
  );
}

function Row({ children, i }: { children: React.ReactNode; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- builds ---------------- */

export function BuildsPage() {
  const [filter, setFilter] = useState<"all" | BuildRow["status"]>("all");
  const rows = BUILDS.filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="space-y-5">
      <PageHead
        title="Builds"
        sub="Every run the loop has taken, with what it wrote and what it caught."
        right={
          <a href="#/app/new" className="flex items-center gap-1.5 rounded-xl bg-volt px-4 py-2.5 text-[13.5px] font-medium text-coal transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" /> New build
          </a>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(["all", "building", "passed", "paused", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors",
              filter === f ? "border-volt/40 bg-volt/[0.08] text-volt" : "hairline text-mute hover:text-bone",
            )}
          >
            {f}
            <span className="ml-1.5 text-faint">
              {f === "all" ? BUILDS.length : BUILDS.filter((b) => b.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        {/* header (desktop) */}
        <div className="hidden grid-cols-[1.4fr_.7fr_.9fr_.8fr_.7fr_.7fr_.6fr] gap-3 border-b hairline px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase lg:grid">
          <span>project</span><span>run</span><span>status</span><span>changes</span>
          <span>flags</span><span>cost</span><span>when</span>
        </div>
        {rows.map((b, i) => (
          <Row key={b.id} i={i}>
            <a
              href="#/app/new"
              onClick={() => {
                try {
                  sessionStorage.setItem("vibex:project", b.project);
                  sessionStorage.removeItem("vibex:idea");
                } catch {
                  /* The workspace still opens. */
                }
              }}
              className="grid grid-cols-2 items-center gap-3 border-b hairline px-5 py-3.5 transition-colors last:border-0 hover:bg-bone/[0.025] lg:grid-cols-[1.4fr_.7fr_.9fr_.8fr_.7fr_.7fr_.6fr]"
            >
              <span className="font-display text-[15px] font-medium tracking-tight">{b.project}</span>
              <span className="text-right font-mono text-[11.5px] text-mute lg:text-left">{b.run}</span>
              <span className="col-span-2 lg:col-span-1"><Pill status={b.status} /></span>
              <span className="font-mono text-[11.5px]">
                <span className="text-volt">+{b.added}</span>{" "}
                <span className="text-[#ff8a8a]">-{b.removed}</span>
              </span>
              <span className="text-right font-mono text-[11.5px] text-mute lg:text-left">
                {b.flags} {b.flags === 1 ? "flag" : "flags"}
              </span>
              <span className="font-mono text-[11.5px] text-mute">{b.cost}</span>
              <span className="text-right font-mono text-[11px] text-faint lg:text-left">{b.when}</span>
            </a>
          </Row>
        ))}
        {rows.length === 0 && (
          <p className="px-5 py-10 text-center font-mono text-[12px] text-faint">no builds in this state</p>
        )}
      </Card>
    </div>
  );
}

/* ---------------- deploys ---------------- */

export function DeploysPage({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState<DeployRow[]>(DEPLOYS);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const redeploy = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "building", time: "now" } : r)));
    notify("redeploy started");
    timers.current.push(window.setTimeout(() => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "ready" } : r)));
      notify("deploy is live");
    }, 2000));
  };

  return (
    <div className="space-y-5">
      <PageHead title="Deploys" sub="Where every finished build actually lives on the internet." />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "live deploys", value: rows.filter((r) => r.status === "ready").length },
          { label: "in flight", value: rows.filter((r) => r.status === "building").length },
          { label: "needs attention", value: rows.filter((r) => r.status === "error").length },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">{s.label}</p>
            <p className="mt-2 font-display text-[30px] leading-none font-medium tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        {rows.map((d, i) => (
          <Row key={d.id} i={i}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b hairline px-5 py-4 last:border-0 hover:bg-bone/[0.025]">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", d.status === "ready" ? "bg-volt" : d.status === "building" ? "bg-[#8ad4ff] animate-pulse-dot" : "bg-[#ff8a8a]")} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-bone">{d.url}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-faint">
                  {d.project} · build {d.build} · {d.region} · {d.provider} · {d.time}
                </p>
              </div>
              <span className="rounded-md border hairline px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-mute uppercase">
                {d.env}
              </span>
              <Pill status={d.status} />
              <div className="flex gap-1.5">
                <button
                  onClick={() => redeploy(d.id)}
                  disabled={d.status === "building"}
                  className="flex items-center gap-1.5 rounded-lg border hairline px-2.5 py-1.5 font-mono text-[10.5px] text-mute transition-colors hover:border-volt/30 hover:text-volt disabled:opacity-40"
                >
                  {d.status === "building" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                  redeploy
                </button>
                <a
                  href="#/app/analytics"
                  className="flex items-center gap-1 rounded-lg border hairline px-2.5 py-1.5 font-mono text-[10.5px] text-mute transition-colors hover:border-bone/25 hover:text-bone"
                >
                  stats <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- activity ---------------- */

export function ActivityPage() {
  return (
    <div className="space-y-5">
      <PageHead title="Activity" sub="Everything the agents and you have done, newest first." />
      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ActivityFeed />
        <Card className="p-5">
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">this week</p>
          <div className="mt-4 space-y-3.5">
            {[
              ["files written", "68"],
              ["flags caught", "11"],
              ["auto-fixed", "10"],
              ["needed you", "1"],
              ["deploys", "3"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b hairline pb-3 last:border-0">
                <span className="text-[13.5px] text-mute">{k}</span>
                <span className="font-mono text-[14px] text-bone tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl border border-volt/20 bg-volt/[0.05] p-3.5 font-mono text-[11px] leading-relaxed text-volt">
            91% of issues were fixed without you touching anything.
          </p>
        </Card>
      </div>
      <p className="text-center font-mono text-[10.5px] text-faint">
        showing {ACTIVITY.length} of {ACTIVITY.length} events
      </p>
    </div>
  );
}

/* ---------------- usage ---------------- */

export function UsagePage() {
  const bars = [42, 58, 35, 72, 64, 88, 54, 91, 76, 62, 83, 47];
  return (
    <div className="space-y-5">
      <PageHead title="Usage & plan" sub="Rolling windows, monthly totals, and what it's costing you." />
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.1fr]">
        <UsagePanel />
        <div className="space-y-5">
          <Card className="p-5">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">tokens · last 12 windows</p>
            <div className="mt-5 flex h-32 items-end gap-1.5">
              {bars.map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: EASE }}
                  className={cn("flex-1 rounded-t-[3px]", i === bars.length - 1 ? "bg-volt" : "bg-bone/[0.14]")}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-faint">
              <span>60h ago</span><span>now</span>
            </div>
          </Card>
          <Card className="p-5">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">spend breakdown</p>
            <div className="mt-4 space-y-3">
              {[
                ["coder (sonnet 4.5)", "$14.20", 62],
                ["reviewer (opus 4.5)", "$7.10", 31],
                ["design polish", "$1.60", 7],
              ].map(([label, amt, pct]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-mute">{label}</span>
                    <span className="font-mono text-bone tabular-nums">{amt}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bone/[0.07]">
                    <motion.div
                      className="h-full rounded-full bg-volt/80"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: EASE }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- api keys ---------------- */

export function KeysPage({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem("vibex:keys");
      return saved ? (JSON.parse(saved) as typeof KEYS) : KEYS;
    } catch {
      return KEYS;
    }
  });
  const [revealed, setRevealed] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [provider, setProvider] = useState("anthropic");
  const [value, setValue] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("vibex:keys", JSON.stringify(rows));
    } catch {
      /* Keep the keys available for the current view. */
    }
  }, [rows]);

  const add = () => {
    if (!value.trim()) {
      notify("paste a key first");
      return;
    }
    setRows((prev) => [
      { id: `k${Date.now()}`, provider, masked: `${value.slice(0, 6)}••••••••${value.slice(-4)}`, added: "just now", lastUsed: "—", status: "active" },
      ...prev,
    ]);
    setValue("");
    setAdding(false);
    notify("key encrypted & saved");
  };

  return (
    <div className="space-y-5">
      <PageHead
        title="API keys"
        sub="Bring your own provider keys — encrypted at rest, never sent to the browser."
        right={
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-volt px-4 py-2.5 text-[13.5px] font-medium text-coal transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Cancel" : "Add key"}
          </button>
        }
      />

      {adding && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5">
            <div className="flex flex-wrap gap-3">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="rounded-xl border border-bone/10 bg-coal px-3.5 py-2.5 font-mono text-[12.5px] text-bone outline-none focus:border-volt/40"
              >
                {["anthropic", "openai", "google", "openrouter"].map((p) => (
                  <option key={p} value={p} className="bg-coal">{p}</option>
                ))}
              </select>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="sk-..."
                className="min-w-[200px] flex-1 rounded-xl border border-bone/10 bg-coal px-3.5 py-2.5 font-mono text-[12.5px] text-bone outline-none placeholder:text-faint focus:border-volt/40"
              />
              <button onClick={add} className="rounded-xl bg-volt px-5 py-2.5 font-mono text-[12px] font-medium text-coal">
                save key
              </button>
            </div>
            <p className="mt-3 font-mono text-[10.5px] text-faint">
              demo only — nothing is transmitted or stored server-side.
            </p>
          </Card>
        </motion.div>
      )}

      <Card>
        {rows.map((k, i) => (
          <Row key={k.id} i={i}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b hairline px-5 py-4 last:border-0 hover:bg-bone/[0.025]">
              <KeyRound className="h-4 w-4 shrink-0 text-volt" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] text-bone">{k.provider}</p>
                <p className="mt-0.5 font-mono text-[11px] text-faint">
                  {revealed === k.id ? k.masked.replace(/•/g, "x") : k.masked} · added {k.added} · used {k.lastUsed}
                </p>
              </div>
              <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase", k.status === "active" ? STATUS_TONE.passed : "hairline text-faint")}>
                {k.status}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setRevealed(revealed === k.id ? null : k.id)}
                  className="rounded-lg border hairline p-2 text-mute transition-colors hover:text-bone"
                  aria-label="Reveal"
                >
                  {revealed === k.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(k.masked);
                      notify("key reference copied");
                    } catch {
                      notify("copy blocked by browser");
                    }
                  }}
                  className="rounded-lg border hairline p-2 text-mute transition-colors hover:text-volt"
                  aria-label="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setRows((prev) => prev.filter((r) => r.id !== k.id));
                    notify("key removed");
                  }}
                  className="rounded-lg border hairline p-2 text-mute transition-colors hover:border-[#ff8a8a]/40 hover:text-[#ff8a8a]"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Row>
        ))}
        {rows.length === 0 && (
          <p className="px-5 py-10 text-center font-mono text-[12px] text-faint">
            no keys yet — builds will run on Vibex plan tokens
          </p>
        )}
      </Card>
    </div>
  );
}

/* ---------------- settings ---------------- */

type Preferences = {
  emailOnPass: boolean;
  emailOnFlag: boolean;
  autoPolish: boolean;
  autoDeploy: boolean;
};

export function SettingsPage({ notify }: { notify: (m: string) => void }) {
  const { user, signOut, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggles, setToggles] = useState<Preferences>(() => {
    const defaults: Preferences = {
      emailOnPass: true,
      emailOnFlag: false,
      autoPolish: true,
      autoDeploy: false,
    };
    try {
      const saved = localStorage.getItem("vibex:preferences");
      return saved ? { ...defaults, ...(JSON.parse(saved) as Partial<Preferences>) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vibex:preferences", JSON.stringify(toggles));
    } catch {
      /* Preferences remain active for the current view. */
    }
  }, [toggles]);

  const Toggle = ({ k, label, sub }: { k: keyof typeof toggles; label: string; sub: string }) => (
    <div className="flex items-center justify-between gap-4 border-b hairline py-4 last:border-0">
      <div>
        <p className="text-[13.5px] text-bone">{label}</p>
        <p className="mt-0.5 font-mono text-[10.5px] text-faint">{sub}</p>
      </div>
      <button
        onClick={() => {
          setToggles((t) => ({ ...t, [k]: !t[k] }));
          notify("preference saved");
        }}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          toggles[k] ? "border-volt/40 bg-volt/25" : "border-bone/15 bg-bone/[0.06]",
        )}
        role="switch"
        aria-checked={toggles[k]}
      >
        <motion.span
          className={cn("absolute top-[3px] h-4 w-4 rounded-full", toggles[k] ? "bg-volt" : "bg-bone/40")}
          animate={{ left: toggles[k] ? 24 : 3 }}
          transition={{ duration: 0.25, ease: EASE }}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHead title="Settings" sub="Profile, notifications, and build defaults." />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">profile</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-volt to-[#8ad4ff] font-mono text-[16px] font-semibold text-coal">
              {user?.initials ?? "VX"}
            </span>
            <div>
              <p className="font-display text-[17px] font-medium">{user?.name ?? "guest"}</p>
              <p className="font-mono text-[11px] text-faint">{user?.plan ?? "free"} plan</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-bone/10 bg-coal px-3.5 py-2.5 text-[13.5px] text-bone outline-none focus:border-volt/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-bone/10 bg-coal px-3.5 py-2.5 text-[13.5px] text-bone outline-none focus:border-volt/40"
              />
            </div>
            <button
              onClick={() => {
                if (!name.trim()) {
                  notify("name cannot be empty");
                  return;
                }
                if (!email.includes("@")) {
                  notify("enter a valid email");
                  return;
                }
                updateProfile(name, email);
                notify("profile saved everywhere");
              }}
              className="w-full rounded-xl bg-volt px-4 py-2.5 text-[13.5px] font-medium text-coal transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Save changes
            </button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">notifications & defaults</p>
            <div className="mt-2">
              <Toggle k="emailOnPass" label="Email when a build passes" sub="one message, with the preview link" />
              <Toggle k="emailOnFlag" label="Email on every reviewer flag" sub="noisy — the loop fixes most itself" />
              <Toggle k="autoPolish" label="Automatic design-polish pass" sub="art-director agent reworks the UI" />
              <Toggle k="autoDeploy" label="Auto-deploy passing builds" sub="ship to preview without asking" />
            </div>
          </Card>

          <Card className="border-[#ff8a8a]/20 p-5">
            <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-[#ff8a8a] uppercase">
              <TriangleAlert className="h-3.5 w-3.5" /> danger zone
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                onClick={signOut}
                className="rounded-xl border hairline px-4 py-2.5 text-[13.5px] text-bone transition-colors hover:border-bone/25"
              >
                Sign out
              </button>
              <button
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    notify("click again to confirm deletion");
                    return;
                  }
                  try {
                    [
                      "vibex:split", "vibex:model", "vibex:user", "vibex:keys",
                      "vibex:preferences", "vibex:workspace-files", "vibex:workspace-diffs",
                    ].forEach((key) => localStorage.removeItem(key));
                    sessionStorage.clear();
                  } catch {
                    /* Continue with sign-out if storage is unavailable. */
                  }
                  signOut();
                }}
                className="rounded-xl border border-[#ff8a8a]/30 px-4 py-2.5 text-[13.5px] text-[#ff8a8a] transition-colors hover:bg-[#ff8a8a]/[0.07]"
              >
                {confirmDelete ? "Confirm deletion" : "Delete workspace"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


