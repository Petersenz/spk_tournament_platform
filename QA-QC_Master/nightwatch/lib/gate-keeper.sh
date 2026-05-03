#!/bin/bash
# QA Night Watch — Gate Keeper
# Verify 100% completion, anti-skip, retry mechanism

# ============================================================
# VERIFY PHASE COMPLETION
# ============================================================
verify_phase() {
  local phase_num="$1"
  local phase_file="$2"
  local expected="$3"

  if [[ ! -f "$phase_file" ]]; then
    log_progress "GATE" "Phase $phase_num: NO RESULTS FILE — FAIL"
    return 1
  fi

  local actual
  actual=$(count_total "$phase_file")
  local skipped
  skipped=$(count_status "$phase_file" "skip")
  local executed=$(( actual - skipped ))

  # Anti-skip: every expected check must have a result
  if (( actual < expected )); then
    log_progress "GATE" "Phase $phase_num: INCOMPLETE — expected $expected checks, got $actual"
    return 1
  fi

  # Anti-lie: every non-skip result must have evidence
  local missing_evidence=0
  while IFS='|' read -r status id name detail severity evidence_file; do
    if [[ "$status" != "skip" ]] && [[ -z "$evidence_file" || ! -f "$evidence_file" ]]; then
      (( missing_evidence++ ))
      log_progress "GATE" "Phase $phase_num: [$id] missing evidence"
    fi
  done < "$phase_file"

  if (( missing_evidence > 0 )); then
    log_progress "GATE" "Phase $phase_num: $missing_evidence checks missing evidence"
    return 1
  fi

  log_progress "GATE" "Phase $phase_num: VERIFIED — $actual checks ($executed executed, $skipped skipped)"
  return 0
}

# ============================================================
# RETRY MECHANISM
# ============================================================
retry_phase() {
  local phase_num="$1"
  local scanner_func="$2"
  local max_retries=2
  local attempt=1

  while (( attempt <= max_retries )); do
    log_progress "GATE" "Phase $phase_num: retry attempt $attempt/$max_retries"
    echo -e "  ${YELLOW}↻${NC} Retry $attempt/$max_retries..."

    # Re-run scanner
    $scanner_func

    # Check again
    local phase_file="$SESSION_DIR/phase-${phase_num}.txt"
    local expected
    expected=$(get_expected_checks "$phase_num")

    if verify_phase "$phase_num" "$phase_file" "$expected"; then
      echo -e "  ${GREEN}✓${NC} Retry successful"
      return 0
    fi

    (( attempt++ ))
  done

  log_progress "GATE" "Phase $phase_num: FAILED after $max_retries retries — marking BLOCKED"
  echo -e "  ${RED}✗${NC} Phase $phase_num BLOCKED after $max_retries retries"
  return 1
}

# ============================================================
# EXPECTED CHECK COUNTS PER PHASE
# ============================================================
get_expected_checks() {
  local phase_num="$1"
  case "$phase_num" in
    01) echo 15 ;;
    02) echo 12 ;;
    03) echo 8 ;;
    04) echo 10 ;;
    05) echo 8 ;;
    06) echo 6 ;;
    07) echo 5 ;;
    08) echo 8 ;;
    *) echo 0 ;;
  esac
}

# ============================================================
# PHASE SUMMARY JSON
# ============================================================
write_phase_summary() {
  local phase_num="$1"
  local phase_name="$2"
  local phase_file="$3"
  local duration="$4"

  local total pass warn fail skip score grade
  total=$(count_total "$phase_file")
  pass=$(count_status "$phase_file" "pass")
  warn=$(count_status "$phase_file" "warn")
  fail=$(count_status "$phase_file" "fail")
  skip=$(count_status "$phase_file" "skip")
  score=$(calc_phase_score "$phase_file")
  grade=$(calculate_grade "$score")

  cat > "$SESSION_DIR/phase-${phase_num}-summary.json" <<EOJSON
{
  "phase": $phase_num,
  "name": "$phase_name",
  "score": $score,
  "grade": "$grade",
  "duration_seconds": $duration,
  "total": $total,
  "pass": $pass,
  "warn": $warn,
  "fail": $fail,
  "skip": $skip
}
EOJSON

  echo "$score"
}
