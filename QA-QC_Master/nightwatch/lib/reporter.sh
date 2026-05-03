#!/bin/bash
# QA Night Watch — Report Generator
# Generates summary.md with full scan results

generate_report() {
  local report="$SESSION_DIR/summary.md"
  local total_score=0
  local total_phases=0
  local total_critical=0
  local total_high=0
  local total_medium=0
  local total_pass=0
  local total_warn=0
  local total_fail=0
  local total_checks=0
  local started_at ended_at duration

  started_at=$(node -pe "try{JSON.parse(require('fs').readFileSync('$SESSION_DIR/session.json','utf8')).started_at}catch(e){'unknown'}" 2>/dev/null || echo "unknown")
  ended_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  duration=$(( $(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$started_at" +%s 2>/dev/null || echo $(date +%s)) ))

  # Collect phase data
  local phase_lines=""
  for phase_cfg in "${PHASES[@]}"; do
    local pnum="${phase_cfg%%:*}"
    local pname="${phase_cfg#*:}"
    local summary_file="$SESSION_DIR/phase-${pnum}-summary.json"
    local phase_file="$SESSION_DIR/phase-${pnum}.txt"

    if [[ -f "$summary_file" ]]; then
      local pscore pgrade ppass pwarn pfail pdur
      pscore=$(grep '"score"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo 0)
      pgrade=$(grep '"grade"' "$summary_file" | grep -oE '"[A-F+]+"' | tr -d '"' || echo "?")
      ppass=$(grep '"pass"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo 0)
      pwarn=$(grep '"warn"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo 0)
      pfail=$(grep '"fail"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo 0)
      pdur=$(grep '"duration_seconds"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo 0)

      total_score=$(( total_score + pscore ))
      total_pass=$(( total_pass + ppass ))
      total_warn=$(( total_warn + pwarn ))
      total_fail=$(( total_fail + pfail ))
      (( total_phases++ ))

      phase_lines="$phase_lines\n| $pnum | $pname | $pscore | $pgrade | $ppass pass, $pwarn warn, $pfail fail | ${pdur}s |"
    fi
  done

  # Calculate overall
  local avg_score=0
  (( total_phases > 0 )) && avg_score=$(( total_score / total_phases ))
  local overall_grade
  overall_grade=$(calculate_grade "$avg_score")
  total_checks=$(( total_pass + total_warn + total_fail ))

  # Count by severity
  for pf in "$SESSION_DIR"/phase-*.txt; do
    [[ -f "$pf" ]] || continue
    local _c _h _m
    _c=$(grep -c "|critical|" "$pf" 2>/dev/null || true); _c=$(echo "${_c:-0}" | tr -d '[:space:]')
    _h=$(grep -c "|high|" "$pf" 2>/dev/null || true); _h=$(echo "${_h:-0}" | tr -d '[:space:]')
    _m=$(grep -c "|medium|" "$pf" 2>/dev/null || true); _m=$(echo "${_m:-0}" | tr -d '[:space:]')
    total_critical=$(( total_critical + _c ))
    total_high=$(( total_high + _h ))
    total_medium=$(( total_medium + _m ))
  done

  # Build score bar
  local bar_filled=$(( avg_score / 4 ))
  local bar_empty=$(( 25 - bar_filled ))
  local score_bar=""
  for ((i=0; i<bar_filled; i++)); do score_bar="${score_bar}█"; done
  for ((i=0; i<bar_empty; i++)); do score_bar="${score_bar}░"; done

  # ============================================================
  # WRITE REPORT
  # ============================================================
  cat > "$report" <<EOMD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  QA NIGHT WATCH — SCAN REPORT
  Project: $PROJECT_NAME ($PROJECT_FRAMEWORK)
  Scan: $started_at → $ended_at
  Mode: $SCAN_MODE | Checks: $total_checks | Phases: $total_phases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## HEALTH SCORE

    ${score_bar}  ${avg_score} / 100  Grade: ${overall_grade}

  Critical:  ${total_critical}
  High:      ${total_high}
  Medium:    ${total_medium}
  Pass:      ${total_pass}
  Warn:      ${total_warn}
  Fail:      ${total_fail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE SUMMARY

| # | Phase | Score | Grade | Issues | Time |
|---|-------|:-----:|:-----:|--------|:----:|
$(echo -e "$phase_lines")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOMD

  # Critical issues section
  local has_critical=false
  for pf in "$SESSION_DIR"/phase-*.txt; do
    [[ -f "$pf" ]] || continue
    while IFS='|' read -r status id name detail severity evidence_file; do
      if [[ "$severity" == "critical" ]] && [[ "$status" == "fail" ]]; then
        if [[ "$has_critical" == "false" ]]; then
          echo "" >> "$report"
          echo "## CRITICAL — FIX NOW" >> "$report"
          echo "" >> "$report"
          has_critical=true
        fi
        echo "### [$id] $name" >> "$report"
        echo "  Severity:  CRITICAL" >> "$report"
        echo "  Status:    FAIL" >> "$report"
        echo "  Detail:    $detail" >> "$report"
        if [[ -n "$evidence_file" ]] && [[ -f "$evidence_file" ]]; then
          echo "  Evidence:  $(head -3 "$evidence_file")" >> "$report"
        fi
        echo "" >> "$report"
      fi
    done < "$pf"
  done

  # High issues section
  local has_high=false
  for pf in "$SESSION_DIR"/phase-*.txt; do
    [[ -f "$pf" ]] || continue
    while IFS='|' read -r status id name detail severity evidence_file; do
      if [[ "$severity" == "high" ]] && [[ "$status" != "pass" ]]; then
        if [[ "$has_high" == "false" ]]; then
          echo "" >> "$report"
          echo "## HIGH — FIX THIS SPRINT" >> "$report"
          echo "" >> "$report"
          has_high=true
        fi
        echo "### [$id] $name" >> "$report"
        echo "  Status:    $(echo "$status" | tr '[:lower:]' '[:upper:]')" >> "$report"
        echo "  Detail:    $detail" >> "$report"
        echo "" >> "$report"
      fi
    done < "$pf"
  done

  # Medium issues section
  local has_medium=false
  for pf in "$SESSION_DIR"/phase-*.txt; do
    [[ -f "$pf" ]] || continue
    while IFS='|' read -r status id name detail severity evidence_file; do
      if [[ "$severity" == "medium" ]] && [[ "$status" != "pass" ]]; then
        if [[ "$has_medium" == "false" ]]; then
          echo "" >> "$report"
          echo "## MEDIUM — FIX WHEN AVAILABLE" >> "$report"
          echo "" >> "$report"
          has_medium=true
        fi
        echo "- [$id] $name — $detail" >> "$report"
      fi
    done < "$pf"
  done

  # Decision template
  cat >> "$report" <<'EODECISION'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## DECISION TEMPLATE

ตรวจสอบแต่ละ phase แล้ว mark:

EODECISION

  for phase_cfg in "${PHASES[@]}"; do
    local pnum="${phase_cfg%%:*}"
    local pname="${phase_cfg#*:}"
    local summary_file="$SESSION_DIR/phase-${pnum}-summary.json"
    if [[ -f "$summary_file" ]]; then
      local pscore2 pgrade2
      pscore2=$(grep '"score"' "$summary_file" | grep -oE '[0-9]+' | head -1 || echo "?")
      pgrade2=$(grep '"grade"' "$summary_file" | grep -oE '"[A-F+]+"' | tr -d '"' || echo "?")
      echo "- [ ] Phase $pnum: $pname — Score $pscore2 ($pgrade2)" >> "$report"
    fi
  done

  cat >> "$report" <<EORESCAN

## RE-SCAN

Phase ไหนที่ reject:

    bash QA-QC_Master/nightwatch/rescan.sh <phase-number>

    ตัวอย่าง: bash QA-QC_Master/nightwatch/rescan.sh 02

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> QA Night Watch v1.0 | $SESSION_ID | $SCAN_MODE mode
> Evidence files: $EVIDENCE_DIR/
EORESCAN

  # Update scan history
  update_scan_history "$avg_score" "$overall_grade"

  echo ""
  echo -e "${GREEN}${BOLD}Report saved: $report${NC}"
  log_progress "REPORT" "Report generated: $report"
}

# ============================================================
# SCAN HISTORY
# ============================================================
update_scan_history() {
  local score="$1"
  local grade="$2"
  local history_file="$RESULTS_DIR/scan-history.json"

  local entry
  entry=$(cat <<EOJSON
{
  "id": "$SESSION_ID",
  "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project": "$PROJECT_NAME",
  "mode": "$SCAN_MODE",
  "score": $score,
  "grade": "$grade",
  "critical": $total_critical,
  "high": $total_high,
  "total_checks": $total_checks
}
EOJSON
  )

  if [[ -f "$history_file" ]]; then
    # Append to existing array
    local existing
    existing=$(cat "$history_file")
    # Remove trailing ] and add new entry
    echo "${existing%]}, $entry]" > "$history_file"
  else
    echo "[$entry]" > "$history_file"
  fi

  log_progress "HISTORY" "Scan history updated"
}
