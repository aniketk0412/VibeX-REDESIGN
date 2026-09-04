import { useEffect, useState } from "react";

/** Ticking countdown for the rolling 5-hour usage window. */
export function useResetClock(initialSeconds = 2 * 3600 + 41 * 60 + 7) {
  const [left, setLeft] = useState(initialSeconds);

  useEffect(() => {
    const t = setInterval(
      () => setLeft((v) => (v <= 1 ? initialSeconds : v - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [initialSeconds]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const clock = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { left, clock, pct: left / initialSeconds };
}
