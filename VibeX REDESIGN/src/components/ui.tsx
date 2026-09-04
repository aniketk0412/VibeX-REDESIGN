import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, type ReactNode, type MouseEvent as FMMouseEvent } from "react";
import { cn } from "../utils/cn";

/* ---------------- custom easing ---------------- */
export const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ---------------- logomark ---------------- */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden>
      <rect width="32" height="32" rx="7" fill="#d9ff3f" />
      <path
        d="M9 9l7 14 7-14"
        stroke="#070708"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- section kicker ---------------- */
export function Kicker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-mute uppercase">
      <span className="text-volt">[{index}]</span>
      <span className="h-px w-8 bg-volt/40" />
      <span>{label}</span>
    </div>
  );
}

/* ---------------- magnetic wrapper ---------------- */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: FMMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- buttons ---------------- */
export function VoltButton({
  children,
  href = "#",
  className,
  small,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  small?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-volt font-medium text-coal transition-transform duration-300 active:scale-[0.97]",
        small ? "px-5 py-2.5 text-[13px]" : "px-7 py-3.5 text-[15px]",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-white/35 transition-transform duration-500 ease-out group-hover:translate-x-0" />
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowUpRight className={cn("transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", small ? "h-3.5 w-3.5" : "h-4 w-4")} />
      </span>
    </a>
  );
}

export function GhostButton({
  children,
  href = "#",
  className,
  small,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  small?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full border hairline text-bone transition-all duration-300 hover:border-bone/30 hover:bg-bone/[0.04] active:scale-[0.97]",
        small ? "px-5 py-2.5 text-[13px]" : "px-7 py-3.5 text-[15px]",
        className,
      )}
    >
      {children}
    </a>
  );
}


