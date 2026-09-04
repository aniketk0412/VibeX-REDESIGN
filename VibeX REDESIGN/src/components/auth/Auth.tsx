import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import { EASE, Logomark } from "../ui";

type Mode = "login" | "signup";

const PROOF = [
  "Coder + Reviewer on every file",
  "Builds always finish — or auto-resume",
  "Your keys stay AES-256 encrypted",
];

export default function Auth({ mode }: { mode: Mode }) {
  const { signIn } = useAuth();
  const timer = useRef<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
  }, [mode]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (!email.trim() || !email.includes("@")) {
      setErr("enter a valid email address");
      return;
    }
    if (pw.length < 4) {
      setErr("password needs at least 4 characters");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setErr("what should we call you?");
      return;
    }
    setErr(null);
    setBusy(true);
    timer.current = window.setTimeout(() => {
      signIn(email, mode === "signup" ? name : undefined);
      window.location.hash = "#/app";
    }, 900);
  };

  const demo = () => {
    if (busy) return;
    setBusy(true);
    timer.current = window.setTimeout(() => {
      signIn("alex@vibex.app", "Alex Luxe");
      window.location.hash = "#/app";
    }, 600);
  };

  return (
    <div className="grid min-h-screen bg-coal text-bone lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- brand side ---------- */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r hairline bg-panel p-10 lg:flex">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_30%_0%,rgb(217_255_63/0.10),transparent_70%)]" />

        <a href="#/" className="relative flex items-center gap-2.5">
          <Logomark className="h-7 w-7" />
          <span className="font-display text-[19px] font-medium tracking-tight">vibex</span>
        </a>

        <div className="relative">
          <h2 className="max-w-md font-display text-[42px] leading-[1.05] font-medium tracking-[-0.02em]">
            Describe it once.
            <br />
            It <em className="font-serif italic font-normal text-volt">ships itself.</em>
          </h2>
          <ul className="mt-8 space-y-3">
            {PROOF.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: EASE }}
                className="flex items-center gap-2.5 text-[14px] text-mute"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-volt/25 bg-volt/[0.07]">
                  <Check className="h-3 w-3 text-volt" />
                </span>
                {p}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border hairline bg-coal/60 p-5">
          <p className="text-[13.5px] leading-relaxed text-bone/80">
            “I described a habit tracker at midnight and woke up to a working app with
            zero errors. The reviewer caught two bugs I'd have shipped.”
          </p>
          <p className="mt-3 font-mono text-[11px] text-faint">— indie builder, beta cohort</p>
        </div>
      </div>

      {/* ---------- form side ---------- */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full max-w-[400px]"
        >
          <a href="#/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logomark className="h-6 w-6" />
            <span className="font-display text-[17px] font-medium tracking-tight">vibex</span>
          </a>

          <h1 className="font-display text-[30px] font-medium tracking-tight">
            {mode === "login" ? "Welcome back." : "Create your workspace."}
          </h1>
          <p className="mt-1.5 text-[14px] text-mute">
            {mode === "login"
              ? "Sign in to pick up where the loop left off."
              : "One free project. No card. No prompt-writing."}
          </p>

          {/* social (decorative but responsive) */}
          <div className="mt-7 grid grid-cols-2 gap-2.5">
            {["GitHub", "Google"].map((p) => (
              <button
                key={p}
                onClick={demo}
                className="rounded-xl border hairline bg-panel px-4 py-2.5 text-[13px] text-bone transition-colors duration-300 hover:border-bone/25 hover:bg-bone/[0.04]"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-bone/10" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">or</span>
            <span className="h-px flex-1 bg-bone/10" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
                  name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Luxe"
                  className="w-full rounded-xl border border-bone/10 bg-panel px-4 py-3 text-[14px] text-bone outline-none transition-colors placeholder:text-faint focus:border-volt/40"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full rounded-xl border border-bone/10 bg-panel px-4 py-3 text-[14px] text-bone outline-none transition-colors placeholder:text-faint focus:border-volt/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
                password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-bone/10 bg-panel px-4 py-3 pr-11 text-[14px] text-bone outline-none transition-colors placeholder:text-faint focus:border-volt/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-faint transition-colors hover:text-bone"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {err && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-[11px] text-[#ff8a8a]"
              >
                {err}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 text-[14px] font-medium text-coal transition-transform duration-200",
                busy ? "opacity-80" : "hover:scale-[1.01] active:scale-[0.99]",
              )}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> opening workspace…
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <button
            onClick={demo}
            className="mt-3 w-full rounded-xl border hairline px-4 py-3 text-[13.5px] text-mute transition-colors duration-300 hover:border-volt/30 hover:text-volt"
          >
            Skip — explore the demo workspace
          </button>

          <p className="mt-6 text-center text-[13px] text-mute">
            {mode === "login" ? (
              <>
                New here?{" "}
                <a href="#/signup" className="text-volt u-sweep">
                  Create an account
                </a>
              </>
            ) : (
              <>
                Already building?{" "}
                <a href="#/login" className="text-volt u-sweep">
                  Sign in
                </a>
              </>
            )}
          </p>

          <p className="mt-6 text-center font-mono text-[10px] leading-relaxed text-faint">
            demo mode · no real accounts, nothing leaves your browser
          </p>
        </motion.div>
      </div>
    </div>
  );
}
