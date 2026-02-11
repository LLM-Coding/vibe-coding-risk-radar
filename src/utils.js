export function getTierIndex(values) {
  const mx = Math.max(...Object.values(values));
  return mx <= 1 ? 0 : mx <= 2 ? 1 : mx <= 3 ? 2 : 3;
}

export function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function detectBrowserLanguage() {
  const nav = navigator.language || navigator.userLanguage || "";
  return nav.startsWith("de") ? "de" : "en";
}
