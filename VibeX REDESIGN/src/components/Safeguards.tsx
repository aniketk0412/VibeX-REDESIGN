import { Check, X } from "lucide-react";
import { Kicker, Reveal } from "./ui";

const ROWS = [
  {
    pain: "Builds that freeze halfway",
    elsewhere: "One stuck model means an endless spinner — and everything built so far is gone.",
    vibex: "Timeouts recover automatically. Every build ends in openable, working code.",
  },
  {
    pain: "Cookie-cutter, templated apps",
    elsewhere: "Most builders stop at a generic first draft that instantly reads as “AI-made.”",
    vibex: "Coder, Reviewer, then an art-director pass critiques and reworks it until it reads hand-built.",
  },
  {
    pain: "Vague prompts, vague results",
    elsewhere: "A one-line prompt gives every idea the same shallow treatment.",
    vibex: "Vibex asks sharp, idea-specific questions first — then builds what you actually meant.",
  },
  {
    pain: "Exposed API keys",
    elsewhere: "Paste a key into the wrong tool and it can leak, get logged, or land in a browser bundle.",
    vibex: "Keys are encrypted at rest with AES-256 and never leave the server or touch the browser.",
  },
  {
    pain: "Progress lost at the limit",
    elsewhere: "Hit a usage cap mid-run and the build dies — you start again from zero.",
    vibex: "Rolling windows auto-pause and auto-resume. You never lose progress or a credit.",
  },
];

export default function Safeguards() {
  return (
    <section id="safeguards" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <Kicker index="03" label="safeguards" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] sm:text-[52px]">
              What breaks other builders,
              <br />
              <em className="font-serif italic font-normal text-volt">handled</em> here.
            </h2>
            <p className="max-w-xs text-[14.5px] leading-relaxed text-mute">
              Every run passes through the same safeguards automatically. Here's
              what that saves you from.
            </p>
          </div>
        </Reveal>

        {/* column labels */}
        <Reveal delay={0.1}>
          <div className="mt-14 hidden grid-cols-[44px_1.1fr_1fr_1fr] gap-6 border-b hairline pb-4 font-mono text-[10px] tracking-[0.22em] uppercase lg:grid">
            <span />
            <span className="text-faint">the failure mode</span>
            <span className="flex items-center gap-2 text-faint">
              <X className="h-3 w-3" /> elsewhere
            </span>
            <span className="flex items-center gap-2 text-volt">
              <Check className="h-3 w-3" /> with vibex
            </span>
          </div>
        </Reveal>

        <div>
          {ROWS.map((r, i) => (
            <Reveal key={r.pain} delay={i * 0.05}>
              <div className="group grid gap-5 border-b hairline py-7 transition-colors duration-500 hover:bg-bone/[0.015] lg:grid-cols-[44px_1.1fr_1fr_1fr] lg:gap-6 lg:py-9">
                <span className="font-mono text-[11px] text-faint lg:pt-1">
                  0{i + 1}
                </span>
                <h3 className="font-display text-[21px] leading-snug font-medium tracking-tight lg:pt-0 text-bone">
                  {r.pain}
                </h3>
                <p className="relative text-[13.5px] leading-relaxed text-faint lg:border-l lg:border-bone/[0.07] lg:pl-5">
                  <span className="mb-2 flex items-center gap-2 font-mono text-[9.5px] tracking-[0.18em] uppercase text-faint lg:hidden">
                    <X className="h-3 w-3" /> elsewhere
                  </span>
                  {r.elsewhere}
                </p>
                <p className="relative text-[13.5px] leading-relaxed text-bone/85 lg:border-l lg:border-volt/20 lg:pl-5">
                  <span className="mb-2 flex items-center gap-2 font-mono text-[9.5px] tracking-[0.18em] uppercase text-volt lg:hidden">
                    <Check className="h-3 w-3" /> with vibex
                  </span>
                  {r.vibex}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
