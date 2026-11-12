"use client";

import { useEffect, useState } from "react";

/** Cycles through words in place, with a blur-and-slide swap. */
export default function WordRotator({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="fx-rotator">
      {/* Screen readers get one stable phrase instead of a ticking one. */}
      <span className="sr-only">{words[0]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden
          className={`fx-gradient-text ${i === index ? "on" : i === (index - 1 + words.length) % words.length ? "off" : ""}`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
