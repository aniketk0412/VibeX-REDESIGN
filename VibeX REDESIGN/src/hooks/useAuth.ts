import { useCallback, useEffect, useState } from "react";

export type User = { name: string; email: string; initials: string; plan: string };

const KEY = "vibex:user";
const EVT = "vibex:auth";

function read(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function initialsOf(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const s = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  return s || "VX";
}

function persist(user: User | null) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  window.dispatchEvent(new Event(EVT));
}

/** Fake auth with durable, browser-local profile state. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(read);

  useEffect(() => {
    const sync = () => setUser(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVT, sync);
    };
  }, []);

  const signIn = useCallback((email: string, name?: string) => {
    const mail = email.trim() || "you@vibex.app";
    const nm = (name?.trim() || mail.split("@")[0].replace(/[._-]+/g, " ")).slice(0, 32);
    const u: User = { name: nm, email: mail, initials: initialsOf(nm), plan: "pro" };
    persist(u);
    setUser(u);
  }, []);

  const updateProfile = useCallback((name: string, email: string) => {
    const previous = read();
    if (!previous) return false;
    const next: User = {
      ...previous,
      name: name.trim().slice(0, 32) || previous.name,
      email: email.trim() || previous.email,
      initials: initialsOf(name.trim() || previous.name),
    };
    persist(next);
    setUser(next);
    return true;
  }, []);

  const updatePlan = useCallback((plan: string) => {
    const previous = read();
    if (!previous) return false;
    const next = { ...previous, plan };
    persist(next);
    setUser(next);
    return true;
  }, []);

  const signOut = useCallback(() => {
    persist(null);
    setUser(null);
    window.location.hash = "#/";
  }, []);

  return { user, signIn, signOut, updateProfile, updatePlan };
}
