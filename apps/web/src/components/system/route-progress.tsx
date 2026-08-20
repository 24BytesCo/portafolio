"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);

  // Start on internal link clicks immediately
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // left click only
      const target = e.composedPath()[0] as HTMLElement | undefined;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      const isInternal = url.origin === location.origin;
      const isNewTab = anchor.target === "_blank" || e.metaKey || e.ctrlKey;
      if (isInternal && !isNewTab) {
        setActive(true);
        // change key to restart animation
        setKey((k) => k + 1);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Stop when the pathname updates
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setActive(false), 1000);
    return () => clearTimeout(id);
  }, [pathname]);

  // Safety timeout
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setActive(false), 8000);
    return () => clearTimeout(id);
  }, [active]);

  if (!active) return null;
  return (
    <div
      key={key}
      className="pointer-events-none fixed inset-x-0 top-0 z-[9998]"
    >
      <div className="h-0.5 w-full overflow-hidden bg-transparent">
        <div className="h-full w-full animate-[route-progress_1.2s_ease_infinite] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500" />
      </div>
      <style jsx global>{`
        @keyframes route-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-10%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
