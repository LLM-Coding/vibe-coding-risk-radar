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

- **`src/constants.js`** — Shared constants: `VERSION`, `TIER_BG` (tier colors), `TYPE_COLORS` (measure type colors).
- **`src/utils.js`** — Pure utility functions: `getTierIndex`, `polarToCartesian`, `detectBrowserLanguage`.
- **`src/components/RiskRadar.jsx`** + `.module.css` — Main app component. Risk model: 5 dimensions (codeType, language, deployment, data, blastRadius), each scored 0–4. Tier = `Math.max()` across all dimensions, mapped to 4 tiers.
- **`src/components/RadarChart.jsx`** + `.module.css` — SVG polygon radar chart.
- **`src/components/MitigationCard.jsx`** + `.module.css` — Expandable tier cards showing mitigation measures.
- **`src/components/DocSidebar.jsx`** + `.module.css` — Slide-out documentation panel using asciidoctor.js.
- **Styling**: CSS Modules for static layout/typography, inline styles only for dynamic/JS-dependent values (tier colors, active states). Theme via CSS custom properties in `src/theme.js`.

- **`src/i18n.js`** — Full DE/EN translations (~353 lines): dimension definitions, preset scenarios, mitigation measures, and documentation content with AsciiDoc markup and hyperlinked references.

- **`docs/risk-radar.adoc`** — Standalone AsciiDoc documentation with 30+ references. Rendered separately by Asciidoctor (not by the React app).

### Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the React app and renders AsciiDoc docs, then deploys both to GitHub Pages. The base path is auto-detected from the repo name via `VITE_BASE_PATH`.

## Key Patterns

- Dimension values are stored as `{ codeType: number, language: number, ... }` with values 0–4
- `getTierIndex(values)` maps the max dimension value to tier index 0–3
- Presets are predefined value combinations (e.g., "Payment Service", "Medical Device FW")
- Mitigations are categorized as deterministic/probabilistic/organizational with corresponding color coding
