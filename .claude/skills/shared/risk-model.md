# Vibe-Coding Risk Radar — Reference Model

## Tier Calculation

```
Tier = max(codeType, language, deployment, data, blastRadius)
Mapping: max <= 1 → Tier 1, max <= 2 → Tier 2, max <= 3 → Tier 3, max = 4 → Tier 4
```

Tiers are **cumulative**: Tier N includes all mitigations from Tier 1 through N-1.

---

## Dimensions (each scored 0–4)

### 1. Code Type (`codeType`)

| Score | Level | Examples |
|-------|-------|---------|
| 0 | UI / CSS / Docs | Styling, static pages, documentation |
| 1 | Build Scripts / Tests | CI configs, test files, Makefiles |
| 2 | Business Logic | Domain services, data processing, validation |
| 3 | API / DB Queries | REST/GraphQL endpoints, SQL, ORM code |
| 4 | Auth / Security / Crypto | Authentication, encryption, access control |

### 2. Language Safety (`language`)

| Score | Level | Languages |
|-------|-------|-----------|
| 0 | Static + Memory-safe | Rust |
| 1 | Statically typed | TypeScript, Java, Go, Kotlin, Scala, Swift |
| 2 | Dynamically typed | Python, JavaScript, Ruby, PHP, Lua, Elixir |
| 3 | Memory-unsafe managed | C# with `unsafe` blocks |
| 4 | Memory-unsafe | C, C++, Assembly |

### 3. Deployment Context (`deployment`)

| Score | Level | Examples |
|-------|-------|---------|
| 0 | Personal / Prototype | Local tools, learning projects |
| 1 | Internal tool | Company-internal dashboards, admin tools |
| 2 | Public-facing app | SaaS, public APIs, mobile apps |
| 3 | Regulated system | HIPAA, PCI-DSS, SOC2, GDPR-critical |
| 4 | Safety-critical | Avionics, medical devices, automotive |

### 4. Data Sensitivity (`data`)

| Score | Level | Examples |
|-------|-------|---------|
| 0 | Public data | Open datasets, public content |
| 1 | Internal business data | Revenue figures, internal docs |
| 2 | General PII | Name, email, phone, address |
| 3 | Sensitive PII | SSN, biometrics, passport numbers |
| 4 | PHI / PCI | Medical records (HIPAA), credit cards (PCI) |

### 5. Blast Radius (`blastRadius`)

| Score | Level | Examples |
|-------|-------|---------|
| 0 | Cosmetic / Tech debt | UI glitches, code smell |
| 1 | Performance / DoS | Slowdowns, service unavailability |
| 2 | Data loss (recoverable) | Lost data restorable from backups |
| 3 | Systemic breach | Unrecoverable data exposure |
| 4 | Safety (life & limb) | Physical harm, loss of life |

---

## Module Detection Strategy

### Phase 1: Workspace Configs (confidence: 0.9)

Check these files for explicit module declarations:

| Config File | Parse Field | Module = |
|-------------|-------------|----------|
| `pnpm-workspace.yaml` | `packages:` array | Each resolved glob path |
| `package.json` (root) | `"workspaces"` field | Each resolved glob path |
| `lerna.json` | `"packages"` array | Each resolved path |
| `Cargo.toml` (root) | `[workspace] members` | Each member path |
| `settings.gradle(.kts)` | `include(...)` | Each subproject dir |
| `pom.xml` (root) | `<modules>` elements | Each module dir |
| `go.work` | `use (...)` | Each module dir |

### Phase 2: Conventional Directories (confidence: 0.6–0.8)

| Pattern | Signal |
|---------|--------|
| `packages/*/package.json` | JS/TS monorepo packages |
| `apps/*/` with build config | Application packages |
| `services/*/Dockerfile` | Microservices |
| `frontend/` + `backend/` | Client/server split |
| `src/client/` + `src/server/` | Co-located client/server |
| `docker-compose.yml` with multiple `build:` | Multi-service |

### Phase 3: Fallback

Entire repository = single module.

---

## Auto-Detection Grep Patterns

### Code Type Patterns

**Auth/Security/Crypto (codeType=4):**
```
\b(bcrypt|argon2|scrypt|pbkdf2)\b
\b(jwt|jsonwebtoken|jose)\b
\b(oauth|openid|oidc|saml|ldap|kerberos)\b
\b(passport|express-session|cookie-session)\b
\b(crypto\.create|createCipher|createHash|createSign)\b
\b(private.?key|secret.?key|api.?secret)\b
\b(authenticate|authorization|login|signup|signIn|signUp)\b
\b(csrf|xss|sanitize|helmet)\b
\b(tls|ssl|certificate|x509)\b
```

**API/DB (codeType=3):**
```
\b(app\.(get|post|put|delete|patch|use)\s*\()
\b(@(Get|Post|Put|Delete|Patch)Mapping)
\b(@app\.(route|get|post|put|delete))
\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+.+\s+SET|DELETE\s+FROM)
\b(prisma|sequelize|typeorm|knex|mongoose|sqlalchemy|ActiveRecord)
\b(GraphQL|type\s+Query|type\s+Mutation|gql`)
```

### Data Sensitivity Patterns

**PHI/PCI (data=4):**
```
\b(hipaa|phi|protected.health|health.record|medical.record)\b
\b(pci|pci.dss|credit.card|card.number|cvv|cvc)\b
\b(stripe|braintree|adyen|paypal.sdk)\b
\b(hl7|fhir|dicom|icd.?10)\b
```

**Sensitive PII (data=3):**
```
\b(ssn|social.security.number|social_security)\b
\b(passport.number|driver.?license|national.?id)\b
\b(biometric|fingerprint|face.?recognition|iris.?scan)\b
\b(tax.?id|tin|ein)\b
```

**General PII (data=2):**
```
\b(email|first.?name|last.?name|full.?name|phone.?number)\b
\b(date.?of.?birth|dob|birth.?date|address|zip.?code)\b
\b(user.?profile|personal.?data|gdpr|consent)\b
```

### Deployment/Regulatory Patterns

**Regulated (deployment>=3):**
```
\b(HIPAA|PCI.DSS|SOC.?2|GDPR|FedRAMP|FISMA|NIST)\b
```

**Safety-critical (deployment=4):**
```
\b(DO.?178|IEC.?61508|ISO.?26262|EN.?50128)\b
\b(SIL|DAL|ASIL|safety.?integrity|safety.?critical)\b
\b(FDA|CE.?marking|medical.?device)\b
```

### Language Detection (file extensions)

| Score | Extensions |
|-------|-----------|
| 0 | `.rs` |
| 1 | `.ts`, `.tsx`, `.java`, `.go`, `.kt`, `.kts`, `.scala`, `.swift` |
| 2 | `.py`, `.js`, `.jsx`, `.rb`, `.php`, `.lua`, `.pl`, `.ex`, `.exs` |
| 3 | `.cs` (check for `unsafe` keyword → 3, else → 1) |
| 4 | `.c`, `.h`, `.cpp`, `.cc`, `.cxx`, `.hpp`, `.asm`, `.s` |

---

## Auto-Detection Confidence Levels

| Dimension | Confidence | User Confirmation Needed? |
|-----------|-----------|--------------------------|
| codeType | 0.7–0.85 | Only if score <= 2 |
| language | 0.85–0.95 | Rarely |
| deployment | 0.2–0.5 | **Always** |
| data | 0.5–0.7 | Usually (confirm >= 2) |
| blastRadius | 0.1–0.3 | **Always** |

---

## Mitigations per Tier

### Tier 1 — Automated Gates (always active)

| Measure | Type | Tools |
|---------|------|-------|
| Linter & Formatter | deterministic | ESLint, Prettier, Ruff, Black |
| Type Checking | deterministic | TypeScript strict, mypy |
| Pre-Commit Hooks | deterministic | husky + lint-staged, pre-commit framework |
| Dependency Check | deterministic | npm audit, pip-audit, cargo audit |
| CI Build & Unit Tests | deterministic | GitHub Actions, Jenkins, GitLab CI |

**Detection signals for existing mitigations:**

| Measure | Config Files |
|---------|-------------|
| Linter | `.eslintrc*`, `ruff.toml`, `.pylintrc`, `lint` script in package.json |
| Formatter | `.prettierrc*`, `rustfmt.toml`, `black` in pyproject.toml |
| Type Checking | `tsconfig.json` (strict: true), `mypy.ini`, `[mypy]` in pyproject.toml |
| Pre-Commit | `.pre-commit-config.yaml`, `.husky/`, `lint-staged` in package.json |
| Dependency Check | `audit` in CI workflows, `safety` / `pip-audit` in requirements |
| CI/CD | `.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml` |

### Tier 2 — Extended Assurance

| Measure | Type | Tools |
|---------|------|-------|
| SAST | deterministic | Semgrep, CodeQL |
| AI Code Review | probabilistic | CodeRabbit, Copilot Review |
| Property-Based Tests | probabilistic | fast-check, Hypothesis |
| SonarQube Quality Gate | deterministic | SonarQube, SonarCloud |
| Sampling Review (~20%) | organizational | PR review policy |

**Detection signals:**

| Measure | Config Files |
|---------|-------------|
| SAST | `semgrep.yml` in CI, `codeql-analysis.yml`, `.semgrep/` |
| SonarQube | `sonar-project.properties`, sonar step in CI |
| Property-Based Tests | `fast-check` / `hypothesis` in dependencies |

### Tier 3 — Mandatory Measures for High Risk

| Measure | Type | Tools |
|---------|------|-------|
| Mandatory Human Review | organizational | Branch protection rules |
| Sandbox / Isolation | deterministic | Firecracker, Deno Sandbox |
| Fuzzing | probabilistic | AFL++, cargo-fuzz, Fuzz4All |
| Penetration Testing | organizational | Regular security audits |
| Canary Deployments | deterministic | Gradual rollout + auto-rollback |
| PromptBOM / Provenance | organizational | Document model, prompt, approver |

**Detection signals:**

| Measure | Config Files |
|---------|-------------|
| Branch Protection | Check via `gh api repos/{owner}/{repo}/branches/main/protection` |
| Fuzzing | `fuzz/` directory, `cargo-fuzz` in deps, AFL config |

### Tier 4 — Critical (Severely Restrict AI Use)

| Measure | Type | Tools |
|---------|------|-------|
| Formal Verification | deterministic | Dafny, TLA+, SPARK |
| Independent Re-Verification | organizational | Separate team (per DO-178C DAL A) |
| MC/DC Test Coverage | deterministic | Coverage tools with MC/DC support |
| Contract-Based Design | deterministic | Pre/postconditions + invariants |
| Certification Process | organizational | IEC 61508, DO-178C, ISO 26262 |
| AI as Draft Aid Only | organizational | LLM proposes, human implements |

---

## CLAUDE.md Output Format

### Per-Module Assessment

```markdown
## Risk Radar Assessment

_Generated by `/risk-assess` on YYYY-MM-DD_

### Module: {module-name}
| Dimension | Score | Level | Evidence |
|-----------|-------|-------|----------|
| Code Type | N | {level} | {files/patterns found} |
| Language | N | {level} | {file counts by extension} |
| Deployment | N | {level} | {config hints or user input} |
| Data Sensitivity | N | {level} | {patterns found or user input} |
| Blast Radius | N | {level} | {user input} |

**Tier: N — {label}** (determined by {dimension} = {score})
```

### Per-Module Mitigation Status

```markdown
### Mitigations: {module-name} (Tier N)
| Measure | Status | Details |
|---------|--------|---------|
| {name} | {status-emoji} {status} | {config file or note} |
```

Status values: `Vorhanden/Present`, `Eingerichtet/Set up`, `Ausstehend/Pending`, `N/A`
