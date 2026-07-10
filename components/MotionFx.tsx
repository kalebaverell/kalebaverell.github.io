"use client";
// Scroll-reveal engine. Marks <html> with .js (so reveal styles only apply when JS runs),
// then reveals [data-reveal] elements as they enter the viewport, honoring reduced motion.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionFx() {
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduce) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = el.getAttribute("data-reveal");
            if (delay && delay !== "true") el.style.transitionDelay = `${delay}ms`;
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  return null;
}
