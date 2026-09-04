/* ================= workspace data layer ================= */

export type AgentKind = "interviewer" | "coder" | "reviewer";

export type FileEdit = {
  file: string;
  path: string;
  added: number;
  removed: number;
  action: "create" | "update" | "fix";
};

export type ChatMsg = {
  id: number;
  role: "user" | "agent" | "system";
  agent?: AgentKind;
  text?: string;
  code?: { file: string; body: string };
  edit?: FileEdit;
  spec?: boolean;
  time: string;
};

export function now(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const SPEC = {
  files: 9,
  cost: "$0.42",
  time: "~6 min",
  rows: [
    ["target", "web app · react + tailwind"],
    ["data", "local-first · localstorage"],
    ["auth", "none — single user"],
    ["theme", "dark · volt accent"],
  ] as [string, string][],
};

/* ---------- code files (shown in the Code tab) ---------- */

export type WsFile = { name: string; path: string; lines: string[] };

export const WS_FILES: WsFile[] = [
  {
    name: "App.tsx",
    path: "src/",
    lines: [
      'import { HabitGrid } from "./components/HabitGrid";',
      'import { Header } from "./components/Header";',
      'import { useSync } from "./lib/sync";',
      "",
      "export default function App() {",
      "  const { habits, toggle, streak } = useSync();",
      "",
      "  return (",
      '    <main className="shell">',
      "      <Header streak={streak} />",
      "      <HabitGrid habits={habits} onToggle={toggle} />",
      "    </main>",
      "  );",
      "}",
    ],
  },
  {
    name: "HabitGrid.tsx",
    path: "src/components/",
    lines: [
      'import { useEffect, useState } from "react";',
      'import type { Habit } from "../lib/types";',
      'import { HabitRow } from "./HabitRow";',
      "",
      "type Props = { habits: Habit[]; onToggle: (id: string) => void };",
      "",
      "export function HabitGrid({ habits, onToggle }: Props) {",
      "  const [rows, setRows] = useState(habits);",
      "",
      "  useEffect(() => {",
      "    setRows(habits);",
      "  }, [habits]);",
      "",
      "  return (",
      '    <section className="grid-7">',
      "      {rows.map((h) => (",
      '        <HabitRow key={h.id} habit={h} onToggle={onToggle} />',
      "      ))}",
      "    </section>",
      "  );",
      "}",
    ],
  },
  {
    name: "sync.ts",
    path: "src/lib/",
    lines: [
      'import { useState } from "react";',
      'import type { Habit } from "./types";',
      'import { seed } from "./seed";',
      "",
      "export function useSync() {",
      "  const [habits, setHabits] = useState<Habit[]>(seed);",
      "",
      "  const toggle = (id: string, day: number) =>",
      "    setHabits((xs) =>",
      "      xs.map((h) => (h.id === id ? flip(h, day) : h)),",
      "    );",
      "",
      "  const streak = longest(habits);",
      "  return { habits, toggle, streak };",
      "}",
    ],
  },
  {
    name: "HabitRow.tsx",
    path: "src/components/",
    lines: [
      'import type { Habit } from "../lib/types";',
      "",
      "export function HabitRow({ habit, onToggle }: Props) {",
      "  return (",
      '    <article className="habit-row">',
      "      <p>{habit.name}</p>",
      '      <div className="week">',
      "        {habit.days.map((done, day) => (",
      "          <button",
      "            key={day}",
      "            aria-pressed={done}",
      "            onClick={() => onToggle(habit.id, day)}",
      "          />",
      "        ))}",
      "      </div>",
      "    </article>",
      "  );",
      "}",
    ],
  },
  {
    name: "Header.tsx",
    path: "src/components/",
    lines: [
      "export function Header({ streak }: { streak: number }) {",
      "  return (",
      '    <header className="app-header">',
      "      <div>",
      '        <p className="eyebrow">habitly · week 32</p>',
      "        <h1>Tonight's list</h1>",
      "      </div>",
      '      <span className="streak">{streak}-day streak</span>',
      "    </header>",
      "  );",
      "}",
    ],
  },
  {
    name: "types.ts",
    path: "src/lib/",
    lines: [
      "export type Habit = {",
      "  id: string;",
      "  name: string;",
      "  days: boolean[];",
      "};",
      "",
      "export type Week = {",
      "  index: number;",
      "  label: string;",
      "};",
    ],
  },
  {
    name: "seed.ts",
    path: "src/lib/",
    lines: [
      'import type { Habit } from "./types";',
      "",
      "export const seed: Habit[] = [",
      '  { id: "read", name: "Read 20 pages", days: [true, true, true, true, true, true, false] },',
      '  { id: "ship", name: "Ship code", days: [true, true, false, true, true, false, false] },',
      '  { id: "run", name: "Morning run", days: [true, false, true, true, false, false, false] },',
      "];",
    ],
  },
];

export const TREE = [
  { dir: "src/", files: ["App.tsx"] },
  { dir: "src/components/", files: ["HabitGrid.tsx", "HabitRow.tsx", "Header.tsx"] },
  { dir: "src/lib/", files: ["sync.ts", "types.ts", "seed.ts"] },
];

/** reviewer's last auto-fix, highlighted by the "show fix" toggle */
export const LAST_FIX = {
  file: "HabitGrid.tsx",
  line: 11, // 0-based index of `}, [habits]);`
  note: "reviewer · added [habits] dep — was a stale closure",
};

/* ---------- console feed ---------- */

export type LogLevel = "info" | "ok" | "warn" | "err" | "cmd";
export type LogLine = { t: string; level: LogLevel; text: string };

export const CONSOLE_LINES: LogLine[] = [
  { t: "09:41:02", level: "cmd", text: "$ vibex run #43 --resume" },
  { t: "09:41:03", level: "info", text: "window reset — resuming from checkpoint (file 7/9)" },
  { t: "09:41:05", level: "info", text: "coder: writing src/components/StreakRing.tsx" },
  { t: "09:41:11", level: "ok", text: "reviewer: StreakRing.tsx clean — 86 lines" },
  { t: "09:41:14", level: "warn", text: "reviewer: flag — unused prop `compact` in HabitRow" },
  { t: "09:41:16", level: "info", text: "coder: removing prop + updating 2 call sites" },
  { t: "09:41:19", level: "ok", text: "reviewer: auto-fix verified — 0 issues" },
  { t: "09:41:24", level: "info", text: "coder: writing src/lib/notify.ts" },
  { t: "09:41:29", level: "ok", text: "reviewer: notify.ts clean — 41 lines" },
  { t: "09:41:33", level: "info", text: "reviewer: full pass on 9 files — types · a11y · dead code" },
  { t: "09:41:36", level: "cmd", text: "$ vite build" },
  { t: "09:41:37", level: "ok", text: "built in 812ms — 0 errors, 0 warnings" },
  { t: "09:41:37", level: "ok", text: "preview deployed to sandbox — habitly.vibex.app" },
];

/* ---------- versions ---------- */

export type Version = { v: string; label: string; time: string; current?: boolean };

export const VERSIONS: Version[] = [
  { v: "v3", label: "reviewer fixes · streak ring · notify", time: "now", current: true },
  { v: "v2", label: "streaks + dark UI pass", time: "12m ago" },
  { v: "v1", label: "initial scaffold · 6 files", time: "28m ago" },
];

/* ---------- scripted build sequence (after spec approval) ---------- */

export type ScriptStep =
  | { kind: "typing"; agent: AgentKind; ms: number }
  | { kind: "msg"; msg: Omit<ChatMsg, "id" | "time"> };

export const BUILD_SCRIPT: ScriptStep[] = [
  { kind: "typing", agent: "coder", ms: 1100 },
  {
    kind: "msg",
    msg: {
      role: "agent",
      agent: "coder",
      text: "Scaffolded. Writing the grid first — it's the heart of the app.",
      code: {
        file: "HabitGrid.tsx",
        body: "useEffect(() => {\n  setRows(habits);\n}, []);",
      },
      edit: { file: "HabitGrid.tsx", path: "src/components/", added: 21, removed: 0, action: "create" },
    },
  },
  { kind: "typing", agent: "reviewer", ms: 1400 },
  {
    kind: "msg",
    msg: {
      role: "agent",
      agent: "reviewer",
      text: "Flag on HabitGrid — that effect closes over stale state. Empty dep list means rows never update after the first render.",
    },
  },
  { kind: "typing", agent: "coder", ms: 1200 },
  {
    kind: "msg",
    msg: {
      role: "agent",
      agent: "coder",
      text: "Good catch. Patching the dep list now.",
      code: { file: "HabitGrid.tsx", body: "}, [habits]);  // fixed" },
      edit: { file: "HabitGrid.tsx", path: "src/components/", added: 1, removed: 1, action: "fix" },
    },
  },
  { kind: "typing", agent: "reviewer", ms: 1100 },
  {
    kind: "msg",
    msg: {
      role: "agent",
      agent: "reviewer",
      text: "Verified — re-ran the render trace, rows stay in sync. Moving on to sync + streak logic.",
    },
  },
  { kind: "typing", agent: "coder", ms: 1300 },
  {
    kind: "msg",
    msg: {
      role: "agent",
      agent: "coder",
      text: "Last file in. Streak counter, local persistence, dark theme tokens — all wired.",
      edit: { file: "sync.ts", path: "src/lib/", added: 16, removed: 2, action: "update" },
    },
  },
  {
    kind: "msg",
    msg: {
      role: "system",
      text: "run #43 complete — 9 files · 0 errors · preview updated on the right",
    },
  },
];

export const STEER_REPLIES: Omit<ChatMsg, "id" | "time">[] = [
  {
    role: "agent",
    agent: "coder",
    text: "On it — folding that into the current file set. Nothing restarts, nothing is lost.",
  },
  {
    role: "agent",
    agent: "reviewer",
    text: "Checked the steer against all 9 files — no conflicts. Verdict: clean to apply.",
  },
];
