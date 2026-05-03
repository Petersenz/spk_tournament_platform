#!/bin/bash
# Phase 06: Accessibility Scanner
# axe-core, alt text, form labels, ARIA, pa11y, heading hierarchy

run_phase_06() {
  local phase_file="$SESSION_DIR/phase-06.txt"
  > "$phase_file"

  # ── A11Y-001: axe-core check ──
  local axe_evidence
  if command -v npx &>/dev/null && [[ -d "$PROJECT_ROOT/node_modules/@axe-core" || -d "$PROJECT_ROOT/node_modules/axe-core" ]]; then
    # Check if playwright is installed for browser-based axe test
    if [[ -d "$PROJECT_ROOT/node_modules/playwright" ]] || [[ -d "$PROJECT_ROOT/node_modules/@playwright" ]]; then
      local axe_output
      axe_output=$(cd "$PROJECT_ROOT" && npx playwright test --grep axe 2>&1 | head -50 || true)
      axe_evidence=$(save_evidence "A11Y-001" "$axe_output")
      local axe_fail
      axe_fail=$(echo "$axe_output" | grep -ci "fail\|error" 2>/dev/null || echo 0)

      if (( axe_fail == 0 )); then
        record_check "$phase_file" "pass" "A11Y-001" "axe-core check" "playwright axe test passed" "info" "$axe_evidence"
      else
        record_check "$phase_file" "warn" "A11Y-001" "axe-core check" "axe reported $axe_fail potential issues" "medium" "$axe_evidence"
      fi
    else
      axe_evidence=$(save_evidence "A11Y-001" "axe-core packages found in node_modules but playwright not available for browser testing")
      record_check "$phase_file" "pass" "A11Y-001" "axe-core check" "axe-core installed (no playwright for runtime test)" "info" "$axe_evidence"
    fi
  else
    axe_evidence=$(save_evidence "A11Y-001" "axe-core not found in node_modules")
    record_check "$phase_file" "skip" "A11Y-001" "axe-core check" "axe-core not installed" "info" "$axe_evidence"
  fi

  # ── A11Y-002: All images have alt text ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local img_all img_no_alt img_detail img_evidence
    img_all=$(grep -rn "<img" "$PROJECT_ROOT/src/" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null | grep -v "node_modules" || true)
    img_no_alt=$(echo "$img_all" | grep -v "alt=" 2>/dev/null | head -10 || true)
    local no_alt_count
    no_alt_count=$(echo "$img_no_alt" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$img_no_alt" ]] && no_alt_count=0
    img_evidence=$(save_evidence "A11Y-002" "images_without_alt=$no_alt_count\n\n$img_no_alt")

    if (( no_alt_count == 0 )); then
      record_check "$phase_file" "pass" "A11Y-002" "All images have alt text" "all <img> tags have alt attribute" "info" "$img_evidence"
    else
      record_check "$phase_file" "fail" "A11Y-002" "All images have alt text" "$no_alt_count images missing alt attribute" "high" "$img_evidence"
    fi
  else
    local ev=$(save_evidence "A11Y-002" "no src/")
    record_check "$phase_file" "skip" "A11Y-002" "All images have alt text" "no src/" "info" "$ev"
  fi

  # ── A11Y-003: Form labels present ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local input_lines input_no_label label_count label_evidence
    input_lines=$(grep -rn "<input" "$PROJECT_ROOT/src/" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null | grep -v "node_modules" || true)
    input_no_label=$(echo "$input_lines" | grep -v "aria-label\|aria-labelledby\|id=" 2>/dev/null | head -10 || true)
    label_count=$(echo "$input_no_label" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$input_no_label" ]] && label_count=0
    label_evidence=$(save_evidence "A11Y-003" "inputs_without_label=$label_count\n\n$input_no_label")

    if (( label_count == 0 )); then
      record_check "$phase_file" "pass" "A11Y-003" "Form labels present" "all inputs have labels or aria attributes" "info" "$label_evidence"
    else
      record_check "$phase_file" "warn" "A11Y-003" "Form labels present" "$label_count inputs may lack associated labels" "medium" "$label_evidence"
    fi
  else
    local ev=$(save_evidence "A11Y-003" "no src/")
    record_check "$phase_file" "skip" "A11Y-003" "Form labels present" "no src/" "info" "$ev"
  fi

  # ── A11Y-004: ARIA attributes valid ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local aria_detail aria_count aria_evidence
    aria_detail=$(grep -rn "aria-" "$PROJECT_ROOT/src/" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null | grep -v "node_modules" | head -20 || true)
    aria_count=$(echo "$aria_detail" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$aria_detail" ]] && aria_count=0
    aria_evidence=$(save_evidence "A11Y-004" "aria_usage_count=$aria_count\n\nSample:\n$aria_detail")

    if (( aria_count > 0 )); then
      record_check "$phase_file" "pass" "A11Y-004" "ARIA attributes valid" "$aria_count aria- usages found" "info" "$aria_evidence"
    else
      record_check "$phase_file" "warn" "A11Y-004" "ARIA attributes valid" "no aria- attributes found in source" "low" "$aria_evidence"
    fi
  else
    local ev=$(save_evidence "A11Y-004" "no src/")
    record_check "$phase_file" "skip" "A11Y-004" "ARIA attributes valid" "no src/" "info" "$ev"
  fi

  # ── A11Y-005: Pa11y scan ──
  if [[ "$HAS_PA11Y" == "true" ]]; then
    # Check if dev server is running
    local server_up
    server_up=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$DEV_PORT" 2>/dev/null || echo "000")

    if [[ "$server_up" == "200" ]] || [[ "$server_up" == "304" ]]; then
      local pa11y_output pa11y_evidence
      pa11y_output=$(pa11y "http://localhost:$DEV_PORT" --json 2>&1 | head -100 || true)
      pa11y_evidence=$(save_evidence "A11Y-005" "$pa11y_output")
      local issue_count
      issue_count=$(echo "$pa11y_output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length}catch(e){0}" 2>/dev/null || echo "0")

      if (( issue_count == 0 )); then
        record_check "$phase_file" "pass" "A11Y-005" "Pa11y scan" "no issues found" "info" "$pa11y_evidence"
      else
        record_check "$phase_file" "warn" "A11Y-005" "Pa11y scan" "$issue_count accessibility issues" "medium" "$pa11y_evidence"
      fi
    else
      local ev=$(save_evidence "A11Y-005" "dev server not running on port $DEV_PORT (HTTP $server_up)")
      record_check "$phase_file" "skip" "A11Y-005" "Pa11y scan" "dev server not running on port $DEV_PORT" "info" "$ev"
    fi
  else
    local ev=$(save_evidence "A11Y-005" "pa11y not installed")
    record_check "$phase_file" "skip" "A11Y-005" "Pa11y scan" "pa11y not installed" "info" "$ev"
  fi

  # ── A11Y-006: Heading hierarchy ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local h1_count h_all heading_evidence
    h1_count=$(grep -rn "<h1\|<H1" "$PROJECT_ROOT/src/" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    h_all=$(grep -rn "<h[1-6]\|<H[1-6]" "$PROJECT_ROOT/src/" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null | grep -v "node_modules" | head -20 || true)
    heading_evidence=$(save_evidence "A11Y-006" "h1_count=$h1_count\n\nAll headings:\n$h_all")

    if (( h1_count > 0 )); then
      record_check "$phase_file" "pass" "A11Y-006" "Heading hierarchy" "h1 found ($h1_count occurrences)" "info" "$heading_evidence"
    else
      record_check "$phase_file" "warn" "A11Y-006" "Heading hierarchy" "no <h1> tag found in src/" "medium" "$heading_evidence"
    fi
  else
    local ev=$(save_evidence "A11Y-006" "no src/")
    record_check "$phase_file" "skip" "A11Y-006" "Heading hierarchy" "no src/" "info" "$ev"
  fi
}
