import { useState } from "react";
import T from "../i18n.js";
import { useTheme } from "../theme.js";
import { VERSION, TIER_BG, TYPE_COLORS } from "../constants.js";
import { getTierIndex, detectBrowserLanguage } from "../utils.js";
import RadarChart from "./RadarChart.jsx";
import MitigationCard from "./MitigationCard.jsx";
import DocSidebar from "./DocSidebar.jsx";
import styles from "./RiskRadar.module.css";

export default function RiskRadar() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
    return detectBrowserLanguage();
  });
  const { setTheme, isDark } = useTheme();
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

  return (
    <div className={styles.app} style={{ marginRight: docsOpen ? "min(480px, 85vw)" : 0 }}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button onClick={() => setTheme(isDark ? "light" : "dark")} className={styles.btn} aria-label="Toggle theme">
          {isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"} {isDark ? "Light" : "Dark"}
        </button>
        <button onClick={toggleLang} className={styles.btn}>
          {t.langSwitch}
        </button>
        <button
          onClick={() => setDocsOpen(!docsOpen)}
          className={styles.btn}
          style={{
            background: docsOpen ? `${tc}22` : undefined,
            border: `1px solid ${docsOpen ? tc : "var(--border)"}`,
            color: docsOpen ? "var(--text-heading)" : undefined,
          }}
        >
          {docsOpen ? t.closeButton : t.docsButton}
        </button>
      </div>

      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      {/* Presets */}
      <div className={styles.presets}>
        {t.presets.map((p) => {
          const active = JSON.stringify(values) === JSON.stringify(p.values);
          return (
            <button
              key={p.name}
              onClick={() => setValues(p.values)}
              className={styles.presetBtn}
              style={{
                border: active ? `2px solid ${tc}` : "1px solid var(--border)",
                background: active ? `${tc}22` : "var(--bg-card)",
                color: active ? "var(--text-heading)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.chartWrapper}>
          <RadarChart values={values} dimensions={t.dimensions} />
        </div>

        {/* Tier badge */}
        <div className={styles.tierBadge} style={{ background: `${tc}18`, border: `2px solid ${tc}` }}>
          <span className={styles.tierNumber} style={{ color: tc }}>
            {ti + 1}
          </span>
          <div>
            <div className={styles.tierLabel} style={{ color: tc }}>
              {tier.label}
            </div>
            <div className={styles.tierDesc}>{tier.desc}</div>
          </div>
        </div>

        {/* Sliders */}
        <div className={styles.sliders}>
          {t.dimensions.map((dim) => {
            const v = values[dim.key];
            const sc = TIER_BG[v <= 1 ? 0 : v <= 2 ? 1 : v <= 3 ? 2 : 3];
            return (
              <div key={dim.key} className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>{dim.label}</span>
                  <span className={styles.sliderLevel} style={{ color: sc }}>
                    {dim.levels[v]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={v}
                  onChange={(e) => set(dim.key, parseInt(e.target.value))}
                  className={styles.slider}
                  style={{ accentColor: sc }}
                />
                <div className={styles.sliderRange}>
                  <span>{t.low}</span>
                  <span>{t.high}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitigations */}
        <div className={styles.mitigations}>
          <div className={styles.mitigationHeader}>
            <h2 className={styles.mitigationTitle}>{t.mitigationHeading}</h2>
            <span className={styles.mitigationCount}>
              {activeCount} {t.active}
            </span>
          </div>
          <div className={styles.legend}>
            {Object.entries(TYPE_COLORS).map(([key, c]) => (
              <div key={key} className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: c.color }} />
                <span className={styles.legendLabel}>{t.typeBadges[key]}</span>
              </div>
            ))}
          </div>
          <div className={styles.cumulativeNote} style={{ borderLeft: `3px solid ${tc}` }}>
            <strong className={styles.cumulativeStrong}>{t.cumulative}:</strong>{" "}
            {t.cumulativeNote(ti, t.mitigations[ti].title)}
          </div>
          <div className={styles.cardList}>
            {t.mitigations.map((g) => (
              <MitigationCard key={g.tier} group={g} active={g.tier <= ti + 1} accent={TIER_BG[g.tier - 1]} t={t} />
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            v{VERSION} ·{" "}
            <a
              href="https://github.com/LLM-Coding/vibe-coding-risk-radar"
              target="_blank"
              rel="noopener"
              className={styles.footerLink}
            >
              {t.footer.github}
            </a>{" "}
            ·{" "}
            <a
              href={`docs/risk-radar${lang === "en" ? "-en" : ""}.html`}
              target="_blank"
              rel="noopener"
              className={styles.footerLink}
            >
              {t.footer.fullDocs}
            </a>{" "}
            ·{" "}
            <a
              href={`https://github.com/LLM-Coding/vibe-coding-risk-radar/issues/new?title=${encodeURIComponent(t.footer.feedbackTitle)}&body=${encodeURIComponent(t.footer.feedbackBody)}`}
              target="_blank"
              rel="noopener"
              className={styles.footerLink}
            >
              {t.footer.feedback}
            </a>
          </div>
          <div>
            {t.footer.madeBy}{" "}
            <a
              href="https://www.linkedin.com/in/rdmueller"
              target="_blank"
              rel="noopener"
              className={styles.footerLink}
            >
              Ralf D. Müller
            </a>
          </div>
        </div>
      </div>

      <a
        href={`https://github.com/LLM-Coding/vibe-coding-risk-radar/issues/new?title=${encodeURIComponent(t.footer.feedbackTitle)}&body=${encodeURIComponent(t.footer.feedbackBody)}`}
        target="_blank"
        rel="noopener"
        className={styles.fab}
      >
        <span className={styles.fabIcon}>💬</span> {t.footer.feedback}
      </a>

      <DocSidebar docs={t.docs} open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
