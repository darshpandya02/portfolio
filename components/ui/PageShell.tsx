import type { ReactNode } from "react";

import Window from "./Window";

export default function PageShell({
  title,
  command,
  children,
  footer,
}: {
  title: string;
  command: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <div className="relative mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
        <Window title={title} command={command}>
          {children}
        </Window>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
