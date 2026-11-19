/**
 * useScrollReveal — lightweight Intersection Observer based
 * scroll-reveal hook. No external dependencies.
 *
 * Usage:
 *   const ref = useScrollReveal({ direction: 'left', delay: 100 });
 *   <div ref={ref} ...>...</div>
 */

import { useEffect, useRef } from "react";

export type RevealDirection = "left" | "right" | "up" | "down" | "none";

interface Options {
  direction?: RevealDirection;
  delay?: number;       // ms
  duration?: number;    // ms
  distance?: number;    // px
  threshold?: number;   // 0-1
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>({
  direction = "none",
  delay = 0,
  duration = 600,
  distance = 60,
  threshold = 0.15,
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const translateMap: Record<RevealDirection, string> = {
      left:  `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up:    `translateY(${distance}px)`,
      down:  `translateY(-${distance}px)`,
      none:  "none",
    };

    // Initial hidden state
    el.style.opacity = "0";
    el.style.transform = translateMap[direction] === "none" ? "" : translateMap[direction];
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "";
          if (once) {
            observer.unobserve(el);
            // Clean up will-change after animation
            setTimeout(() => { el.style.willChange = "auto"; }, duration + delay + 100);
          }
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = translateMap[direction] === "none" ? "" : translateMap[direction];
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, distance, threshold, once]);

  return ref;
}
