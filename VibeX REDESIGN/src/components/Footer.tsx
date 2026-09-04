import { Logomark } from "./ui";

const COLS = [
  {
    title: "product",
    links: [
      ["How it works", "#how"],
      ["Features", "#features"],
      ["Safeguards", "#safeguards"],
      ["Pricing", "#pricing"],
      ["Open the app", "#/login"],
    ],
  },
  {
    title: "resources",
    links: [
      ["Product tour", "#how"],
      ["Model status", "#/login"],
      ["Build examples", "#features"],
      ["Free project", "#/signup"],
      ["Support", "#faq"],
    ],
  },
  {
    title: "legal",
    links: [
      ["Privacy", "#faq"],
      ["Terms", "#faq"],
      ["Security", "#safeguards"],
      ["Cookies", "#faq"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t hairline">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logomark className="h-7 w-7" />
              <span className="font-display text-xl font-medium tracking-tight">vibex</span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-mute">
              Automated vibe coding — you describe it once, the loop writes it,
              reviews it, and ships it working.
            </p>
            <div className="mt-6 flex w-fit items-center gap-2.5 rounded-full border hairline bg-panel px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-mute uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-dot" />
              all systems operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="u-sweep text-[13.5px] text-mute transition-colors duration-300 hover:text-bone"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t hairline py-6 font-mono text-[10.5px] tracking-[0.1em] text-faint">
          <span>© 2026 vibex — describe once, ship working</span>
          <span>this page was built by a coder + reviewer loop</span>
        </div>

        {/* giant wordmark */}
        <div className="pointer-events-none -mb-[2vw] overflow-hidden select-none">
          <p className="bg-gradient-to-b from-bone/[0.13] to-bone/[0.015] bg-clip-text text-center font-display text-[21.5vw] leading-[0.82] font-semibold tracking-[-0.03em] text-transparent">
            VIBEX
          </p>
        </div>
      </div>
    </footer>
  );
}
