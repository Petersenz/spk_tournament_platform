#!/bin/bash
# ============================================================
# QA NIGHT WATCH — Re-scan Specific Phase
# ============================================================
# Usage:
#   bash QA-QC_Master/nightwatch/rescan.sh 02     (re-scan Phase 2: Security)
#   bash QA-QC_Master/nightwatch/rescan.sh 04     (re-scan Phase 4: Testing)
#
# Re-scan uses the LATEST session and overwrites that phase's results
# Re-scan runs in STRICT mode for deeper analysis
# ============================================================

set -uo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash rescan.sh <phase-number>"
  echo "  Example: bash rescan.sh 02"
  echo ""
  echo "Available phases:"
  echo "  01  Code Quality"
  echo "  02  Security"
  echo "  03  Dependencies"
  echo "  04  Testing"
  echo "  05  Performance"
  echo "  06  Accessibility"
  echo "  07  Documentation"
  echo "  08  Infrastructure"
  exit 1
fi

PHASE_NUM="$1"

# Force strict mode for re-scan (more thorough)
export SCAN_MODE="strict"

NIGHTWATCH_DIR="$(cd "$(dirname "$0")" && pwd)"

# หา project root จาก package.json
find_project_root() {
  local dir="$NIGHTWATCH_DIR"
  for i in 1 2 3 4 5; do
    dir="$(dirname "$dir")"
    if [[ -f "$dir/package.json" ]]; then
      echo "$dir"
      return 0
    fi
  done
  echo "$(cd "$NIGHTWATCH_DIR/../.." && pwd)"
}
PROJECT_ROOT="$(find_project_root)"

# Load modules
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

# Detect project
detect_project "$PROJECT_ROOT"
detect_tools

# Find latest session
RESULTS_DIR="$NIGHTWATCH_DIR/results"
if [[ -L "$RESULTS_DIR/latest" ]]; then
  SESSION_ID=$(readlink "$RESULTS_DIR/latest")
  SESSION_DIR="$RESULTS_DIR/$SESSION_ID"
  PROGRESS_LOG="$SESSION_DIR/progress.log"
  EVIDENCE_DIR="$SESSION_DIR/evidence"
else
  echo "No previous scan found. Run full scan first:"
  echo "  bash QA-QC_Master/nightwatch/run.sh"
  exit 1
fi

echo ""
echo -e "${BOLD}${YELLOW}  RE-SCAN Phase $PHASE_NUM (STRICT mode)${NC}"
echo -e "${DIM}  Session: $SESSION_ID${NC}"
echo ""

# Back up old results
old_phase="$SESSION_DIR/phase-${PHASE_NUM}.txt"
if [[ -f "$old_phase" ]]; then
  cp "$old_phase" "${old_phase}.bak"
fi

# Start server if needed
if echo "$PHASES_NEED_SERVER" | grep -q "$PHASE_NUM"; then
  start_dev_server
fi

# Find phase name
phase_name=""
for phase_cfg in "${PHASES[@]}"; do
  pnum="${phase_cfg%%:*}"
  pname="${phase_cfg#*:}"
  if [[ "$pnum" == "$PHASE_NUM" ]]; then
    phase_name="$pname"
    break
  fi
done

if [[ -z "$phase_name" ]]; then
  echo "Invalid phase number: $PHASE_NUM"
  exit 1
fi

# Run re-scan
start_time=$(timer_start)
log_phase_start "$PHASE_NUM" "$phase_name (RE-SCAN STRICT)"

scanner_func="run_phase_${PHASE_NUM}"
$scanner_func

# Verify
expected=$(get_expected_checks "$PHASE_NUM")
verify_phase "$PHASE_NUM" "$SESSION_DIR/phase-${PHASE_NUM}.txt" "$expected" || true

elapsed=$(timer_elapsed "$start_time")

# Score
score=$(write_phase_summary "$PHASE_NUM" "$phase_name" "$SESSION_DIR/phase-${PHASE_NUM}.txt" "$elapsed")
grade=$(calculate_grade "$score")

pass=$(count_status "$SESSION_DIR/phase-${PHASE_NUM}.txt" "pass")
warn=$(count_status "$SESSION_DIR/phase-${PHASE_NUM}.txt" "warn")
fail=$(count_status "$SESSION_DIR/phase-${PHASE_NUM}.txt" "fail")

log_phase_end "$PHASE_NUM" "$phase_name" "$pass" "$warn" "$fail" "$score" "$grade" "$elapsed"

# Show diff with previous scan
if [[ -f "${old_phase}.bak" ]]; then
  old_pass=0; old_fail=0
  old_pass=$(count_status "${old_phase}.bak" "pass")
  old_fail=$(count_status "${old_phase}.bak" "fail")

  echo ""
  echo -e "${BOLD}  VS Previous Scan:${NC}"
  echo -e "    Pass: $old_pass → $pass  $([ $pass -gt $old_pass ] && echo -e "${GREEN}↑${NC}" || echo -e "${RED}↓${NC}")"
  echo -e "    Fail: $old_fail → $fail  $([ $fail -lt $old_fail ] && echo -e "${GREEN}↑${NC}" || echo -e "${RED}↓${NC}")"
fi

stop_dev_server

# Regenerate report
generate_report

echo ""
echo -e "${GREEN}${BOLD}  Re-scan complete. Report updated: $SESSION_DIR/summary.md${NC}"
echo ""
