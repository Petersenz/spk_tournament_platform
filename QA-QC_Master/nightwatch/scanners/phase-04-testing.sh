#!/bin/bash
# Phase 04: Testing Scanner
# Unit tests, coverage, E2E, test quality, config

run_phase_04() {
  local phase_file="$SESSION_DIR/phase-04.txt"
  > "$phase_file"

  # Detect test runner
  local test_runner=""
  if [[ "$HAS_VITEST" == "true" ]]; then
    test_runner="vitest"
  elif [[ "$HAS_JEST" == "true" ]]; then
    test_runner="jest"
  fi

  # ── TS-001: Unit tests pass ──
  if [[ -n "$test_runner" ]]; then
    local test_output test_evidence test_exit
    if [[ "$test_runner" == "vitest" ]]; then
      test_output=$(cd "$PROJECT_ROOT" && npx vitest run 2>&1)
      test_exit=$?
    else
      test_output=$(cd "$PROJECT_ROOT" && npx jest 2>&1)
      test_exit=$?
    fi
    test_evidence=$(save_evidence "TS-001" "$test_output")

    if (( test_exit == 0 )); then
      record_check "$phase_file" "pass" "TS-001" "Unit tests pass" "exit code: 0 ($test_runner)" "info" "$test_evidence"
    else
      record_check "$phase_file" "fail" "TS-001" "Unit tests pass" "exit code: $test_exit ($test_runner)" "critical" "$test_evidence"
    fi
  else
    local ev=$(save_evidence "TS-001" "no test runner detected (vitest/jest)")
    record_check "$phase_file" "skip" "TS-001" "Unit tests pass" "no test runner found" "info" "$ev"
  fi

  # ── TS-002: Test coverage > threshold ──
  if [[ -n "$test_runner" ]]; then
    local cov_output cov_evidence cov_pct
    if [[ "$test_runner" == "vitest" ]]; then
      cov_output=$(cd "$PROJECT_ROOT" && npx vitest run --coverage 2>&1 || true)
    else
      cov_output=$(cd "$PROJECT_ROOT" && npx jest --coverage 2>&1 || true)
    fi
    cov_evidence=$(save_evidence "TS-002" "$cov_output")

    # Parse coverage percentage from summary line (e.g., "All files  |  85.5 |")
    cov_pct=$(echo "$cov_output" | grep -E "All files\s*\|" | head -1 | awk -F'|' '{gsub(/[[:space:]]/,"",$2); print $2}' 2>/dev/null || echo "0")
    [[ -z "$cov_pct" ]] && cov_pct="0"

    local cov_int
    cov_int=$(echo "$cov_pct" | awk '{printf "%d", $1}' 2>/dev/null || echo "0")

    if (( cov_int >= TH_TEST_COVERAGE )); then
      record_check "$phase_file" "pass" "TS-002" "Test coverage" "coverage: ${cov_pct}% (min: ${TH_TEST_COVERAGE}%)" "info" "$cov_evidence"
    else
      record_check "$phase_file" "fail" "TS-002" "Test coverage" "coverage: ${cov_pct}% (min: ${TH_TEST_COVERAGE}%)" "high" "$cov_evidence"
    fi
  else
    local ev=$(save_evidence "TS-002" "no test runner detected")
    record_check "$phase_file" "skip" "TS-002" "Test coverage" "no test runner found" "info" "$ev"
  fi

  # ── TS-003: No skipped tests ──
  local test_dirs=("$PROJECT_ROOT/src" "$PROJECT_ROOT/tests" "$PROJECT_ROOT/test" "$PROJECT_ROOT/__tests__")
  local skip_count=0 skip_detail="" skip_evidence
  for dir in "${test_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      local found
      found=$(grep -rn "\.skip(" "$dir" --include="*.test.*" --include="*.spec.*" 2>/dev/null | grep -v "node_modules" || true)
      if [[ -n "$found" ]]; then
        skip_detail="$skip_detail$found"$'\n'
        skip_count=$(( skip_count + $(echo "$found" | wc -l | tr -d ' ') ))
      fi
    fi
  done
  skip_evidence=$(save_evidence "TS-003" "skipped_tests=$skip_count\n\n$skip_detail")

  if (( skip_count == 0 )); then
    record_check "$phase_file" "pass" "TS-003" "No skipped tests" "skipped: 0" "info" "$skip_evidence"
  else
    record_check "$phase_file" "warn" "TS-003" "No skipped tests" "skipped: $skip_count" "medium" "$skip_evidence"
  fi

  # ── TS-004: No .only tests ──
  local only_count=0 only_detail="" only_evidence
  for dir in "${test_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      local found
      found=$(grep -rn "\.only(" "$dir" --include="*.test.*" --include="*.spec.*" 2>/dev/null | grep -v "node_modules" || true)
      if [[ -n "$found" ]]; then
        only_detail="$only_detail$found"$'\n'
        only_count=$(( only_count + $(echo "$found" | wc -l | tr -d ' ') ))
      fi
    fi
  done
  only_evidence=$(save_evidence "TS-004" "only_tests=$only_count\n\n$only_detail")

  if (( only_count == 0 )); then
    record_check "$phase_file" "pass" "TS-004" "No .only tests" "only: 0" "info" "$only_evidence"
  else
    record_check "$phase_file" "fail" "TS-004" "No .only tests" "only: $only_count — will skip other tests" "high" "$only_evidence"
  fi

  # ── TS-005: E2E tests exist ──
  if [[ "$HAS_PLAYWRIGHT" == "true" ]]; then
    local e2e_files e2e_count e2e_evidence
    e2e_files=$(find "$PROJECT_ROOT" -path "*/e2e/*.spec.*" -o -path "*/e2e/*.test.*" -o -path "*/__e2e__/*.spec.*" 2>/dev/null | grep -v "node_modules" || true)
    [[ -z "$e2e_files" ]] && e2e_files=$(find "$PROJECT_ROOT" -name "*.spec.ts" -path "*/tests/*" 2>/dev/null | grep -v "node_modules" || true)
    e2e_count=$(echo "$e2e_files" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$e2e_files" ]] && e2e_count=0
    e2e_evidence=$(save_evidence "TS-005" "e2e_files=$e2e_count\n\n$e2e_files")

    if (( e2e_count > 0 )); then
      record_check "$phase_file" "pass" "TS-005" "E2E tests exist" "e2e files: $e2e_count" "info" "$e2e_evidence"
    else
      record_check "$phase_file" "warn" "TS-005" "E2E tests exist" "playwright config found but no test files" "medium" "$e2e_evidence"
    fi
  else
    local ev=$(save_evidence "TS-005" "no playwright config found")
    record_check "$phase_file" "skip" "TS-005" "E2E tests exist" "no playwright config" "info" "$ev"
  fi

  # ── TS-006: E2E tests pass ──
  if [[ "$HAS_PLAYWRIGHT" == "true" ]]; then
    local e2e_output e2e_exit e2e_run_evidence
    e2e_output=$(cd "$PROJECT_ROOT" && npx playwright test 2>&1)
    e2e_exit=$?
    e2e_run_evidence=$(save_evidence "TS-006" "$e2e_output")

    if (( e2e_exit == 0 )); then
      record_check "$phase_file" "pass" "TS-006" "E2E tests pass" "exit code: 0" "info" "$e2e_run_evidence"
    else
      record_check "$phase_file" "fail" "TS-006" "E2E tests pass" "exit code: $e2e_exit" "high" "$e2e_run_evidence"
    fi
  else
    local ev=$(save_evidence "TS-006" "playwright not configured")
    record_check "$phase_file" "skip" "TS-006" "E2E tests pass" "playwright not configured" "info" "$ev"
  fi

  # ── TS-007: Test file ratio ──
  local src_files=0 test_files_count=0 ratio_evidence
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    src_files=$(find "$PROJECT_ROOT/src" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "\.test\." | grep -v "\.spec\." | wc -l | tr -d ' ')
  fi
  for dir in "${test_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      local count
      count=$(find "$dir" \( -name "*.test.*" -o -name "*.spec.*" \) 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
      test_files_count=$(( test_files_count + count ))
    fi
  done
  ratio_evidence=$(save_evidence "TS-007" "src_files=$src_files test_files=$test_files_count")

  if (( src_files == 0 )); then
    record_check "$phase_file" "skip" "TS-007" "Test file ratio" "no src files found" "info" "$ratio_evidence"
  else
    local ratio=$(( test_files_count * 100 / src_files ))
    if (( ratio >= 20 )); then
      record_check "$phase_file" "pass" "TS-007" "Test file ratio" "ratio: ${ratio}% ($test_files_count tests / $src_files src)" "info" "$ratio_evidence"
    else
      record_check "$phase_file" "warn" "TS-007" "Test file ratio" "ratio: ${ratio}% (min: 20%) — $test_files_count tests / $src_files src" "medium" "$ratio_evidence"
    fi
  fi

  # ── TS-008: No empty test files ──
  local empty_tests=0 empty_detail="" empty_evidence
  for dir in "${test_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      local test_file_list
      test_file_list=$(find "$dir" \( -name "*.test.*" -o -name "*.spec.*" \) 2>/dev/null | grep -v "node_modules" || true)
      while IFS= read -r f; do
        [[ -z "$f" ]] && continue
        local has_assert
        has_assert=$(grep -c "expect\|assert\|should\|toBe\|toEqual\|toContain\|toHaveBeenCalled" "$f" 2>/dev/null || echo 0)
        if (( has_assert == 0 )); then
          empty_detail="$empty_detail$f"$'\n'
          (( empty_tests++ ))
        fi
      done <<< "$test_file_list"
    fi
  done
  empty_evidence=$(save_evidence "TS-008" "empty_test_files=$empty_tests\n\n$empty_detail")

  if (( empty_tests == 0 )); then
    record_check "$phase_file" "pass" "TS-008" "No empty test files" "all test files have assertions" "info" "$empty_evidence"
  else
    record_check "$phase_file" "warn" "TS-008" "No empty test files" "empty tests: $empty_tests — no expect/assert found" "medium" "$empty_evidence"
  fi

  # ── TS-009: Test execution time < 300s ──
  if [[ -n "$test_runner" ]]; then
    local time_start time_end time_elapsed time_evidence time_output
    time_start=$(date +%s)
    if [[ "$test_runner" == "vitest" ]]; then
      time_output=$(cd "$PROJECT_ROOT" && npx vitest run 2>&1 || true)
    else
      time_output=$(cd "$PROJECT_ROOT" && npx jest 2>&1 || true)
    fi
    time_end=$(date +%s)
    time_elapsed=$(( time_end - time_start ))
    time_evidence=$(save_evidence "TS-009" "execution_time=${time_elapsed}s\n\n$(echo "$time_output" | tail -10)")

    if (( time_elapsed < 300 )); then
      record_check "$phase_file" "pass" "TS-009" "Test execution time" "time: ${time_elapsed}s (max: 300s)" "info" "$time_evidence"
    else
      record_check "$phase_file" "warn" "TS-009" "Test execution time" "time: ${time_elapsed}s (max: 300s) — tests too slow" "medium" "$time_evidence"
    fi
  else
    local ev=$(save_evidence "TS-009" "no test runner detected")
    record_check "$phase_file" "skip" "TS-009" "Test execution time" "no test runner found" "info" "$ev"
  fi

  # ── TS-010: Test config exists ──
  local config_evidence config_found=""
  if [[ "$HAS_VITEST" == "true" ]]; then
    config_found="vitest"
  elif [[ "$HAS_JEST" == "true" ]]; then
    config_found="jest"
  fi

  if [[ -n "$config_found" ]]; then
    config_evidence=$(save_evidence "TS-010" "test config found: $config_found")
    record_check "$phase_file" "pass" "TS-010" "Test config exists" "config: $config_found" "info" "$config_evidence"
  else
    config_evidence=$(save_evidence "TS-010" "no vitest.config or jest.config found")
    record_check "$phase_file" "fail" "TS-010" "Test config exists" "no test config found" "medium" "$config_evidence"
  fi
}
