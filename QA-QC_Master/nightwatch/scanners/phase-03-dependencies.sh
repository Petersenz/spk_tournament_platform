#!/bin/bash
# Phase 03: Dependencies Scanner
# npm audit, depcheck, outdated, license, duplicates

run_phase_03() {
  local phase_file="$SESSION_DIR/phase-03.txt"
  > "$phase_file"

  # ── DP-001: npm audit vulnerabilities ──
  if [[ -f "$PROJECT_ROOT/package-lock.json" ]]; then
    local audit_output audit_evidence
    audit_output=$(cd "$PROJECT_ROOT" && npm audit --json 2>&1 || true)
    audit_evidence=$(save_evidence "DP-001" "$audit_output")
    local total_vulns
    total_vulns=$(echo "$audit_output" | node -pe "try{let d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.metadata?Object.values(d.metadata.vulnerabilities).reduce((a,b)=>a+b,0):(d.vulnerabilities?Object.keys(d.vulnerabilities).length:0)}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$total_vulns" == "-1" ]]; then
      record_check "$phase_file" "warn" "DP-001" "npm audit vulnerabilities" "Could not parse audit output" "medium" "$audit_evidence"
    elif (( total_vulns == 0 )); then
      record_check "$phase_file" "pass" "DP-001" "npm audit vulnerabilities" "vulnerabilities: 0" "info" "$audit_evidence"
    else
      record_check "$phase_file" "warn" "DP-001" "npm audit vulnerabilities" "vulnerabilities: $total_vulns" "high" "$audit_evidence"
    fi
  else
    local ev=$(save_evidence "DP-001" "no package-lock.json")
    record_check "$phase_file" "skip" "DP-001" "npm audit vulnerabilities" "no package-lock.json" "info" "$ev"
  fi

  # ── DP-002: Unused dependencies ──
  if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
    local depcheck_output depcheck_evidence
    depcheck_output=$(cd "$PROJECT_ROOT" && npx depcheck --json 2>&1 || true)
    depcheck_evidence=$(save_evidence "DP-002" "$depcheck_output")
    local unused
    unused=$(echo "$depcheck_output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).dependencies.length}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$unused" == "-1" ]] || (( unused == 0 )); then
      record_check "$phase_file" "pass" "DP-002" "No unused dependencies" "unused: ${unused}" "info" "$depcheck_evidence"
    elif (( unused <= TH_UNUSED_DEPS )); then
      record_check "$phase_file" "pass" "DP-002" "No unused dependencies" "unused: $unused" "info" "$depcheck_evidence"
    else
      record_check "$phase_file" "warn" "DP-002" "No unused dependencies" "unused: $unused (max: $TH_UNUSED_DEPS)" "medium" "$depcheck_evidence"
    fi
  else
    local ev=$(save_evidence "DP-002" "no node_modules — depcheck not available")
    record_check "$phase_file" "skip" "DP-002" "No unused dependencies" "depcheck not available" "info" "$ev"
  fi

  # ── DP-003: Missing dependencies ──
  if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
    local missing_output missing_evidence
    # Reuse depcheck_output if available, otherwise run again
    if [[ -z "$depcheck_output" ]]; then
      missing_output=$(cd "$PROJECT_ROOT" && npx depcheck --json 2>&1 || true)
    else
      missing_output="$depcheck_output"
    fi
    missing_evidence=$(save_evidence "DP-003" "$missing_output")
    local missing_count
    missing_count=$(echo "$missing_output" | node -pe "try{Object.keys(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).missing).length}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$missing_count" == "-1" ]] || (( missing_count == 0 )); then
      record_check "$phase_file" "pass" "DP-003" "No missing dependencies" "missing: ${missing_count}" "info" "$missing_evidence"
    else
      record_check "$phase_file" "fail" "DP-003" "No missing dependencies" "missing: $missing_count" "high" "$missing_evidence"
    fi
  else
    local ev=$(save_evidence "DP-003" "no node_modules — depcheck not available")
    record_check "$phase_file" "skip" "DP-003" "No missing dependencies" "depcheck not available" "info" "$ev"
  fi

  # ── DP-004: Lock file exists + synced ──
  if [[ -f "$PROJECT_ROOT/package-lock.json" ]]; then
    local sync_output sync_evidence
    sync_output=$(cd "$PROJECT_ROOT" && npm ci --dry-run 2>&1 || true)
    sync_evidence=$(save_evidence "DP-004" "$sync_output")
    local sync_ok
    sync_ok=$(echo "$sync_output" | grep -c "npm error\|ERR!" 2>/dev/null || echo 0)

    if (( sync_ok == 0 )); then
      record_check "$phase_file" "pass" "DP-004" "Lock file synced" "package-lock.json in sync" "info" "$sync_evidence"
    else
      record_check "$phase_file" "fail" "DP-004" "Lock file synced" "package-lock.json out of sync" "high" "$sync_evidence"
    fi
  else
    local ev=$(save_evidence "DP-004" "no package-lock.json found")
    record_check "$phase_file" "fail" "DP-004" "Lock file synced" "no package-lock.json" "high" "$ev"
  fi

  # ── DP-005: Outdated major versions ──
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local outdated_output outdated_evidence
    outdated_output=$(cd "$PROJECT_ROOT" && npm outdated --json 2>&1 || true)
    outdated_evidence=$(save_evidence "DP-005" "$outdated_output")
    local major_count
    major_count=$(echo "$outdated_output" | node -pe "
      try {
        let d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        let count = 0;
        for (let pkg in d) {
          let cur = (d[pkg].current || '0.0.0').split('.')[0];
          let lat = (d[pkg].latest || '0.0.0').split('.')[0];
          if (cur !== lat) count++;
        }
        count;
      } catch(e) { 0 }
    " 2>/dev/null || echo "0")

    if (( major_count <= TH_OUTDATED_MAJOR )); then
      record_check "$phase_file" "pass" "DP-005" "No outdated major versions" "major outdated: $major_count" "info" "$outdated_evidence"
    else
      record_check "$phase_file" "warn" "DP-005" "No outdated major versions" "major outdated: $major_count (max: $TH_OUTDATED_MAJOR)" "high" "$outdated_evidence"
    fi
  else
    local ev=$(save_evidence "DP-005" "no package.json")
    record_check "$phase_file" "skip" "DP-005" "No outdated major versions" "no package.json" "info" "$ev"
  fi

  # ── DP-006: Outdated minor versions ──
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local minor_evidence
    # Reuse outdated_output from DP-005
    minor_evidence=$(save_evidence "DP-006" "$outdated_output")
    local minor_count
    minor_count=$(echo "$outdated_output" | node -pe "
      try {
        let d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        let count = 0;
        for (let pkg in d) {
          let cur = (d[pkg].current || '0.0.0').split('.');
          let lat = (d[pkg].latest || '0.0.0').split('.');
          if (cur[0] === lat[0] && cur[1] !== lat[1]) count++;
        }
        count;
      } catch(e) { 0 }
    " 2>/dev/null || echo "0")

    if (( minor_count <= TH_OUTDATED_MINOR )); then
      record_check "$phase_file" "pass" "DP-006" "Outdated minor versions" "minor outdated: $minor_count" "info" "$minor_evidence"
    else
      record_check "$phase_file" "warn" "DP-006" "Outdated minor versions" "minor outdated: $minor_count (max: $TH_OUTDATED_MINOR)" "medium" "$minor_evidence"
    fi
  else
    local ev=$(save_evidence "DP-006" "no package.json")
    record_check "$phase_file" "skip" "DP-006" "Outdated minor versions" "no package.json" "info" "$ev"
  fi

  # ── DP-007: License check ──
  if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
    local license_output license_evidence
    license_output=$(cd "$PROJECT_ROOT" && npx license-checker --json --production 2>&1 || true)
    license_evidence=$(save_evidence "DP-007" "$license_output")
    local gpl_count
    gpl_count=$(echo "$license_output" | grep -ci "GPL" 2>/dev/null || echo 0)

    if (( gpl_count == 0 )); then
      record_check "$phase_file" "pass" "DP-007" "No GPL licenses" "GPL packages: 0" "info" "$license_evidence"
    else
      record_check "$phase_file" "warn" "DP-007" "No GPL licenses" "GPL packages: $gpl_count — review required" "high" "$license_evidence"
    fi
  else
    local ev=$(save_evidence "DP-007" "no node_modules — license-checker not available")
    record_check "$phase_file" "skip" "DP-007" "No GPL licenses" "license-checker not available" "info" "$ev"
  fi

  # ── DP-008: Duplicate packages ──
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local ls_output ls_evidence
    ls_output=$(cd "$PROJECT_ROOT" && npm ls --all --json 2>&1 || true)
    ls_evidence=$(save_evidence "DP-008" "$(echo "$ls_output" | head -100)")
    local deduped_count
    deduped_count=$(echo "$ls_output" | grep -c "deduped" 2>/dev/null || echo 0)

    if (( deduped_count == 0 )); then
      record_check "$phase_file" "pass" "DP-008" "No duplicate packages" "duplicates: 0" "info" "$ls_evidence"
    elif (( deduped_count <= 10 )); then
      record_check "$phase_file" "pass" "DP-008" "No duplicate packages" "deduped: $deduped_count (acceptable)" "info" "$ls_evidence"
    else
      record_check "$phase_file" "warn" "DP-008" "No duplicate packages" "deduped: $deduped_count — consider npm dedupe" "low" "$ls_evidence"
    fi
  else
    local ev=$(save_evidence "DP-008" "no package.json")
    record_check "$phase_file" "skip" "DP-008" "No duplicate packages" "no package.json" "info" "$ev"
  fi
}
