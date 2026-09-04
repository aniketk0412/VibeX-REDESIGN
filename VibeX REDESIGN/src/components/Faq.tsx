import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { EASE, Kicker, Reveal } from "./ui";

const QA = [
  {
    q: "What exactly is Vibex?",
    a: "Vibex turns a plain-language idea into working code. You describe it once; a short interview locks the goal, then a Coder AI writes every file while a Reviewer AI verifies each one — generating and running every prompt until the build passes.",
  },
  {
    q: "Do I have to write prompts?",
    a: "No — that's the whole point. You answer a short interview in plain words, and Vibex writes and runs all the prompts for you, hands-free. Interrupt anytime if you want to steer.",
  },
  {
    q: "Can I bring my own API key?",
    a: "Yes. Add an Anthropic, OpenAI, Google or OpenRouter key in settings and builds run on your account — or use a Vibex plan. OpenRouter's free models cost $0. Keys are AES-256 encrypted at rest and never touch the browser.",
  },
  {
    q: "How do usage limits work?",
    a: "They're time-based rolling windows, not credit top-ups. Hit a window and the build saves, pauses, and auto-resumes when it resets — so you never lose progress or a credit.",
  },
  {
    q: "What can Vibex build?",
    a: "Web apps, APIs and CLI tools. You get a live preview, the real file tree, an in-app IDE, and a downloadable .zip of working code — plus GitHub export and one-click deploy on paid plans.",
  },
  {
    q: "Is there really a free plan?",
    a: "One free project runs the entire Coder + Reviewer loop on community models — live preview, design critique score and .zip download included, no card required. Paid plans add your chosen model, automatic design polish and one-click shipping.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <Kicker index="05" label="faq" />
            <h2 className="mt-6 font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] sm:text-[52px]">
              Questions,
              <br />
              <em className="font-serif italic font-normal text-volt">answered.</em>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mute">
              The short version: describe it once, get working reviewed code. The
              details live here.
            </p>
            <a
              href="#/signup"
              className="u-sweep mt-7 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.08em] text-volt"
            >
              or just try it — one project is free
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>

        <div>
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className="border-b hairline">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center gap-5 py-6 text-left"
                  >
                    <span className="font-mono text-[11px] text-faint">
                      0{i + 1}
                    </span>
                    <span
                      className={cn(
                        "flex-1 font-display text-[19px] font-medium tracking-tight transition-colors duration-300 sm:text-[21px]",
                        isOpen ? "text-bone" : "text-bone/75 group-hover:text-bone",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-400",
                        isOpen ? "rotate-45 border-volt/40 bg-volt/[0.08] text-volt" : "hairline text-mute group-hover:border-bone/25",
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pl-9 text-[14px] leading-relaxed text-mute sm:pl-10">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
