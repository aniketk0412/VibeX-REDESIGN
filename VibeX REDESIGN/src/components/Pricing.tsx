import { Check, KeyRound } from "lucide-react";
import { cn } from "../utils/cn";
import { GhostButton, Kicker, Reveal, VoltButton } from "./ui";

type Plan = {
  name: string;
  price: string;
  period: string;
  blurb: string;
  cta: string;
  popular?: boolean;
  features: string[];
  footnote?: string;
};

const PLANS: Plan[] = [
  {
    name: "Free trial",
    price: "$0",
    period: "once",
    blurb: "Run the whole loop, start to finish, one time.",
    cta: "Start free",
    features: [
      "1 project, ever",
      "50k tokens / 5h · 300k / mo",
      "Full coder + reviewer loop",
      "Live preview + critique score",
      ".zip download — code is yours",
    ],
    footnote: "no card required",
  },
  {
    name: "Starter",
    price: "$12",
    period: "/ mo",
    blurb: "For steady side-project building.",
    cta: "Choose Starter",
    features: [
      "Unlimited projects",
      "200k tokens / 5h · 4M / mo",
      "Interrupt & steer mid-build",
      "Live preview + in-app IDE",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ mo",
    blurb: "For builders shipping every week.",
    cta: "Choose Pro",
    popular: true,
    features: [
      "500k tokens / 5h · 12M / mo",
      "Your chosen model on Vibex keys",
      "Automatic design-polish passes",
      "GitHub export + one-click deploy",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "$79",
    period: "/ mo",
    blurb: "For heavy, back-to-back runs.",
    cta: "Choose Scale",
    features: [
      "1.5M tokens / 5h · 40M / mo",
      "Up to 3 concurrent builds",
      "Everything in Pro",
      "Build version history",
      "Priority support",
    ],
  },
];

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <Reveal delay={index * 0.07} className="h-full">
      <div
        className={cn(
          "relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-500",
          plan.popular
            ? "border-volt/50 bg-panel shadow-[0_0_60px_-18px_rgb(217_255_63/0.28)] lg:-translate-y-3"
            : "hairline bg-panel hover:border-bone/25",
        )}
      >
        {plan.popular && (
          <span className="absolute -top-3 left-6 rounded-full bg-volt px-3 py-1 font-mono text-[9px] font-semibold tracking-[0.16em] text-coal uppercase">
            most popular
          </span>
        )}

        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-[19px] font-medium tracking-tight">{plan.name}</h3>
          <span className="font-mono text-[10px] text-faint">P.0{index + 1}</span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">{plan.blurb}</p>

        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="font-display text-[42px] leading-none font-medium tracking-tight">
            {plan.price}
          </span>
          <span className="font-mono text-[11px] text-faint">{plan.period}</span>
        </div>

        <ul className="mt-6 flex-1 space-y-2.5 border-t hairline pt-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug text-bone/80">
              <Check className={cn("mt-[3px] h-3.5 w-3.5 shrink-0", plan.popular ? "text-volt" : "text-mute")} />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          {plan.popular ? (
            <VoltButton href="#/signup" small className="w-full">
              {plan.cta}
            </VoltButton>
          ) : (
            <GhostButton href="#/signup" small className="w-full">
              {plan.cta}
            </GhostButton>
          )}
          {plan.footnote && (
            <p className="mt-3 text-center font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
              {plan.footnote}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-36">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-24 h-[420px] bg-[radial-gradient(ellipse_45%_55%_at_50%_20%,rgb(217_255_63/0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <Kicker index="04" label="plans" />
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] sm:text-[52px]">
            Start free.
            <br />
            Scale when it <em className="font-serif italic font-normal text-volt">clicks.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-mute">
            Limits are time-based rolling windows — never credit top-ups. A run
            auto-pauses and resumes, and your code is always yours.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <PlanCard key={p.name} plan={p} index={i} />
          ))}
        </div>

        {/* BYOK strip */}
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-col items-start gap-6 rounded-2xl border hairline bg-panel p-6 sm:p-8 lg:flex-row lg:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-volt/25 bg-volt/[0.06] text-volt">
              <KeyRound className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-[20px] font-medium tracking-tight">
                Bring your own key{" "}
                <span className="ml-2 rounded-full border border-volt/25 bg-volt/[0.07] px-2.5 py-0.5 align-middle font-mono text-[9.5px] tracking-[0.14em] text-volt uppercase">
                  free · every plan
                </span>
              </h3>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-mute">
                Use your own Anthropic, OpenAI, Google or OpenRouter keys — we just
                run the loop, billed by your provider. OpenRouter's free models
                cost $0. No Vibex token windows; keys encrypted at rest.
              </p>
            </div>
            <GhostButton href="#/login" small className="shrink-0">
              Set up your own key
            </GhostButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
