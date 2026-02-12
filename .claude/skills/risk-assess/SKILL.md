---
name: risk-assess
description: Analyze a repository to assess vibe-coding risk per module. Detects modules, scans code patterns, asks targeted questions, and writes structured assessment to CLAUDE.md.
disable-model-invocation: true
---

# /risk-assess — Interactive Risk Assessment

Assess the vibe-coding risk level of the current repository by scanning code patterns,
detecting modules, and interactively confirming uncertain dimensions with the user.

**Reference model:** Read `.claude/skills/shared/risk-model.md` before proceeding.
It contains the dimension definitions, scoring tables, grep patterns, module detection
strategy, mitigation signals, and the required output format. Do NOT duplicate those
patterns inline — always read them from the shared file at runtime.

---

## Step 1 — Module Detection

Detect the modules (independently assessable units) in this repository.

### 1a. Check Workspace Configs (confidence 0.9)

Look for these files in the repo root and parse the relevant field:

| Config File                               | Field to Parse         |
| ----------------------------------------- | ---------------------- |
| `pnpm-workspace.yaml`                     | `packages:` array      |
| `package.json` (root)                     | `"workspaces"` field   |
| `lerna.json`                              | `"packages"` array     |
| `Cargo.toml` (root)                       | `[workspace] members`  |
| `settings.gradle` / `settings.gradle.kts` | `include(...)` calls   |
| `pom.xml` (root)                          | `<modules>` elements   |
| `go.work`                                 | `use (...)` directives |

Resolve any glob patterns to actual directories.

### 1b. Conventional Directories (confidence 0.6-0.8)

If no workspace config is found, check for these directory patterns:

- `packages/*/package.json` — JS/TS monorepo
- `apps/*/` with a build config — application packages
- `services/*/Dockerfile` — microservices
- `frontend/` + `backend/` — client/server split
- `src/client/` + `src/server/` — co-located client/server
- `docker-compose.yml` with multiple `build:` entries — multi-service

### 1c. Fallback

If neither workspace configs nor conventional patterns are found,
treat the entire repository as a single module.

### 1d. Present and Confirm

Present the discovered modules to the user:

```
Detected modules:
  1. {module-name} ({path}) — detected via {method}
  2. ...

Does this look correct? Should I add, remove, or rename any modules?
```

Wait for user confirmation before proceeding.

---

## Step 2 — Auto-Scan per Module

For each confirmed module, run automated detection for every dimension.
Use the grep patterns defined in `.claude/skills/shared/risk-model.md`.

### 2a. Language Detection

Count files by extension within the module directory. Use the extension-to-score
mapping from the shared risk model. The module's language score is the **maximum**
score across all detected languages (weighted by file count — if only 1-2 files
of a high-score language exist among hundreds of low-score files, note this).

Report:

```
Language scan for {module}:
  .ts/.tsx: 42 files (score 1)
  .js/.jsx: 8 files  (score 2)
  → Auto-detected score: 2 (Dynamically typed) — JS files present
```

### 2b. Code Type Detection

Search for patterns in the shared risk model, starting from the highest score (4)
and working down. Stop at the first match level that has significant hits.

Report each match with the file and line:

```
Code Type scan for {module}:
  Auth/Security patterns (score 4):
    src/auth/login.ts:15 — matches "authenticate"
    src/middleware/csrf.ts:3 — matches "csrf"
  API/DB patterns (score 3):
    src/routes/users.ts:8 — matches "app.get("
  → Auto-detected score: 4 (Auth/Security/Crypto)
```

### 2c. Data Sensitivity Detection

Search for data sensitivity patterns from the shared risk model, starting from
score 4 (PHI/PCI) down to score 2 (General PII).

Report matches with evidence:

```
Data Sensitivity scan for {module}:
  PHI/PCI patterns (score 4): no matches
  Sensitive PII patterns (score 3): no matches
  General PII patterns (score 2):
    src/models/user.ts:5 — matches "email"
    src/models/user.ts:7 — matches "phone_number"
  → Auto-detected score: 2 (General PII)
```

### 2d. Deployment Hints

Search for deployment/regulatory patterns from the shared risk model.
Also check for:

- `Dockerfile`, `docker-compose.yml` — containerized deployment
- `.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml` — CI/CD presence
- `kubernetes/`, `k8s/`, `helm/` — orchestrated deployment

This dimension has low auto-detection confidence (0.2-0.5).
Note findings but flag that user confirmation is required.

### 2e. Blast Radius Hints

Blast radius is nearly impossible to auto-detect. Note any hints:

- Number of downstream dependents (if library)
- Presence of health/safety keywords
- Scale indicators (load balancer configs, horizontal scaling)

Flag that user confirmation is **required**.

---

## Step 3 — Interactive Confirmation

Process modules **one at a time**. For each module, present the auto-scan
results and ask the user to confirm or adjust.

### 3a. High-Confidence Dimensions

For dimensions with high confidence (language, codeType when score >= 3):

```
Language: Auto-detected score 2 (Dynamically typed)
  Evidence: 42 .ts files (score 1), 8 .js files (score 2)
  → Accept score 2? [Y/n]
```

### 3b. Low-Confidence Dimensions (ALWAYS ask)

For `deployment` and `blastRadius` (and any dimension with low confidence),
present a multiple-choice question:

```
Deployment context for {module}:
  Auto-detected hints: Dockerfile found, GitHub Actions CI
  No regulatory keywords detected.

  What best describes the deployment context?
  [0] Personal / Prototype — local tools, learning projects
  [1] Internal tool — company-internal dashboards
  [2] Public-facing app — SaaS, public APIs, mobile apps
  [3] Regulated system — HIPAA, PCI-DSS, SOC2, GDPR-critical
  [4] Safety-critical — avionics, medical devices, automotive

  Suggested: [2] (containerized with CI/CD, no regulatory signals)
```

```
Blast Radius for {module}:
  What is the worst realistic impact of a bug in this module?
  [0] Cosmetic / Tech debt — UI glitches, code smell
  [1] Performance / DoS — slowdowns, service unavailability
  [2] Data loss (recoverable) — lost data restorable from backups
  [3] Systemic breach — unrecoverable data exposure
  [4] Safety (life & limb) — physical harm, loss of life
```

### 3c. Data Sensitivity Confirmation

If data sensitivity was auto-detected at score >= 2, confirm with the user:

```
Data Sensitivity: Auto-detected score 2 (General PII)
  Evidence: email, phone_number fields in user model
  Could there be higher-sensitivity data not detected by pattern scan?
  [Keep 2] / [Upgrade to 3: Sensitive PII] / [Upgrade to 4: PHI/PCI]
```

---

## Step 4 — Tier Calculation and Output

### 4a. Calculate Tier

```
Tier = max(codeType, language, deployment, data, blastRadius)
Mapping: max <= 1 → Tier 1, max <= 2 → Tier 2, max <= 3 → Tier 3, max = 4 → Tier 4
```

Present the result:

```
{module} Risk Assessment:
  Code Type:        3 (API / DB Queries)
  Language:         2 (Dynamically typed)
  Deployment:       2 (Public-facing app)
  Data Sensitivity: 2 (General PII)
  Blast Radius:     1 (Performance / DoS)

  → Tier 3 — determined by Code Type = 3
```

### 4b. Scan Existing Mitigations

Before writing, scan for mitigation signals as listed in the shared risk model.
Check for config files and CI workflow steps that indicate existing mitigations.

### 4c. Check for Existing Assessment

Before writing to CLAUDE.md:

- Check if CLAUDE.md already contains a `## Risk Radar Assessment` section
- If it does, ask the user: "CLAUDE.md already contains a risk assessment. Overwrite it?"
- If the user declines, skip writing

### 4d. ADR Generation (Tier 3+ only)

If **any module** was assessed as **Tier 3 or higher**, offer to generate an Architecture Decision Record:

```
Tier 3 detected. Generate an Architecture Decision Record (ADR nach Nygard)?
  [Y/n] — Recommended for Tier 3+ to document the risk classification decision.
```

If the user accepts:

1. **Detect next ADR number**:
   - Check if `docs/adr/` exists; if not, create it
   - Find the highest existing ADR number (`docs/adr/NNN-*.md`)
   - Use next number (zero-padded to 3 digits)

2. **Write ADR nach Nygard** to `docs/adr/NNN-risk-classification-{project}.md`:
   - **Title**: `# {NNN}. Risk Classification — {project/module}`
   - **Date**: Current date (YYYY-MM-DD)
   - **Status**: Proposed
   - **Context**: Summary of dimension scores with reasoning for each module
   - **Decision**: Tier classification result, determining dimension
   - **Consequences**: Positive (security baseline), Negative (CI overhead, workflow changes)

   Use "ADR nach Nygard" as the semantic anchor — no need for a custom template.
   The LLM knows the format: Title, Status, Context, Decision, Consequences.

3. **Arc42 integration** (if applicable):
   - Check if `docs/arc42/` exists
   - If yes, check if `docs/arc42/chapters/09_architecture_decisions.adoc` exists
   - If yes, append a reference to the ADR:

     ```asciidoc
     === ADR-NNN: Risk Classification — {project}

     See link:../../adr/NNN-risk-classification-{project}.md[ADR-NNN] for vibe-coding risk assessment.

     **Status:** Proposed | **Date:** YYYY-MM-DD | **Tier:** {N}
     ```

4. **Reference in CLAUDE.md**:
   - Add a line to the Risk Radar Assessment header:
     ```markdown
     _Architecture Decision: See [ADR-NNN](docs/adr/NNN-risk-classification-{project}.md)_
     ```

### 4e. Write to CLAUDE.md

Use the exact output format from `.claude/skills/shared/risk-model.md` under
"CLAUDE.md Output Format". Write:

1. The assessment header with timestamp (and ADR reference if generated)
2. Per-module dimension table with scores, levels, and evidence
3. Tier result with determining dimension
4. Per-module mitigation status table

Insert or replace the `## Risk Radar Assessment` section in CLAUDE.md.
Preserve all other existing content in CLAUDE.md.

---

## Important Guidelines

- **One module at a time**: Complete the full assess-confirm cycle for each module
  before moving to the next. Do not overwhelm the user with all modules at once.
- **Show evidence**: Always explain WHY a score was auto-detected. Include file
  paths and matched patterns.
- **Respect the shared model**: Read patterns from `.claude/skills/shared/risk-model.md`
  at runtime. Do not hardcode pattern lists.
- **Tiers are cumulative**: When listing mitigations, include all tiers up to and
  including the assessed tier.
- **Be conservative**: When uncertain, suggest the higher (more cautious) score and
  let the user downgrade if appropriate.
- **Timestamp**: Use the current date in YYYY-MM-DD format in the output header.
