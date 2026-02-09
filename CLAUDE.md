# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run docs         # Render AsciiDoc docs with Asciidoctor
```

No test framework is configured. No linter is configured.

## Architecture

This is a single-page React app (React 18, Vite 6) that visualizes a MECE risk framework for AI-generated code. It has **no routing, no state management library, and no backend**.

### Core Structure

- **`src/RiskRadar.jsx`** — The entire application lives in this single self-contained component (~517 lines). It includes:
  - **i18n**: A `T` object at the top with full DE/EN translations, dimension definitions, preset scenarios, mitigation measures, and documentation content. All text is inline, no external i18n library.
  - **Risk model**: 5 dimensions (codeType, language, deployment, data, blastRadius), each scored 0–4. The tier is determined by `Math.max()` across all dimensions, mapped to 4 tiers.
  - **Components** (not exported, all in the same file): `RadarChart` (SVG polygon radar), `MitigationCard` (expandable tier cards), `DocSidebar` (slide-out documentation panel), and the default export `RiskRadar`.
  - **Styling**: All inline styles, no CSS modules or styled-components. Dark theme with slate color palette. Colors defined via `TIER_BG` and `TYPE_COLORS` constants.

- **`docs/risk-radar.adoc`** — Standalone AsciiDoc documentation with 30+ references. Rendered separately by Asciidoctor (not by the React app).

### Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the React app and renders AsciiDoc docs, then deploys both to GitHub Pages. The base path is auto-detected from the repo name via `VITE_BASE_PATH`.

## Key Patterns

- Dimension values are stored as `{ codeType: number, language: number, ... }` with values 0–4
- `getTierIndex(values)` maps the max dimension value to tier index 0–3
- Presets are predefined value combinations (e.g., "Payment Service", "Medical Device FW")
- Mitigations are categorized as deterministic/probabilistic/organizational with corresponding color coding
