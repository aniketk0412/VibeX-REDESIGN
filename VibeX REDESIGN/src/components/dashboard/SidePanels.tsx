import { motion } from "framer-motion";
import {
  Check, FolderGit2, KeyRound, Pause, Plus, Rocket, TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useResetClock } from "../../hooks/useResetClock";
import { ACTIVITY, USAGE, fmtTokens, type ActivityKind } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";

/* ===================== activity feed ===================== */

const KIND_ICON: Record<ActivityKind, { icon: typeof Check; tone: string }> = {
  ok: { icon: Check, tone: "text-volt" },
  flag: { icon: TriangleAlert, tone: "text-[#e9b872]" },
  rocket: { icon: Rocket, tone: "text-volt" },
  pause: { icon: Pause, tone: "text-[#e9b872]" },
  key: { icon: KeyRound, tone: "text-[#8ad4ff]" },
  git: { icon: FolderGit2, tone: "text-mute" },
};

export function ActivityFeed() {
  return (
    <div className="rounded-2xl border hairline bg-panel">
      <div className="flex items-center justify-between border-b hairline px-5 py-3.5">
        <p className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">activity</p>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] text-volt">
          <span className="h-1 w-1 rounded-full bg-volt animate-pulse-dot" /> live
        </span>
      </div>
      <div className="p-2.5">
        {ACTIVITY.map((a, i) => {
          const { icon: Icon, tone } = KIND_ICON[a.kind];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
              className="group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200 hover:bg-bone/[0.03]"
            >
              {i < ACTIVITY.length - 1 && (
                <span className="absolute top-8 left-[21px] h-[calc(100%-16px)] w-px bg-bone/[0.06]" />
              )}
              <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border hairline bg-coal">
                <Icon className={cn("h-3 w-3", tone)} />
              </span>
              <p className="flex-1 text-[12.5px] leading-snug text-bone/80">
                {a.text}
                {a.project && (
                  <span className="ml-1.5 rounded border hairline px-1.5 py-px font-mono text-[9px] text-faint">
                    {a.project}
                  </span>
                )}
              </p>
              <span className="shrink-0 font-mono text-[9.5px] text-faint">{a.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== usage panel ===================== */

function Ring({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 36;
  return (
    <div className="relative h-[88px] w-[88px]">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgb(239 239 232 / 0.07)" strokeWidth="6" />
        <motion.circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="#d9ff3f"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[19px] font-medium tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

export function UsagePanel() {
  const { clock } = useResetClock();
  const { user, updatePlan } = useAuth();
  const [scale, setScale] = useState(() => {
    try {
      return user?.plan === "scale" || localStorage.getItem("vibex:plan") === "scale";
    } catch {
      return false;
    }
  });
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

  return (
    <div className="flex h-full flex-col rounded-2xl border hairline bg-panel">
      <div className="border-b hairline px-5 py-3.5">
        <p className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">usage & plan</p>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        {/* 5-hour window */}
        <div className="flex items-center gap-5">
          <Ring pct={USAGE.window.pct} />
          <div>
            <p className="font-mono text-[9.5px] tracking-[0.18em] text-faint uppercase">5-hour window</p>
            <p className="mt-1.5 text-[15px] text-bone/90 tabular-nums">
              {fmtTokens(USAGE.window.used)}{" "}
              <span className="text-mute">of {fmtTokens(USAGE.window.cap)} tokens</span>
            </p>
            <p className="mt-1 font-mono text-[10px] text-mute">
              resets in <span className="text-volt tabular-nums">{clock}</span>
            </p>
            <p className="mt-1 font-mono text-[9px] leading-relaxed text-faint">
              auto-pauses on the cap — never loses progress
            </p>
          </div>
        </div>

        {/* monthly */}
        <div className="border-t hairline pt-4">
          <div className="flex items-baseline justify-between font-mono text-[9.5px] tracking-[0.14em] uppercase">
            <span className="text-faint">this month</span>
            <span className="text-mute tabular-nums">
              {fmtTokens(USAGE.month.used)} / {fmtTokens(USAGE.month.cap)}
            </span>
          </div>
          <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-bone/[0.07]">
            <motion.div
              className="h-full rounded-full bg-volt/85"
              initial={{ width: 0 }}
              whileInView={{ width: `${USAGE.month.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-faint tabular-nums">
            resets in {daysLeft} day{daysLeft === 1 ? "" : "s"}
          </p>
        </div>

        {/* plan */}
        <div className="rounded-xl border border-volt/20 bg-volt/[0.04] p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-[15px] font-medium">{scale ? "scale plan" : "pro plan"}</p>
            <p className="font-mono text-[10px] text-mute">{scale ? "$79/mo" : "$29/mo"}</p>
          </div>
          <p className="mt-1 font-mono text-[9.5px] leading-relaxed text-mute">
            {scale ? "1.5M windows · 3 concurrent builds · priority support" : "500k windows · design polish · 1-click deploy · github export"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setScale((v) => {
                const next = !v;
                try {
                  localStorage.setItem("vibex:plan", next ? "scale" : "pro");
                } catch {
                  /* The visual plan state still updates. */
                }
                updatePlan(next ? "scale" : "pro");
                return next;
              })}
              className="flex-1 rounded-lg bg-volt px-3 py-2 font-mono text-[10.5px] font-medium text-coal transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {scale ? "switch back to pro" : "upgrade to scale"}
            </button>
            <a href="#/app/settings" className="rounded-lg border hairline px-3 py-2 font-mono text-[10.5px] text-mute transition-colors hover:border-bone/20 hover:text-bone">
              manage
            </a>
          </div>
        </div>

        {/* keys */}
        <div className="space-y-2">
          {["anthropic", "openrouter"].map((k) => (
            <div key={k} className="flex items-center justify-between rounded-lg border hairline bg-coal/50 px-3 py-2.5">
              <span className="flex items-center gap-2 font-mono text-[10.5px] text-bone/85">
                <KeyRound className="h-3 w-3 text-volt" /> {k}
              </span>
              <span className="font-mono text-[9px] text-faint">aes-256 · connected</span>
            </div>
          ))}
          <a href="#/app/keys" className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-bone/15 px-3 py-2.5 font-mono text-[10.5px] text-mute transition-colors duration-300 hover:border-volt/30 hover:text-volt">
            <Plus className="h-3 w-3" /> add provider key
          </a>
        </div>
      </div>
    </div>
  );
}
