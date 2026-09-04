import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import Bento from "./Bento";
import Cta from "./Cta";
import Faq from "./Faq";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LandingBackdrop from "./LandingBackdrop";
import Marquee from "./Marquee";
import Nav from "./Nav";
import Preloader from "./Preloader";
import Pricing from "./Pricing";
import Safeguards from "./Safeguards";

/* boot sequence only once per session — returning from the app skips it */
let hasBooted = false;

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-volt/80"
      style={{ scaleX }}
    />
  );
}

export default function Landing() {
  const [booted, setBooted] = useState(hasBooted);

  useEffect(() => {
    if (booted) hasBooted = true;
  }, [booted]);

  return (
    <div className="relative min-h-screen bg-coal text-bone">
      <AnimatePresence>
        {!booted && <Preloader onDone={() => setBooted(true)} />}
      </AnimatePresence>

      <LandingBackdrop />
      <ScrollProgress />
      <Nav booted={booted} />

      <main className="relative z-10">
        <Hero booted={booted} />
        <Marquee />
        <HowItWorks />
        <Bento />
        <Safeguards />
        <Pricing />
        <Faq />
        <Cta />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

    </div>
  );
}
