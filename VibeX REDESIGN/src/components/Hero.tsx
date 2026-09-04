import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import HeroBuildRoom from "./HeroBuildRoom";
import { EASE, GhostButton, Magnetic, VoltButton } from "./ui";

/* ---------- masked line reveal ---------- */
function Line({ children, i, booted }: { children: ReactNode; i: number; booted: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={booted ? { y: 0 } : {}}
        transition={{ duration: 1.1, ease: EASE, delay: 0.18 + i * 0.09 }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const TRUST = [
  "1 free project",
  "no prompts to write",
  "interrupt anytime",
  "keys never touch the browser",
];

export default function Hero({ booted }: { booted: boolean }) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const gx = useSpring(mx, { stiffness: 60, damping: 20 });
  const gy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY + window.scrollY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
      {/* hero-local glow — the page-wide flow field lives in LandingBackdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_55%_50%_at_50%_-8%,rgb(217_255_63/0.07),transparent_70%)]" />
      {/* pointer glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[560px] w-[560px] rounded-full opacity-[0.55] blur-3xl"
        style={{
          x: gx,
          y: gy,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgb(217 255 63 / 0.055), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="mx-auto flex w-fit items-center gap-3 rounded-full border hairline bg-panel/60 px-4 py-2 font-mono text-[10.5px] tracking-[0.18em] text-mute uppercase backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-dot" />
          autonomous builds · coder + reviewer on every file
        </motion.div>

        {/* headline */}
        <h1 className="mt-8 text-center font-display text-[13.5vw] leading-[0.98] font-medium tracking-[-0.02em] text-balance sm:text-[11vw] lg:text-[96px]">
          <Line i={0} booted={booted}>Describe it once.</Line>
          <Line i={1} booted={booted}>
            It{" "}
            <em className="font-serif italic font-normal text-volt">ships itself.</em>
          </Line>
        </h1>

        {/* subcopy */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mx-auto mt-7 max-w-xl text-center text-[15.5px] leading-relaxed text-mute sm:text-[17px]"
        >
          Vibex turns one plain sentence into running software — a Coder AI writes
          every file while a Reviewer AI verifies it, prompt after prompt, until
          the build passes. No prompt-writing. No babysitting.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.62 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <VoltButton href="#/signup">Start building — free</VoltButton>
          </Magnetic>
          <Magnetic strength={0.2}>
            <GhostButton href="#how">Watch it run</GhostButton>
          </Magnetic>
        </motion.div>

        {/* trust row */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.08em] text-faint uppercase">
              <span className="h-[3px] w-[3px] rounded-full bg-volt" />
              {t}
            </li>
          ))}
        </motion.ul>

        {/* simulator */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={booted ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE, delay: 0.75 }}
          className="relative mt-16"
        >
          <div className="absolute -inset-x-8 -top-10 h-40 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(217_255_63/0.10),transparent_70%)] blur-xl" />
          <HeroBuildRoom />
          <p className="mt-4 text-center font-mono text-[10.5px] tracking-[0.16em] text-faint uppercase">
            a real run, start to finish — switch between code and preview anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
