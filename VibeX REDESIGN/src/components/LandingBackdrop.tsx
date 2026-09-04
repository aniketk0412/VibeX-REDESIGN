/**
 * The autonomous build engine behind the landing page.
 *
 * Files move through the Coder lane, cross the Reviewer feedback loop, merge
 * inside the compiler core, then leave as one verified output. Every moving
 * object has a product meaning, so the animation stays clear rather than noisy.
 */

function CodePacket({
  path,
  begin,
  duration,
  tone = "volt",
  file,
}: {
  path: string;
  begin: string;
  duration: string;
  tone?: "volt" | "cyan";
  file?: string;
}) {
  const color = tone === "volt" ? "#d9ff3f" : "#8ad4ff";
  return (
    <g className="build-packet" opacity="0">
      <rect x="-25" y="-17" width="50" height="34" rx="7" fill="#0c0c0e" stroke={color} strokeOpacity="0.58" />
      <path d="M-14 -7 H12 M-14 0 H17 M-14 7 H5" stroke={color} strokeOpacity="0.62" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="-8" r="2.5" fill={color} />
      {file && <text x="0" y="29" textAnchor="middle" className="engine-packet-name">{file}</text>}
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.88;1" dur={duration} begin={begin} repeatCount="indefinite" />
      <animateMotion dur={duration} begin={begin} repeatCount="indefinite" rotate="auto">
        <mpath href={path} />
      </animateMotion>
    </g>
  );
}

function VerifiedPacket({ begin }: { begin: string }) {
  return (
    <g className="build-packet" opacity="0">
      <rect x="-27" y="-18" width="54" height="36" rx="8" fill="#d9ff3f" />
      <path d="M-10 0 L-3 7 L12 -8" fill="none" stroke="#070708" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.82;1" dur="5.8s" begin={begin} repeatCount="indefinite" />
      <animateMotion dur="5.8s" begin={begin} repeatCount="indefinite" rotate="0">
        <mpath href="#verified-output" />
      </animateMotion>
    </g>
  );
}

export default function LandingBackdrop() {
  return (
    <div
      className="landing-engine pointer-events-none absolute inset-x-0 top-0 z-0 h-[1420px] overflow-hidden bg-coal"
      aria-hidden
    >
      {/* Large atmospheric light, never granular. */}
      <div className="engine-aurora engine-aurora-volt" />
      <div className="engine-aurora engine-aurora-cyan" />

      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-x-0 top-0 h-[920px] min-h-[760px] w-full"
      >
        <defs>
          <linearGradient id="coder-lane" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#d9ff3f" stopOpacity="0" />
            <stop offset="0.52" stopColor="#d9ff3f" stopOpacity="0.22" />
            <stop offset="1" stopColor="#d9ff3f" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="review-lane" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#8ad4ff" stopOpacity="0" />
            <stop offset="0.52" stopColor="#8ad4ff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#8ad4ff" stopOpacity="0.68" />
          </linearGradient>
          <linearGradient id="success-lane" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#d9ff3f" stopOpacity="0.74" />
            <stop offset="0.48" stopColor="#d9ff3f" stopOpacity="0.2" />
            <stop offset="1" stopColor="#d9ff3f" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="compiler-core">
            <stop offset="0" stopColor="#efffe0" stopOpacity="0.95" />
            <stop offset="0.12" stopColor="#d9ff3f" stopOpacity="0.7" />
            <stop offset="0.42" stopColor="#d9ff3f" stopOpacity="0.13" />
            <stop offset="1" stopColor="#d9ff3f" stopOpacity="0" />
          </radialGradient>
          <filter id="lane-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="17" />
          </filter>
          <filter id="core-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="30" />
          </filter>

          {/* Motion paths are visible below and also drive the packets. */}
          <path id="coder-input" d="M-90 800 C260 790 410 710 535 575 C615 490 660 455 728 442" />
          <path id="review-input" d="M1690 800 C1340 790 1190 710 1065 575 C985 490 940 455 872 442" />
          <path id="feedback-loop" d="M885 438 C1090 335 1040 180 800 194 C560 180 510 335 715 438" />
          <path id="verified-output" d="M800 418 C800 315 800 165 800 -90" />
        </defs>

        {/* Broad lane glow defines the composition before any fine detail. */}
        <path d="M-90 800 C260 790 410 710 535 575 C615 490 660 455 728 442" fill="none" stroke="#d9ff3f" strokeOpacity="0.08" strokeWidth="80" strokeLinecap="round" filter="url(#lane-glow)" />
        <path d="M1690 800 C1340 790 1190 710 1065 575 C985 490 940 455 872 442" fill="none" stroke="#8ad4ff" strokeOpacity="0.07" strokeWidth="80" strokeLinecap="round" filter="url(#lane-glow)" />

        {/* Coder and Reviewer lanes. */}
        <use href="#coder-input" fill="none" stroke="url(#coder-lane)" strokeWidth="2" strokeLinecap="round" />
        <use href="#coder-input" className="engine-dash engine-dash-volt" fill="none" stroke="#d9ff3f" strokeOpacity="0.2" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 22" />
        <use href="#review-input" fill="none" stroke="url(#review-lane)" strokeWidth="2" strokeLinecap="round" />
        <use href="#review-input" className="engine-dash engine-dash-cyan" fill="none" stroke="#8ad4ff" strokeOpacity="0.2" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 22" />

        {/* Feedback orbit where review sends a fix back to the coder. */}
        <use href="#feedback-loop" fill="none" stroke="#8ad4ff" strokeOpacity="0.11" strokeWidth="34" filter="url(#lane-glow)" />
        <use href="#feedback-loop" className="engine-feedback" fill="none" stroke="url(#review-lane)" strokeOpacity="0.62" strokeWidth="1.6" strokeDasharray="10 13" />

        {/* Peripheral telemetry adds product detail without sitting under copy. */}
        <g className="engine-telemetry engine-telemetry-left">
          <text x="86" y="390" className="engine-kicker">INPUT QUEUE</text>
          <text x="86" y="426" className="engine-telemetry-number">03</text>
          <text x="86" y="450" className="engine-meta engine-meta-dim">files waiting</text>
          <path d="M86 468 H238" stroke="#d9ff3f" strokeOpacity="0.14" />
          <rect x="86" y="486" width="112" height="8" rx="4" fill="#d9ff3f" fillOpacity="0.16" />
          <rect x="86" y="507" width="78" height="8" rx="4" fill="#d9ff3f" fillOpacity="0.1" />
          <rect x="86" y="528" width="134" height="8" rx="4" fill="#d9ff3f" fillOpacity="0.07" />
        </g>
        <g className="engine-telemetry engine-telemetry-right">
          <text x="1514" y="390" textAnchor="end" className="engine-kicker engine-kicker-cyan">REVIEW PASS</text>
          <text x="1514" y="426" textAnchor="end" className="engine-telemetry-number engine-telemetry-number-cyan">01</text>
          <text x="1514" y="450" textAnchor="end" className="engine-meta engine-meta-dim">0 blocking issues</text>
          <path d="M1362 468 H1514" stroke="#8ad4ff" strokeOpacity="0.14" />
          <text x="1514" y="493" textAnchor="end" className="engine-meta engine-meta-cyan">types   pass</text>
          <text x="1514" y="514" textAnchor="end" className="engine-meta engine-meta-cyan">a11y   pass</text>
          <text x="1514" y="535" textAnchor="end" className="engine-meta engine-meta-cyan">imports pass</text>
        </g>

        {/* CODER — a labelled terminal window writing files. */}
        <g className="engine-agent engine-agent-left">
          {/* window */}
          <rect x="196" y="612" width="228" height="152" rx="18" fill="#0c0c0e" stroke="#d9ff3f" strokeOpacity="0.26" />
          <rect x="196" y="612" width="228" height="34" rx="18" fill="#d9ff3f" fillOpacity="0.05" />
          <path d="M196 646 H424" stroke="#d9ff3f" strokeOpacity="0.16" strokeWidth="1" />
          {/* title bar */}
          <circle cx="216" cy="629" r="3.6" fill="#d9ff3f" fillOpacity="0.55" />
          <circle cx="228" cy="629" r="3.6" fill="#efefe8" fillOpacity="0.14" />
          <circle cx="240" cy="629" r="3.6" fill="#efefe8" fillOpacity="0.14" />
          <text x="258" y="634" className="engine-label engine-label-volt">CODER</text>
          <text x="404" y="634" textAnchor="end" className="engine-meta engine-meta-volt">writing</text>
          {/* code lines being typed */}
          <rect className="engine-code-line engine-code-1" x="216" y="666" width="118" height="7" rx="3.5" fill="#d9ff3f" fillOpacity="0.4" />
          <rect className="engine-code-line engine-code-2" x="216" y="683" width="86" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.16" />
          <rect className="engine-code-line engine-code-3" x="228" y="700" width="132" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.12" />
          <rect className="engine-code-line engine-code-4" x="228" y="717" width="70" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.1" />
          <rect className="engine-caret" x="302" y="717" width="8" height="7" rx="2" fill="#d9ff3f" />
          {/* status footer */}
          <path d="M196 738 H424" stroke="#d9ff3f" strokeOpacity="0.12" strokeWidth="1" />
          <circle className="engine-status-dot" cx="218" cy="752" r="4" fill="#d9ff3f" />
          <text x="232" y="756" className="engine-meta engine-meta-dim">HabitGrid.tsx</text>
          <text x="404" y="756" textAnchor="end" className="engine-meta engine-meta-volt">+124</text>
        </g>

        {/* REVIEWER — a labelled panel verifying each file. */}
        <g className="engine-agent engine-agent-right">
          <rect x="1176" y="612" width="228" height="152" rx="18" fill="#0c0c0e" stroke="#8ad4ff" strokeOpacity="0.26" />
          <rect x="1176" y="612" width="228" height="34" rx="18" fill="#8ad4ff" fillOpacity="0.05" />
          <path d="M1176 646 H1404" stroke="#8ad4ff" strokeOpacity="0.16" strokeWidth="1" />
          <circle cx="1196" cy="629" r="3.6" fill="#8ad4ff" fillOpacity="0.55" />
          <circle cx="1208" cy="629" r="3.6" fill="#efefe8" fillOpacity="0.14" />
          <circle cx="1220" cy="629" r="3.6" fill="#efefe8" fillOpacity="0.14" />
          <text x="1238" y="634" className="engine-label engine-label-cyan">REVIEWER</text>
          <text x="1384" y="634" textAnchor="end" className="engine-meta engine-meta-cyan">checking</text>
          {/* verification checklist */}
          <g className="engine-check engine-check-1">
            <path d="M1198 670 L1206 678 L1221 662" fill="none" stroke="#8ad4ff" strokeOpacity="0.85" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="1234" y="666" width="88" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.15" />
          </g>
          <g className="engine-check engine-check-2">
            <path d="M1198 697 L1206 705 L1221 689" fill="none" stroke="#8ad4ff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="1234" y="693" width="112" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.13" />
          </g>
          <g className="engine-check engine-check-3">
            <path d="M1198 724 L1206 732 L1221 716" fill="none" stroke="#8ad4ff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="1234" y="720" width="64" height="7" rx="3.5" fill="#efefe8" fillOpacity="0.11" />
          </g>
          <path d="M1176 738 H1404" stroke="#8ad4ff" strokeOpacity="0.12" strokeWidth="1" />
          <circle className="engine-status-dot engine-status-delay" cx="1198" cy="752" r="4" fill="#8ad4ff" />
          <text x="1212" y="756" className="engine-meta engine-meta-dim">0 issues</text>
          <text x="1384" y="756" textAnchor="end" className="engine-meta engine-meta-cyan">verified</text>
        </g>

        {/* Lane captions so the flow direction reads instantly. */}
        <text x="470" y="556" className="engine-caption engine-caption-volt">writes every file</text>
        <text x="1130" y="556" textAnchor="end" className="engine-caption engine-caption-cyan">verifies every file</text>
        <text x="800" y="196" textAnchor="middle" className="engine-caption engine-caption-volt">ships working code</text>

        {/* Moving files on both lanes and one reviewed fix circling back. */}
        <CodePacket path="#coder-input" begin="-0.8s" duration="7.6s" file="App.tsx" />
        <CodePacket path="#coder-input" begin="-4.6s" duration="7.6s" file="sync.ts" />
        <CodePacket path="#review-input" begin="-2.2s" duration="8.4s" tone="cyan" file="Grid.tsx" />
        <CodePacket path="#review-input" begin="-6.4s" duration="8.4s" tone="cyan" file="types.ts" />
        <CodePacket path="#feedback-loop" begin="-1.4s" duration="6.8s" tone="cyan" file="fix +1 -1" />

        {/* Compiler core: segmented rings rotate in opposite directions. */}
        <circle cx="800" cy="430" r="150" fill="url(#compiler-core)" opacity="0.14" filter="url(#core-blur)" />
        <circle className="engine-ring engine-ring-outer" cx="800" cy="430" r="108" fill="none" stroke="#d9ff3f" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="34 18 5 18" />
        <circle className="engine-ring engine-ring-inner" cx="800" cy="430" r="82" fill="none" stroke="#8ad4ff" strokeOpacity="0.19" strokeWidth="1.4" strokeDasharray="8 15" />

        {/* Two agents orbiting the core — coder and reviewer in lockstep. */}
        <g className="engine-ring engine-orbit">
          <circle cx="908" cy="430" r="4.5" fill="#d9ff3f" fillOpacity="0.85" />
          <circle cx="692" cy="430" r="4.5" fill="#8ad4ff" fillOpacity="0.85" />
        </g>

        <circle className="engine-pulse" cx="800" cy="430" r="55" fill="none" stroke="#d9ff3f" strokeOpacity="0.36" strokeWidth="1.5" />
        <circle className="engine-pulse engine-pulse-late" cx="800" cy="430" r="55" fill="none" stroke="#8ad4ff" strokeOpacity="0.22" strokeWidth="1.2" />
        <circle cx="800" cy="430" r="47" fill="#09090b" stroke="#d9ff3f" strokeOpacity="0.34" />
        <path d="M778 409 L800 452 L822 409" fill="none" stroke="#d9ff3f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

        {/* Core identity + live build readout. */}
        <text x="800" y="510" textAnchor="middle" className="engine-label engine-label-volt">BUILD CORE</text>
        <text x="800" y="533" textAnchor="middle" className="engine-meta engine-meta-dim">coder + reviewer loop</text>

        {/* Build telemetry anchored below the core. */}
        <g className="engine-build-readout">
          <rect x="679" y="554" width="242" height="42" rx="13" fill="#0a0a0c" stroke="#d9ff3f" strokeOpacity="0.15" />
          <circle cx="701" cy="575" r="4" fill="#d9ff3f" className="engine-status-dot" />
          <text x="714" y="579" className="engine-meta engine-meta-volt">BUILD 07 / 09</text>
          <text x="899" y="579" textAnchor="end" className="engine-meta engine-meta-dim">$0.38</text>
        </g>

        {/* A clean verified output leaves the core. */}
        <path d="M800 418 C800 315 800 165 800 -90" fill="none" stroke="#d9ff3f" strokeOpacity="0.1" strokeWidth="68" strokeLinecap="round" filter="url(#lane-glow)" />
        <use href="#verified-output" fill="none" stroke="url(#success-lane)" strokeWidth="2" />
        <VerifiedPacket begin="-0.4s" />
        <VerifiedPacket begin="-3.3s" />
      </svg>

      {/* Strong center scrim keeps headline copy readable; the engine stays at the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_34%_38%_at_50%_34%,rgb(7_7_8/0.78)_0%,rgb(7_7_8/0.48)_46%,transparent_82%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgb(7_7_8/0.12)_55%,rgb(7_7_8/0.96)_92%,#070708_100%)]" />
    </div>
  );
}