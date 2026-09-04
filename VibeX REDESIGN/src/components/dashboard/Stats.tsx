import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { STATS } from "../../lib/mock";

function useCountUp(target: number, decimals: number, duration = 1500) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(parseFloat((target * eased).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, decimals, duration]);

  return { ref, v };
}

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d - min) / range) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <polygon points={`0,32 ${pts} 100,32`} fill="rgb(217 255 63 / 0.06)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#d9ff3f"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  suffix,
  delta,
  spark,
}: (typeof STATS)[number]) {
  const decimals = value % 1 !== 0 ? 1 : 0;
  const { ref, v } = useCountUp(value, decimals);

  return (
    <div className="group rounded-2xl border hairline bg-panel p-5 transition-colors duration-500 hover:border-volt/25">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">{label}</p>
        <span className="flex items-center gap-1 rounded-full border border-volt/25 bg-volt/[0.07] px-2 py-0.5 font-mono text-[9px] text-volt">
          <TrendingUp className="h-2.5 w-2.5" />
          {delta}
        </span>
      </div>
      <p className="mt-3 font-display text-[34px] leading-none font-medium tracking-tight tabular-nums">
        <span ref={ref}>{decimals ? v.toFixed(1) : Math.round(v)}</span>
        <span className="text-mute">{suffix}</span>
      </p>
      <div className="mt-4 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
        <Sparkline data={spark} />
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
