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
    footer: {
      github: "GitHub",
      fullDocs: "Ausführliche Dokumentation",
      madeBy: "Erstellt von",
    },
    docs: {
      title: "Dokumentation",
      sections: [
        {
          id: "disclaimer",
          title: "Hinweis",
          content: `Dieses Tool bietet eine *allgemeine Orientierungshilfe* zur Risikoeinschätzung von AI-generiertem Code. Die vorgeschlagenen Tier-Einstufungen und Maßnahmen ersetzen keine individuelle Sicherheitsbewertung und sind nicht für jeden Kontext gleichermaßen geeignet.

Jede Organisation sollte die Dimensionen, Schwellwerte und Maßnahmen an ihre eigenen Anforderungen, regulatorischen Rahmenbedingungen und Risikobereitschaft anpassen. Der gesamte Quellcode ist https://github.com/LLM-Coding/vibe-coding-risk-radar[Open Source (MIT)] — Anpassungen sind ausdrücklich erwünscht.

Feedback, Verbesserungsvorschläge und Fehlerberichte bitte als https://github.com/LLM-Coding/vibe-coding-risk-radar/issues[GitHub Issue] oder direkt an https://www.linkedin.com/in/rdmueller[Ralf D. Müller].`,
        },
        {
          id: "intro",
          title: "Warum dieses Framework?",
          content: `LLM-generierter Code enthält in ca. 45% der Fälle Sicherheitslücken (https://www.veracode.com/blog/ai-generated-code-security-risks/[Veracode, 2025]). Gleichzeitig schreiben LLMs bereits über 30% des neuen Codes bei Google und Microsoft. Das Problem: Nicht jeder Code ist gleich riskant. CSS-Styling für eine Landingpage ohne Review zu deployen ist etwas grundlegend anderes als ein Auth-Modul für eine Fintech-App.

Dieses Framework bietet eine https://github.com/LLM-Coding/Semantic-Anchors?tab=readme-ov-file#262-mece-principle[MECE]-Risikokategorisierung (Mutually Exclusive, Collectively Exhaustive), die auf etablierten Safety-Standards (https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508], https://en.wikipedia.org/wiki/DO-178C[DO-178C], https://en.wikipedia.org/wiki/ISO_26262[ISO 26262]) aufbaut und sie auf Vibe-Coding anwendet.`,
        },
        {
          id: "dims",
          title: "Die fünf Dimensionen",
          content: `Das Gesamtrisiko ergibt sich aus dem Maximum über fünf unabhängige Dimensionen — analog zum "highest applicable SIL" aus https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508]:

*1. Code-Typ* — Stärkster Prädiktor. Auth/Crypto-Code an der Spitze, da LLMs systematisch MFA, HSTS und Session-Management auslassen. SQL-Injection bleibt häufig, weil LLMs String-Konkatenation statt parametrisierter Queries nutzen.

*2. Sprachsicherheit* — Memory-unsafe Sprachen (C/C++) erzeugen einen Boden-Risiko-Level. https://www.chromium.org/Home/chromium-security/memory-safety/[Microsoft/Google berichten], dass ~70% ihrer Sicherheitslücken aus Memory-Safety-Problemen stammen.

*3. Deployment-Kontext* — Wo der Code läuft bestimmt, wer betroffen ist. Safety-critical (Avionik, Medizin) erfordert nach https://en.wikipedia.org/wiki/DO-178C[DO-178C] DAL A MC/DC-Coverage und unabhängige Verifikation.

*4. Datensensibilität* — Regulatorische Exposition: PHI (HIPAA), PCI-Daten, sensible PII. https://www.kaspersky.com/blog/vibe-coding-2025-risks/54584/[LLM-Code implementiert routinemäßig nicht] die erforderlichen Audit-Trails.

*5. Blast Radius* — Reichweite und Reversibilität eines Schadens. Von kosmetischen Bugs bis Leib & Leben.`,
        },
        {
          id: "tiers",
          title: "Die vier Risiko-Tiers",
          content: `*Tier 1 — Minimal:* Persönliche Scripts, Prototypen, UI-Styling. Nur automatische Gates nötig. Kein Human Review erforderlich.

*Tier 2 — Moderat:* Interne Tools, unkritische Business-Logik, Test-Code. Stichproben-Review (~20%) plus erweiterte automatische Analyse.

*Tier 3 — Hoch:* Public-facing APIs, Payment-Processing, PII-Handling, Auth-Flows. Pflicht-Review durch Senior Engineers plus Defense-in-Depth.

*Tier 4 — Kritisch:* Flugsteuerung, autonomes Fahren, Medizingeräte, Nuklearsysteme. AI-Generierung fragwürdig; falls eingesetzt, unabhängige Re-Verifikation erforderlich.`,
        },
        {
          id: "failures",
          title: "LLM-spezifische Fehlerarten",
          content: `LLM-Code scheitert qualitativ anders als menschlicher Code:

*Plausibel aber subtil falsch* — Kompiliert, besteht oberflächliche Reviews, enthält aber fundamentale Fehler. https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code[CodeRabbit] fand 1,7× mehr Issues pro PR in AI-Code vs. menschlichem Code.

*Halluzinierte Packages (Slopsquatting)* — https://www.helpnetsecurity.com/2025/04/14/package-hallucination-slopsquatting-malicious-code/[~20% der empfohlenen Packages existieren nicht]. Angreifer können diese Namen registrieren. "huggingface-cli" wurde https://www.infosecurity-magazine.com/news/ai-hallucinations-slopsquatting/[über 30.000 mal installiert].

*Automation Complacency* — Entwickler mit AI-Assistenten produzieren mehr Vulnerabilities und glauben gleichzeitig, sichereren Code zu schreiben (https://arxiv.org/abs/2211.03622[Stanford, Perry et al. 2022]). https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/[Code-Review-Beteiligung sinkt um 30%].`,
        },
        {
          id: "mitigations",
          title: "Mitigationsstrategie",
          content: `Da Human Review nicht mit dem Volumen von AI-generiertem Code skaliert, setzt das Framework auf Defense-in-Depth mit drei Maßnahmentypen:

*Deterministisch* (blau) — Garantierte Erkennung innerhalb ihres Scopes. Type Checker, Linter, SAST, Sandboxing. Kein False-Negative-Risiko innerhalb der abgedeckten Patterns.

*Probabilistisch* (lila) — Findet vieles, aber nicht alles. AI Code Review, Property-Based Testing, Fuzzing. Erhöht die Erkennungsrate, bietet aber keine Garantie.

*Organisatorisch* (orange) — Braucht Menschen, skaliert am schlechtesten. Deshalb erst ab Tier 2/3 eingeplant, und dort gezielt auf die riskantesten Änderungen fokussiert.`,
        },
        {
          id: "references",
          title: "Referenzen & Standards",
          content: `*Safety Standards:* https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508] (SIL), https://en.wikipedia.org/wiki/DO-178C[DO-178C] (DAL), https://en.wikipedia.org/wiki/ISO_26262[ISO 26262] (ASIL), https://www.euaiact.com/key-issue/3[EU AI Act]

*Frameworks:* https://unit42.paloaltonetworks.com/securing-vibe-coding-tools/[Palo Alto Unit 42 SHIELD], https://www.aikido.dev/blog/vibe-coding-security[Aikido VCAL], https://cloudsecurityalliance.org/blog/2025/04/09/secure-vibe-coding-guide[Cloud Security Alliance Secure Vibe Coding Guide], https://saif.google/secure-ai-framework[Google SAIF]

*Empirische Daten:* https://www.veracode.com/blog/ai-generated-code-security-risks/[Veracode] (45% Vulnerability-Rate), https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code[CodeRabbit] (1,7× mehr Issues), https://baxbench.com/[BaxBench] (62% fehlerhafte Backends), https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/[GitClear] (30% weniger Reviews), https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/[METR RCT] (19% langsamer mit AI)

*Tooling:* Semgrep, CodeQL, SonarQube, GitGuardian, Firecracker, Deno Sandbox, Fuzz4All, Hypothesis`,
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
    footer: {
      github: "GitHub",
      fullDocs: "Full Documentation",
      madeBy: "Created by",
    },
    docs: {
      title: "Documentation",
      sections: [
        {
          id: "disclaimer",
          title: "Disclaimer",
          content: `This tool provides *general guidance* for assessing the risk of AI-generated code. The suggested tier classifications and measures do not replace an individual security assessment and may not be equally suitable for every context.

Each organization should adapt the dimensions, thresholds, and measures to their own requirements, regulatory frameworks, and risk appetite. The entire source code is https://github.com/LLM-Coding/vibe-coding-risk-radar[open source (MIT)] — customization is explicitly encouraged.

Feedback, suggestions, and bug reports welcome as https://github.com/LLM-Coding/vibe-coding-risk-radar/issues[GitHub issues] or directly to https://www.linkedin.com/in/rdmueller[Ralf D. Müller].`,
        },
        {
          id: "intro",
          title: "Why This Framework?",
          content: `LLM-generated code contains security vulnerabilities roughly 45% of the time (https://www.veracode.com/blog/ai-generated-code-security-risks/[Veracode, 2025]). At the same time, LLMs already write over 30% of new code at Google and Microsoft. The problem: not all code carries equal risk. Deploying CSS styling for a landing page without review is fundamentally different from doing the same with an auth module for a fintech app.

This framework provides a https://github.com/LLM-Coding/Semantic-Anchors?tab=readme-ov-file#262-mece-principle[MECE] risk categorization (Mutually Exclusive, Collectively Exhaustive) built on established safety standards (https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508], https://en.wikipedia.org/wiki/DO-178C[DO-178C], https://en.wikipedia.org/wiki/ISO_26262[ISO 26262]) and applies them to vibe coding.`,
        },
        {
          id: "dims",
          title: "The Five Dimensions",
          content: `Overall risk is determined by the maximum across five independent dimensions — analogous to the "highest applicable SIL" from https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508]:

*1. Code Type* — Strongest predictor. Auth/crypto code at the top, as LLMs systematically omit MFA, HSTS, and session management. SQL injection remains common because LLMs default to string concatenation over parameterized queries.

*2. Language Safety* — Memory-unsafe languages (C/C++) create a floor risk level. https://www.chromium.org/Home/chromium-security/memory-safety/[Microsoft/Google report] ~70% of security vulnerabilities stem from memory safety issues.

*3. Deployment Context* — Where code runs determines who is affected. Safety-critical systems (avionics, medical) require MC/DC coverage and independent verification per https://en.wikipedia.org/wiki/DO-178C[DO-178C] DAL A.

*4. Data Sensitivity* — Regulatory exposure: PHI (HIPAA), PCI data, sensitive PII. https://www.kaspersky.com/blog/vibe-coding-2025-risks/54584/[LLM code routinely fails] to implement required audit trails.

*5. Blast Radius* — Scope and reversibility of potential damage. From cosmetic bugs to loss of life.`,
        },
        {
          id: "tiers",
          title: "The Four Risk Tiers",
          content: `*Tier 1 — Minimal:* Personal scripts, prototypes, UI styling. Only automated gates needed. No human review required.

*Tier 2 — Moderate:* Internal tools, non-critical business logic, test code. Sampling review (~20%) plus extended automated analysis.

*Tier 3 — High:* Public-facing APIs, payment processing, PII handling, auth flows. Mandatory review by senior engineers plus defense-in-depth.

*Tier 4 — Critical:* Flight control, autonomous driving, medical devices, nuclear systems. AI generation questionable; if used, independent re-verification required.`,
        },
        {
          id: "failures",
          title: "LLM-Specific Failure Modes",
          content: `LLM code fails in qualitatively different ways than human-written code:

*Plausible but subtly wrong* — Compiles, passes superficial review, but contains fundamental flaws. https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code[CodeRabbit] found 1.7× more issues per PR in AI code vs. human code.

*Hallucinated packages (Slopsquatting)* — https://www.helpnetsecurity.com/2025/04/14/package-hallucination-slopsquatting-malicious-code/[~20% of recommended packages don't exist]. Attackers can register these names. "huggingface-cli" was https://www.infosecurity-magazine.com/news/ai-hallucinations-slopsquatting/[installed 30,000+ times] before detection.

*Automation Complacency* — Developers using AI assistants produce more vulnerabilities while simultaneously believing they write more secure code (https://arxiv.org/abs/2211.03622[Stanford, Perry et al. 2022]). https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/[Code review participation drops by 30%].`,
        },
        {
          id: "mitigations",
          title: "Mitigation Strategy",
          content: `Since human review cannot scale with AI code generation volume, the framework relies on defense-in-depth with three measure types:

*Deterministic* (blue) — Guaranteed detection within scope. Type checkers, linters, SAST, sandboxing. No false-negative risk within covered patterns.

*Probabilistic* (purple) — Finds many issues but not all. AI code review, property-based testing, fuzzing. Increases detection rate but offers no guarantee.

*Organizational* (orange) — Requires humans, scales worst. Therefore only introduced from Tier 2/3 onward, focused on the riskiest changes.`,
        },
        {
          id: "references",
          title: "References & Standards",
          content: `*Safety Standards:* https://www.perforce.com/blog/qac/what-iec-61508-safety-integrity-levels-sils[IEC 61508] (SIL), https://en.wikipedia.org/wiki/DO-178C[DO-178C] (DAL), https://en.wikipedia.org/wiki/ISO_26262[ISO 26262] (ASIL), https://www.euaiact.com/key-issue/3[EU AI Act]

*Frameworks:* https://unit42.paloaltonetworks.com/securing-vibe-coding-tools/[Palo Alto Unit 42 SHIELD], https://www.aikido.dev/blog/vibe-coding-security[Aikido VCAL], https://cloudsecurityalliance.org/blog/2025/04/09/secure-vibe-coding-guide[Cloud Security Alliance Secure Vibe Coding Guide], https://saif.google/secure-ai-framework[Google SAIF]

*Empirical Data:* https://www.veracode.com/blog/ai-generated-code-security-risks/[Veracode] (45% vulnerability rate), https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code[CodeRabbit] (1.7× more issues), https://baxbench.com/[BaxBench] (62% faulty backends), https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/[GitClear] (30% fewer reviews), https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/[METR RCT] (19% slower with AI)

*Tooling:* Semgrep, CodeQL, SonarQube, GitGuardian, Firecracker, Deno Sandbox, Fuzz4All, Hypothesis`,
        },
      ],
    },
  },
};

export default T;
