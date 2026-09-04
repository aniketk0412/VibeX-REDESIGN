import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { CONSOLE_LINES, WS_FILES, type LogLevel, type LogLine } from "../../lib/workspace";

export type Diff = { added: number; removed: number };
export type RunStatus = "idle" | "building" | "paused" | "passed";

type Ctx = {
  /** live (editable) file contents keyed by file name */
  files: Record<string, string[]>;
  setFile: (name: string, lines: string[]) => void;
  resetFile: (name: string) => void;
  /** per-file +/- line stats, Claude-Code style */
  diffs: Record<string, Diff>;
  markDiff: (name: string, d: Diff) => void;
  totals: Diff & { files: number };
  /** console */
  logs: LogLine[];
  pushLog: (level: LogLevel, text: string) => void;
  clearLogs: () => void;
  /** model selection */
  model: string;
  setModel: (m: string) => void;
  /** preview refresh signal */
  previewKey: number;
  bumpPreview: () => void;
  runStatus: RunStatus;
  setRunStatus: (status: RunStatus) => void;
  restoreVersion: (version: string) => void;
};

const WorkspaceCtx = createContext<Ctx | null>(null);

const BASE_FILES: Record<string, string[]> = Object.fromEntries(
  WS_FILES.map((f) => [f.name, f.lines]),
);

export function clock(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("vibex:workspace-files");
      return saved ? { ...BASE_FILES, ...(JSON.parse(saved) as Record<string, string[]>) } : { ...BASE_FILES };
    } catch {
      return { ...BASE_FILES };
    }
  });
  const [diffs, setDiffs] = useState<Record<string, Diff>>(() => {
    try {
      const saved = localStorage.getItem("vibex:workspace-diffs");
      return saved ? (JSON.parse(saved) as Record<string, Diff>) : {};
    } catch {
      return {};
    }
  });
  const [logs, setLogs] = useState<LogLine[]>(CONSOLE_LINES);
  const [model, setModel] = useState(() => {
    try {
      return sessionStorage.getItem("vibex:model") || localStorage.getItem("vibex:model") || "claude sonnet 4.5";
    } catch {
      return "claude sonnet 4.5";
    }
  });
  const [previewKey, setPreviewKey] = useState(0);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");

  const setFile = useCallback((name: string, lines: string[]) => {
    setFiles((prev) => ({ ...prev, [name]: lines }));
  }, []);

  const resetFile = useCallback((name: string) => {
    setFiles((prev) => ({ ...prev, [name]: BASE_FILES[name] ?? [] }));
    setDiffs((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const markDiff = useCallback((name: string, d: Diff) => {
    setDiffs((prev) => ({
      ...prev,
      [name]: {
        added: (prev[name]?.added ?? 0) + d.added,
        removed: (prev[name]?.removed ?? 0) + d.removed,
      },
    }));
  }, []);

  const pushLog = useCallback((level: LogLevel, text: string) => {
    setLogs((prev) => [...prev.slice(-300), { t: clock(), level, text }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);
  const bumpPreview = useCallback(() => setPreviewKey((k) => k + 1), []);

  const restoreVersion = useCallback((version: string) => {
    const next = Object.fromEntries(
      Object.entries(BASE_FILES).map(([name, lines]) => [name, [...lines]]),
    );
    if (version === "v2") {
      next["sync.ts"] = next["sync.ts"].filter((line) => !line.includes("streak"));
    }
    if (version === "v1") {
      next["App.tsx"] = [
        'import { HabitGrid } from "./components/HabitGrid";',
        "",
        "export default function App() {",
        "  return <HabitGrid />;",
        "}",
      ];
      next["HabitGrid.tsx"] = [
        "export function HabitGrid() {",
        '  return <section className="grid-7" />;',
        "}",
      ];
    }
    setFiles(next);
    setDiffs({});
    setPreviewKey((k) => k + 1);
    setLogs((prev) => [
      ...prev.slice(-300),
      { t: clock(), level: "info", text: `restored ${version} snapshot` },
      { t: clock(), level: "ok", text: "preview rebuilt from restored files" },
    ]);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vibex:model", model);
    } catch {
      /* Selection remains valid for the current session. */
    }
  }, [model]);

  useEffect(() => {
    try {
      localStorage.setItem("vibex:workspace-files", JSON.stringify(files));
      localStorage.setItem("vibex:workspace-diffs", JSON.stringify(diffs));
    } catch {
      /* Edits remain available until the room is closed. */
    }
  }, [files, diffs]);

  const totals = useMemo(() => {
    const vals = Object.values(diffs);
    return {
      added: vals.reduce((a, d) => a + d.added, 0),
      removed: vals.reduce((a, d) => a + d.removed, 0),
      files: vals.length,
    };
  }, [diffs]);

  const value = useMemo(
    () => ({
      files, setFile, resetFile, diffs, markDiff, totals,
      logs, pushLog, clearLogs, model, setModel, previewKey, bumpPreview,
      runStatus, setRunStatus, restoreVersion,
    }),
    [files, setFile, resetFile, diffs, markDiff, totals, logs, pushLog, clearLogs, model, previewKey, bumpPreview, runStatus, restoreVersion],
  );

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace(): Ctx {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

/** line-level diff counts between two versions of a file */
export function diffLines(before: string[], after: string[]): Diff {
  const b = new Map<string, number>();
  before.forEach((l) => b.set(l, (b.get(l) ?? 0) + 1));
  let added = 0;
  after.forEach((l) => {
    const n = b.get(l) ?? 0;
    if (n > 0) b.set(l, n - 1);
    else added++;
  });
  const removed = [...b.values()].reduce((a, n) => a + n, 0);
  return { added, removed };
}

export const MODELS = [
  { id: "claude sonnet 4.5", vendor: "anthropic", note: "balanced · best default", cost: "$3/M" },
  { id: "claude opus 4.5", vendor: "anthropic", note: "deepest reasoning", cost: "$15/M" },
  { id: "gpt-5", vendor: "openai", note: "strong at APIs", cost: "$5/M" },
  { id: "gemini 3 pro", vendor: "google", note: "huge context", cost: "$2/M" },
  { id: "qwen3-coder:free", vendor: "openrouter", note: "community · free", cost: "$0" },
];
