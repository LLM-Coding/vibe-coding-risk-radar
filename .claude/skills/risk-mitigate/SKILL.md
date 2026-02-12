---
name: risk-mitigate
description: Help implement mitigation measures based on the risk assessment in CLAUDE.md. Detects existing tools, installs missing ones, and tracks progress.
disable-model-invocation: true
---

# /risk-mitigate — Implement Mitigation Measures

Read the shared risk model at `.claude/skills/shared/risk-model.md` for all measure definitions, detection signals, tier requirements, and output formats. Do not duplicate those lists here — always reference the shared model as the single source of truth.

---

## Step 1 — Read Assessment from CLAUDE.md

1. Read the project's `CLAUDE.md` file.
2. Look for a section titled `## Risk Radar Assessment`.
3. If not found, stop and tell the user:
   > No Risk Radar Assessment found in CLAUDE.md. Please run `/risk-assess` first.
4. If found, parse every `### Module: {name}` subsection. For each module extract:
   - The five dimension scores (codeType, language, deployment, data, blastRadius)
   - The overall **Tier** (1–4)
5. Print a summary table:

```
Found N module(s) with risk assessments:
| Module | Tier | Highest Dimension |
|--------|------|-------------------|
| ...    | ...  | ...               |
```

---

## Step 2 — Detect Existing Mitigations

For each module (or repo-wide for measures like CI and linting):

### 2a. Determine project type

- **JavaScript/TypeScript**: `package.json` exists
- **Python**: `pyproject.toml`, `requirements.txt`, or `setup.py` exists
- **Rust**: `Cargo.toml` exists
- **Multi-language**: multiple of the above

### 2b. Check detection signals

Use the **Detection signals** tables in `.claude/skills/shared/risk-model.md` (one per tier) to check which mitigations are already present.

**Tier 1 checks:**

| Measure          | What to check                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Linter           | Files: `.eslintrc*`, `eslint.config.*`, `ruff.toml`, `.pylintrc`. Scripts: `lint` in package.json |
| Formatter        | Files: `.prettierrc*`, `rustfmt.toml`. Config: `black` or `ruff.format` in pyproject.toml         |
| Type Checking    | `tsconfig.json` with `"strict": true`. Python: `mypy.ini` or `[tool.mypy]` in pyproject.toml      |
| Pre-Commit Hooks | Dirs: `.husky/`. Files: `.pre-commit-config.yaml`. Config: `lint-staged` in package.json          |
| Dependency Check | `audit` step in CI workflows. Python: `pip-audit` or `safety` in dependencies                     |
| CI/CD            | Dirs: `.github/workflows/`. Files: `Jenkinsfile`, `.gitlab-ci.yml`                                |

**Tier 2 checks:**

| Measure              | What to check                                                |
| -------------------- | ------------------------------------------------------------ |
| SAST                 | `semgrep` or `codeql` in CI workflow files. Dir: `.semgrep/` |
| AI Code Review       | `coderabbit.yaml`, Copilot review in CI                      |
| Property-Based Tests | `fast-check` or `hypothesis` in dependencies                 |
| SonarQube            | `sonar-project.properties`. Sonar step in CI                 |

**Tier 3 checks:**

| Measure               | What to check                                                               |
| --------------------- | --------------------------------------------------------------------------- |
| Branch Protection     | Run: `gh api repos/{owner}/{repo}/branches/main/protection` (200 = enabled) |
| Fuzzing               | Dir: `fuzz/`. Deps: `cargo-fuzz`, AFL config files                          |
| Canary/Gradual Deploy | Check CI for canary or blue-green deployment steps                          |

**Tier 4 checks:**

| Measure             | What to check                                             |
| ------------------- | --------------------------------------------------------- |
| Formal Verification | Files: `*.dfy` (Dafny), `*.tla` (TLA+), SPARK annotations |
| MC/DC Coverage      | Coverage config requiring MC/DC                           |

For each check, record the result as:

- **Present** — config file or tool found and appears correctly configured
- **Missing** — no config found
- **Partial** — config exists but incomplete (e.g., linter config but no CI integration)

---

## Step 3 — Present Gap Analysis

For each module, show a gap analysis table grouped by tier (cumulative up to the module's tier):

```
### Gap Analysis: {module-name} (Tier {N})

#### Tier 1 — Automated Gates
| Measure | Type | Status | Details |
|---------|------|--------|---------|
| Linter & Formatter | deterministic | Present | .eslintrc.js found |
| Pre-Commit Hooks | deterministic | Missing | — |
| ...

#### Tier 2 — Extended Assurance
| Measure | Type | Status | Details |
|---------|------|--------|---------|
| SAST | deterministic | Missing | — |
| ...
```

After the table, summarize:

- Total measures required for this tier: X
- Already present: Y
- Missing: Z
- Completion: Y/X (percentage)

---

## Step 4 — Interactive Implementation

Work through missing measures in priority order: all Tier 1 gaps first, then Tier 2, etc.

For each missing measure:

1. **Explain** what the measure does and why the module's tier requires it.
2. **Ask the user** whether they want to implement it now. Wait for confirmation before proceeding.
3. **Implement** based on the tier level:

### Tier 1 — Install and configure directly

| Measure          | JS/TS Project                                                                               | Python Project                                                               |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Linter           | `npm install -D eslint`, create `eslint.config.js` with recommended rules                   | `pip install ruff`, create `ruff.toml`                                       |
| Formatter        | `npm install -D prettier`, create `.prettierrc`                                             | Add `[tool.ruff.format]` to pyproject.toml or `pip install black`            |
| Type Checking    | Ensure `tsconfig.json` has `"strict": true`                                                 | `pip install mypy`, create `mypy.ini` or add `[tool.mypy]` to pyproject.toml |
| Pre-Commit       | `npm install -D husky lint-staged`, `npx husky init`, configure lint-staged in package.json | `pip install pre-commit`, create `.pre-commit-config.yaml`                   |
| Dependency Check | Add `npm audit` step to CI workflow                                                         | Add `pip-audit` step to CI workflow                                          |
| CI Build & Tests | Create `.github/workflows/ci.yml` with install, lint, build, test steps                     | Create `.github/workflows/ci.yml` with install, lint, test steps             |

After installing, **verify** the tool works:

- Run the linter and confirm it executes without config errors
- Run the formatter in check mode
- Run the type checker
- Validate the CI workflow YAML is well-formed

### Tier 2 — Install where possible, suggest for others

| Measure              | Action                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| SAST (Semgrep)       | Create `.github/workflows/semgrep.yml` with Semgrep CI action. Or add CodeQL workflow                       |
| AI Code Review       | Suggest enabling CodeRabbit or Copilot review. Provide setup link                                           |
| Property-Based Tests | JS/TS: `npm install -D fast-check`. Python: `pip install hypothesis`. Create one example test file          |
| SonarQube            | Create `sonar-project.properties`, add SonarCloud step to CI. Requires user to set up project in SonarCloud |
| Sampling Review      | Suggest CODEOWNERS file and PR review policy. Provide template                                              |

### Tier 3 — Configure where possible, guide for others

| Measure              | Action                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Branch Protection    | Configure via `gh api -X PUT repos/{owner}/{repo}/branches/main/protection` with required reviews, status checks                         |
| Sandbox/Isolation    | Provide guidance for Docker-based isolation, Deno sandbox, or Firecracker setup                                                          |
| Fuzzing              | JS/TS: Suggest `jsfuzz` or custom property-based fuzzing. Rust: `cargo install cargo-fuzz`, create `fuzz/` dir. Provide starter template |
| Penetration Testing  | Provide a recommended schedule and checklist. Suggest tools: OWASP ZAP, Burp Suite                                                       |
| Canary Deployments   | Provide a workflow template for gradual rollout with auto-rollback                                                                       |
| PromptBOM/Provenance | Create a `PROMPTBOM.md` template documenting AI model, prompt, and approver for each module                                              |

### Tier 4 — Recommendations and checklists only

| Measure                     | Action                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Formal Verification         | Recommend tools (Dafny, TLA+, SPARK) based on language. Provide getting-started links         |
| Independent Re-Verification | Provide a process checklist for independent review per DO-178C DAL A                          |
| MC/DC Coverage              | Recommend coverage tools and configuration for MC/DC. Provide setup guide                     |
| Contract-Based Design       | Suggest libraries: `ts-contract` (TS), `icontract` (Python), `contracts` (Rust). Show example |
| Certification Process       | Provide a checklist for relevant standard (IEC 61508, DO-178C, ISO 26262)                     |
| AI as Draft Aid Only        | Suggest a workflow policy document template restricting AI to proposal-only role              |

### After each installation

- Verify the tool works (run it, check output)
- Create a git commit for the installed tool:
  ```
  git add <relevant files>
  git commit -m "chore: set up {tool name} for {module}"
  ```

---

## Step 5 — Update CLAUDE.md

After completing implementations (or if the user stops partway through):

1. Open `CLAUDE.md`
2. For each assessed module, add or update a `### Mitigations: {module-name} (Tier N)` section
3. Use the format from `.claude/skills/shared/risk-model.md`:

```markdown
### Mitigations: {module-name} (Tier {N})

_Updated by `/risk-mitigate` on YYYY-MM-DD_

| Measure            | Status  | Details                        |
| ------------------ | ------- | ------------------------------ |
| Linter & Formatter | Present | eslint.config.js, .prettierrc  |
| Type Checking      | Set up  | tsconfig.json strict enabled   |
| Pre-Commit Hooks   | Set up  | husky + lint-staged configured |
| SAST               | Pending | —                              |
| Branch Protection  | N/A     | Not required for Tier 1        |
```

Status values:

- **Present** — was already in place before running this skill
- **Set up** — installed/configured during this session
- **Pending** — required but not yet implemented (user deferred or manual action needed)
- **N/A** — not required at this module's tier level

4. Commit the CLAUDE.md update:
   ```
   git add CLAUDE.md
   git commit -m "docs: update mitigation status in CLAUDE.md"
   ```

---

## Step 6 — Update ADR (if exists)

If an ADR was generated during `/risk-assess`, update it with mitigation status:

1. **Check for ADR reference in CLAUDE.md**:
   - Look for a line like `_Architecture Decision: See [ADR-NNN](docs/adr/NNN-risk-classification-*.md)_`
   - Extract the ADR file path

2. **If ADR exists, update it**:
   - Read the current ADR file
   - Add or replace a section at the end titled `## Implementation Status` (or `## Mitigations Implemented` if following strict Nygard format)
   - Include the mitigation status table from CLAUDE.md
   - Update the **Status** field at the top:
     - If all required mitigations are now "Present" or "Set up" → change Status to `Accepted`
     - If some are still "Pending" → keep Status as `Proposed`

3. **Example addition to ADR**:

   ```markdown
   ## Implementation Status

   _Updated by `/risk-mitigate` on YYYY-MM-DD_

   | Measure            | Status     | Details                                     |
   | ------------------ | ---------- | ------------------------------------------- |
   | Linter & Formatter | ✅ Set up  | eslint.config.js, .prettierrc               |
   | Pre-Commit Hooks   | ✅ Set up  | husky + lint-staged                         |
   | SAST               | ⬜ Pending | CodeQL workflow created, awaiting first run |

   **Overall Status:** 8/10 measures active → ADR Status updated to **Accepted**
   ```

4. **Update arc42 reference (if exists)**:
   - If `docs/arc42/chapters/09_architecture_decisions.adoc` contains a reference to this ADR
   - Update the status badge there as well:
     ```asciidoc
     **Status:** Accepted | **Date:** YYYY-MM-DD | **Tier:** {N} | **Mitigations:** 8/10 active
     ```

5. **Commit the ADR update**:
   ```bash
   git add docs/adr/NNN-*.md docs/arc42/ (if modified)
   git commit -m "docs: update ADR with mitigation implementation status"
   ```

---

## Important Guidelines

- **Always read `.claude/skills/shared/risk-model.md`** at the start for the authoritative measure definitions and detection signals. Do not hardcode or duplicate those lists.
- **Never install anything without asking the user first.** Present the measure, explain it, and wait for confirmation.
- **Verify each tool after installation.** Run the tool and confirm it executes without errors.
- **Commit each tool separately.** Each installed mitigation gets its own commit for clean history.
- **Handle both JS/TS and Python projects.** Detect from `package.json` vs `pyproject.toml`/`requirements.txt`.
- **Tiers are cumulative.** A Tier 3 module needs all Tier 1 + Tier 2 + Tier 3 measures.
- **Be conservative with automated configuration.** For measures that require external service setup (SonarCloud, CodeRabbit), provide guidance rather than attempting partial setup that won't work.
- **If a measure is already present, confirm it is properly configured.** A linter config without CI integration is only "Partial".
