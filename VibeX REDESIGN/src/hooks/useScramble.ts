import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#";

/** Hover-scramble for mono labels. Returns display text + trigger. */
export function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const frame = useRef<number>(0);
  const running = useRef(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const play = useCallback(() => {
    if (running.current) return;
    running.current = true;
    let tick = 0;
    const total = Math.max(10, text.length * 2);

    const step = () => {
      tick++;
      const settled = Math.floor((tick / total) * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") { next += " "; continue; }
        next += i < settled ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(next);
      if (tick < total) {
        frame.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
        running.current = false;
      }
    };
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(step);
  }, [text]);

  return { display, play };
}
