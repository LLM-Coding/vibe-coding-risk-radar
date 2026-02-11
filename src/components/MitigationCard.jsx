import { useState } from "react";
import { TYPE_COLORS } from "../constants.js";
import styles from "./MitigationCard.module.css";

export default function MitigationCard({ group, active, accent, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`${styles.card} ${active ? "" : styles.cardInactive}`}
      style={{
        border: `2px solid ${active ? accent : "var(--border-subtle)"}`,
        background: active ? `${accent}10` : "var(--bg-main)",
      }}
    >
      <div
        onClick={() => active && setOpen(!open)}
        className={styles.header}
        style={{ cursor: active ? "pointer" : "default" }}
      >
        <div className={styles.headerInfo}>
          <span className={styles.icon}>{group.icon}</span>
          <div>
            <div className={styles.title} style={{ color: active ? "var(--text-heading)" : "var(--text-secondary)" }}>
              {group.title}
            </div>
            <div className={styles.subtitle}>
              {group.measures.length} {group.measures.length !== 1 ? t.measures : t.measure}
            </div>
          </div>
        </div>
        {active && <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>}
      </div>
      {active && open && (
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
      )}
    </div>
  );
}
