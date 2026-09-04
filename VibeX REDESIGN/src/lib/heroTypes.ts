import type { Block } from "../components/hero/PreviewCanvas";

export type Tone = "coder" | "reviewer" | "ok" | "flag" | "infra";

export type HeroFile = { name: string; path: string; lines: string[] };

/** One stage of the engineering pipeline shown beside the editor. */
export type Stage = { label: string; detail: string };

export type HeroRun = {
  id: string;
  project: string;
  prompt: string;
  target: string;
  stack: string[];
  spec: { files: number; cost: string; time: string };
  stages: Stage[];
  log: { tone: Tone; text: string }[];
  files: HeroFile[];
  preview: Block[];
};

/** Shared pipeline fragments — the serious engineering layer. */
export const S = {
  scaffold: { label: "Scaffold workspace", detail: "vite · typescript · strict mode" },
  schema: { label: "Model the schema", detail: "normalised tables · fk constraints" },
  db: { label: "Provision database", detail: "postgres 16 · pooled connections" },
  auth: { label: "Wire authentication", detail: "session cookies · rotating tokens" },
  api: { label: "Build API surface", detail: "typed handlers · zod validation" },
  ui: { label: "Compose interface", detail: "design tokens · responsive grid" },
  state: { label: "Wire state layer", detail: "optimistic writes · rollback" },
  security: { label: "Security audit", detail: "xss · csrf · injection surface" },
  perf: { label: "Optimise runtime", detail: "code-split · memo · lazy routes" },
  a11y: { label: "Accessibility pass", detail: "aria roles · focus order · contrast" },
  tests: { label: "Generate test suite", detail: "unit · integration · edge cases" },
  seo: { label: "Index + metadata", detail: "og tags · sitemap · structured data" },
  cache: { label: "Cache strategy", detail: "stale-while-revalidate · edge ttl" },
  rate: { label: "Rate limiting", detail: "token bucket · per-ip windows" },
  realtime: { label: "Realtime channel", detail: "websocket · backoff · resume" },
  pay: { label: "Payment rails", detail: "idempotency keys · webhook replay" },
  build: { label: "Compile & verify", detail: "0 errors · bundle budget met" },
};
