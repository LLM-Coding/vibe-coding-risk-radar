import { useState, useRef, useEffect } from "react";

const VERSION = "1.0.0";

// ─── i18n ────────────────────────────────────────────────────────────
const T = {
  de: {
    title: "Vibe-Coding Risk Radar",
    subtitle: "5 Dimensionen · MECE · Höchstes Risiko bestimmt den Tier",
    low: "niedrig",
    high: "hoch",
    active: "aktiv",
    cumulative: "Kumulativ",
    cumulativeNote: (ti, tierTitle) =>
      ti > 0
        ? `Jeder Tier umfasst alle Maßnahmen der niedrigeren Tiers. Tier ${ti + 1} erfordert alle Maßnahmen von Tier 1${ti > 1 ? `–${ti}` : ""} plus die zusätzlichen Maßnahmen aus „${tierTitle}".`
        : `Tier 1 erfordert die Maßnahmen aus „${tierTitle}".`,
    mitigationHeading: "Erforderliche Mitigationsmaßnahmen",
    measures: "Maßnahmen",
    measure: "Maßnahme",
    docsButton: "Dokumentation",
    closeButton: "Schließen",
    langSwitch: "EN",
    typeBadges: {
      deterministic: "Deterministisch",
      probabilistic: "Probabilistisch",
      organizational: "Organisatorisch",
    },
    dimensions: [
      {
        key: "codeType", label: "Code-Typ", shortLabel: "Code",
        levels: ["UI / CSS / Doku", "Build-Scripts / Tests", "Business-Logik", "API / DB-Queries", "Auth / Security / Crypto"],
      },
      {
        key: "language", label: "Sprachsicherheit", shortLabel: "Sprache",
        levels: ["Statisch + Memory-safe (Rust)", "Statisch typisiert (Java, Go, TS)", "Dynamisch typisiert (Python, JS)", "Memory-unsafe managed (C#/unsafe)", "Memory-unsafe (C, C++)"],
      },
      {
        key: "deployment", label: "Deployment-Kontext", shortLabel: "Deploy",
        levels: ["Persönlich / Prototyp", "Internes Tool", "Public-facing App", "Reguliertes System", "Safety-critical (Avionik etc.)"],
      },
      {
        key: "data", label: "Datensensibilität", shortLabel: "Daten",
        levels: ["Öffentliche Daten", "Interne Geschäftsdaten", "Allg. PII (Name, E-Mail)", "Sensible PII (SSN, Biometrie)", "PHI / PCI (HIPAA, Kreditkarten)"],
      },
      {
        key: "blastRadius", label: "Blast Radius", shortLabel: "Blast",
        levels: ["Kosmetisch / Tech Debt", "Performance / DoS", "Datenverlust (wiederherstellbar)", "Systemischer Breach", "Safety (Leib & Leben)"],
      },
    ],
    tiers: [
      { label: "Tier 1 — Minimal", desc: "Nur automatische Gates" },
      { label: "Tier 2 — Moderat", desc: "Sampling-Review + Gates" },
      { label: "Tier 3 — Hoch", desc: "Pflicht-Review + Gates" },
      { label: "Tier 4 — Kritisch", desc: "AI-Generierung fragwürdig" },
    ],
    presets: [
      { name: "CSS Landing Page", values: { codeType: 0, language: 2, deployment: 0, data: 0, blastRadius: 0 } },
      { name: "Internes Dashboard", values: { codeType: 2, language: 1, deployment: 1, data: 1, blastRadius: 1 } },
      { name: "Public REST API", values: { codeType: 3, language: 2, deployment: 2, data: 2, blastRadius: 2 } },
      { name: "Payment Service", values: { codeType: 4, language: 1, deployment: 2, data: 4, blastRadius: 3 } },
      { name: "Auth-Modul (Fintech)", values: { codeType: 4, language: 2, deployment: 2, data: 3, blastRadius: 3 } },
      { name: "Medizingerät-Firmware", values: { codeType: 4, language: 4, deployment: 4, data: 4, blastRadius: 4 } },
    ],
    mitigations: [
      {
        tier: 1, title: "Automatische Gates (immer aktiv)", icon: "⚙️",
        measures: [
          { name: "Linter & Formatter", desc: "ESLint, Prettier, Ruff — schnelles Feedback, null Aufwand", type: "deterministic" },
          { name: "Type Checking", desc: "TypeScript strict, mypy — ganze Fehlerklassen ausgeschlossen", type: "deterministic" },
          { name: "Pre-Commit Hooks", desc: "Secrets-Scanning (GitGuardian), Lint, Format vor jedem Commit", type: "deterministic" },
          { name: "Dependency Check", desc: "npm audit, pip-audit — bekannte CVEs in Dependencies blocken", type: "deterministic" },
          { name: "CI Build & Unit Tests", desc: "Grüner Build als Merge-Bedingung — fängt Regressionen ab", type: "deterministic" },
        ],
      },
      {
        tier: 2, title: "Erweiterte Absicherung", icon: "🔍",
        measures: [
          { name: "SAST (Semgrep, CodeQL)", desc: "Statische Analyse auf Vulnerability-Patterns — als CI-Gate", type: "deterministic" },
          { name: "AI Code Review", desc: "CodeRabbit, Copilot Review — unabhängig vom generierenden LLM", type: "probabilistic" },
          { name: "Property-Based Tests", desc: "Hypothesis, fast-check — 81% Bug-Detection bei Edge Cases", type: "probabilistic" },
          { name: "SonarQube Quality Gate", desc: "Coverage ≥70%, 0 Critical Vulns, 0 Blocker als Merge-Gate", type: "deterministic" },
          { name: "Stichproben-Review", desc: "Mensch reviewt ~20% der PRs (rotierend, risiko-gewichtet)", type: "organizational" },
        ],
      },
      {
        tier: 3, title: "Pflicht-Maßnahmen für hohes Risiko", icon: "🛡️",
        measures: [
          { name: "Pflicht Human Review", desc: "Jeder PR mit Auth/PII/Payment wird von Senior Engineer reviewt", type: "organizational" },
          { name: "Sandbox / Isolation", desc: "Firecracker microVM, Deno Sandbox — Schadensbegrenzung bei Exploit", type: "deterministic" },
          { name: "Fuzzing", desc: "Fuzz4All, AFL++ — findet Crashes und Vulns durch zufällige Inputs", type: "probabilistic" },
          { name: "Penetration Testing", desc: "Regelmäßige Security-Audits auf Auth-Flows und API-Endpoints", type: "organizational" },
          { name: "Canary Deployments", desc: "Schrittweiser Rollout mit automatischem Rollback bei Anomalien", type: "deterministic" },
          { name: "PromptBOM / Provenance", desc: "Dokumentation: welches Modell, welcher Prompt, wer hat approved", type: "organizational" },
        ],
      },
      {
        tier: 4, title: "Kritisch — AI-Einsatz stark einschränken", icon: "🚨",
        measures: [
          { name: "Formale Verifikation", desc: "Dafny, TLA+, SPARK — mathematischer Beweis der Korrektheit", type: "deterministic" },
          { name: "Unabhängige Re-Verifikation", desc: "Separates Team verifiziert Output — analog DO-178C DAL A", type: "organizational" },
          { name: "MC/DC Test Coverage", desc: "Modified Condition/Decision Coverage — Pflicht bei DAL A/B", type: "deterministic" },
          { name: "Contract-Based Design", desc: "Pre/Postconditions + Invarianten — Spec first, dann Generierung", type: "deterministic" },
          { name: "Zertifizierungsprozess", desc: "IEC 61508, DO-178C, ISO 26262 Compliance — kein Shortcut möglich", type: "organizational" },
          { name: "AI nur als Entwurfshilfe", desc: "LLM generiert Vorschlag, Mensch implementiert und verifiziert", type: "organizational" },
        ],
      },
    ],
    docs: {
      title: "Dokumentation",
      sections: [
        {
          id: "intro",
          title: "Warum dieses Framework?",
          content: `LLM-generierter Code enthält in ca. 45% der Fälle Sicherheitslücken (Veracode, 2025). Gleichzeitig schreiben LLMs bereits über 30% des neuen Codes bei Google und Microsoft. Das Problem: Nicht jeder Code ist gleich riskant. CSS-Styling für eine Landingpage ohne Review zu deployen ist etwas grundlegend anderes als ein Auth-Modul für eine Fintech-App.\n\nDieses Framework bietet eine MECE-Risikokategorisierung (Mutually Exclusive, Collectively Exhaustive), die auf etablierten Safety-Standards (IEC 61508, DO-178C, ISO 26262) aufbaut und sie auf Vibe-Coding anwendet.`,
        },
        {
          id: "dims",
          title: "Die fünf Dimensionen",
          content: `Das Gesamtrisiko ergibt sich aus dem Maximum über fünf unabhängige Dimensionen — analog zum \"highest applicable SIL\" aus IEC 61508:\n\n**1. Code-Typ** — Stärkster Prädiktor. Auth/Crypto-Code an der Spitze, da LLMs systematisch MFA, HSTS und Session-Management auslassen. SQL-Injection bleibt häufig, weil LLMs String-Konkatenation statt parametrisierter Queries nutzen.\n\n**2. Sprachsicherheit** — Memory-unsafe Sprachen (C/C++) erzeugen einen Boden-Risiko-Level. Microsoft/Google berichten, dass ~70% ihrer Sicherheitslücken aus Memory-Safety-Problemen stammen.\n\n**3. Deployment-Kontext** — Wo der Code läuft bestimmt, wer betroffen ist. Safety-critical (Avionik, Medizin) erfordert nach DO-178C DAL A MC/DC-Coverage und unabhängige Verifikation.\n\n**4. Datensensibilität** — Regulatorische Exposition: PHI (HIPAA), PCI-Daten, sensible PII. LLM-Code implementiert routinemäßig nicht die erforderlichen Audit-Trails.\n\n**5. Blast Radius** — Reichweite und Reversibilität eines Schadens. Von kosmetischen Bugs bis Leib & Leben.`,
        },
        {
          id: "tiers",
          title: "Die vier Risiko-Tiers",
          content: `**Tier 1 — Minimal:** Persönliche Scripts, Prototypen, UI-Styling. Nur automatische Gates nötig. Kein Human Review erforderlich.\n\n**Tier 2 — Moderat:** Interne Tools, unkritische Business-Logik, Test-Code. Stichproben-Review (~20%) plus erweiterte automatische Analyse.\n\n**Tier 3 — Hoch:** Public-facing APIs, Payment-Processing, PII-Handling, Auth-Flows. Pflicht-Review durch Senior Engineers plus Defense-in-Depth.\n\n**Tier 4 — Kritisch:** Flugsteuerung, autonomes Fahren, Medizingeräte, Nuklearsysteme. AI-Generierung fragwürdig; falls eingesetzt, unabhängige Re-Verifikation erforderlich.`,
        },
        {
          id: "failures",
          title: "LLM-spezifische Fehlerarten",
          content: `LLM-Code scheitert qualitativ anders als menschlicher Code:\n\n**Plausibel aber subtil falsch** — Kompiliert, besteht oberflächliche Reviews, enthält aber fundamentale Fehler. CodeRabbit fand 1,7× mehr Issues pro PR in AI-Code vs. menschlichem Code.\n\n**Halluzinierte Packages (Slopsquatting)** — ~20% der empfohlenen Packages existieren nicht. Angreifer können diese Namen registrieren. \"huggingface-cli\" wurde 30.000+ mal installiert bevor es entdeckt wurde.\n\n**Automation Complacency** — Entwickler mit AI-Assistenten produzieren mehr Vulnerabilities und glauben gleichzeitig, sichereren Code zu schreiben (Stanford, Perry et al. 2022). Code-Review-Beteiligung sinkt um 30%.`,
        },
        {
          id: "mitigations",
          title: "Mitigationsstrategie",
          content: `Da Human Review nicht mit dem Volumen von AI-generiertem Code skaliert, setzt das Framework auf Defense-in-Depth mit drei Maßnahmentypen:\n\n**Deterministisch** (blau) — Garantierte Erkennung innerhalb ihres Scopes. Type Checker, Linter, SAST, Sandboxing. Kein False-Negative-Risiko innerhalb der abgedeckten Patterns.\n\n**Probabilistisch** (lila) — Findet vieles, aber nicht alles. AI Code Review, Property-Based Testing, Fuzzing. Erhöht die Erkennungsrate, bietet aber keine Garantie.\n\n**Organisatorisch** (orange) — Braucht Menschen, skaliert am schlechtesten. Deshalb erst ab Tier 2/3 eingeplant, und dort gezielt auf die riskantesten Änderungen fokussiert.`,
        },
        {
          id: "references",
          title: "Referenzen & Standards",
          content: `**Safety Standards:** IEC 61508 (SIL), DO-178C (DAL), ISO 26262 (ASIL), EU AI Act\n\n**Frameworks:** Palo Alto Unit 42 SHIELD, Aikido VCAL, Cloud Security Alliance Secure Vibe Coding Guide, Google SAIF\n\n**Empirische Daten:** Veracode (45% Vulnerability-Rate), CodeRabbit (1,7× mehr Issues), BaxBench (62% fehlerhafte Backends), GitClear (30% weniger Reviews), METR RCT (19% langsamer mit AI)\n\n**Tooling:** Semgrep, CodeQL, SonarQube, GitGuardian, Firecracker, Deno Sandbox, Fuzz4All, Hypothesis`,
        },
      ],
    },
  },
  en: {
    title: "Vibe-Coding Risk Radar",
    subtitle: "5 Dimensions · MECE · Highest risk determines the tier",
    low: "low",
    high: "high",
    active: "active",
    cumulative: "Cumulative",
    cumulativeNote: (ti, tierTitle) =>
      ti > 0
        ? `Each tier includes all measures from lower tiers. Tier ${ti + 1} requires all measures from Tier 1${ti > 1 ? `–${ti}` : ""} plus the additional measures from "${tierTitle}".`
        : `Tier 1 requires the measures from "${tierTitle}".`,
    mitigationHeading: "Required Mitigation Measures",
    measures: "measures",
    measure: "measure",
    docsButton: "Documentation",
    closeButton: "Close",
    langSwitch: "DE",
    typeBadges: {
      deterministic: "Deterministic",
      probabilistic: "Probabilistic",
      organizational: "Organizational",
    },
    dimensions: [
      {
        key: "codeType", label: "Code Type", shortLabel: "Code",
        levels: ["UI / CSS / Docs", "Build scripts / Tests", "Business logic", "API / DB queries", "Auth / Security / Crypto"],
      },
      {
        key: "language", label: "Language Safety", shortLabel: "Lang",
        levels: ["Static + Memory-safe (Rust)", "Statically typed (Java, Go, TS)", "Dynamically typed (Python, JS)", "Memory-unsafe managed (C#/unsafe)", "Memory-unsafe (C, C++)"],
      },
      {
        key: "deployment", label: "Deployment Context", shortLabel: "Deploy",
        levels: ["Personal / Prototype", "Internal tool", "Public-facing app", "Regulated system", "Safety-critical (avionics etc.)"],
      },
      {
        key: "data", label: "Data Sensitivity", shortLabel: "Data",
        levels: ["Public data", "Internal business data", "General PII (name, email)", "Sensitive PII (SSN, biometrics)", "PHI / PCI (HIPAA, credit cards)"],
      },
      {
        key: "blastRadius", label: "Blast Radius", shortLabel: "Blast",
        levels: ["Cosmetic / Tech debt", "Performance / DoS", "Data loss (recoverable)", "Systemic breach", "Safety (life & limb)"],
      },
    ],
    tiers: [
      { label: "Tier 1 — Minimal", desc: "Automated gates only" },
      { label: "Tier 2 — Moderate", desc: "Sampling review + gates" },
      { label: "Tier 3 — High", desc: "Mandatory review + gates" },
      { label: "Tier 4 — Critical", desc: "AI generation questionable" },
    ],
    presets: [
      { name: "CSS Landing Page", values: { codeType: 0, language: 2, deployment: 0, data: 0, blastRadius: 0 } },
      { name: "Internal Dashboard", values: { codeType: 2, language: 1, deployment: 1, data: 1, blastRadius: 1 } },
      { name: "Public REST API", values: { codeType: 3, language: 2, deployment: 2, data: 2, blastRadius: 2 } },
      { name: "Payment Service", values: { codeType: 4, language: 1, deployment: 2, data: 4, blastRadius: 3 } },
      { name: "Auth Module (Fintech)", values: { codeType: 4, language: 2, deployment: 2, data: 3, blastRadius: 3 } },
      { name: "Medical Device FW", values: { codeType: 4, language: 4, deployment: 4, data: 4, blastRadius: 4 } },
    ],
    mitigations: [
      {
        tier: 1, title: "Automated Gates (always active)", icon: "⚙️",
        measures: [
          { name: "Linter & Formatter", desc: "ESLint, Prettier, Ruff — instant feedback, zero effort", type: "deterministic" },
          { name: "Type Checking", desc: "TypeScript strict, mypy — entire error classes eliminated", type: "deterministic" },
          { name: "Pre-Commit Hooks", desc: "Secrets scanning (GitGuardian), lint, format before every commit", type: "deterministic" },
          { name: "Dependency Check", desc: "npm audit, pip-audit — block known CVEs in dependencies", type: "deterministic" },
          { name: "CI Build & Unit Tests", desc: "Green build as merge requirement — catches regressions", type: "deterministic" },
        ],
      },
      {
        tier: 2, title: "Extended Assurance", icon: "🔍",
        measures: [
          { name: "SAST (Semgrep, CodeQL)", desc: "Static analysis for vulnerability patterns — as CI gate", type: "deterministic" },
          { name: "AI Code Review", desc: "CodeRabbit, Copilot Review — independent from generating LLM", type: "probabilistic" },
          { name: "Property-Based Tests", desc: "Hypothesis, fast-check — 81% bug detection on edge cases", type: "probabilistic" },
          { name: "SonarQube Quality Gate", desc: "Coverage ≥70%, 0 critical vulns, 0 blockers as merge gate", type: "deterministic" },
          { name: "Sampling Review", desc: "Human reviews ~20% of PRs (rotating, risk-weighted)", type: "organizational" },
        ],
      },
      {
        tier: 3, title: "Mandatory Measures for High Risk", icon: "🛡️",
        measures: [
          { name: "Mandatory Human Review", desc: "Every PR touching auth/PII/payment reviewed by senior engineer", type: "organizational" },
          { name: "Sandbox / Isolation", desc: "Firecracker microVM, Deno Sandbox — containment on exploit", type: "deterministic" },
          { name: "Fuzzing", desc: "Fuzz4All, AFL++ — finds crashes and vulns via random inputs", type: "probabilistic" },
          { name: "Penetration Testing", desc: "Regular security audits on auth flows and API endpoints", type: "organizational" },
          { name: "Canary Deployments", desc: "Gradual rollout with automatic rollback on anomalies", type: "deterministic" },
          { name: "PromptBOM / Provenance", desc: "Document: which model, which prompt, who approved", type: "organizational" },
        ],
      },
      {
        tier: 4, title: "Critical — Severely Restrict AI Use", icon: "🚨",
        measures: [
          { name: "Formal Verification", desc: "Dafny, TLA+, SPARK — mathematical proof of correctness", type: "deterministic" },
          { name: "Independent Re-Verification", desc: "Separate team verifies output — per DO-178C DAL A", type: "organizational" },
          { name: "MC/DC Test Coverage", desc: "Modified Condition/Decision Coverage — required at DAL A/B", type: "deterministic" },
          { name: "Contract-Based Design", desc: "Pre/postconditions + invariants — spec first, then generation", type: "deterministic" },
          { name: "Certification Process", desc: "IEC 61508, DO-178C, ISO 26262 compliance — no shortcut", type: "organizational" },
          { name: "AI as Draft Aid Only", desc: "LLM generates proposal, human implements and verifies", type: "organizational" },
        ],
      },
    ],
    docs: {
      title: "Documentation",
      sections: [
        {
          id: "intro",
          title: "Why This Framework?",
          content: `LLM-generated code contains security vulnerabilities roughly 45% of the time (Veracode, 2025). At the same time, LLMs already write over 30% of new code at Google and Microsoft. The problem: not all code carries equal risk. Deploying CSS styling for a landing page without review is fundamentally different from doing the same with an auth module for a fintech app.\n\nThis framework provides a MECE risk categorization (Mutually Exclusive, Collectively Exhaustive) built on established safety standards (IEC 61508, DO-178C, ISO 26262) and applies them to vibe coding.`,
        },
        {
          id: "dims",
          title: "The Five Dimensions",
          content: `Overall risk is determined by the maximum across five independent dimensions — analogous to the "highest applicable SIL" from IEC 61508:\n\n**1. Code Type** — Strongest predictor. Auth/crypto code at the top, as LLMs systematically omit MFA, HSTS, and session management. SQL injection remains common because LLMs default to string concatenation over parameterized queries.\n\n**2. Language Safety** — Memory-unsafe languages (C/C++) create a floor risk level. Microsoft/Google report ~70% of security vulnerabilities stem from memory safety issues.\n\n**3. Deployment Context** — Where code runs determines who is affected. Safety-critical systems (avionics, medical) require MC/DC coverage and independent verification per DO-178C DAL A.\n\n**4. Data Sensitivity** — Regulatory exposure: PHI (HIPAA), PCI data, sensitive PII. LLM code routinely fails to implement required audit trails.\n\n**5. Blast Radius** — Scope and reversibility of potential damage. From cosmetic bugs to loss of life.`,
        },
        {
          id: "tiers",
          title: "The Four Risk Tiers",
          content: `**Tier 1 — Minimal:** Personal scripts, prototypes, UI styling. Only automated gates needed. No human review required.\n\n**Tier 2 — Moderate:** Internal tools, non-critical business logic, test code. Sampling review (~20%) plus extended automated analysis.\n\n**Tier 3 — High:** Public-facing APIs, payment processing, PII handling, auth flows. Mandatory review by senior engineers plus defense-in-depth.\n\n**Tier 4 — Critical:** Flight control, autonomous driving, medical devices, nuclear systems. AI generation questionable; if used, independent re-verification required.`,
        },
        {
          id: "failures",
          title: "LLM-Specific Failure Modes",
          content: `LLM code fails in qualitatively different ways than human-written code:\n\n**Plausible but subtly wrong** — Compiles, passes superficial review, but contains fundamental flaws. CodeRabbit found 1.7× more issues per PR in AI code vs. human code.\n\n**Hallucinated packages (Slopsquatting)** — ~20% of recommended packages don't exist. Attackers can register these names. "huggingface-cli" was installed 30,000+ times before detection.\n\n**Automation Complacency** — Developers using AI assistants produce more vulnerabilities while simultaneously believing they write more secure code (Stanford, Perry et al. 2022). Code review participation drops by 30%.`,
        },
        {
          id: "mitigations",
          title: "Mitigation Strategy",
          content: `Since human review cannot scale with AI code generation volume, the framework relies on defense-in-depth with three measure types:\n\n**Deterministic** (blue) — Guaranteed detection within scope. Type checkers, linters, SAST, sandboxing. No false-negative risk within covered patterns.\n\n**Probabilistic** (purple) — Finds many issues but not all. AI code review, property-based testing, fuzzing. Increases detection rate but offers no guarantee.\n\n**Organizational** (orange) — Requires humans, scales worst. Therefore only introduced from Tier 2/3 onward, focused on the riskiest changes.`,
        },
        {
          id: "references",
          title: "References & Standards",
          content: `**Safety Standards:** IEC 61508 (SIL), DO-178C (DAL), ISO 26262 (ASIL), EU AI Act\n\n**Frameworks:** Palo Alto Unit 42 SHIELD, Aikido VCAL, Cloud Security Alliance Secure Vibe Coding Guide, Google SAIF\n\n**Empirical Data:** Veracode (45% vulnerability rate), CodeRabbit (1.7× more issues), BaxBench (62% faulty backends), GitClear (30% fewer reviews), METR RCT (19% slower with AI)\n\n**Tooling:** Semgrep, CodeQL, SonarQube, GitGuardian, Firecracker, Deno Sandbox, Fuzz4All, Hypothesis`,
        },
      ],
    },
  },
};

const TIER_BG = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];
const TYPE_COLORS = {
  deterministic: { color: "#38bdf8", bg: "#0c4a6e" },
  probabilistic: { color: "#a78bfa", bg: "#3b0764" },
  organizational: { color: "#fb923c", bg: "#7c2d12" },
};

function getTierIndex(values) {
  const mx = Math.max(...Object.values(values));
  return mx <= 1 ? 0 : mx <= 2 ? 1 : mx <= 3 ? 2 : 3;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RadarChart({ values, dimensions, size = 320 }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 48, levels = 5, n = dimensions.length, step = 360 / n;
  const ti = getTierIndex(values);
  const tc = TIER_BG[ti];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
      {[1, 2, 3, 4, 5].map((l) => {
        const r = (maxR / levels) * l;
        const pts = Array.from({ length: n }, (_, i) => polarToCartesian(cx, cy, r, i * step));
        return <polygon key={l} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={l === 5 ? "#475569" : "#334155"} strokeWidth={l === 5 ? 1.5 : 0.7} />;
      })}
      {dimensions.map((_, i) => {
        const p = polarToCartesian(cx, cy, maxR, i * step);
        return <line key={`a${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#334155" strokeWidth={0.7} />;
      })}
      {(() => {
        const pts = dimensions.map((d, i) => polarToCartesian(cx, cy, (maxR / levels) * (values[d.key] + 1), i * step));
        return (
          <>
            <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={tc} fillOpacity={0.25} stroke={tc} strokeWidth={2.5} />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={tc} stroke="#0f172a" strokeWidth={1.5} />)}
          </>
        );
      })()}
      {dimensions.map((d, i) => {
        const lp = polarToCartesian(cx, cy, maxR + 26, i * step);
        return <text key={`l${i}`} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="11" fontWeight="600">{d.shortLabel}</text>;
      })}
    </svg>
  );
}

function MitigationCard({ group, active, accent, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${active ? accent : "#1e293b"}`, borderRadius: 12, background: active ? `${accent}10` : "#0f172a", padding: "12px 14px", opacity: active ? 1 : 0.35, transition: "all 0.3s" }}>
      <div onClick={() => active && setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: active ? "pointer" : "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{group.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: active ? "#f8fafc" : "#64748b" }}>{group.title}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{group.measures.length} {group.measures.length !== 1 ? t.measures : t.measure}</div>
          </div>
        </div>
        {active && <span style={{ fontSize: 16, color: "#64748b", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>}
      </div>
      {active && open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {group.measures.map((m, i) => {
            const tc = TYPE_COLORS[m.type];
            return (
              <div key={i} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${tc.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: "#e2e8f0" }}>{m.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: tc.color, background: tc.bg, padding: "2px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t.typeBadges[m.type]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocSidebar({ docs, open, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (open && ref.current) ref.current.scrollTop = 0; }, [open]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: open ? "min(480px, 85vw)" : "0",
        background: "#111827", borderLeft: open ? "1px solid #334155" : "none",
        overflowY: "auto", overflowX: "hidden",
        transition: "width 0.3s ease",
        zIndex: 1000,
        boxShadow: open ? "-8px 0 30px rgba(0,0,0,0.5)" : "none",
      }}
    >
      {open && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>📖 {docs.title}</h2>
            <button onClick={onClose} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
          {docs.sections.map((sec) => (
            <div key={sec.id} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 10px", paddingBottom: 6, borderBottom: "1px solid #1e293b" }}>{sec.title}</h3>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {sec.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <strong key={i} style={{ color: "#e2e8f0" }}>{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
                )}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 16, marginTop: 8, fontSize: 11, color: "#475569", textAlign: "center" }}>
            Generated with data from Veracode, CodeRabbit, BaxBench, Unit 42, Aikido Security, CSA, and others.
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiskRadar() {
  const [lang, setLang] = useState("de");
  const [docsOpen, setDocsOpen] = useState(false);
  const [values, setValues] = useState({ codeType: 0, language: 1, deployment: 0, data: 0, blastRadius: 0 });
  const t = T[lang];
  const ti = getTierIndex(values);
  const tier = t.tiers[ti];
  const tc = TIER_BG[ti];
  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));
  const activeCount = t.mitigations.filter((g) => g.tier <= ti + 1).reduce((s, g) => s + g.measures.length, 0);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0f172a", color: "#e2e8f0", minHeight: "100vh", padding: "20px 16px", transition: "margin-right 0.3s", marginRight: docsOpen ? "min(480px, 85vw)" : 0 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
        <button
          onClick={() => setLang(lang === "de" ? "en" : "de")}
          style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
        >
          🌐 {t.langSwitch}
        </button>
        <button
          onClick={() => setDocsOpen(!docsOpen)}
          style={{ background: docsOpen ? `${tc}22` : "#1e293b", border: `1px solid ${docsOpen ? tc : "#334155"}`, borderRadius: 6, color: docsOpen ? "#f8fafc" : "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
        >
          📖 {docsOpen ? t.closeButton : t.docsButton}
        </button>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", margin: "0 0 4px", color: "#f8fafc" }}>{t.title}</h1>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, margin: "0 0 18px" }}>{t.subtitle}</p>

      {/* Presets */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 18 }}>
        {t.presets.map((p) => {
          const active = JSON.stringify(values) === JSON.stringify(p.values);
          return (
            <button key={p.name} onClick={() => setValues(p.values)} style={{ padding: "4px 9px", fontSize: 11, borderRadius: 6, border: active ? `2px solid ${tc}` : "1px solid #334155", background: active ? `${tc}22` : "#1e293b", color: active ? "#f8fafc" : "#94a3b8", cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>
              {p.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ width: "100%", maxWidth: 320 }}><RadarChart values={values} dimensions={t.dimensions} /></div>

        {/* Tier badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: `${tc}18`, border: `2px solid ${tc}`, borderRadius: 10, padding: "8px 18px" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: tc }}>{ti + 1}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: tc }}>{tier.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{tier.desc}</div>
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
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{dim.label}</span>
                  <span style={{ fontSize: 10, color: sc, fontWeight: 600 }}>{dim.levels[v]}</span>
                </div>
                <input type="range" min={0} max={4} step={1} value={v} onChange={(e) => set(dim.key, parseInt(e.target.value))} style={{ width: "100%", accentColor: sc, height: 5, cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", marginTop: 1 }}>
                  <span>{t.low}</span><span>{t.high}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitigations */}
        <div style={{ width: "100%", maxWidth: 500, borderTop: "1px solid #1e293b", paddingTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t.mitigationHeading}</h2>
            <span style={{ fontSize: 11, color: "#64748b" }}>{activeCount} {t.active}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(TYPE_COLORS).map(([key, c]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: c.color }} />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{t.typeBadges[key]}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 11, color: "#94a3b8", lineHeight: 1.5, borderLeft: `3px solid ${tc}` }}>
            <strong style={{ color: "#e2e8f0" }}>{t.cumulative}:</strong> {t.cumulativeNote(ti, t.mitigations[ti].title)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.mitigations.map((g) => <MitigationCard key={g.tier} group={g} active={g.tier <= ti + 1} accent={TIER_BG[g.tier - 1]} t={t} />)}
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 10, color: "#334155", textAlign: "center" }}>v{VERSION}</div>
      </div>

      <DocSidebar docs={t.docs} open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
