"use client";

import { useEffect, useState } from "react";

import { defaultTheme, themeKeys, themes, THEME_STORAGE_KEY } from "@/lib/terminal/themes";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(defaultTheme);

  // The `theme` command in the terminal writes straight to the dataset, so
  // watch it rather than letting this select drift out of sync.
  useEffect(() => {
    const sync = () => {
      const current = document.documentElement.dataset.theme;
      if (current && themeKeys.includes(current)) setTheme(current);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const apply = (key: string) => {
    setTheme(key);
    document.documentElement.dataset.theme = key;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, key);
    } catch {
      /* private browsing — the theme just won't persist */
    }
  };

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-term-faint">theme:</span>
      <select
        value={theme}
        onChange={(event) => apply(event.target.value)}
        aria-label="Colour theme"
        className="cursor-pointer border-0 bg-transparent py-0 pl-0 pr-5 text-xs text-term-cyan focus:outline-none focus:ring-0"
      >
        {themes.map((option) => (
          <option key={option.key} value={option.key} className="bg-term-panel text-term-fg">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
