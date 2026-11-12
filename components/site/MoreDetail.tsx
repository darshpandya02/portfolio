"use client";

import { useState } from "react";

/**
 * "More detail" toggle for project cards. Replaces <details>: Chrome re-attaches a
 * closed <details> element's content whenever its card restyles, which forced a
 * layout on every scroll frame of the project gallery.
 */
export default function MoreDetail({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-ed-muted transition-colors hover:text-ed-ink"
      >
        {open ? "Less detail −" : "More detail +"}
      </button>
      {open ? <div className="mt-3 space-y-3 text-sm leading-relaxed text-ed-muted">{children}</div> : null}
    </div>
  );
}
