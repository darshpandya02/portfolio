"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Route transitions through the View Transitions API.
 *
 * Next's client router swaps the DOM out from under us, so the browser never
 * gets a chance to snapshot the old page on its own. This listens for link
 * clicks first, hands the navigation to startViewTransition, and resolves the
 * transition once the new route has committed.
 *
 * Every bail-out here falls through to a plain Next.js navigation: no support,
 * reduced motion, modifier click, new tab, download, external host. Nothing
 * about getting from one page to another depends on this component working.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => { finished: Promise<void> };
};

/** If a route somehow never commits, let the page go rather than freezing it mid transition. */
const COMMIT_TIMEOUT_MS = 1200;

export default function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const commit = useRef<(() => void) | null>(null);

  useEffect(() => {
    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || link.target || link.hasAttribute("download")) return;
      if (link.dataset.noViewTransition !== undefined) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();

      let timer = 0;
      doc.startViewTransition?.(
        () =>
          new Promise<void>((resolve) => {
            commit.current = () => {
              window.clearTimeout(timer);
              commit.current = null;
              resolve();
            };
            timer = window.setTimeout(() => commit.current?.(), COMMIT_TIMEOUT_MS);
            router.push(url.pathname + url.search + url.hash);
          }),
      );
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  // The new route has rendered, so the browser can snapshot it and start animating.
  useEffect(() => {
    commit.current?.();
  }, [pathname]);

  return null;
}
