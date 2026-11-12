"use client";

import { useEffect } from "react";

/**
 * Every pointer- and scroll-driven effect on the home page, run from one place.
 *
 * Performance rules this file follows, so scrolling stays smooth:
 * - one scroll listener and one pointer listener, each coalesced to a single rAF;
 * - layout is measured up front (and on resize), never read inside the scroll frame;
 * - the scroll frame only writes transform / opacity, which the compositor handles;
 * - work is skipped for elements far outside the viewport.
 *
 * Effects (attributes are set in components/site/sections.tsx):
 * - [data-parallax="0.2"]   moves at a different speed from the page
 * - [data-hero-out]         drifts, scales and fades as the hero scrolls away
 * - [data-scrub-text]       words light up as the paragraph scrolls through
 * - [data-stack]            sticky stacked cards; the covered card shrinks and dims
 * - [data-hscroll]          pinned section whose track moves sideways with scroll
 * - [data-drift="1|-1"]     marquee rows that slide with scroll in a direction
 * - .fx-bg-move             background layers that drift with scroll
 * - [data-reveal], [data-count], .fx-card glow/tilt, [data-magnetic], progress bar
 */
export default function FxRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 1024px)");

    /* ================= reveal + count-up ================= */
    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || reduced) return;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1400);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    };

    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("in");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          revealer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revealer.observe(el));
    if (!reduced) root.classList.add("fx-ready");

    /* ================= scroll engine ================= */
    type Parallax = { el: HTMLElement; speed: number; top: number; height: number };
    type Stack = { el: HTMLElement; inner: HTMLElement; shade: HTMLElement | null; top: number; height: number; stickTop: number };
    type HScroll = { el: HTMLElement; track: HTMLElement; counter: HTMLElement | null; items: number; top: number; distance: number };
    type Scrub = { el: HTMLElement; words: HTMLElement[]; top: number; height: number; lit: number };
    type Drift = { el: HTMLElement; dir: number; top: number; base: number };

    let vh = window.innerHeight;
    let parallax: Parallax[] = [];
    let stacks: Stack[] = [];
    let hscrolls: HScroll[] = [];
    let scrubs: Scrub[] = [];
    let drifts: Drift[] = [];
    let heroOut: HTMLElement[] = [];
    let heroHeight = 1;
    const progressBar = document.querySelector<HTMLElement>(".fx-progress");
    const bgLayers = Array.from(document.querySelectorAll<HTMLElement>(".fx-bg-move"));

    // Page-space top of an element, ignoring any transform we applied to it.
    const pageTop = (el: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    // Split scrub paragraphs into word spans once.
    document.querySelectorAll<HTMLElement>("[data-scrub-text]").forEach((el) => {
      if (el.dataset.scrubbed) return;
      el.dataset.scrubbed = "1";
      const text = el.textContent ?? "";
      el.setAttribute("aria-label", text);
      el.textContent = "";
      for (const word of text.split(/(\s+)/)) {
        if (/^\s+$/.test(word)) {
          el.appendChild(document.createTextNode(word));
        } else if (word) {
          const span = document.createElement("span");
          span.className = "fx-word";
          span.setAttribute("aria-hidden", "true");
          span.textContent = word;
          el.appendChild(span);
        }
      }
    });

    const measure = () => {
      vh = window.innerHeight;

      // Horizontal sections first: they set their own height, which moves everything below.
      hscrolls = [];
      document.querySelectorAll<HTMLElement>("[data-hscroll]").forEach((el) => {
        const track = el.querySelector<HTMLElement>("[data-hscroll-track]");
        if (!track) return;
        if (!wide.matches || reduced) {
          el.style.height = "";
          track.style.transform = "";
          el.classList.remove("hs-on");
          return;
        }
        el.classList.add("hs-on");
        track.style.transform = "";
        // Travel far enough that the last card ends 48px inside the right edge.
        const left = track.getBoundingClientRect().left;
        const distance = Math.max(0, left + track.scrollWidth - window.innerWidth + 48);
        el.style.height = `${distance + vh}px`;
        hscrolls.push({
          el,
          track,
          counter: el.querySelector<HTMLElement>("[data-hscroll-counter]"),
          items: track.querySelectorAll("[data-hscroll-item]").length,
          top: pageTop(el),
          distance,
        });
      });

      // A stuck sticky element reports its stuck offset, so flow positions come from
      // the (non-sticky) container plus the heights of the cards before it.
      stacks = [];
      document.querySelectorAll<HTMLElement>("[data-stack-group]").forEach((group) => {
        let flowTop = pageTop(group);
        Array.from(group.querySelectorAll<HTMLElement>(":scope > [data-stack]")).forEach((el, i) => {
          const inner = el.firstElementChild as HTMLElement | null;
          if (!inner) return;
          const height = el.offsetHeight;
          // Cards taller than the screen stick by their bottom edge, so every line is read before it's covered.
          const stickTop = Math.min(88 + i * 14, vh - height - 24);
          el.style.top = reduced ? "" : `${stickTop}px`;
          stacks.push({ el, inner, shade: el.querySelector<HTMLElement>("[data-stack-shade]"), top: flowTop, height, stickTop });
          flowTop += height + parseFloat(getComputedStyle(el).marginBottom || "0");
        });
      });

      parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
        el,
        speed: Number(el.dataset.parallax) || 0,
        top: pageTop(el),
        height: el.offsetHeight,
      }));

      scrubs = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub-text]")).map((el) => ({
        el,
        words: Array.from(el.querySelectorAll<HTMLElement>(".fx-word")),
        top: pageTop(el),
        height: el.offsetHeight,
        lit: -1,
      }));

      drifts = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]")).map((el) => ({
        el,
        dir: Number(el.dataset.drift) || 1,
        top: pageTop(el),
        // Rows moving right start shifted left, so their left edge is never empty.
        base: (Number(el.dataset.drift) || 1) > 0 ? -el.scrollWidth / 2 : 0,
      }));

      heroOut = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-out]"));
      heroHeight = document.getElementById("home")?.offsetHeight || vh;

      update();
    };

    const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

    const update = () => {
      const y = window.scrollY;
      const max = root.scrollHeight - vh;
      // Written to the bar itself: a custom property on <html> would restyle the whole page each frame.
      if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : "0"})`;
      if (reduced) return;

      // Background drift: slow sine waves so the glows wander instead of leaving the screen.
      bgLayers.forEach((layer, i) => {
        const s = Number(layer.dataset.speed) || 0.1;
        const dy = i === bgLayers.length - 1 ? -((y * s) % 64) : Math.sin(y / 900 + i * 2) * 160 * s * 6;
        layer.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      });

      // Hero: content drifts at different speeds, scales down and fades out.
      if (y < heroHeight * 1.2) {
        const p = clamp(y / heroHeight);
        heroOut.forEach((el) => {
          const s = Number(el.dataset.heroOut) || 0.3;
          el.style.transform = `translate3d(0, ${(y * s).toFixed(1)}px, 0) scale(${(1 - p * 0.06).toFixed(4)})`;
          el.style.opacity = String((1 - p * 1.15).toFixed(3));
        });
      }

      for (const item of parallax) {
        const center = item.top + item.height / 2 - y - vh / 2;
        if (Math.abs(center) > vh * 1.5) continue;
        item.el.style.transform = `translate3d(0, ${(center * -item.speed).toFixed(1)}px, 0)`;
      }

      for (const item of drifts) {
        const offset = item.base + (y - item.top + vh) * 0.35 * item.dir;
        if (Math.abs(y + vh - item.top) > vh * 3) continue;
        item.el.style.transform = `translate3d(${offset.toFixed(1)}px, 0, 0)`;
      }

      for (const item of scrubs) {
        const start = item.top - vh * 0.85;
        const end = item.top + item.height - vh * 0.45;
        const lit = Math.round(clamp((y - start) / (end - start)) * item.words.length);
        if (lit === item.lit) continue;
        // Only touch the words whose state changed.
        const from = Math.min(lit, item.lit < 0 ? 0 : item.lit);
        const to = Math.max(lit, item.lit < 0 ? item.words.length : item.lit);
        for (let i = from; i < to; i++) item.words[i].classList.toggle("lit", i < lit);
        item.lit = lit;
      }

      // Stack: each card is covered by the next one; shrink and shade it as that happens.
      for (let i = 0; i < stacks.length; i++) {
        const card = stacks[i];
        const next = stacks[i + 1];
        let p = 0;
        if (next) {
          // Where the next card's top is on screen, relative to this card's stuck top.
          const nextScreenTop = next.top - y;
          const from = card.stickTop + card.height;
          const to = next.stickTop;
          p = clamp((from - nextScreenTop) / Math.max(1, from - to));
        }
        card.inner.style.transform = `scale(${(1 - p * 0.07).toFixed(4)}) translate3d(0, ${(-p * 12).toFixed(1)}px, 0)`;
        if (card.shade) card.shade.style.opacity = (p * 0.6).toFixed(3);
      }

      for (const hs of hscrolls) {
        const p = clamp((y - hs.top) / Math.max(1, hs.distance));
        hs.track.style.transform = `translate3d(${(-p * hs.distance).toFixed(1)}px, 0, 0)`;
        if (hs.counter) {
          const n = Math.min(hs.items, Math.max(1, Math.round(p * (hs.items - 1)) + 1));
          const label = `${String(n).padStart(2, "0")} / ${String(hs.items).padStart(2, "0")}`;
          if (hs.counter.textContent !== label) hs.counter.textContent = label;
          hs.el.style.setProperty("--hs", p.toFixed(4));
        }
      }
    };

    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        update();
      });
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    };

    // Content can change height after load (fonts, images, <details> opening).
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(document.body);
    document.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", onResize));

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    wide.addEventListener("change", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);

    /* ================= pointer effects ================= */
    let pointerFrame = 0;
    let lastPointer: PointerEvent | null = null;
    let activeCard: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;

    const resetCard = (card: HTMLElement) => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    const resetMagnet = (el: HTMLElement) => {
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };

    const pointerFrameFn = () => {
      pointerFrame = 0;
      const e = lastPointer;
      if (!e) return;
      const { clientX: x, clientY: y } = e;
      const target = e.target as Element | null;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);

      const card = target?.closest<HTMLElement>(".fx-card") ?? null;
      if (activeCard && activeCard !== card) resetCard(activeCard);
      activeCard = card;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (x - r.left) / r.width;
        const py = (y - r.top) / r.height;
        card.style.setProperty("--x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--y", `${(py * 100).toFixed(1)}%`);
        if (!reduced && card.dataset.tilt !== "off") {
          const strength = r.width > 600 ? 1.5 : 5;
          card.style.setProperty("--rx", `${((0.5 - py) * strength).toFixed(2)}deg`);
          card.style.setProperty("--ry", `${((px - 0.5) * strength).toFixed(2)}deg`);
        }
      }

      const magnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (activeMagnet && activeMagnet !== magnet) resetMagnet(activeMagnet);
      activeMagnet = magnet;
      if (magnet && !reduced) {
        const r = magnet.getBoundingClientRect();
        magnet.style.setProperty("--tx", `${((x - (r.left + r.width / 2)) * 0.25).toFixed(1)}px`);
        magnet.style.setProperty("--ty", `${((y - (r.top + r.height / 2)) * 0.35).toFixed(1)}px`);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lastPointer = e;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(pointerFrameFn);
    };
    const onPointerLeave = () => {
      root.classList.remove("fx-pointer");
      if (activeCard) resetCard(activeCard);
      if (activeMagnet) resetMagnet(activeMagnet);
      activeCard = activeMagnet = null;
    };
    const onPointerEnter = () => root.classList.add("fx-pointer");

    if (finePointer) {
      root.classList.add("fx-pointer");
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      root.addEventListener("pointerleave", onPointerLeave);
      root.addEventListener("pointerenter", onPointerEnter);
    }

    return () => {
      revealer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      wide.removeEventListener("change", measure);
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointerenter", onPointerEnter);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      window.clearTimeout(resizeTimer);
      root.classList.remove("fx-ready", "fx-pointer");
    };
  }, []);

  return null;
}
