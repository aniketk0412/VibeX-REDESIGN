import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useScramble } from "../hooks/useScramble";
import { cn } from "../utils/cn";
import { EASE, Logomark, VoltButton } from "./ui";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Safeguards", href: "#safeguards" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function NavLink({ label, href }: { label: string; href: string }) {
  const { display, play } = useScramble(label);
  return (
    <a
      href={href}
      onMouseEnter={play}
      className="px-1 py-1 font-mono text-[12px] tracking-[0.06em] text-mute transition-colors duration-300 hover:text-bone"
    >
      {display}
    </a>
  );
}

export default function Nav({ booted }: { booted: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 32)), [scrollY]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={booted ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled
            ? "hairline bg-coal/75 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <a href="#top" className="group flex items-center gap-2.5">
          <Logomark className="h-6 w-6 transition-transform duration-500 group-hover:rotate-[360deg]" />
          <span className="font-display text-[17px] font-medium tracking-tight">vibex</span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#/login"
            className="rounded-full px-4 py-2 text-[13px] text-mute transition-colors hover:text-bone"
          >
            Sign in
          </a>
          <VoltButton href="#/signup" small>
            Start free
          </VoltButton>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border hairline text-bone lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-x-4 top-[72px] rounded-2xl border hairline bg-coal/95 p-3 backdrop-blur-xl lg:hidden"
          >
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] text-bone transition-colors hover:bg-bone/[0.05]"
              >
                {l.label}
                <span className="font-mono text-[10px] text-faint">0{i + 1}</span>
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t hairline pt-3">
              <a
                href="#/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full border hairline px-4 py-2.5 text-[13px] text-bone"
              >
                Sign in
              </a>
              <VoltButton href="#/signup" small className="flex-1">
                Start free
              </VoltButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
