import { useEffect, useState } from "react";

export type Route = "landing" | "auth-login" | "auth-signup" | "app" | "workspace";

function read(): Route {
  const h = window.location.hash;
  if (h.startsWith("#/login")) return "auth-login";
  if (h.startsWith("#/signup")) return "auth-signup";
  if (h === "#/app/new" || h.startsWith("#/app/build/")) return "workspace";
  if (h.startsWith("#/app")) return "app";
  return "landing";
}

/** Hash router: "#/", "#/login", "#/signup", "#/app/*", "#/app/new". */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [route]);

  return route;
}
