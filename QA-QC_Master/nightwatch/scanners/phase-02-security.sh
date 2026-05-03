#!/bin/bash
# Phase 02: Security Scanner
# Gitleaks, npm audit, Snyk, secret/vulnerability patterns

run_phase_02() {
  local phase_file="$SESSION_DIR/phase-02.txt"
  > "$phase_file"

  # ── SC-001: Secrets in code ──
  if [[ "$HAS_GITLEAKS" == "true" ]] && [[ "$HAS_GIT" == "true" ]]; then
    local output evidence_path
    output=$(cd "$PROJECT_ROOT" && gitleaks detect --source . --no-banner 2>&1 || true)
    evidence_path=$(save_evidence "SC-001" "$output")
    local leak_count
    leak_count=$(echo "$output" | grep -c "Secret\|RuleID" 2>/dev/null || echo 0)

    if (( leak_count == 0 )); then
      record_check "$phase_file" "pass" "SC-001" "No secrets in code" "leaks: 0" "info" "$evidence_path"
    else
      record_check "$phase_file" "fail" "SC-001" "No secrets in code" "leaks: $leak_count" "critical" "$evidence_path"
    fi
  else
    local ev=$(save_evidence "SC-001" "gitleaks not installed or not a git repo")
    record_check "$phase_file" "skip" "SC-001" "No secrets in code" "gitleaks not available" "info" "$ev"
  fi

  # ── SC-002: Secrets in git history ──
  if [[ "$HAS_GITLEAKS" == "true" ]] && [[ "$HAS_GIT" == "true" ]]; then
    local hist_output hist_evidence
    hist_output=$(cd "$PROJECT_ROOT" && gitleaks detect --source . --log-opts="--all" --no-banner 2>&1 | head -50 || true)
    hist_evidence=$(save_evidence "SC-002" "$hist_output")
    local hist_leaks
    hist_leaks=$(echo "$hist_output" | grep -c "Secret\|RuleID" 2>/dev/null || echo 0)

    if (( hist_leaks == 0 )); then
      record_check "$phase_file" "pass" "SC-002" "No secrets in git history" "leaks: 0" "info" "$hist_evidence"
    else
      record_check "$phase_file" "fail" "SC-002" "No secrets in git history" "leaks: $hist_leaks" "critical" "$hist_evidence"
    fi
  else
    local ev=$(save_evidence "SC-002" "skipped")
    record_check "$phase_file" "skip" "SC-002" "No secrets in git history" "gitleaks not available" "info" "$ev"
  fi

  # ── SC-003: npm audit critical ──
  if [[ -f "$PROJECT_ROOT/package-lock.json" ]]; then
    local audit_output audit_evidence
    audit_output=$(cd "$PROJECT_ROOT" && npm audit --json 2>&1 || true)
    audit_evidence=$(save_evidence "SC-003" "$audit_output")
    local critical_count
    critical_count=$(echo "$audit_output" | node -pe "try{let d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.metadata?d.metadata.vulnerabilities.critical:(d.vulnerabilities?Object.values(d.vulnerabilities).filter(v=>v.severity==='critical').length:0)}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$critical_count" == "-1" ]] || (( critical_count <= TH_NPM_CRITICAL )); then
      record_check "$phase_file" "pass" "SC-003" "npm audit — no critical" "critical: ${critical_count}" "info" "$audit_evidence"
    else
      record_check "$phase_file" "fail" "SC-003" "npm audit — no critical" "critical: $critical_count" "critical" "$audit_evidence"
    fi
  else
    local ev=$(save_evidence "SC-003" "no package-lock.json")
    record_check "$phase_file" "skip" "SC-003" "npm audit — no critical" "no package-lock.json" "info" "$ev"
  fi

  # ── SC-004: npm audit high ──
  if [[ -f "$PROJECT_ROOT/package-lock.json" ]]; then
    local high_count
    high_count=$(echo "$audit_output" | node -pe "try{let d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d.metadata?d.metadata.vulnerabilities.high:(d.vulnerabilities?Object.values(d.vulnerabilities).filter(v=>v.severity==='high').length:0)}catch(e){-1}" 2>/dev/null || echo "-1")
    local ev=$(save_evidence "SC-004" "high=$high_count")

    if [[ "$high_count" == "-1" ]] || (( high_count <= TH_NPM_HIGH )); then
      record_check "$phase_file" "pass" "SC-004" "npm audit — no high" "high: ${high_count}" "info" "$ev"
    else
      record_check "$phase_file" "fail" "SC-004" "npm audit — no high" "high: $high_count" "high" "$ev"
    fi
  else
    local ev=$(save_evidence "SC-004" "no package-lock.json")
    record_check "$phase_file" "skip" "SC-004" "npm audit — no high" "no package-lock.json" "info" "$ev"
  fi

  # ── SC-005: Snyk scan ──
  if [[ "$HAS_SNYK" == "true" ]]; then
    local snyk_output snyk_evidence
    snyk_output=$(cd "$PROJECT_ROOT" && snyk test --json 2>&1 | head -200 || true)
    snyk_evidence=$(save_evidence "SC-005" "$snyk_output")
    local snyk_critical
    snyk_critical=$(echo "$snyk_output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).vulnerabilities.filter(v=>v.severity==='critical').length}catch(e){0}" 2>/dev/null || echo "0")

    if (( snyk_critical <= TH_SNYK_CRITICAL )); then
      record_check "$phase_file" "pass" "SC-005" "Snyk — no critical" "critical: $snyk_critical" "info" "$snyk_evidence"
    else
      record_check "$phase_file" "fail" "SC-005" "Snyk — no critical" "critical: $snyk_critical" "critical" "$snyk_evidence"
    fi
  else
    local ev=$(save_evidence "SC-005" "snyk not installed")
    record_check "$phase_file" "skip" "SC-005" "Snyk — no critical" "snyk not installed" "info" "$ev"
  fi

  # ── SC-006: .env not in git ──
  if [[ "$HAS_GIT" == "true" ]]; then
    local env_tracked env_evidence
    env_tracked=$(cd "$PROJECT_ROOT" && git ls-files .env .env.local .env.production 2>/dev/null)
    env_evidence=$(save_evidence "SC-006" "tracked_env_files: $env_tracked")

    if [[ -z "$env_tracked" ]]; then
      record_check "$phase_file" "pass" "SC-006" ".env not in git" "not tracked" "info" "$env_evidence"
    else
      record_check "$phase_file" "fail" "SC-006" ".env not in git" "TRACKED: $env_tracked" "critical" "$env_evidence"
    fi
  else
    local ev=$(save_evidence "SC-006" "not a git repo")
    record_check "$phase_file" "skip" "SC-006" ".env not in git" "not a git repo" "info" "$ev"
  fi

  # ── SC-007: .env.example exists ──
  local env_ex_evidence
  if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
    env_ex_evidence=$(save_evidence "SC-007" ".env.example exists")
    record_check "$phase_file" "pass" "SC-007" ".env.example exists" "found" "info" "$env_ex_evidence"
  else
    env_ex_evidence=$(save_evidence "SC-007" ".env.example NOT found")
    record_check "$phase_file" "warn" "SC-007" ".env.example exists" "not found" "medium" "$env_ex_evidence"
  fi

  # ── SC-008: Hardcoded API keys in frontend ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local key_patterns key_count key_detail key_evidence
    key_patterns='(sk_live|sk_test|AKIA|AIza|ghp_|gho_|glpat-|xox[bpas]-)'
    key_detail=$(grep -rn -E "$key_patterns" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "\.example" | head -10)
    key_count=$(echo "$key_detail" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$key_detail" ]] && key_count=0
    key_evidence=$(save_evidence "SC-008" "hardcoded_keys=$key_count\n\n$key_detail")

    if (( key_count == 0 )); then
      record_check "$phase_file" "pass" "SC-008" "No hardcoded API keys" "found: 0" "info" "$key_evidence"
    else
      record_check "$phase_file" "fail" "SC-008" "No hardcoded API keys" "found: $key_count" "critical" "$key_evidence"
    fi
  else
    local ev=$(save_evidence "SC-008" "no src/")
    record_check "$phase_file" "skip" "SC-008" "No hardcoded API keys" "no src/" "info" "$ev"
  fi

  # ── SC-009: No eval() usage ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local eval_count eval_detail eval_evidence
    eval_detail=$(grep -rn "eval(" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | head -10)
    eval_count=$(echo "$eval_detail" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$eval_detail" ]] && eval_count=0
    eval_evidence=$(save_evidence "SC-009" "eval_count=$eval_count\n\n$eval_detail")

    if (( eval_count == 0 )); then
      record_check "$phase_file" "pass" "SC-009" "No eval() usage" "count: 0" "info" "$eval_evidence"
    else
      record_check "$phase_file" "fail" "SC-009" "No eval() usage" "count: $eval_count" "high" "$eval_evidence"
    fi
  else
    local ev=$(save_evidence "SC-009" "no src/")
    record_check "$phase_file" "skip" "SC-009" "No eval() usage" "no src/" "info" "$ev"
  fi

  # ── SC-010: No dangerouslySetInnerHTML ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local dsi_count dsi_detail dsi_evidence
    dsi_detail=$(grep -rn "dangerouslySetInnerHTML\|innerHTML" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | head -10)
    dsi_count=$(echo "$dsi_detail" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$dsi_detail" ]] && dsi_count=0
    dsi_evidence=$(save_evidence "SC-010" "innerHTML_count=$dsi_count\n\n$dsi_detail")

    if (( dsi_count == 0 )); then
      record_check "$phase_file" "pass" "SC-010" "No innerHTML/dangerouslySet" "count: 0" "info" "$dsi_evidence"
    else
      record_check "$phase_file" "warn" "SC-010" "No innerHTML/dangerouslySet" "count: $dsi_count — review usage" "high" "$dsi_evidence"
    fi
  else
    local ev=$(save_evidence "SC-010" "no src/")
    record_check "$phase_file" "skip" "SC-010" "No innerHTML/dangerouslySet" "no src/" "info" "$ev"
  fi

  # ── SC-011: CORS wildcard check ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local cors_detail cors_evidence cors_count
    cors_detail=$(grep -rn "Access-Control-Allow-Origin.*\*\|origin.*\*\|cors.*origin.*true" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -10)
    cors_count=$(echo "$cors_detail" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$cors_detail" ]] && cors_count=0
    cors_evidence=$(save_evidence "SC-011" "cors_wildcard=$cors_count\n\n$cors_detail")

    if (( cors_count == 0 )); then
      record_check "$phase_file" "pass" "SC-011" "No CORS wildcard origin" "count: 0" "info" "$cors_evidence"
    else
      record_check "$phase_file" "warn" "SC-011" "No CORS wildcard origin" "count: $cors_count" "high" "$cors_evidence"
    fi
  else
    local ev=$(save_evidence "SC-011" "no src/")
    record_check "$phase_file" "skip" "SC-011" "No CORS wildcard origin" "no src/" "info" "$ev"
  fi

  # ── SC-012: .gitignore has security entries ──
  if [[ -f "$PROJECT_ROOT/.gitignore" ]]; then
    local gi_checks=0 gi_missing=""
    for pattern in ".env" "node_modules" ".next" "*.pem" "*.key"; do
      if grep -q "$pattern" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
        (( gi_checks++ ))
      else
        gi_missing="$gi_missing $pattern"
      fi
    done
    local gi_evidence
    gi_evidence=$(save_evidence "SC-012" "checked=5 found=$gi_checks missing=$gi_missing")

    if (( gi_checks >= 3 )); then
      record_check "$phase_file" "pass" "SC-012" ".gitignore security entries" "found: $gi_checks/5" "info" "$gi_evidence"
    else
      record_check "$phase_file" "warn" "SC-012" ".gitignore security entries" "missing:$gi_missing" "medium" "$gi_evidence"
    fi
  else
    local ev=$(save_evidence "SC-012" "no .gitignore")
    record_check "$phase_file" "fail" "SC-012" ".gitignore security entries" "no .gitignore file" "high" "$ev"
  fi
}
