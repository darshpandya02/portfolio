/**
 * Reader preferences for the editorial home page: colour mode and type style.
 * Both live as data attributes on <html> so CSS can switch them without React,
 * and a boot script applies them before first paint so there is no flash.
 */

export type Mode = "light" | "dark";

export interface TypeStyle {
  key: string;
  label: string;
  description: string;
}

export const typeStyles: TypeStyle[] = [
  { key: "grotesk", label: "Grotesk", description: "Space Grotesk headings, mono labels" },
  { key: "editorial", label: "Editorial", description: "Newsreader headings, Inter body" },
  { key: "system", label: "System", description: "Your device's own UI font" },
];

export const defaultTypeStyle = "grotesk";
export const MODE_STORAGE_KEY = "site-mode";
export const TYPE_STORAGE_KEY = "site-type";

export const siteBootScript = `
(function(){
  var d = document.documentElement;
  try {
    var m = localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});
    // Dark is the designed default; light is an opt-in from the footer switch.
    if (m !== "light" && m !== "dark") m = "dark";
    d.dataset.mode = m;
    var t = localStorage.getItem(${JSON.stringify(TYPE_STORAGE_KEY)});
    var valid = ${JSON.stringify(typeStyles.map((s) => s.key))};
    d.dataset.type = valid.indexOf(t) > -1 ? t : ${JSON.stringify(defaultTypeStyle)};
  } catch (e) {
    d.dataset.mode = "dark";
    d.dataset.type = ${JSON.stringify(defaultTypeStyle)};
  }
})();
`;
