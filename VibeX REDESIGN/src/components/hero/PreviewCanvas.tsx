import { cn } from "../../utils/cn";

/* ============================================================
   A tiny block language for rendering believable app previews.
   Each hero run describes its UI as blocks; this renders them.
   ============================================================ */

export type Block =
  | { t: "head"; eyebrow: string; title: string; badge?: string }
  | { t: "kpi"; items: { label: string; value: string; delta?: string }[] }
  | { t: "bars"; label: string; values: number[]; caption?: string }
  | { t: "list"; label: string; rows: { name: string; meta: string; state?: "on" | "off" | "warn" }[] }
  | { t: "table"; cols: string[]; rows: string[][]; total?: [string, string] }
  | { t: "ring"; value: string; sub: string; pct: number; actions?: string[] }
  | { t: "heat"; label: string; rows: number[][] }
  | { t: "chat"; msgs: { who: "them" | "me"; text: string }[] }
  | { t: "cards"; items: { title: string; sub: string; tag?: string }[] }
  | { t: "kanban"; cols: { name: string; items: string[] }[] }
  | { t: "form"; label: string; fields: { name: string; value: string }[]; cta: string }
  | { t: "feed"; items: { title: string; meta: string }[] }
  | { t: "split"; left: string; right: string; label: string }
  | { t: "map"; label: string; pins: { x: number; y: number; live?: boolean }[]; caption: string };

const CARD = "rounded-xl border hairline bg-panel p-4";

export default function PreviewCanvas({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3 px-5 py-5">
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "head":
      return (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">{b.eyebrow}</p>
            <h3 className="mt-1 font-display text-[22px] leading-tight font-medium tracking-tight">
              {b.title}
            </h3>
          </div>
          {b.badge && (
            <span className="shrink-0 rounded-full border border-volt/25 bg-volt/[0.07] px-3 py-1.5 font-mono text-[10.5px] text-volt">
              {b.badge}
            </span>
          )}
        </div>
      );

    case "kpi":
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {b.items.map((k) => (
            <div key={k.label} className={CARD}>
              <p className="font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase">{k.label}</p>
              <p className="mt-1.5 font-display text-[20px] leading-none font-medium tabular-nums">{k.value}</p>
              {k.delta && <p className="mt-1 font-mono text-[10px] text-volt">{k.delta}</p>}
            </div>
          ))}
        </div>
      );

    case "bars":
      return (
        <div className={CARD}>
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">{b.label}</p>
            {b.caption && <p className="font-mono text-[10px] text-mute">{b.caption}</p>}
          </div>
          <div className="mt-3 flex h-20 items-end gap-1">
            {b.values.map((v, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-t",
                  i === b.values.length - 1 ? "bg-volt" : "bg-volt/35",
                )}
                style={{ height: `${Math.max(6, v)}%` }}
              />
            ))}
          </div>
        </div>
      );

    case "list":
      return (
        <div className={CARD}>
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">{b.label}</p>
          <div className="mt-2.5 space-y-2">
            {b.rows.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-lg bg-coal/50 px-3 py-2.5">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    r.state === "on" ? "bg-volt" : r.state === "warn" ? "bg-[#e9b872]" : "bg-bone/20",
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-bone/85">{r.name}</span>
                <span className="shrink-0 font-mono text-[10.5px] text-faint">{r.meta}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "table":
      return (
        <div className="overflow-hidden rounded-xl border hairline bg-panel">
          <div className="flex gap-3 border-b hairline px-4 py-2.5">
            {b.cols.map((c, i) => (
              <span
                key={c}
                className={cn(
                  "font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase",
                  i === 0 ? "flex-1" : "w-[74px] text-right",
                )}
              >
                {c}
              </span>
            ))}
          </div>
          {b.rows.map((row, i) => (
            <div key={i} className={cn("flex gap-3 px-4 py-2.5", i && "border-t hairline")}>
              {row.map((cell, j) => (
                <span
                  key={j}
                  className={cn(
                    "truncate text-[12.5px]",
                    j === 0 ? "flex-1 text-bone/85" : "w-[74px] text-right font-mono text-[11.5px] text-mute",
                  )}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
          {b.total && (
            <div className="flex items-baseline justify-between border-t border-volt/20 bg-volt/[0.04] px-4 py-3">
              <span className="font-mono text-[10.5px] tracking-[0.16em] text-mute uppercase">{b.total[0]}</span>
              <span className="font-display text-[20px] font-medium tracking-tight text-volt">{b.total[1]}</span>
            </div>
          )}
        </div>
      );

    case "ring": {
      const C = 327;
      return (
        <div className={cn(CARD, "flex flex-col items-center py-6")}>
          <div className="relative h-[124px] w-[124px]">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(239 239 232 / 0.08)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="#d9ff3f" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - b.pct)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[26px] font-medium tracking-tight tabular-nums">{b.value}</span>
              <span className="font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">{b.sub}</span>
            </div>
          </div>
          {b.actions && (
            <div className="mt-4 flex gap-2">
              {b.actions.map((a, i) => (
                <span
                  key={a}
                  className={cn(
                    "rounded-lg px-4 py-2 font-mono text-[11px]",
                    i === 0 ? "bg-volt font-medium text-coal" : "border hairline text-mute",
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "heat":
      return (
        <div className={CARD}>
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">{b.label}</p>
          <div className="mt-3 space-y-1.5">
            {b.rows.map((row, i) => (
              <div key={i} className="flex gap-1.5">
                {row.map((v, j) => (
                  <span
                    key={j}
                    className="h-5 flex-1 rounded"
                    style={{ background: v ? `rgb(217 255 63 / ${0.18 + v * 0.22})` : "rgb(239 239 232 / 0.05)" }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case "chat":
      return (
        <div className={cn(CARD, "space-y-2")}>
          {b.msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.who === "me" ? "justify-end" : "justify-start")}>
              <span
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed",
                  m.who === "me"
                    ? "rounded-br-sm border border-volt/25 bg-volt/[0.08] text-bone"
                    : "rounded-bl-sm bg-bone/[0.06] text-bone/80",
                )}
              >
                {m.text}
              </span>
            </div>
          ))}
          <div className="mt-1 h-9 rounded-lg border hairline bg-coal/60" />
        </div>
      );

    case "cards":
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {b.items.map((c) => (
            <div key={c.title} className={CARD}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-medium text-bone/90">{c.title}</p>
                {c.tag && (
                  <span className="shrink-0 rounded border border-volt/25 px-1.5 py-0.5 font-mono text-[9px] text-volt">
                    {c.tag}
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-mono text-[10.5px] leading-relaxed text-faint">{c.sub}</p>
            </div>
          ))}
        </div>
      );

    case "kanban":
      return (
        <div className="grid grid-cols-3 gap-2.5">
          {b.cols.map((col) => (
            <div key={col.name} className="rounded-xl border hairline bg-panel p-2.5">
              <p className="px-1 font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">{col.name}</p>
              <div className="mt-2 space-y-1.5">
                {col.items.map((it) => (
                  <div key={it} className="rounded-lg bg-coal/60 px-2.5 py-2 text-[11.5px] text-bone/80">
                    {it}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "form":
      return (
        <div className={CARD}>
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">{b.label}</p>
          <div className="mt-3 space-y-2.5">
            {b.fields.map((f) => (
              <div key={f.name}>
                <p className="font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">{f.name}</p>
                <div className="mt-1 rounded-lg border hairline bg-coal/60 px-3 py-2.5 text-[12.5px] text-bone/85">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-volt px-3 py-2.5 text-center font-mono text-[11px] font-medium text-coal">
            {b.cta}
          </div>
        </div>
      );

    case "feed":
      return (
        <div className={CARD}>
          <div className="space-y-2.5">
            {b.items.map((it, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] text-bone/85">{it.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-faint">{it.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "split":
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {[b.left, b.right].map((v, i) => (
            <div key={i} className={CARD}>
              <p className="font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase">
                {i === 0 ? b.label : "vs last period"}
              </p>
              <p className="mt-1.5 font-display text-[24px] leading-none font-medium tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      );

    case "map":
      return (
        <div className={CARD}>
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">{b.label}</p>
          <div className="relative mt-3 h-32 overflow-hidden rounded-lg border hairline bg-coal/60">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: "radial-gradient(rgb(239 239 232 / 0.14) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
            />
            {b.pins.map((p, i) => (
              <span
                key={i}
                className={cn(
                  "absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  p.live ? "bg-volt animate-pulse-dot" : "bg-volt/45",
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-faint">{b.caption}</p>
        </div>
      );
  }
}
