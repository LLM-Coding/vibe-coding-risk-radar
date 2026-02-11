#!/usr/bin/env bash
# Install Vibe-Coding Risk Radar skills for Claude Code
# Usage: curl -sL https://raw.githubusercontent.com/LLM-Coding/vibe-coding-risk-radar/main/install-skills.sh | bash

set -euo pipefail

BASE_URL="https://raw.githubusercontent.com/LLM-Coding/vibe-coding-risk-radar/main/.claude/skills"

SKILLS=(
  "shared/risk-model.md"
  "risk-assess/SKILL.md"
  "risk-mitigate/SKILL.md"
)

echo "Installing Vibe-Coding Risk Radar skills..."

for file in "${SKILLS[@]}"; do
  dir=".claude/skills/$(dirname "$file")"
  mkdir -p "$dir"
  curl -sfL "$BASE_URL/$file" -o ".claude/skills/$file"
  echo "  -> .claude/skills/$file"
done

echo ""
echo "Done! Skills installed to .claude/skills/"
echo ""
echo "Usage:"
echo "  /risk-assess    — Analyze your repo and assess risk per module"
echo "  /risk-mitigate  — Implement mitigation measures for your risk tier"
