const ITEMS = [
  "claude sonnet 4.5",
  "gpt-5",
  "gemini 3 pro",
  "openrouter",
  "aes-256 at rest",
  "vercel",
  "netlify",
  "github export",
  "stackblitz",
  "rolling windows",
];

function Asterisk() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-volt" aria-hidden>
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
        <line x1="19.8" y1="7.5" x2="4.2" y2="16.5" />
      </g>
    </svg>
  );
}

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="border-y hairline py-6">
      <p className="mb-5 text-center font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
        runs on your keys or ours — every major model, one loop
      </p>
      <div className="mask-x overflow-hidden">
        <div className="flex w-max items-center gap-10 animate-marquee hover:[animation-play-state:paused]">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-mono text-[13px] tracking-[0.14em] whitespace-nowrap text-bone/55 uppercase">
                {item}
              </span>
              <Asterisk />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
