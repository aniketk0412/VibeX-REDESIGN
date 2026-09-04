import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight, Check, Download, Eye, FolderGit2, Pause, PencilLine, Rocket, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import { PROJECTS, type Project, type ProjectStatus, type ThumbKind } from "../../lib/mock";
import { cn } from "../../utils/cn";
import { EASE } from "../ui";

/* ===================== css-only app thumbnails ===================== */

function Thumb({ kind }: { kind: ThumbKind }) {
  switch (kind) {
    case "habits":
      return (
        <div className="flex h-full flex-col justify-center gap-2 p-4">
          <p className="font-mono text-[7px] tracking-[0.2em] text-faint uppercase">this week</p>
          {[6, 5, 4].map((n, i) => (
            <div key={i} className="flex gap-[3px]">
              {Array.from({ length: 7 }).map((_, d) => (
                <span key={d} className={cn("h-2.5 flex-1 rounded-[1.5px]", d < n ? "bg-volt/75" : "bg-bone/[0.07]")} />
              ))}
            </div>
          ))}
          <p className="font-mono text-[7px] text-mute"><Zap className="mr-0.5 inline h-2 w-2 text-volt" />12 day streak</p>
        </div>
      );
    case "charts":
      return (
        <div className="flex h-full flex-col justify-end p-4">
          <p className="mb-2 font-mono text-[7px] tracking-[0.2em] text-faint uppercase">subscribers</p>
          <div className="flex h-16 items-end gap-1.5">
            {[35, 55, 40, 70, 58, 88, 74, 100].map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-t-[2px]", i === 7 ? "bg-volt/85" : "bg-bone/[0.13]")}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-1.5 h-px bg-bone/10" />
        </div>
      );
    case "terminal":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 bg-black/30 p-4 font-mono text-[8px]">
          <p className="text-[#8ad4ff]">$ forksmith sweep --dry-run</p>
          <p className="text-mute">found 7 stale branches</p>
          <p className="text-mute">oldest: <span className="text-[#e9b872]">feature/old-auth · 8mo</span></p>
          <p className="text-bone/80">$ forksmith sweep --prune<span className="ml-1 inline-block h-2 w-[5px] animate-pulse bg-volt" /></p>
        </div>
      );
    case "portfolio":
      return (
        <div className="grid h-full grid-cols-3 gap-1.5 p-4">
          <span className="col-span-2 rounded bg-bone/[0.09]" />
          <span className="rounded bg-volt/[0.14]" />
          <span className="rounded bg-bone/[0.06]" />
          <span className="col-span-2 rounded bg-bone/[0.11]" />
        </div>
      );
    case "invoice":
      return (
        <div className="flex h-full items-center justify-center p-4">
          <div className="w-[70%] rounded-md border hairline bg-panel-2 p-3">
            <div className="flex justify-between">
              <span className="h-1.5 w-8 rounded-full bg-bone/20" />
              <span className="h-1.5 w-5 rounded-full bg-volt/50" />
            </div>
            <div className="mt-2.5 space-y-1">
              <span className="block h-1 w-full rounded-full bg-bone/[0.08]" />
              <span className="block h-1 w-4/5 rounded-full bg-bone/[0.08]" />
              <span className="block h-1 w-3/5 rounded-full bg-bone/[0.08]" />
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t hairline pt-1.5">
              <span className="font-mono text-[6.5px] text-faint">total</span>
              <span className="font-mono text-[7.5px] text-volt">$1,240.00</span>
            </div>
          </div>
        </div>
      );
    case "chat":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-4">
          <div className="flex justify-start">
            <span className="max-w-[70%] rounded-lg rounded-bl-[2px] bg-bone/[0.1] px-2 py-1 font-mono text-[7px] text-bone/80">
              hey — order #1142?
            </span>
          </div>
          <div className="flex justify-end">
            <span className="max-w-[70%] rounded-lg rounded-br-[2px] bg-volt/[0.16] px-2 py-1 font-mono text-[7px] text-volt">
              on it — tracking now
            </span>
          </div>
          <div className="flex justify-end">
            <span className="max-w-[55%] rounded-lg rounded-br-[2px] bg-volt/[0.16] px-2 py-1 font-mono text-[7px] text-volt">
              arrives thursday
            </span>
          </div>
          <span className="mt-1 h-5 w-full rounded-md border hairline bg-coal/70" />
        </div>
      );
  }
}

/* ===================== status badge ===================== */

function StatusBadge({ status, note }: { status: ProjectStatus; note?: string }) {
  if (status === "building")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-volt/30 bg-coal/85 px-2.5 py-1 font-mono text-[8.5px] tracking-[0.1em] text-volt uppercase backdrop-blur">
        <span className="h-1 w-1 rounded-full bg-volt animate-pulse-dot" />
        {note ?? "live"}
      </span>
    );
  if (status === "passed")
    return (
      <span className="flex items-center gap-1 rounded-full border hairline bg-coal/85 px-2.5 py-1 font-mono text-[8.5px] tracking-[0.1em] text-bone/75 uppercase backdrop-blur">
        <Check className="h-2.5 w-2.5 text-volt" /> passed
      </span>
    );
  if (status === "paused")
    return (
      <span className="flex items-center gap-1 rounded-full border border-[#e9b872]/30 bg-coal/85 px-2.5 py-1 font-mono text-[8.5px] tracking-[0.1em] text-[#e9b872] uppercase backdrop-blur">
        <Pause className="h-2.5 w-2.5" /> paused
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full border hairline bg-coal/85 px-2.5 py-1 font-mono text-[8.5px] tracking-[0.1em] text-mute uppercase backdrop-blur">
      <PencilLine className="h-2.5 w-2.5" /> interview
    </span>
  );
}

/* ===================== project card ===================== */

const ACTIONS = [
  { icon: Eye, label: "open" },
  { icon: Download, label: "download" },
  { icon: FolderGit2, label: "github" },
  { icon: Rocket, label: "deploy" },
] as const;

async function downloadProject(project: Project) {
  const zip = new JSZip();
  zip.file(
    "README.md",
    `# ${project.name}\n\n${project.prompt}\n\nGenerated by Vibex.\n`,
  );
  zip.file(
    "src/App.tsx",
    `export default function App() {\n  return <main>${project.name}</main>;\n}\n`,
  );
  zip.file("vibex-project.json", JSON.stringify(project, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.id}.zip`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ProjectCard({ project, notify }: { project: Project; notify: (m: string) => void }) {
  const action = async (label: (typeof ACTIONS)[number]["label"]) => {
    if (label === "download") {
      await downloadProject(project);
      notify(`${project.name}.zip downloaded`);
      return;
    }
    if (label === "github") {
      const url = `https://github.com/alexlux/${project.id}`;
      try {
        await navigator.clipboard.writeText(url);
        notify("GitHub repo link copied");
      } catch {
        notify("GitHub export prepared");
      }
      return;
    }
    if (label === "deploy") window.location.hash = "#/app/deploys";
  };

  return (
    <article className="group overflow-hidden rounded-2xl border hairline bg-panel transition-colors duration-500 hover:border-volt/25">
      {/* thumb */}
      <div className="relative h-36 overflow-hidden border-b hairline bg-coal/60">
        <div className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <Thumb kind={project.thumb} />
        </div>
        <div className="absolute top-3 left-3">
          <StatusBadge status={project.status} note={project.statusNote} />
        </div>
        {/* hover actions */}
        <div className="absolute top-3 right-3 flex translate-y-1 gap-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {ACTIONS.map((a) =>
            a.label === "open" ? (
              <a
                key={a.label}
                href="#/app/new"
                onClick={() => {
                  try {
                    sessionStorage.setItem("vibex:project", project.id);
                    sessionStorage.removeItem("vibex:idea");
                  } catch {
                    /* The project still opens. */
                  }
                }}
                title={a.label}
                className="flex h-7 w-7 items-center justify-center rounded-lg border hairline bg-coal/85 text-mute backdrop-blur transition-colors duration-200 hover:border-volt/40 hover:text-volt"
              >
                <a.icon className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                key={a.label}
                title={a.label}
                onClick={() => void action(a.label)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border hairline bg-coal/85 text-mute backdrop-blur transition-colors duration-200 hover:border-volt/40 hover:text-volt"
              >
                <a.icon className="h-3.5 w-3.5" />
              </button>
            ),
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[16px] font-medium tracking-tight">{project.name}</h3>
          <span className="font-mono text-[10px] text-faint">{project.updated}</span>
        </div>
        <p className="mt-1 truncate font-mono text-[10.5px] text-mute">“{project.prompt}”</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="rounded-md border hairline px-2 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-faint uppercase">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t hairline pt-3 font-mono text-[9.5px] text-faint">
          <span>
            {project.files > 0 ? `${project.files} files · ${project.cost}` : `draft · ${project.cost}`}
          </span>
          {project.deploy ? (
            <span className="flex items-center gap-1 text-volt/90">
              {project.deploy}
              <ArrowUpRight className="h-2.5 w-2.5" />
            </span>
          ) : project.status === "draft" ? (
            <span className="text-mute">{project.statusNote}</span>
          ) : (
            <span className="text-faint">not deployed</span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ===================== grid + filters ===================== */

const FILTERS: { key: "all" | ProjectStatus | "deployed"; label: string }[] = [
  { key: "all", label: "all" },
  { key: "building", label: "building" },
  { key: "passed", label: "passed" },
  { key: "paused", label: "paused" },
  { key: "draft", label: "drafts" },
  { key: "deployed", label: "deployed" },
];

export default function Projects({ notify = () => undefined }: { notify?: (m: string) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: PROJECTS.length, deployed: PROJECTS.filter((p) => p.deploy).length };
    for (const p of PROJECTS) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, []);

  const shown = PROJECTS.filter((p) => {
    if (filter === "all") return true;
    if (filter === "deployed") return Boolean(p.deploy);
    return p.status === filter;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[20px] font-medium tracking-tight">
          Projects <span className="ml-1 font-mono text-[11px] text-faint">{PROJECTS.length}</span>
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[10.5px] transition-all duration-200",
                filter === f.key
                  ? "border-volt/40 bg-volt/[0.08] text-volt"
                  : "hairline text-mute hover:text-bone",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-faint">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <ProjectCard project={p} notify={notify} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
