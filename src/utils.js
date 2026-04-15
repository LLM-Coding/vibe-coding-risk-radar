export function getTierIndex(values, llmRuntimeLevel = 0) {
  const mx = Math.max(...Object.values(values));
  const base = mx <= 1 ? 0 : mx <= 2 ? 1 : mx <= 3 ? 2 : 3;
  // LLM Runtime Modifier: L3 → min Tier 3 (index 2), L4 → min Tier 4 (index 3)
  const floor = llmRuntimeLevel >= 4 ? 3 : llmRuntimeLevel >= 3 ? 2 : 0;
  return Math.max(base, floor);
}

export function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function detectBrowserLanguage() {
  const nav = navigator.language || navigator.userLanguage || "";
  return nav.startsWith("de") ? "de" : "en";
}
