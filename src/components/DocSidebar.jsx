import { useRef, useEffect, useMemo } from "react";
import Asciidoctor from "@asciidoctor/core";
import styles from "./DocSidebar.module.css";

const adoc = Asciidoctor();

const ADOC_SIDEBAR_STYLES = `
  .adoc-content p { margin: 0.5em 0; }
  .adoc-content a { color: var(--link); text-decoration: underline; text-decoration-color: var(--link-underline); }
  .adoc-content a:hover { text-decoration-color: var(--link); }
  .adoc-content strong { color: var(--text-primary); }
  .adoc-content code { background: var(--bg-card); padding: 1px 4px; border-radius: 3px; font-size: 0.92em; }
  .adr-admonition {
    background: var(--bg-card);
    border: 1px solid #f59e0b;
    border-left: 4px solid #f59e0b;
    border-radius: 6px;
    padding: 12px 14px;
    margin: 16px 0;
  }
  .adr-admonition p:first-child { margin-top: 0; }
  .adr-admonition p:last-child { margin-bottom: 0; }
`;

export default function DocSidebar({ docs, open, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open && ref.current) ref.current.scrollTop = 0;
  }, [open]);
  useEffect(() => {
    if (open && ref.current) {
      ref.current.querySelectorAll(".adoc-content a").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      });
    }
  });

  const rendered = useMemo(
    () =>
      docs.sections.map((sec) => ({
        ...sec,
        html: adoc.convert(sec.content, { safe: "safe", attributes: { showtitle: false } }),
      })),
    [docs.sections],
  );

  return (
    <div ref={ref} className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
      {open && (
        <div className={styles.content}>
          <style>{ADOC_SIDEBAR_STYLES}</style>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>{docs.title}</h2>
            <button onClick={onClose} className={styles.closeBtn}>
              ✕
            </button>
          </div>
          {rendered.map((sec) => (
            <div key={sec.id} className={`${styles.section} ${sec.id === "disclaimer" ? styles.disclaimer : ""}`}>
              <h3 className={sec.id === "disclaimer" ? styles.disclaimerTitle : styles.sectionTitle}>
                {sec.id === "disclaimer" ? "\u26A0\uFE0F " : ""}
                {sec.title}
              </h3>
              <div className={`adoc-content ${styles.adocBody}`} dangerouslySetInnerHTML={{ __html: sec.html }} />
            </div>
          ))}
          <div className={styles.footer}>
            Generated with data from Veracode, CodeRabbit, BaxBench, Unit 42, Aikido Security, CSA, and others.
          </div>
        </div>
      )}
    </div>
  );
}
