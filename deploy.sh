#!/bin/bash
# Leverage Desk — one-shot GitHub + Vercel deploy
# Usage: GITHUB_TOKEN=xxx VERCEL_TOKEN=xxx ./deploy.sh

set -e

GITHUB_ORG="wwwourstudio"
REPO_NAME="leverage-desk"
VERCEL_TEAM="leverage-ai-sports"
VERCEL_TEAM_ID="team_oXm7EzKdHei7oDATOF0qvpqT"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$VERCEL_TOKEN" ]; then
  echo "❌  Set GITHUB_TOKEN and VERCEL_TOKEN before running."
  echo "   export GITHUB_TOKEN=ghp_..."
  echo "   export VERCEL_TOKEN=..."
  exit 1
fi

echo "→ Creating GitHub repo ${GITHUB_ORG}/${REPO_NAME}..."
REPO_RESPONSE=$(curl -s -X POST "https://api.github.com/orgs/${GITHUB_ORG}/repos" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Leverage Market Desk — sports intelligence UI\",\"private\":false,\"auto_init\":false}")

CLONE_URL=$(echo "$REPO_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('clone_url',''))")
if [ -z "$CLONE_URL" ]; then
  MSG=$(echo "$REPO_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message','unknown'))" 2>/dev/null)
  # Repo may already exist — just use it
  CLONE_URL="https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"
  echo "   ↳ repo may already exist ($MSG) — pushing to ${CLONE_URL}"
else
  echo "   ✓ repo created: https://github.com/${GITHUB_ORG}/${REPO_NAME}"
fi

echo "→ Pushing to GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${REPO_NAME}.git"
git push -u origin main --force
echo "   ✓ pushed"

echo "→ Deploying to Vercel (team: ${VERCEL_TEAM})..."
npx vercel deploy \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_TEAM" \
  --yes \
  --prod

echo ""
echo "✅  Done — your app is live."
