import { useState, useRef, useEffect, useMemo } from "react";
import Asciidoctor from "@asciidoctor/core";
import T from "./i18n.js";
import { useTheme } from "./theme.js";
import { VERSION, TIER_BG, TYPE_COLORS } from "./constants.js";
import { getTierIndex, detectBrowserLanguage } from "./utils.js";
import RadarChart from "./components/RadarChart.jsx";

function MitigationCard({ group, active, accent, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${active ? accent : "var(--border-subtle)"}`, borderRadius: 12, background: active ? `${accent}10` : "var(--bg-main)", padding: "12px 14px", opacity: active ? 1 : 0.5, transition: "all 0.3s" }}>
      <div onClick={() => active && setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: active ? "pointer" : "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{group.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: active ? "var(--text-heading)" : "var(--text-secondary)" }}>{group.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{group.measures.length} {group.measures.length !== 1 ? t.measures : t.measure}</div>
          </div>
        </div>
        {active && <span style={{ fontSize: 22, color: "var(--text-secondary)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>}
      </div>
      {active && open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {group.measures.map((m, i) => {
            const tc = TYPE_COLORS[m.type];
            return (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${tc.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{m.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg, padding: "2px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t.typeBadges[m.type]}
                  </span>
                </div>
                <div style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const adoc = Asciidoctor();

const ADOC_SIDEBAR_STYLES = `
  .adoc-content p { margin: 0.5em 0; }
  .adoc-content a { color: var(--link); text-decoration: underline; text-decoration-color: var(--link-underline); }
  .adoc-content a:hover { text-decoration-color: var(--link); }
  .adoc-content strong { color: var(--text-primary); }
  .adoc-content code { background: var(--bg-card); padding: 1px 4px; border-radius: 3px; font-size: 0.92em; }
`;

function DocSidebar({ docs, open, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (open && ref.current) ref.current.scrollTop = 0; }, [open]);
  useEffect(() => {
    if (open && ref.current) {
      ref.current.querySelectorAll(".adoc-content a").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      });
    }
  });

  const rendered = useMemo(() =>
    docs.sections.map((sec) => ({
      ...sec,
      html: adoc.convert(sec.content, { safe: "safe", attributes: { showtitle: false } }),
    })),
    [docs.sections]
  );

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: open ? "min(480px, 85vw)" : "0",
        background: "var(--bg-sidebar)", borderLeft: open ? "1px solid var(--border)" : "none",
        overflowY: "auto", overflowX: "hidden",
        transition: "width 0.3s ease",
        zIndex: 1000,
        boxShadow: open ? "-8px 0 30px var(--shadow)" : "none",
      }}
    >
      {open && (
        <div style={{ padding: "24px 20px" }}>
          <style>{ADOC_SIDEBAR_STYLES}</style>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-heading)" }}>{docs.title}</h2>
            <button onClick={onClose} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          {rendered.map((sec) => (
            <div key={sec.id} style={{
              marginBottom: 28,
              ...(sec.id === "disclaimer" ? { background: "var(--bg-card)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" } : {}),
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: sec.id === "disclaimer" ? "#f59e0b" : "var(--text-primary)", margin: "0 0 10px", paddingBottom: 6, borderBottom: sec.id === "disclaimer" ? "none" : "1px solid var(--border-subtle)" }}>
                {sec.id === "disclaimer" ? "\u26A0\uFE0F " : ""}{sec.title}
              </h3>
              <div
                className="adoc-content"
                style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: sec.html }}
              />
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16, marginTop: 8, fontSize: 15, color: "var(--text-secondary)", textAlign: "center" }}>
            Generated with data from Veracode, CodeRabbit, BaxBench, Unit 42, Aikido Security, CSA, and others.
          </div>
        </div>
      )}
    </div>
  );
}

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
