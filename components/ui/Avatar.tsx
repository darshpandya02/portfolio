import Image from "next/image";

import { profile } from "@/lib/content";

/**
 * Photo, rendered so it belongs in a terminal rather than sitting in it like a
 * stock headshot: desaturated by default, colour on hover, with the same
 * scanline wash the rest of the CRT uses.
 */
export default function Avatar({
  size = 168,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`group relative shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* accent bloom, sits under the photo and reads as phosphor glow */}
      <div
        aria-hidden
        className="absolute -inset-1 rounded-lg bg-term-accent/20 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100"
      />
      <Image
        src={profile.avatar}
        alt={`${profile.fullName}, ${profile.role}`}
        width={size * 2}
        height={size * 2}
        priority={priority}
        sizes={`${size}px`}
        className="relative h-full w-full rounded-lg border border-term-border object-cover grayscale transition duration-500 group-hover:grayscale-0"
      />
      {/* scanlines, matched to .crt-overlay so the photo sits in the same plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,.18) 0px, rgba(0,0,0,.18) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* corner ticks, the way a viewfinder frames a subject */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          "left-0 top-0 border-l-2 border-t-2",
          "right-0 top-0 border-r-2 border-t-2",
          "left-0 bottom-0 border-b-2 border-l-2",
          "right-0 bottom-0 border-b-2 border-r-2",
        ].map((pos) => (
          <span key={pos} className={`absolute h-3 w-3 border-term-accent/70 ${pos}`} />
        ))}
      </div>
    </div>
  );
}
