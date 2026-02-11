import { TIER_BG } from "../constants.js";
import { getTierIndex, polarToCartesian } from "../utils.js";
import styles from "./RadarChart.module.css";

export default function RadarChart({ values, dimensions, size = 320 }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 48, levels = 5, n = dimensions.length, step = 360 / n;
  const ti = getTierIndex(values);
  const tc = TIER_BG[ti];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={styles.chart} style={{ maxWidth: size }}>
      {[1, 2, 3, 4, 5].map((l) => {
        const r = (maxR / levels) * l;
        const pts = Array.from({ length: n }, (_, i) => polarToCartesian(cx, cy, r, i * step));
        return <polygon key={l} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={l === 5 ? "var(--grid-line-outer)" : "var(--grid-line)"} strokeWidth={l === 5 ? 1.5 : 0.7} />;
      })}
      {dimensions.map((_, i) => {
        const p = polarToCartesian(cx, cy, maxR, i * step);
        return <line key={`a${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--grid-line)" strokeWidth={0.7} />;
      })}
      {(() => {
        const pts = dimensions.map((d, i) => polarToCartesian(cx, cy, (maxR / levels) * (values[d.key] + 1), i * step));
        return (
          <>
            <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={tc} fillOpacity={0.25} stroke={tc} strokeWidth={2.5} />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={tc} stroke="var(--dot-stroke)" strokeWidth={1.5} />)}
          </>
        );
      })()}
      {dimensions.map((d, i) => {
        const lp = polarToCartesian(cx, cy, maxR + 26, i * step);
        return <text key={`l${i}`} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="var(--text-secondary)" fontSize="15" fontWeight="600">{d.shortLabel}</text>;
      })}
    </svg>
  );
}
