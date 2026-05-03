#!/bin/bash
# QA Night Watch — Utilities
# Logging, colors, JSON output, progress tracking

# ============================================================
# COLORS
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ============================================================
# PATHS
# ============================================================
NIGHTWATCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_DIR="$NIGHTWATCH_DIR/results"
SESSION_ID=""
SESSION_DIR=""
PROGRESS_LOG=""
EVIDENCE_DIR=""

# ============================================================
# INIT SESSION
# ============================================================
init_session() {
  SESSION_ID=$(date +"%Y-%m-%d_%H%M")
  SESSION_DIR="$RESULTS_DIR/$SESSION_ID"
  PROGRESS_LOG="$SESSION_DIR/progress.log"
  EVIDENCE_DIR="$SESSION_DIR/evidence"

  mkdir -p "$SESSION_DIR" "$EVIDENCE_DIR"

  # Write session start
  cat > "$SESSION_DIR/session.json" <<EOJSON
{
  "id": "$SESSION_ID",
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project": "$PROJECT_NAME",
  "framework": "$PROJECT_FRAMEWORK",
  "pkg_manager": "$PKG_MANAGER",
  "scan_mode": "$SCAN_MODE",
  "project_root": "$PROJECT_ROOT"
}
EOJSON

  # Symlink latest
  rm -f "$RESULTS_DIR/latest"
  ln -sf "$SESSION_ID" "$RESULTS_DIR/latest"

  log_progress "SESSION_START" "Night Watch started — $PROJECT_NAME ($PROJECT_FRAMEWORK) — mode: $SCAN_MODE"
}

# ============================================================
# LOGGING
# ============================================================
log_progress() {
  local type="$1"
  local msg="$2"
  local timestamp
  timestamp=$(date +"%H:%M:%S")
  echo "[$timestamp] [$type] $msg" >> "$PROGRESS_LOG"
}

log_phase_start() {
  local phase_num="$1"
  local phase_name="$2"
  echo ""
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  Phase $phase_num: $phase_name${NC}"
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  log_progress "PHASE_START" "Phase $phase_num: $phase_name"
}

log_phase_end() {
  local phase_num="$1"
  local phase_name="$2"
  local pass="$3"
  local warn="$4"
  local fail="$5"
  local score="$6"
  local grade="$7"
  local duration="$8"

  echo ""
  echo -e "  ${GREEN}Pass: $pass${NC}  ${YELLOW}Warn: $warn${NC}  ${RED}Fail: $fail${NC}  Score: ${BOLD}$score${NC} ($grade)  Time: ${duration}s"
  log_progress "PHASE_END" "Phase $phase_num: score=$score grade=$grade pass=$pass warn=$warn fail=$fail"
}

log_check() {
  local status="$1"  # pass|warn|fail|skip
  local id="$2"
  local name="$3"
  local detail="$4"

  case "$status" in
    pass) echo -e "  ${GREEN}✓${NC} [$id] $name ${DIM}$detail${NC}" ;;
    warn) echo -e "  ${YELLOW}⚠${NC} [$id] $name ${YELLOW}$detail${NC}" ;;
    fail) echo -e "  ${RED}✗${NC} [$id] $name ${RED}$detail${NC}" ;;
    skip) echo -e "  ${DIM}○${NC} [$id] $name ${DIM}(skipped: $detail)${NC}" ;;
  esac
}

# ============================================================
# CHECK RESULT RECORDING
# ============================================================
# Store results as simple line-delimited format in phase file
# Format: STATUS|ID|NAME|DETAIL|SEVERITY|EVIDENCE_FILE

record_check() {
  local phase_file="$1"
  local status="$2"    # pass|warn|fail|skip
  local id="$3"
  local name="$4"
  local detail="$5"
  local severity="$6"  # critical|high|medium|low|info
  local evidence_file="${7:-}"

  echo "${status}|${id}|${name}|${detail}|${severity}|${evidence_file}" >> "$phase_file"
  log_check "$status" "$id" "$name" "$detail"
}

# ============================================================
# EVIDENCE SAVING
# ============================================================
save_evidence() {
  local check_id="$1"
  local content="$2"
  local evidence_file="$EVIDENCE_DIR/${check_id}.txt"

  echo "$content" > "$evidence_file"
  echo "$evidence_file"
}

# ============================================================
# PHASE RESULT PARSING
# ============================================================
count_status() {
  local phase_file="$1"
  local status="$2"
  local c
  c=$(grep -c "^${status}|" "$phase_file" 2>/dev/null || true)
  echo "${c:-0}" | tr -d '[:space:]'
}

count_total() {
  local phase_file="$1"
  local c
  c=$(wc -l < "$phase_file" 2>/dev/null || true)
  echo "${c:-0}" | tr -d '[:space:]'
}

calc_phase_score() {
  local phase_file="$1"
  local total pass warn fail
  total=$(count_total "$phase_file")
  pass=$(count_status "$phase_file" "pass")
  warn=$(count_status "$phase_file" "warn")
  fail=$(count_status "$phase_file" "fail")

  if (( total == 0 )); then
    echo 0
    return
  fi

  # pass=100%, warn=50%, fail=0%, skip=0%
  local score=$(( (pass * 100 + warn * 50) / total ))
  echo "$score"
}

# ============================================================
# TIME TRACKING
# ============================================================
timer_start() {
  date +%s
}

timer_elapsed() {
  local start="$1"
  local now
  now=$(date +%s)
  echo $(( now - start ))
}

# ============================================================
# BANNER
# ============================================================
print_banner() {
  echo ""
  echo -e "${BOLD}${CYAN}"
  echo "  ╔═══════════════════════════════════════════════╗"
  echo "  ║         QA NIGHT WATCH v1.0                   ║"
  echo "  ║         Autonomous QA/QC Scanner              ║"
  echo "  ╚═══════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "  Project:   ${BOLD}$PROJECT_NAME${NC} ($PROJECT_FRAMEWORK)"
  echo -e "  Mode:      ${BOLD}$SCAN_MODE${NC}"
  echo -e "  Session:   ${BOLD}$SESSION_ID${NC}"
  echo -e "  Root:      $PROJECT_ROOT"
  echo ""
}
