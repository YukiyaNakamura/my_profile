"use client";
import { useEffect, useRef } from "react";
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.removeAttribute('data-pending'); observer.disconnect(); }
    }, { threshold: 0.08 });
    element.setAttribute('data-pending', 'true'); observer.observe(element);
    return () => { observer.disconnect(); element.removeAttribute('data-pending'); };
  }, []);
  return <div ref={ref} className={"reveal " + className}>{children}</div>;
}
