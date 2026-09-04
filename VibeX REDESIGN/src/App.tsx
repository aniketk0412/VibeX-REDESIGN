import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect } from "react";
import Auth from "./components/auth/Auth";
import Dashboard from "./components/dashboard/Dashboard";
import Landing from "./components/Landing";
import { EASE } from "./components/ui";
import Workspace from "./components/workspace/Workspace";
import { useAuth } from "./hooks/useAuth";
import { useLenis } from "./hooks/useLenis";
import { useRoute } from "./hooks/useRoute";

export default function App() {
  const route = useRoute();
  const { user } = useAuth();
  useLenis();

  const needsAuth = route === "app" || route === "workspace";
  const gated = needsAuth && !user;

  /* bounce protected routes to the login screen */
  useEffect(() => {
    if (gated) window.location.hash = "#/login";
    else if (user && (route === "auth-login" || route === "auth-signup")) {
      window.location.hash = "#/app";
    }
  }, [gated, route, user]);

  const view = gated
    ? { key: "login", node: <Auth mode="login" /> }
    : route === "auth-login"
      ? { key: "login", node: <Auth mode="login" /> }
      : route === "auth-signup"
        ? { key: "signup", node: <Auth mode="signup" /> }
        : route === "workspace"
          ? { key: "room", node: <Workspace /> }
          : route === "app"
            ? { key: "app", node: <Dashboard /> }
            : { key: "site", node: <Landing /> };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={view.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {view.node}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
