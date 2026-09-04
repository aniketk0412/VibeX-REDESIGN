/* ================= builds ================= */

export type BuildRow = {
  id: string;
  project: string;
  run: string;
  status: "passed" | "building" | "failed" | "paused";
  files: number;
  added: number;
  removed: number;
  flags: number;
  duration: string;
  cost: string;
  model: string;
  when: string;
};

export const BUILDS: BuildRow[] = [
  { id: "b43", project: "habitly", run: "#43", status: "building", files: 9, added: 214, removed: 38, flags: 1, duration: "4m 12s", cost: "$0.38", model: "sonnet 4.5", when: "now" },
  { id: "b42", project: "habitly", run: "#42", status: "passed", files: 7, added: 168, removed: 12, flags: 2, duration: "5m 48s", cost: "$0.36", model: "sonnet 4.5", when: "22m ago" },
  { id: "b41", project: "chatbase-mini", run: "#12", status: "passed", files: 11, added: 302, removed: 44, flags: 3, duration: "7m 02s", cost: "$0.51", model: "gpt-5", when: "1h ago" },
  { id: "b40", project: "pulseboard", run: "#31", status: "passed", files: 14, added: 486, removed: 96, flags: 4, duration: "8m 30s", cost: "$0.62", model: "opus 4.5", when: "3h ago" },
  { id: "b39", project: "shadeui", run: "#08", status: "paused", files: 8, added: 121, removed: 9, flags: 0, duration: "2m 15s", cost: "$0.29", model: "gemini 3 pro", when: "5h ago" },
  { id: "b38", project: "forksmith", run: "#05", status: "passed", files: 6, added: 98, removed: 21, flags: 1, duration: "3m 40s", cost: "$0.21", model: "sonnet 4.5", when: "1d ago" },
  { id: "b37", project: "invoicely", run: "#22", status: "failed", files: 17, added: 402, removed: 130, flags: 6, duration: "9m 11s", cost: "$0.84", model: "gpt-5", when: "2d ago" },
];

/* ================= deploys ================= */

export type DeployRow = {
  id: string;
  project: string;
  url: string;
  env: "production" | "preview";
  status: "ready" | "building" | "error";
  region: string;
  build: string;
  time: string;
  provider: "vercel" | "netlify";
};

export const DEPLOYS: DeployRow[] = [
  { id: "d1", project: "pulseboard", url: "pulseboard.vibex.app", env: "production", status: "ready", region: "iad1", build: "#31", time: "3h ago", provider: "vercel" },
  { id: "d2", project: "invoicely", url: "invoicely.vibex.app", env: "production", status: "ready", region: "sfo1", build: "#22", time: "2d ago", provider: "vercel" },
  { id: "d3", project: "habitly", url: "habitly-r43.vibex.app", env: "preview", status: "building", region: "iad1", build: "#43", time: "now", provider: "vercel" },
  { id: "d4", project: "forksmith", url: "npm: forksmith@1.2.0", env: "production", status: "ready", region: "npm", build: "#05", time: "1d ago", provider: "netlify" },
  { id: "d5", project: "shadeui", url: "shadeui-preview.vibex.app", env: "preview", status: "error", region: "fra1", build: "#08", time: "5h ago", provider: "netlify" },
];

/* ================= analytics ================= */

export const ANALYTICS_KPIS = [
  { label: "visitors", value: 12_480, delta: "+18.2%", up: true, unit: "" },
  { label: "page views", value: 38_210, delta: "+12.4%", up: true, unit: "" },
  { label: "avg. session", value: 2.7, delta: "+0.4m", up: true, unit: "m" },
  { label: "bounce rate", value: 38.6, delta: "-4.1%", up: true, unit: "%" },
];

/** 30 days of visitors / views */
export const TRAFFIC: { d: string; visitors: number; views: number }[] = [
  { d: "Apr 1", visitors: 210, views: 620 }, { d: "Apr 2", visitors: 245, views: 700 },
  { d: "Apr 3", visitors: 198, views: 590 }, { d: "Apr 4", visitors: 302, views: 880 },
  { d: "Apr 5", visitors: 340, views: 960 }, { d: "Apr 6", visitors: 288, views: 810 },
  { d: "Apr 7", visitors: 265, views: 760 }, { d: "Apr 8", visitors: 390, views: 1100 },
  { d: "Apr 9", visitors: 412, views: 1180 }, { d: "Apr 10", visitors: 368, views: 1020 },
  { d: "Apr 11", visitors: 430, views: 1240 }, { d: "Apr 12", visitors: 505, views: 1490 },
  { d: "Apr 13", visitors: 478, views: 1360 }, { d: "Apr 14", visitors: 441, views: 1280 },
  { d: "Apr 15", visitors: 520, views: 1520 }, { d: "Apr 16", visitors: 612, views: 1810 },
  { d: "Apr 17", visitors: 588, views: 1720 }, { d: "Apr 18", visitors: 640, views: 1900 },
  { d: "Apr 19", visitors: 702, views: 2100 }, { d: "Apr 20", visitors: 668, views: 1980 },
  { d: "Apr 21", visitors: 720, views: 2160 }, { d: "Apr 22", visitors: 812, views: 2440 },
  { d: "Apr 23", visitors: 790, views: 2330 }, { d: "Apr 24", visitors: 845, views: 2510 },
  { d: "Apr 25", visitors: 910, views: 2720 }, { d: "Apr 26", visitors: 878, views: 2600 },
  { d: "Apr 27", visitors: 940, views: 2810 }, { d: "Apr 28", visitors: 1020, views: 3080 },
  { d: "Apr 29", visitors: 1105, views: 3320 }, { d: "Apr 30", visitors: 1180, views: 3540 },
];

export const TOP_PAGES = [
  { path: "/", views: 14_820, pct: 100, avg: "1m 42s" },
  { path: "/pricing", views: 8_140, pct: 55, avg: "2m 18s" },
  { path: "/dashboard", views: 6_390, pct: 43, avg: "4m 06s" },
  { path: "/blog/ship-fast", views: 4_120, pct: 28, avg: "3m 22s" },
  { path: "/docs/quickstart", views: 2_860, pct: 19, avg: "5m 11s" },
  { path: "/login", views: 1_680, pct: 11, avg: "0m 38s" },
];

export const REFERRERS = [
  { name: "google.com", visits: 4_820, pct: 100 },
  { name: "x.com", visits: 3_140, pct: 65 },
  { name: "producthunt.com", visits: 2_010, pct: 42 },
  { name: "news.ycombinator.com", visits: 1_460, pct: 30 },
  { name: "direct", visits: 1_050, pct: 22 },
];

export const COUNTRIES = [
  { code: "US", name: "United States", visits: 4_910, pct: 100 },
  { code: "IN", name: "India", visits: 2_640, pct: 54 },
  { code: "GB", name: "United Kingdom", visits: 1_380, pct: 28 },
  { code: "DE", name: "Germany", visits: 1_120, pct: 23 },
  { code: "BR", name: "Brazil", visits: 860, pct: 18 },
];

export const DEVICES = [
  { name: "desktop", pct: 62, color: "#d9ff3f" },
  { name: "mobile", pct: 31, color: "#8ad4ff" },
  { name: "tablet", pct: 7, color: "#e9b872" },
];

export const VITALS = [
  { label: "LCP", value: "1.2s", score: 92, good: true },
  { label: "CLS", value: "0.04", score: 98, good: true },
  { label: "INP", value: "148ms", score: 88, good: true },
  { label: "TTFB", value: "210ms", score: 94, good: true },
];

export const LIVE_PAGES = [
  { path: "/", now: 34 },
  { path: "/pricing", now: 18 },
  { path: "/dashboard", now: 11 },
  { path: "/docs/quickstart", now: 6 },
];

/* ================= api keys ================= */

export type KeyRow = {
  id: string;
  provider: string;
  masked: string;
  added: string;
  lastUsed: string;
  status: "active" | "idle";
};

export const KEYS: KeyRow[] = [
  { id: "k1", provider: "anthropic", masked: "sk-ant-••••••••••••4f2a", added: "2 weeks ago", lastUsed: "now", status: "active" },
  { id: "k2", provider: "openrouter", masked: "sk-or-•••••••••••9b31", added: "2 days ago", lastUsed: "3h ago", status: "active" },
  { id: "k3", provider: "openai", masked: "sk-proj-•••••••••7c04", added: "1 month ago", lastUsed: "6d ago", status: "idle" },
];
