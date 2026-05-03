#!/bin/bash
# QA Night Watch — Configuration
# ตั้งค่า phases, thresholds, scan mode

# ============================================================
# SCAN MODE: "standard" หรือ "strict"
# ============================================================
SCAN_MODE="${SCAN_MODE:-standard}"

# ============================================================
# AUTO-DETECT PROJECT
# ============================================================
detect_project() {
  local project_root="$1"

  # Detect framework
  if [[ -f "$project_root/next.config.ts" ]] || [[ -f "$project_root/next.config.js" ]] || [[ -f "$project_root/next.config.mjs" ]]; then
    PROJECT_FRAMEWORK="nextjs"
  elif [[ -f "$project_root/vite.config.ts" ]] || [[ -f "$project_root/vite.config.js" ]]; then
    PROJECT_FRAMEWORK="vite"
  elif [[ -f "$project_root/nuxt.config.ts" ]]; then
    PROJECT_FRAMEWORK="nuxt"
  elif [[ -f "$project_root/angular.json" ]]; then
    PROJECT_FRAMEWORK="angular"
  else
    PROJECT_FRAMEWORK="generic"
  fi

  # Detect package manager
  if [[ -f "$project_root/pnpm-lock.yaml" ]]; then
    PKG_MANAGER="pnpm"
  elif [[ -f "$project_root/yarn.lock" ]]; then
    PKG_MANAGER="yarn"
  elif [[ -f "$project_root/bun.lockb" ]]; then
    PKG_MANAGER="bun"
  else
    PKG_MANAGER="npm"
  fi

  # Detect dev port from package.json
  if [[ -f "$project_root/package.json" ]]; then
    local port_match=""
    port_match=$(grep -oE '(PORT|port)[=:]\s*[0-9]+' "$project_root/package.json" 2>/dev/null | grep -oE '[0-9]+' | head -1 || true)
    DEV_PORT="${port_match:-3000}"
    PROJECT_NAME=$(node -pe "try{require('$project_root/package.json').name}catch(e){'unknown'}" 2>/dev/null || echo "unknown")
  else
    DEV_PORT="3000"
    PROJECT_NAME="unknown"
  fi

  # Detect TypeScript
  [[ -f "$project_root/tsconfig.json" ]] && HAS_TYPESCRIPT=true || HAS_TYPESCRIPT=false

  # Detect test framework
  HAS_VITEST=false; HAS_JEST=false; HAS_PLAYWRIGHT=false
  [[ -f "$project_root/vitest.config.ts" ]] || [[ -f "$project_root/vitest.config.js" ]] && HAS_VITEST=true
  [[ -f "$project_root/jest.config.ts" ]] || [[ -f "$project_root/jest.config.js" ]] && HAS_JEST=true
  [[ -f "$project_root/playwright.config.ts" ]] || [[ -f "$project_root/playwright.config.js" ]] && HAS_PLAYWRIGHT=true

  # Detect git
  [[ -d "$project_root/.git" ]] && HAS_GIT=true || HAS_GIT=false

  # Detect Docker
  [[ -f "$project_root/Dockerfile" ]] || [[ -f "$project_root/docker-compose.yml" ]] || [[ -f "$project_root/docker-compose.yaml" ]] && HAS_DOCKER=true || HAS_DOCKER=false

  # Detect CI/CD
  HAS_GITLAB_CI=false; HAS_GITHUB_CI=false
  [[ -f "$project_root/.gitlab-ci.yml" ]] && HAS_GITLAB_CI=true
  [[ -d "$project_root/.github/workflows" ]] && HAS_GITHUB_CI=true
}

# ============================================================
# THRESHOLDS — Standard vs Strict
# ============================================================

if [[ "$SCAN_MODE" == "strict" ]]; then
  # STRICT — production-ready
  TH_ESLINT_ERRORS=0
  TH_ESLINT_WARNINGS=0
  TH_PRETTIER_PASS=100
  TH_UNUSED_DEPS=0
  TH_CIRCULAR_DEPS=0
  TH_COPY_PASTE_PCT=1
  TH_FILE_MAX_LINES=300
  TH_FUNC_MAX_LINES=40
  TH_ANY_TYPE_MAX=0
  TH_TODO_MAX=0
  TH_CONSOLE_LOG_MAX=0
  TH_NPM_CRITICAL=0
  TH_NPM_HIGH=0
  TH_SNYK_CRITICAL=0
  TH_OUTDATED_MAJOR=0
  TH_OUTDATED_MINOR=3
  TH_TEST_COVERAGE=80
  TH_LIGHTHOUSE_PERF=90
  TH_LIGHTHOUSE_BP=95
  TH_FCP_MS=1500
  TH_LCP_MS=2000
  TH_CLS=0.025
  TH_TBT_MS=150
  TH_BUNDLE_KB=200
  TH_A11Y_CRITICAL=0
  TH_A11Y_SERIOUS=0
else
  # STANDARD — achievable for most projects
  TH_ESLINT_ERRORS=0
  TH_ESLINT_WARNINGS=5
  TH_PRETTIER_PASS=100
  TH_UNUSED_DEPS=0
  TH_CIRCULAR_DEPS=0
  TH_COPY_PASTE_PCT=3
  TH_FILE_MAX_LINES=500
  TH_FUNC_MAX_LINES=50
  TH_ANY_TYPE_MAX=5
  TH_TODO_MAX=5
  TH_CONSOLE_LOG_MAX=0
  TH_NPM_CRITICAL=0
  TH_NPM_HIGH=0
  TH_SNYK_CRITICAL=0
  TH_OUTDATED_MAJOR=0
  TH_OUTDATED_MINOR=5
  TH_TEST_COVERAGE=70
  TH_LIGHTHOUSE_PERF=85
  TH_LIGHTHOUSE_BP=90
  TH_FCP_MS=1800
  TH_LCP_MS=2500
  TH_CLS=0.05
  TH_TBT_MS=200
  TH_BUNDLE_KB=300
  TH_A11Y_CRITICAL=0
  TH_A11Y_SERIOUS=3
fi

# ============================================================
# PHASES — 8 phases
# ============================================================
PHASES=(
  "01:Code Quality"
  "02:Security"
  "03:Dependencies"
  "04:Testing"
  "05:Performance"
  "06:Accessibility"
  "07:Documentation"
  "08:Infrastructure"
)

# Phases that need dev server running
PHASES_NEED_SERVER="05 06"

# ============================================================
# TOOL AVAILABILITY CHECK
# ============================================================
check_tool() {
  command -v "$1" &>/dev/null
}

check_npx_tool() {
  npx --yes "$1" --version &>/dev/null 2>&1
}

detect_tools() {
  HAS_ESLINT=false; HAS_PRETTIER=false; HAS_DEPCHECK=false
  HAS_MADGE=false; HAS_JSCPD=false; HAS_GITLEAKS=false
  HAS_SNYK=false; HAS_LIGHTHOUSE=false; HAS_PA11Y=false

  # Check local project tools (npx)
  [[ -f "$PROJECT_ROOT/node_modules/.bin/eslint" ]] && HAS_ESLINT=true
  [[ -f "$PROJECT_ROOT/node_modules/.bin/prettier" ]] && HAS_PRETTIER=true
  check_tool "gitleaks" && HAS_GITLEAKS=true
  check_tool "snyk" && HAS_SNYK=true
  check_tool "lighthouse" && HAS_LIGHTHOUSE=true || check_npx_tool "lighthouse" && HAS_LIGHTHOUSE=true
  check_tool "pa11y" && HAS_PA11Y=true || check_npx_tool "pa11y" && HAS_PA11Y=true

  # npx tools (always available if node_modules exists)
  [[ -d "$PROJECT_ROOT/node_modules" ]] && {
    HAS_DEPCHECK=true
    HAS_MADGE=true
    HAS_JSCPD=true
  }
}

# ============================================================
# GRADE CALCULATION
# ============================================================
calculate_grade() {
  local score=$1
  if (( score >= 95 )); then echo "A+"
  elif (( score >= 85 )); then echo "A"
  elif (( score >= 75 )); then echo "B"
  elif (( score >= 65 )); then echo "C"
  elif (( score >= 50 )); then echo "D"
  else echo "F"
  fi
}
