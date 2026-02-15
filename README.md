# Vibe-Coding Risk Radar

MECE risk framework for AI-generated code — 5 dimensions, 4 tiers, actionable mitigations.

🔗 **Live Demo:** https://llm-coding.github.io/vibe-coding-risk-radar/

## Features

- Interactive 5-dimension risk assessment (code type, language, deployment, data, blast radius)
- 4-tier classification (Minimal, Moderate, High, Critical)
- Claude Code skills for automated repo analysis (`/risk-assess`, `/risk-mitigate`)
- Architecture Decision Record (ADR) generation
- Bilingual interface (DE/EN)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build locally
```

## Pre-rendering for SEO

The app includes a Puppeteer-based pre-rendering script for better SEO.

**Local pre-rendering (before release):**

```bash
npm run build:prerender
```

This renders the full React app to static HTML in `dist/index.html`.

**Note:** Pre-rendering is not run in CI due to Puppeteer/Chrome setup complexity. The deployed version is a standard SPA (search engines with JS support will still index it, just slower).

## Documentation

- Full docs: `npm run docs` → `dist/docs/`
- In-app: Click "Documentation" button

## License

MIT — see LICENSE file
