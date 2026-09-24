export interface Theme {
  key: string;
  label: string;
  description: string;
}

export const themes: Theme[] = [
  { key: "midnight", label: "midnight", description: "deep slate, green prompt (default)" },
  { key: "matrix", label: "matrix", description: "phosphor green on black" },
  { key: "amber", label: "amber", description: "vintage CRT amber" },
  { key: "dracula", label: "dracula", description: "purple and pink" },
  { key: "nord", label: "nord", description: "cold arctic blues" },
  { key: "solarized", label: "solarized", description: "solarized dark" },
  { key: "paper", label: "paper", description: "light mode, for the brave" },
];

export const defaultTheme = "midnight";
export const themeKeys = themes.map((t) => t.key);
export const THEME_STORAGE_KEY = "portfolio-theme";

/** Runs before paint to avoid a flash of the default theme. */
export const themeBootScript = `
(function(){
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var valid = ${JSON.stringify(themeKeys)};
    document.documentElement.dataset.theme = valid.indexOf(t) > -1 ? t : ${JSON.stringify(defaultTheme)};
  } catch (e) {
    document.documentElement.dataset.theme = ${JSON.stringify(defaultTheme)};
  }
})();
`;
