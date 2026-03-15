import { useState } from "react";
import { TYPE_COLORS } from "../constants.js";
import styles from "./MitigationCard.module.css";

export default function MitigationCard({ group, active, accent, t }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`${styles.card} ${active ? "" : styles.cardInactive}`}
      style={{
        border: `1px solid ${active ? accent : "var(--border-subtle)"}`,
        background: active ? `${accent}10` : "transparent",
      }}
    >
      <div
        onClick={() => active && setOpen(!open)}
        className={styles.header}
        style={{ cursor: active ? "pointer" : "default" }}
      >
        <div className={styles.headerInfo}>
          <span className={styles.icon} style={{ opacity: active ? 1 : 0.35 }}>
            {active ? group.icon : "🔒"}
          </span>
          <div>
            <div
              className={styles.title}
              style={{
                color: active ? "var(--text-heading)" : "var(--text-secondary)",
                opacity: active ? 1 : 0.5,
              }}
            >
              {group.title}
            </div>
            <div className={styles.subtitle} style={{ opacity: active ? 1 : 0.4 }}>
              {active
                ? `${group.measures.length} ${group.measures.length !== 1 ? t.measures : t.measure}`
                : `Unlocks at Tier ${group.tier}`}
            </div>
          </div>
        </div>
        {active && <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>}
      </div>

      {/* Always rendered — grid-template-rows animates open/close smoothly */}
      {active && (
        <div className={`${styles.measuresWrapper} ${open ? styles.measuresWrapperOpen : ""}`}>
          <div className={styles.measures}>
            {group.measures.map((m, i) => {
              const tc = TYPE_COLORS[m.type];
              return (
                <div key={i} className={styles.measure} style={{ borderLeft: `3px solid ${tc.color}` }}>
                  <div className={styles.measureHeader}>
                    <span className={styles.measureName}>{m.name}</span>
                    <span className={styles.typeBadge} style={{ color: tc.color, background: tc.bg }}>
                      {t.typeBadges[m.type]}
                    </span>
                  </div>
                  <div className={styles.measureDesc}>{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
