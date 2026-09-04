import { motion } from "framer-motion";
import { GhostButton, Kicker, Magnetic, Reveal, VoltButton } from "./ui";

export default function Cta() {
  return (
    <section id="cta" className="relative overflow-hidden py-32 sm:py-44">
      {/* glow + orbit ring */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[640px] -translate-y-1/2 bg-[radial-gradient(ellipse_42%_50%_at_50%_50%,rgb(217_255_63/0.09),transparent_70%)]" />
      <motion.svg
        viewBox="0 0 800 800"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        aria-hidden
      >
        <circle cx="400" cy="400" r="330" fill="none" stroke="#d9ff3f" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="400" cy="70" r="4" fill="#d9ff3f" />
        <circle cx="400" cy="730" r="2.5" fill="#d9ff3f" opacity="0.6" />
      </motion.svg>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <div className="flex justify-center">
            <Kicker index="06" label="your move" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-8 font-display text-[13vw] leading-[0.98] font-medium tracking-[-0.02em] text-balance sm:text-[80px] lg:text-[92px]">
            Your idea is one sentence
            <br />
            from <em className="font-serif italic font-normal text-volt">running.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-7 max-w-md text-[15.5px] leading-relaxed text-mute">
            One free project. The full Coder + Reviewer loop. Working code you can
            open, edit, and ship — no card required.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <VoltButton href="#/signup" className="px-9 py-4 text-[16px]">
                Start your free build
              </VoltButton>
            </Magnetic>
            <Magnetic strength={0.2}>
              <GhostButton href="#pricing">See plans</GhostButton>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-9 font-mono text-[10.5px] tracking-[0.18em] text-faint uppercase">
            builds always finish · interrupt anytime · code is yours
          </p>
        </Reveal>
      </div>
    </section>
  );
}
