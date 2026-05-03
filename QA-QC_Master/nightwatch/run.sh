#!/bin/bash
# ============================================================
# QA NIGHT WATCH — Main Orchestrator
# ============================================================
# Usage:
#   bash QA-QC_Master/nightwatch/run.sh              (scan ทุก phase)
#   bash QA-QC_Master/nightwatch/run.sh --phase 02   (scan เฉพาะ phase 2)
#   SCAN_MODE=strict bash QA-QC_Master/nightwatch/run.sh  (strict mode)
#
# Output:
#   QA-QC_Master/nightwatch/results/latest/summary.md
# ============================================================

set -uo pipefail

# ── Resolve paths ──
NIGHTWATCH_DIR="$(cd "$(dirname "$0")" && pwd)"

# PROJECT_ROOT detection:
# 1. ถ้า user ระบุ --project <path> → ใช้ path นั้น
# 2. ถ้าไม่ → หา package.json ขึ้นไปจาก nightwatch dir
# 3. fallback → ../../ จาก nightwatch dir
find_project_root() {
  local dir="$NIGHTWATCH_DIR"
  # ขึ้นไปหา package.json (สูงสุด 5 ระดับ)
  for i in 1 2 3 4 5; do
    dir="$(dirname "$dir")"
    if [[ -f "$dir/package.json" ]]; then
      echo "$dir"
      return 0
    fi
  done
  # fallback
  echo "$(cd "$NIGHTWATCH_DIR/../.." && pwd)"
}

PROJECT_ROOT=""

# ── Parse arguments ──
SINGLE_PHASE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase) SINGLE_PHASE="$2"; shift 2 ;;
    --strict) export SCAN_MODE="strict"; shift ;;
    --standard) export SCAN_MODE="standard"; shift ;;
    --project) PROJECT_ROOT="$(cd "$2" && pwd)"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ถ้าไม่ได้ระบุ --project → auto-detect
if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT="$(find_project_root)"
fi

# Verify: ต้องมี package.json
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  echo "ERROR: ไม่เจอ package.json ที่ $PROJECT_ROOT"
  echo "ลอง: bash QA-QC_Master/nightwatch/run.sh --project /path/to/your/project"
  exit 1
fi

# ── Load all modules ──
source "$NIGHTWATCH_DIR/config.sh"
source "$NIGHTWATCH_DIR/lib/utils.sh"
source "$NIGHTWATCH_DIR/lib/server.sh"
source "$NIGHTWATCH_DIR/lib/gate-keeper.sh"
source "$NIGHTWATCH_DIR/lib/reporter.sh"
source "$NIGHTWATCH_DIR/scanners/phase-01-code-quality.sh"
source "$NIGHTWATCH_DIR/scanners/phase-02-security.sh"
source "$NIGHTWATCH_DIR/scanners/phase-03-dependencies.sh"
source "$NIGHTWATCH_DIR/scanners/phase-04-testing.sh"
source "$NIGHTWATCH_DIR/scanners/phase-05-performance.sh"
source "$NIGHTWATCH_DIR/scanners/phase-06-accessibility.sh"
source "$NIGHTWATCH_DIR/scanners/phase-07-documentation.sh"
source "$NIGHTWATCH_DIR/scanners/phase-08-infrastructure.sh"

# ── Detect project ──
detect_project "$PROJECT_ROOT"
detect_tools

# ── Init session ──
init_session
print_banner

# ── Tool inventory ──
echo -e "${BOLD}  Tool Inventory:${NC}"
echo -e "  ESLint: $([ "$HAS_ESLINT" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Prettier: $([ "$HAS_PRETTIER" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Gitleaks: $([ "$HAS_GITLEAKS" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Snyk: $([ "$HAS_SNYK" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo -e "  TypeScript: $([ "$HAS_TYPESCRIPT" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Vitest: $([ "$HAS_VITEST" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Playwright: $([ "$HAS_PLAYWRIGHT" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")  Git: $([ "$HAS_GIT" == "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo ""

# ── Run phases ──
run_single_phase() {
  local phase_num="$1"
  local phase_name="$2"
  local phase_file="$SESSION_DIR/phase-${phase_num}.txt"
  local scanner_func="run_phase_${phase_num}"

  # Check if server needed
  if echo "$PHASES_NEED_SERVER" | grep -q "$phase_num"; then
    start_dev_server
  fi

  local start_time
  start_time=$(timer_start)

  log_phase_start "$phase_num" "$phase_name"

  # Run scanner
  $scanner_func

  # Verify
  local expected
  expected=$(get_expected_checks "$phase_num")

  if ! verify_phase "$phase_num" "$phase_file" "$expected"; then
    retry_phase "$phase_num" "$scanner_func"
  fi

  local elapsed
  elapsed=$(timer_elapsed "$start_time")

  # Score + grade
  local score grade
  score=$(write_phase_summary "$phase_num" "$phase_name" "$phase_file" "$elapsed")
  grade=$(calculate_grade "$score")

  local pass warn fail
  pass=$(count_status "$phase_file" "pass")
  warn=$(count_status "$phase_file" "warn")
  fail=$(count_status "$phase_file" "fail")

  log_phase_end "$phase_num" "$phase_name" "$pass" "$warn" "$fail" "$score" "$grade" "$elapsed"
}

if [[ -n "$SINGLE_PHASE" ]]; then
  # Run single phase
  for phase_cfg in "${PHASES[@]}"; do
    pnum="${phase_cfg%%:*}"
    pname="${phase_cfg#*:}"
    if [[ "$pnum" == "$SINGLE_PHASE" ]]; then
      run_single_phase "$pnum" "$pname"
      break
    fi
  done
else
  # Run all phases
  for phase_cfg in "${PHASES[@]}"; do
    pnum="${phase_cfg%%:*}"
    pname="${phase_cfg#*:}"
    run_single_phase "$pnum" "$pname"
  done
fi

# ── Stop server if we started it ──
stop_dev_server

# ── Generate report ──
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Generating Report...${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

generate_report

# ── Final summary ──
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  QA Night Watch Complete${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Report:   ${BOLD}$SESSION_DIR/summary.md${NC}"
echo -e "  Evidence: ${BOLD}$EVIDENCE_DIR/${NC}"
echo -e "  Progress: ${BOLD}$PROGRESS_LOG${NC}"
echo ""
echo -e "  ${DIM}To re-scan a phase: bash QA-QC_Master/nightwatch/rescan.sh <phase-number>${NC}"
echo ""
