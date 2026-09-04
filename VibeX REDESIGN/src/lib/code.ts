export type Tok = { t: string; c: string };

const KEYWORDS = new Set([
  "import", "export", "default", "function", "const", "return",
  "from", "type", "interface", "async", "await", "new", "let",
]);

const MASTER =
  /(\/\/.*$)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

/** Tokenize one line of pseudo-TSX into colored spans. Deterministic & cheap. */
export function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  MASTER.lastIndex = 0;
  while ((m = MASTER.exec(line))) {
    const [full, comment, str, num, ident, ws] = m;
    if (comment !== undefined) {
      out.push({ t: comment, c: "text-[#4e4e47]" });
    } else if (str !== undefined) {
      out.push({ t: str, c: "text-[#e9b872]" });
    } else if (num !== undefined) {
      out.push({ t: num, c: "text-[#e9b872]" });
    } else if (ident !== undefined) {
      if (KEYWORDS.has(ident)) out.push({ t: ident, c: "text-[#d9ff3f]" });
      else if (/^[A-Z]/.test(ident) || ident.startsWith("use"))
        out.push({ t: ident, c: "text-[#8ad4ff]" });
      else out.push({ t: ident, c: "text-[#dcdcd3]" });
    } else if (ws !== undefined) {
      out.push({ t: ws, c: "" });
    } else {
      out.push({ t: full, c: "text-[#6f6f68]" });
    }
  }
  return out;
}

/** Render `tokens` showing only `visible` characters from the left. */
export function sliceTokens(tokens: Tok[], visible: number): Tok[] {
  const out: Tok[] = [];
  let used = 0;
  for (const tk of tokens) {
    if (used >= visible) break;
    const take = Math.min(tk.t.length, visible - used);
    out.push({ t: tk.t.slice(0, take), c: tk.c });
    used += take;
  }
  return out;
}

export type SimFile = {
  name: string;
  langHint: string;
  lines: string[];
  /** line that the Reviewer patches mid-build (optional) */
  patch?: { lineIdx: number; from: string; to: string; note: string };
};

export const SIM_FILES: SimFile[] = [
  {
    name: "App.tsx",
    langHint: "src/",
    lines: [
      'import { useSync } from "./lib/sync";',
      'import { HabitGrid } from "./components/HabitGrid";',
      'import { Header } from "./components/Header";',
      "",
      "export default function App() {",
      "  const { habits, toggle } = useSync();",
      "",
      "  return (",
      '    <main className="shell">',
      "      <Header streak={longest(habits)} />",
      "      <HabitGrid habits={habits} onToggle={toggle} />",
      "    </main>",
      "  );",
      "}",
    ],
  },
  {
    name: "HabitGrid.tsx",
    langHint: "components/",
    lines: [
      'import { useEffect, useState } from "react";',
      'import type { Habit } from "../lib/types";',
      'import { HabitRow } from "./HabitRow";',
      "",
      "export function HabitGrid({ habits, onToggle }: Props) {",
      "  const [done, setDone] = useState(habits);",
      "",
      "  useEffect(() => {",
      "    setDone(habits);",
      "  }, []);",
      "",
      "  return (",
      '    <section className="grid-7">',
      "      {done.map((h) => <HabitRow key={h.id} h={h} />)}",
      "    </section>",
      "  );",
      "}",
    ],
    patch: {
      lineIdx: 9,
      from: "  }, []);",
      to: "  }, [habits]);",
      note: "stale closure — dep list was []",
    },
  },
  {
    name: "sync.ts",
    langHint: "lib/",
    lines: [
      'import { useState } from "react";',
      'import type { Habit } from "./types";',
      "",
      "export function useSync() {",
      "  const [habits, setHabits] = useState<Habit[]>(seed);",
      "",
      "  const toggle = (id: string) =>",
      "    setHabits((xs) =>",
      "      xs.map((h) => (h.id === id ? { ...h, done: !h.done } : h)),",
      "    );",
      "",
      "  return { habits, toggle };",
      "}",
    ],
  },
];
