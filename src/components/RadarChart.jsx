import { useRef, useEffect, useState, useCallback } from "react";
import { TIER_BG } from "../constants.js";
import { getTierIndex, polarToCartesian } from "../utils.js";
import styles from "./RadarChart.module.css";

// ── Animation helpers ────────────────────────────────────────────────────────

function animatePoints(el, toStr, duration = 800) {
  if (!el) return;
  const from = el.getAttribute("points");
  if (!from || from === toStr) {
    el.setAttribute("points", toStr);
    return;
  }
  const fromPts = from
    .trim()
    .split(/\s+/)
    .map((p) => p.split(",").map(Number));
  const toPts = toStr
    .trim()
    .split(/\s+/)
    .map((p) => p.split(",").map(Number));
  if (fromPts.length !== toPts.length) {
    el.setAttribute("points", toStr);
    return;
  }
  if (el._rafId) cancelAnimationFrame(el._rafId);
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const t = Math.min((ts - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    el.setAttribute(
      "points",
      fromPts
        .map((fp, i) => {
          const tp = toPts[i];
          return `${fp[0] + (tp[0] - fp[0]) * ease},${fp[1] + (tp[1] - fp[1]) * ease}`;
        })
        .join(" "),
    );
    if (t < 1) {
      el._rafId = requestAnimationFrame(step);
    } else {
      el.setAttribute("points", toStr);
      el._rafId = null;
    }
  }
  el._rafId = requestAnimationFrame(step);
}

function animateAttr(el, attr, from, to, duration = 800) {
  if (!el) return;
  const key = `_raf_${attr}`;
  if (el[key]) cancelAnimationFrame(el[key]);
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const t = Math.min((ts - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    el.setAttribute(attr, from + (to - from) * ease);
    if (t < 1) {
      el[key] = requestAnimationFrame(step);
    } else {
      el.setAttribute(attr, to);
      el[key] = null;
    }
  }
  el[key] = requestAnimationFrame(step);
}

function animateColor(el, fromHex, toHex, duration = 800, attrs = ["fill", "stroke"]) {
  if (!el || !fromHex || !toHex || fromHex === toHex) return;
  const parse = (h) => {
    const s = h.replace("#", "");
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  };
  const toHexStr = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const f = parse(fromHex),
    t = parse(toHex);
  if (el._colorRafId) cancelAnimationFrame(el._colorRafId);
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    const color = toHexStr(f[0] + (t[0] - f[0]) * ease, f[1] + (t[1] - f[1]) * ease, f[2] + (t[2] - f[2]) * ease);
    attrs.forEach((a) => el.setAttribute(a, color));
    if (p < 1) {
      el._colorRafId = requestAnimationFrame(step);
    } else {
      attrs.forEach((a) => el.setAttribute(a, toHex));
      el._colorRafId = null;
    }
  }
  el._colorRafId = requestAnimationFrame(step);
}

function getValueLabelPos(dotX, dotY, cx, cy, offset = 18) {
  const dx = dotX - cx;
  const dy = dotY - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const rx = dx / len;
  const ry = dy / len;
  return {
    x: dotX + px * offset * 0.9 + rx * 4,
    y: dotY + py * offset * 0.9 + ry * 4,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RadarChart({
  values = {},
  dimensions = [],
  size = 460,
  determiningKey = null,
  registerUpdater = null,
  llmRuntimeLevel = 0,
}) {
  // Safe fallbacks to prevent math from crashing if data is missing
  const safeDims = dimensions || [];
  const safeVals = values || {};

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 100;
  const levels = 5;
  const n = safeDims.length || 1; // prevents division by zero
  const angStep = 360 / n;

  // Ref mirrors the prop so the rAF-driven registerUpdater closure
  // can read the current level without re-binding the callback.
  const llmRuntimeLevelRef = useRef(llmRuntimeLevel);
  llmRuntimeLevelRef.current = llmRuntimeLevel;

  const ti = getTierIndex(safeVals, llmRuntimeLevel);
  const tc = TIER_BG[ti] || "#6b7280";

  const [tooltip, setTooltip] = useState(null);

  const svgRef = useRef(null);
  const riskPolygonRef = useRef(null);
  const gridRingRefs = useRef([]);
  const dotRefs = useRef([]);
  const dotGroupRefs = useRef([]);
  const labelRefs = useRef([]);
  const prevTcRef = useRef(tc);
  const mountedRef = useRef(false);
  const dimensionsRef = useRef(safeDims);

  useEffect(() => {
    if (!registerUpdater) return;
    registerUpdater((newValues) => {
      if (!mountedRef.current) return;
      const dims = dimensionsRef.current;
      const newTi = getTierIndex(newValues, llmRuntimeLevelRef.current);
      const newTc = TIER_BG[newTi] || "#6b7280";
      const newRiskPts = dims.map((d, i) =>
        polarToCartesian(cx, cy, (maxR / levels) * (newValues[d.key] + 1), i * angStep),
      );
      const newRiskPointsStr = newRiskPts.map((p) => `${p.x},${p.y}`).join(" ");

      if (riskPolygonRef.current) {
        riskPolygonRef.current.setAttribute("points", newRiskPointsStr);
        riskPolygonRef.current.setAttribute("fill", newTc);
        riskPolygonRef.current.setAttribute("stroke", newTc);
      }
      dotRefs.current.forEach((el, i) => {
        if (!el) return;
        el.setAttribute("cx", newRiskPts[i].x);
        el.setAttribute("cy", newRiskPts[i].y);
        el.setAttribute("fill", newTc);
        el.style.color = newTc;
      });
      labelRefs.current.forEach((el, i) => {
        if (!el) return;
        const lp = getValueLabelPos(newRiskPts[i].x, newRiskPts[i].y, cx, cy, 18);
        el.setAttribute("x", lp.x);
        el.setAttribute("y", lp.y);
        el.setAttribute("fill", newTc);
        el.textContent = Math.round(newValues[dimensionsRef.current[i].key]);
      });
      prevTcRef.current = newTc;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerUpdater]);

  const riskPts = safeDims.map((d, i) =>
    polarToCartesian(cx, cy, (maxR / levels) * ((safeVals[d.key] || 0) + 1), i * angStep),
  );
  const riskPointsStr = riskPts.map((p) => `${p.x},${p.y}`).join(" ");

  const gridPointStrs = [1, 2, 3, 4, 5].map((l) => {
    const r = (maxR / levels) * l;
    return Array.from({ length: safeDims.length }, (_, i) => polarToCartesian(cx, cy, r, i * angStep))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  });

  useEffect(() => {
    mountedRef.current = false;

    riskPolygonRef.current?.setAttribute("points", riskPointsStr);
    riskPolygonRef.current?.setAttribute("fill", tc);
    riskPolygonRef.current?.setAttribute("stroke", tc);

    gridRingRefs.current.forEach((el, i) => el?.setAttribute("points", gridPointStrs[i]));

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      el.setAttribute("cx", riskPts[i].x);
      el.setAttribute("cy", riskPts[i].y);
      el.setAttribute("fill", tc);
      el.style.color = tc;
    });

    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const lp = getValueLabelPos(riskPts[i].x, riskPts[i].y, cx, cy, 18);
      el.setAttribute("x", lp.x);
      el.setAttribute("y", lp.y);
      el.setAttribute("fill", tc);
    });

    dotGroupRefs.current.forEach((g, i) => {
      if (!g) return;
      const ox = riskPts[i].x;
      const oy = riskPts[i].y;
      g.style.transformOrigin = `${ox}px ${oy}px`;
      g.style.opacity = "0";
      g.style.transform = "scale(0.2)";
      g.style.transition = "none";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const delay = 300 + i * 90;
          g.style.transition = `opacity 0.35s ease ${delay}ms, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`;
          g.style.opacity = "1";
          g.style.transform = "scale(1)";
        }),
      );
    });

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const prevTc = prevTcRef.current;
    const colorChanged = prevTc !== tc;

    animatePoints(riskPolygonRef.current, riskPointsStr);

    if (colorChanged) {
      animateColor(riskPolygonRef.current, prevTc, tc, 800, ["fill", "stroke"]);
    }

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const fromCx = parseFloat(el.getAttribute("cx") ?? riskPts[i].x);
      const fromCy = parseFloat(el.getAttribute("cy") ?? riskPts[i].y);
      animateAttr(el, "cx", fromCx, riskPts[i].x);
      animateAttr(el, "cy", fromCy, riskPts[i].y);
      if (colorChanged) animateColor(el, prevTc, tc, 800, ["fill"]);
    });

    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const lp = getValueLabelPos(riskPts[i].x, riskPts[i].y, cx, cy, 18);
      const fromX = parseFloat(el.getAttribute("x") ?? lp.x);
      const fromY = parseFloat(el.getAttribute("y") ?? lp.y);
      animateAttr(el, "x", fromX, lp.x);
      animateAttr(el, "y", fromY, lp.y);
      if (colorChanged) animateColor(el, prevTc, tc, 800, ["fill"]);
    });

    if (colorChanged) prevTcRef.current = tc;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskPointsStr, tc]);

  const handleDotEnter = useCallback(
    (e, i) => {
      if (!safeDims[i]) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip({
        x: (e.clientX - rect.left) * (size / rect.width),
        y: (e.clientY - rect.top) * (size / rect.height),
        label: safeDims[i].label || safeDims[i].shortLabel,
        value: safeVals[safeDims[i].key],
      });
    },
    [safeDims, safeVals, size],
  );

  const handleDotLeave = useCallback(() => setTooltip(null), []);

  const tooltipW = 120,
    tooltipH = 56;
  const tipX = tooltip ? Math.min(Math.max(tooltip.x - tooltipW / 2, 8), size - tooltipW - 8) : 0;
  const tipY = tooltip ? tooltip.y - tooltipH - 18 : 0;

  // ── THE FIX: Early return is now safely AFTER all hooks! ───────────────
  if (!dimensions?.length || !values) return null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      className={styles.chart}
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--grid-line)" opacity="0.7" />
        </pattern>
      </defs>
      <rect width={size} height={size} fill="url(#dot-grid)" />

      {gridPointStrs.map((_, idx) => {
        const l = idx + 1;
        return (
          <polygon
            key={`grid-ring-${l}`}
            ref={(el) => (gridRingRefs.current[idx] = el)}
            fill="none"
            stroke={l === 5 ? "var(--grid-line-outer)" : "var(--grid-line)"}
            strokeWidth={l === 5 ? 1.8 : 1}
          />
        );
      })}

      {dimensions.map((d, i) => {
        const p = polarToCartesian(cx, cy, maxR, i * angStep);
        return (
          <line
            key={`spoke-${d.key || i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--grid-line)"
            strokeWidth={1}
          />
        );
      })}

      <polygon ref={riskPolygonRef} fillOpacity={0.22} strokeWidth={3} className={styles.polygon} />

      {dimensions.map((d, i) => (
        <g key={`item-${d.key}`} ref={(el) => (dotGroupRefs.current[i] = el)}>
          <circle
            ref={(el) => (dotRefs.current[i] = el)}
            r={7}
            stroke="white"
            strokeWidth={2.5}
            className={styles.circle}
            style={{ cursor: "pointer", color: tc }}
            onMouseEnter={(e) => handleDotEnter(e, i)}
            onMouseLeave={handleDotLeave}
          />
          <text
            ref={(el) => (labelRefs.current[i] = el)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="13"
            fontWeight="bold"
            className={styles.valueLabel}
          >
            {Math.round(values[d.key])}
          </text>
        </g>
      ))}

      {dimensions.map((d, i) => {
        const lp = polarToCartesian(cx, cy, maxR + 45, i * angStep);
        const isDetermining = determiningKey && d.key === determiningKey;
        return (
          <text
            key={`label-${d.key}`}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDetermining ? "#ffffff" : "var(--text-secondary)"}
            fontSize="14"
            fontWeight={isDetermining ? "bold" : "600"}
          >
            {d.label || d.shortLabel}
          </text>
        );
      })}

      {tooltip && (
        <g className={styles.tooltip} style={{ pointerEvents: "none" }}>
          <defs>
            <filter id="tt-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>
          <rect
            x={tipX}
            y={tipY}
            width={tooltipW}
            height={tooltipH}
            rx={10}
            fill="#1e293b"
            stroke={tc}
            strokeWidth={1.5}
            filter="url(#tt-shadow)"
          />
          <text x={tipX + 14} y={tipY + 19} fill="#94a3b8" fontSize="11" fontWeight="500">
            {tooltip.label}
          </text>
          <text x={tipX + 14} y={tipY + 39} fill={tc} fontSize="19" fontWeight="800">
            {tooltip.value}
            <tspan fill="#475569" fontSize="11" fontWeight="400">
              {" "}
              / 4
            </tspan>
          </text>
          <polygon
            points={`${tipX + tooltipW / 2 - 7},${tipY + tooltipH} ${tipX + tooltipW / 2 + 7},${tipY + tooltipH} ${tipX + tooltipW / 2},${tipY + tooltipH + 10}`}
            fill="#1e293b"
            stroke={tc}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <polygon
            points={`${tipX + tooltipW / 2 - 5},${tipY + tooltipH - 1} ${tipX + tooltipW / 2 + 5},${tipY + tooltipH - 1} ${tipX + tooltipW / 2},${tipY + tooltipH + 8}`}
            fill="#1e293b"
          />
        </g>
      )}
    </svg>
  );
}
