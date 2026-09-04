import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Globe, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ANALYTICS_KPIS, COUNTRIES, DEVICES, LIVE_PAGES, REFERRERS, TOP_PAGES, TRAFFIC, VITALS,
} from "../../lib/appdata";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";
import { PageHead } from "./Pages";

const RANGES = ["24h", "7d", "30d", "90d"] as const;
type Range = (typeof RANGES)[number];

const SITES = ["habitly.vibex.app", "pulseboard.vibex.app", "invoicely.vibex.app"];

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border hairline bg-panel", className)}>{children}</div>;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

/* ---------------- area chart ---------------- */

function TrafficChart({ points, metric }: { points: typeof TRAFFIC; metric: "visitors" | "views" }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 100;
  const H = 38;

  const { path, area, max } = useMemo(() => {
    const vals = points.map((p) => p[metric]);
    const max = Math.max(...vals);
    const step = W / (points.length - 1);
    const coords = vals.map((v, i) => [i * step, H - (v / max) * (H - 4)] as const);
    const path = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${path} L${W},${H} L0,${H} Z`;
    return { path, area, max };
  }, [points, metric]);

  const step = W / (points.length - 1);
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-48 w-full overflow-visible">
        <defs>
          <linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9ff3f" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#d9ff3f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={H * g} x2={W} y2={H * g} stroke="rgb(239 239 232 / 0.06)" strokeWidth="0.2" />
        ))}
        <motion.path
          d={area}
          fill="url(#traffic-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="#d9ff3f"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        {hover !== null && (
          <>
            <line x1={hover * step} y1="0" x2={hover * step} y2={H} stroke="#d9ff3f" strokeOpacity="0.4" strokeWidth="0.25" />
            <circle
              cx={hover * step}
              cy={H - (points[hover][metric] / max) * (H - 4)}
              r="1"
              fill="#d9ff3f"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {/* hover targets */}
        {points.map((_, i) => (
          <rect
            key={i}
            x={i * step - step / 2}
            y={0}
            width={step}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -top-2 rounded-lg border hairline bg-panel-2/95 px-3 py-2 font-mono text-[11px] shadow-lg backdrop-blur"
          style={{
            left: `${(hover! / (points.length - 1)) * 100}%`,
            transform: `translateX(${hover! > points.length / 2 ? "-110%" : "10%"})`,
          }}
        >
          <p className="text-faint">{active.d}</p>
          <p className="mt-0.5 text-volt tabular-nums">
            {active[metric].toLocaleString()} {metric}
          </p>
        </div>
      )}

      <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
        <span>{points[0].d}</span>
        <span>{points[Math.floor(points.length / 2)].d}</span>
        <span>{points[points.length - 1].d}</span>
      </div>
    </div>
  );
}

/* ---------------- bar list ---------------- */

function BarList({
  title,
  rows,
  unit,
}: {
  title: string;
  rows: { label: string; value: number; pct: number; extra?: string }[];
  unit?: string;
}) {
  return (
    <Card className="p-5">
      <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">{title}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
            className="group relative overflow-hidden rounded-lg"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-lg bg-volt/[0.09] transition-colors group-hover:bg-volt/[0.15]"
              initial={{ width: 0 }}
              animate={{ width: `${r.pct}%` }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: EASE }}
            />
            <div className="relative flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 truncate font-mono text-[12px] text-bone/90">{r.label}</span>
              <span className="shrink-0 font-mono text-[11.5px] text-mute tabular-nums">
                {r.extra ? <span className="mr-3 text-faint">{r.extra}</span> : null}
                {fmt(r.value)}
                {unit}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- device donut ---------------- */

function DeviceDonut() {
  const C = 2 * Math.PI * 34;
  let offset = 0;
  return (
    <Card className="p-5">
      <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">devices</p>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-[104px] w-[104px] shrink-0">
          <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
            {DEVICES.map((d) => {
              const len = (d.pct / 100) * C;
              const el = (
                <motion.circle
                  key={d.name}
                  cx="44"
                  cy="44"
                  r="34"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="9"
                  strokeDasharray={`${len} ${C - len}`}
                  initial={{ strokeDashoffset: -offset, opacity: 0 }}
                  animate={{ strokeDashoffset: -offset, opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[19px] font-medium tabular-nums">62%</span>
            <span className="font-mono text-[9.5px] text-faint">desktop</span>
          </span>
        </div>
        <div className="space-y-2.5">
          {DEVICES.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="font-mono text-[12px] text-mute">{d.name}</span>
              <span className="font-mono text-[12px] text-bone tabular-nums">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ---------------- live visitors ---------------- */

function LiveNow() {
  const [count, setCount] = useState(69);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => Math.max(38, Math.min(120, c + Math.floor(Math.random() * 9) - 4)));
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">
          <Radio className="h-3.5 w-3.5 text-volt" /> live now
        </p>
        <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-dot" />
      </div>
      <p className="mt-3 font-display text-[38px] leading-none font-medium tabular-nums">{count}</p>
      <p className="mt-1 font-mono text-[11px] text-faint">visitors on site right now</p>
      <div className="mt-4 space-y-2 border-t hairline pt-4">
        {LIVE_PAGES.map((p) => (
          <div key={p.path} className="flex items-center justify-between font-mono text-[11.5px]">
            <span className="truncate text-mute">{p.path}</span>
            <span className="text-bone tabular-nums">{p.now}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- page ---------------- */

export default function Analytics() {
  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<"visitors" | "views">("visitors");
  const [site, setSite] = useState(SITES[0]);

  const slice = useMemo(() => {
    const scale = site.startsWith("habitly") ? 1 : site.startsWith("pulseboard") ? 0.68 : 0.42;
    let data: typeof TRAFFIC;
    if (range === "24h") {
      const base = TRAFFIC[TRAFFIC.length - 1];
      data = Array.from({ length: 12 }, (_, i) => ({
        d: `${String(i * 2).padStart(2, "0")}:00`,
        visitors: Math.round((base.visitors / 12) * (0.6 + ((i * 7) % 9) / 10)),
        views: Math.round((base.views / 12) * (0.7 + ((i * 5) % 8) / 10)),
      }));
    } else if (range === "7d") data = TRAFFIC.slice(-7);
    else if (range === "30d") data = TRAFFIC;
    else data = Array.from({ length: 90 }, (_, i) => {
      const source = TRAFFIC[i % TRAFFIC.length];
      const phase = 0.72 + i / 330;
      return {
        d: `day ${i + 1}`,
        visitors: Math.round(source.visitors * phase),
        views: Math.round(source.views * phase),
      };
    });
    return data.map((point) => ({
      ...point,
      visitors: Math.max(1, Math.round(point.visitors * scale)),
      views: Math.max(1, Math.round(point.views * scale)),
    }));
  }, [range, site]);

  return (
    <div className="space-y-5">
      <PageHead
        title="Analytics"
        sub="How the apps you shipped are actually performing in the wild."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="rounded-xl border border-bone/10 bg-panel px-3.5 py-2.5 font-mono text-[12px] text-bone outline-none focus:border-volt/40"
            >
              {SITES.map((s) => (
                <option key={s} value={s} className="bg-coal">{s}</option>
              ))}
            </select>
            <div className="flex rounded-xl border hairline bg-panel p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-lg px-3 py-2 font-mono text-[11.5px] transition-colors",
                    range === r ? "bg-volt/[0.1] text-volt" : "text-faint hover:text-mute",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ANALYTICS_KPIS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
          >
            <Card className="p-5">
              <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">{k.label}</p>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <p className="font-display text-[30px] leading-none font-medium tabular-nums">
                  {k.value >= 1000 ? k.value.toLocaleString() : k.value}
                  <span className="text-mute">{k.unit}</span>
                </p>
                <span className={cn("flex items-center gap-1 font-mono text-[11px]", k.up ? "text-volt" : "text-[#ff8a8a]")}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* traffic chart */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">traffic</p>
            <p className="mt-1 font-mono text-[11.5px] text-mute">{site} · last {range}</p>
          </div>
          <div className="flex rounded-lg border hairline bg-coal/60 p-0.5">
            {(["visitors", "views"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-[11px] transition-colors",
                  metric === m ? "bg-volt/[0.1] text-volt" : "text-faint hover:text-mute",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <TrafficChart points={slice} metric={metric} />
        </div>
      </Card>

      {/* lists */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <BarList
          title="top pages"
          rows={TOP_PAGES.map((p) => ({ label: p.path, value: p.views, pct: p.pct, extra: p.avg }))}
        />
        <BarList
          title="referrers"
          rows={REFERRERS.map((r) => ({ label: r.name, value: r.visits, pct: r.pct }))}
        />
        <div className="space-y-4">
          <LiveNow />
        </div>
        <Card className="p-5">
          <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">
            <Globe className="h-3.5 w-3.5" /> countries
          </p>
          <div className="mt-4 space-y-2.5">
            {COUNTRIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-lg bg-volt/[0.09]"
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.9, delay: i * 0.05, ease: EASE }}
                />
                <div className="relative flex items-center justify-between gap-3 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-7 items-center justify-center rounded border hairline bg-coal font-mono text-[9.5px] text-volt">
                      {c.code}
                    </span>
                    <span className="truncate font-mono text-[12px] text-bone/90">{c.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11.5px] text-mute tabular-nums">{fmt(c.visits)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
        <DeviceDonut />
        <Card className="p-5">
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">core web vitals</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {VITALS.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl border hairline bg-coal/50 p-3.5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-faint">{v.label}</span>
                  <span className="font-mono text-[10.5px] text-volt">{v.score}</span>
                </div>
                <p className="mt-1.5 font-display text-[19px] font-medium tabular-nums">{v.value}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-bone/[0.08]">
                  <motion.div
                    className="h-full rounded-full bg-volt"
                    initial={{ width: 0 }}
                    animate={{ width: `${v.score}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: EASE }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-faint">
            measured from real visits · p75 over the selected range
          </p>
        </Card>
      </div>
    </div>
  );
}
