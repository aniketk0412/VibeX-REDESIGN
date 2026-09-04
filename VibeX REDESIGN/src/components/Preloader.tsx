import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE, Logomark } from "./ui";

const BOOT_LINES = [
  "vibex // autonomous build engine",
  "spawning coder agent............ok",
  "spawning reviewer agent.........ok",
  "interface ready",
];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const quick = setTimeout(onDone, 500);
      return () => clearTimeout(quick);
    }
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.floor(Math.random() * 14) + 7);
      setProgress(p);
      setLineCount(Math.min(BOOT_LINES.length, Math.floor(p / 26) + 1));
      if (p >= 100) {
        clearInterval(t);
        setTimeout(onDone, 420);
      }
    }, 120);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-coal"
      exit={{ y: "-100%", transition: { duration: 0.9, ease: EASE } }}
    >
      <div className="flex items-center gap-3">
        <Logomark className="h-9 w-9" />
        <span className="font-display text-2xl font-medium tracking-tight">vibex</span>
      </div>

      <div className="mt-10 h-[88px] w-[300px] font-mono text-[11px] leading-[1.9] text-mute sm:w-[340px]">
        {BOOT_LINES.slice(0, lineCount).map((l, i) => (
          <motion.p key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <span className="text-faint">{String(i).padStart(2, "0")}</span>&nbsp;&nbsp;
            {i === BOOT_LINES.length - 1 ? <span className="text-volt">{l}</span> : l}
          </motion.p>
        ))}
      </div>

      <div className="mt-6 w-[300px] sm:w-[340px]">
        <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          <span>loading</span>
          <span className="text-volt">{progress}%</span>
        </div>
        <div className="mt-2 h-px w-full bg-bone/10">
          <div
            className="h-px bg-volt transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
