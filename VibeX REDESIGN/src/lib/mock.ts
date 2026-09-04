/* ---------------- shared types ---------------- */

export type ProjectStatus = "building" | "passed" | "paused" | "draft";
export type ThumbKind =
  | "habits"
  | "charts"
  | "terminal"
  | "portfolio"
  | "invoice"
  | "chat";

export type Project = {
  id: string;
  name: string;
  prompt: string;
  status: ProjectStatus;
  statusNote?: string;
  updated: string;
  stack: string[];
  files: number;
  cost: string;
  thumb: ThumbKind;
  deploy?: string;
};

/* ---------------- projects ---------------- */

export const PROJECTS: Project[] = [
  {
    id: "habitly",
    name: "habitly",
    prompt: "habit tracker with streaks and a dark UI",
    status: "building",
    statusNote: "run #43 · file 7/9",
    updated: "2m ago",
    stack: ["React", "Tailwind", "local-first"],
    files: 9,
    cost: "$0.38",
    thumb: "habits",
  },
  {
    id: "chatbase-mini",
    name: "chatbase-mini",
    prompt: "support chat widget for my shopify store",
    status: "building",
    statusNote: "queued · run #44",
    updated: "6m ago",
    stack: ["React", "WebSocket", "widget"],
    files: 11,
    cost: "est. $0.51",
    thumb: "chat",
  },
  {
    id: "pulseboard",
    name: "pulseboard",
    prompt: "analytics dashboard for my newsletter",
    status: "passed",
    updated: "3h ago",
    stack: ["React", "Recharts", "API"],
    files: 14,
    cost: "$0.62",
    thumb: "charts",
    deploy: "pulseboard.vibex.app",
  },
  {
    id: "shadeui",
    name: "shadeui",
    prompt: "portfolio site for a photographer friend",
    status: "paused",
    statusNote: "window cap · resumes soon",
    updated: "5h ago",
    stack: ["Astro", "Tailwind", "CMS"],
    files: 8,
    cost: "$0.29",
    thumb: "portfolio",
  },
  {
    id: "forksmith",
    name: "forksmith",
    prompt: "CLI that cleans up stale git branches",
    status: "passed",
    updated: "1d ago",
    stack: ["Node", "CLI", "npm"],
    files: 6,
    cost: "$0.21",
    thumb: "terminal",
    deploy: "npm i -g forksmith",
  },
  {
    id: "invoicely",
    name: "invoicely",
    prompt: "invoice generator with PDF export",
    status: "passed",
    updated: "2d ago",
    stack: ["React", "PDF", "Stripe"],
    files: 17,
    cost: "$0.84",
    thumb: "invoice",
    deploy: "invoicely.vibex.app",
  },
  {
    id: "driflog",
    name: "driflog",
    prompt: "travel journal with an interactive map",
    status: "draft",
    statusNote: "interview · 2 questions left",
    updated: "3d ago",
    stack: ["React", "Mapbox"],
    files: 0,
    cost: "—",
    thumb: "portfolio",
  },
];

/* ---------------- activity feed ---------------- */

export type ActivityKind = "ok" | "flag" | "rocket" | "pause" | "key" | "git";

export type ActivityItem = {
  id: number;
  kind: ActivityKind;
  text: string;
  project?: string;
  time: string;
};

export const ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    kind: "flag",
    text: "reviewer flagged StreakRing.tsx — unused prop · auto-fix verified",
    project: "habitly",
    time: "now",
  },
  {
    id: 2,
    kind: "ok",
    text: "build #42 passed — 0 errors · 7 files · $0.38",
    project: "habitly",
    time: "4m",
  },
  {
    id: 3,
    kind: "ok",
    text: "interview locked spec — estimated 9 files · $0.42",
    project: "chatbase-mini",
    time: "12m",
  },
  {
    id: 4,
    kind: "rocket",
    text: "deployed to vercel — pulseboard.vibex.app",
    project: "pulseboard",
    time: "3h",
  },
  {
    id: 5,
    kind: "pause",
    text: "window cap reached — build saved, auto-resumes after reset",
    project: "shadeui",
    time: "5h",
  },
  {
    id: 6,
    kind: "git",
    text: "exported to github — alexlux/forksmith",
    project: "forksmith",
    time: "1d",
  },
  {
    id: 7,
    kind: "key",
    text: "provider key added — openrouter (aes-256)",
    time: "2d",
  },
];

/* ---------------- usage ---------------- */

export const USAGE = {
  window: { used: 214_300, cap: 500_000, pct: 43 },
  month: { used: 2_140_000, cap: 12_000_000, pct: 18 },
  plan: "pro",
};

/* ---------------- live run scripts ---------------- */

export type RunLine = { at: number; kind: "cmd" | "dim" | "ok" | "flag" | "note"; text: string };
export type RunScript = {
  project: string;
  run: string;
  goal: string;
  end: number; // seconds → passed
  lines: RunLine[];
};

export const RUN_SCRIPTS: RunScript[] = [
  {
    project: "habitly",
    run: "run #43",
    goal: "habit tracker with streaks and a dark UI",
    end: 24,
    lines: [
      { at: 0.5, kind: "note", text: "resuming run #43 — window reset" },
      { at: 1.6, kind: "cmd", text: "$ coder: write src/components/StreakRing.tsx" },
      { at: 3.6, kind: "dim", text: "86 lines · props typed · tailwind ok" },
      { at: 5.2, kind: "note", text: "reviewer: checking StreakRing.tsx" },
      { at: 6.6, kind: "flag", text: "✗ flag — unused prop `compact`" },
      { at: 7.4, kind: "dim", text: "coder: removing prop + updating call site" },
      { at: 9.2, kind: "ok", text: "✓ auto-fix verified" },
      { at: 10.8, kind: "cmd", text: "$ coder: write src/lib/notify.ts" },
      { at: 13.0, kind: "ok", text: "✓ clean — 41 lines" },
      { at: 14.4, kind: "note", text: "reviewer: full pass on 9 files" },
      { at: 17.2, kind: "ok", text: "✓ 0 issues — types · a11y · dead code" },
      { at: 19.8, kind: "cmd", text: "$ vite build" },
      { at: 22.2, kind: "ok", text: "✓ built in 812ms — 0 errors" },
      { at: 23.6, kind: "note", text: "run complete — preview ready" },
    ],
  },
  {
    project: "chatbase-mini",
    run: "run #44",
    goal: "support chat widget for my shopify store",
    end: 26,
    lines: [
      { at: 0.5, kind: "note", text: "starting run #44 — spec approved" },
      { at: 1.4, kind: "cmd", text: "$ coder: scaffold vite + react-ts" },
      { at: 2.8, kind: "ok", text: "✓ scaffolded — 11 files planned" },
      { at: 4.0, kind: "cmd", text: "$ coder: write src/widget/ChatWidget.tsx" },
      { at: 6.1, kind: "dim", text: "shadow-dom mount · theming tokens" },
      { at: 7.5, kind: "note", text: "reviewer: checking ChatWidget.tsx" },
      { at: 8.9, kind: "flag", text: "✗ flag — listener leak in useEffect" },
      { at: 9.7, kind: "dim", text: "coder: adding cleanup return" },
      { at: 11.4, kind: "ok", text: "✓ auto-fix verified" },
      { at: 13.0, kind: "cmd", text: "$ coder: write src/lib/socket.ts" },
      { at: 15.3, kind: "ok", text: "✓ clean — reconnect backoff ok" },
      { at: 17.2, kind: "note", text: "reviewer: full pass on 11 files" },
      { at: 20.0, kind: "ok", text: "✓ 0 issues — types · a11y · bundle 18kb" },
      { at: 22.4, kind: "cmd", text: "$ vite build --lib" },
      { at: 24.8, kind: "ok", text: "✓ built in 940ms — 0 errors" },
      { at: 25.6, kind: "note", text: "run complete — preview ready" },
    ],
  },
];

/* ---------------- placeholders for command bar ---------------- */

export const IDEA_PLACEHOLDERS = [
  "a booking page for my tattoo studio…",
  "a pomodoro app with lo-fi sounds…",
  "an API that screenshots any url…",
  "a job tracker with a kanban board…",
];

/* ---------------- stats ---------------- */

export const STATS = [
  {
    label: "builds shipped",
    value: 23,
    suffix: "",
    delta: "+4 this week",
    up: true,
    spark: [4, 6, 5, 9, 8, 12, 11, 15, 14, 19, 23],
  },
  {
    label: "first-pass rate",
    value: 94.2,
    suffix: "%",
    delta: "+2.1 vs last mo",
    up: true,
    spark: [88, 89, 91, 90, 92, 91, 93, 92, 94, 93, 94],
  },
  {
    label: "avg build time",
    value: 6.2,
    suffix: "m",
    delta: "-18% vs last mo",
    up: true,
    spark: [9, 8.6, 8.9, 8.1, 7.8, 7.4, 7.6, 7.1, 6.8, 6.5, 6.2],
  },
  {
    label: "flags auto-fixed",
    value: 31,
    suffix: "",
    delta: "97% without you",
    up: true,
    spark: [3, 5, 4, 8, 7, 12, 15, 18, 22, 27, 31],
  },
];

/* ---------------- helpers ---------------- */

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function fmtClock(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor(totalSeconds / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
