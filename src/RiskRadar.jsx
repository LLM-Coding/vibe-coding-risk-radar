import { useState } from "react";
import T from "./i18n.js";
import { useTheme } from "./theme.js";
import { VERSION, TIER_BG, TYPE_COLORS } from "./constants.js";
import { getTierIndex, detectBrowserLanguage } from "./utils.js";
import RadarChart from "./components/RadarChart.jsx";
import MitigationCard from "./components/MitigationCard.jsx";
import DocSidebar from "./components/DocSidebar.jsx";

export default function RiskRadar() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
    return detectBrowserLanguage();
  });
  const { theme, setTheme, isDark } = useTheme();
  const [docsOpen, setDocsOpen] = useState(false);
  const [values, setValues] = useState({ codeType: 0, language: 1, deployment: 0, data: 0, blastRadius: 0 });
  const t = T[lang];
  const ti = getTierIndex(values);
  const tier = t.tiers[ti];
  const tc = TIER_BG[ti];
  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));
  const activeCount = t.mitigations.filter((g) => g.tier <= ti + 1).reduce((s, g) => s + g.measures.length, 0);

  const toggleLang = () => {
    const next = lang === "de" ? "en" : "de";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  const btnStyle = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", padding: "6px 14px", cursor: "pointer", fontSize: 16, fontWeight: 600 };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg-main)", color: "var(--text-primary)", minHeight: "100vh", padding: "20px 16px", transition: "margin-right 0.3s", marginRight: docsOpen ? "min(480px, 85vw)" : 0 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
        <button onClick={() => setTheme(isDark ? "light" : "dark")} style={btnStyle} aria-label="Toggle theme">
          {isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"} {isDark ? "Light" : "Dark"}
        </button>
        <button onClick={toggleLang} style={btnStyle}>
          {t.langSwitch}
        </button>
        <button
          onClick={() => setDocsOpen(!docsOpen)}
          style={{ ...btnStyle, background: docsOpen ? `${tc}22` : "var(--bg-card)", border: `1px solid ${docsOpen ? tc : "var(--border)"}`, color: docsOpen ? "var(--text-heading)" : "var(--text-secondary)" }}
        >
          {docsOpen ? t.closeButton : t.docsButton}
        </button>
      </div>

      <h1 style={{ fontSize: 30, fontWeight: 700, textAlign: "center", margin: "0 0 4px", color: "var(--text-heading)" }}>{t.title}</h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 18, margin: "0 0 18px" }}>{t.subtitle}</p>

      {/* Presets */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 18 }}>
        {t.presets.map((p) => {
          const active = JSON.stringify(values) === JSON.stringify(p.values);
          return (
            <button key={p.name} onClick={() => setValues(p.values)} style={{ padding: "6px 12px", fontSize: 15, borderRadius: 6, border: active ? `2px solid ${tc}` : "1px solid var(--border)", background: active ? `${tc}22` : "var(--bg-card)", color: active ? "var(--text-heading)" : "var(--text-muted)", cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>
              {p.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ width: "100%", maxWidth: 320 }}><RadarChart values={values} dimensions={t.dimensions} /></div>

        {/* Tier badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: `${tc}18`, border: `2px solid ${tc}`, borderRadius: 10, padding: "8px 18px" }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: tc }}>{ti + 1}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, color: tc }}>{tier.label}</div>
            <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>{tier.desc}</div>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ width: "100%", maxWidth: 460 }}>
          {t.dimensions.map((dim) => {
            const v = values[dim.key];
            const sc = TIER_BG[v <= 1 ? 0 : v <= 2 ? 1 : v <= 3 ? 2 : 3];
            return (
              <div key={dim.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{dim.label}</span>
                  <span style={{ fontSize: 13, color: sc, fontWeight: 600 }}>{dim.levels[v]}</span>
                </div>
                <input type="range" min={0} max={4} step={1} value={v} onChange={(e) => set(dim.key, parseInt(e.target.value))} style={{ width: "100%", accentColor: sc, height: 5, cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>
                  <span>{t.low}</span><span>{t.high}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitigations */}
        <div style={{ width: "100%", maxWidth: 500, borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t.mitigationHeading}</h2>
            <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>{activeCount} {t.active}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(TYPE_COLORS).map(([key, c]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: c.color }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.typeBadges[key]}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--bg-card)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.5, borderLeft: `3px solid ${tc}` }}>
            <strong style={{ color: "var(--text-primary)" }}>{t.cumulative}:</strong> {t.cumulativeNote(ti, t.mitigations[ti].title)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.mitigations.map((g) => <MitigationCard key={g.tier} group={g} active={g.tier <= ti + 1} accent={TIER_BG[g.tier - 1]} t={t} />)}
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.8 }}>
          <div>v{VERSION} · <a href="https://github.com/LLM-Coding/vibe-coding-risk-radar" target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>{t.footer.github}</a> · <a href={`docs/risk-radar${lang === "en" ? "-en" : ""}.html`} target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>{t.footer.fullDocs}</a></div>
          <div>{t.footer.madeBy} <a href="https://www.linkedin.com/in/rdmueller" target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>Ralf D. Müller</a></div>
        </div>
      </div>

      <DocSidebar docs={t.docs} open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
