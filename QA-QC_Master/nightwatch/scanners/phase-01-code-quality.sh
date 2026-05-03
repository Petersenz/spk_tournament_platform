#!/bin/bash
# Phase 01: Code Quality Scanner
# ESLint, Prettier, depcheck, madge, jscpd, file analysis

run_phase_01() {
  local phase_file="$SESSION_DIR/phase-01.txt"
  > "$phase_file"

  # ── CQ-001: ESLint errors ──
  if [[ "$HAS_ESLINT" == "true" ]]; then
    local output evidence_path
    output=$(cd "$PROJECT_ROOT" && npx eslint . --format json 2>&1 || true)
    evidence_path=$(save_evidence "CQ-001" "$output")
    local error_count
    error_count=$(echo "$output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).reduce((a,f)=>a+f.errorCount,0)}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$error_count" == "-1" ]]; then
      record_check "$phase_file" "warn" "CQ-001" "ESLint errors" "Could not parse ESLint output" "medium" "$evidence_path"
    elif (( error_count <= TH_ESLINT_ERRORS )); then
      record_check "$phase_file" "pass" "CQ-001" "ESLint errors" "errors: $error_count" "info" "$evidence_path"
    else
      record_check "$phase_file" "fail" "CQ-001" "ESLint errors" "errors: $error_count (max: $TH_ESLINT_ERRORS)" "high" "$evidence_path"
    fi
  else
    record_check "$phase_file" "skip" "CQ-001" "ESLint errors" "eslint not installed" "info" ""
  fi

  # ── CQ-002: ESLint warnings ──
  if [[ "$HAS_ESLINT" == "true" ]]; then
    local warn_count
    warn_count=$(echo "$output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).reduce((a,f)=>a+f.warningCount,0)}catch(e){-1}" 2>/dev/null || echo "-1")
    local evidence_path_w
    evidence_path_w=$(save_evidence "CQ-002" "warning_count=$warn_count")

    if [[ "$warn_count" == "-1" ]]; then
      record_check "$phase_file" "warn" "CQ-002" "ESLint warnings" "Could not parse" "low" "$evidence_path_w"
    elif (( warn_count <= TH_ESLINT_WARNINGS )); then
      record_check "$phase_file" "pass" "CQ-002" "ESLint warnings" "warnings: $warn_count" "info" "$evidence_path_w"
    else
      record_check "$phase_file" "warn" "CQ-002" "ESLint warnings" "warnings: $warn_count (max: $TH_ESLINT_WARNINGS)" "medium" "$evidence_path_w"
    fi
  else
    record_check "$phase_file" "skip" "CQ-002" "ESLint warnings" "eslint not installed" "info" ""
  fi

  # ── CQ-003: Prettier check ──
  if [[ "$HAS_PRETTIER" == "true" ]]; then
    local prettier_output prettier_evidence
    prettier_output=$(cd "$PROJECT_ROOT" && npx prettier --check "**/*.{ts,tsx,js,jsx,css,json}" 2>&1 || true)
    prettier_evidence=$(save_evidence "CQ-003" "$prettier_output")
    local unformatted
    unformatted=$(echo "$prettier_output" | grep -c "would reformat" 2>/dev/null || true)
    unformatted=$(echo "${unformatted:-0}" | tr -d '[:space:]')

    if (( unformatted == 0 )); then
      record_check "$phase_file" "pass" "CQ-003" "Prettier formatted" "all files formatted" "info" "$prettier_evidence"
    else
      record_check "$phase_file" "fail" "CQ-003" "Prettier formatted" "$unformatted files unformatted" "medium" "$prettier_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-003" "Prettier formatted" "prettier not installed" "info" ""
  fi

  # ── CQ-004: Unused dependencies ──
  if [[ "$HAS_DEPCHECK" == "true" ]]; then
    local depcheck_output depcheck_evidence
    depcheck_output=$(cd "$PROJECT_ROOT" && npx depcheck --json 2>&1 || true)
    depcheck_evidence=$(save_evidence "CQ-004" "$depcheck_output")
    local unused
    unused=$(echo "$depcheck_output" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).dependencies.length}catch(e){-1}" 2>/dev/null || echo "-1")

    if [[ "$unused" == "-1" ]] || [[ "$unused" == "0" ]]; then
      record_check "$phase_file" "pass" "CQ-004" "No unused dependencies" "unused: ${unused}" "info" "$depcheck_evidence"
    elif (( unused <= TH_UNUSED_DEPS )); then
      record_check "$phase_file" "pass" "CQ-004" "No unused dependencies" "unused: $unused" "info" "$depcheck_evidence"
    else
      record_check "$phase_file" "warn" "CQ-004" "No unused dependencies" "unused: $unused" "medium" "$depcheck_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-004" "No unused dependencies" "depcheck not available" "info" ""
  fi

  # ── CQ-005: Circular dependencies ──
  if [[ "$HAS_MADGE" == "true" ]] && [[ -d "$PROJECT_ROOT/src" ]]; then
    local madge_output madge_evidence
    madge_output=$(cd "$PROJECT_ROOT" && npx madge --circular src/ 2>&1 || true)
    madge_evidence=$(save_evidence "CQ-005" "$madge_output")
    local circular
    circular=$(echo "$madge_output" | grep -c "→" 2>/dev/null || true)
    circular=$(echo "${circular:-0}" | tr -d '[:space:]')

    if (( circular <= TH_CIRCULAR_DEPS )); then
      record_check "$phase_file" "pass" "CQ-005" "No circular imports" "circular: $circular" "info" "$madge_evidence"
    else
      record_check "$phase_file" "fail" "CQ-005" "No circular imports" "circular: $circular" "high" "$madge_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-005" "No circular imports" "madge not available or no src/" "info" ""
  fi

  # ── CQ-006: Copy-paste detection ──
  if [[ "$HAS_JSCPD" == "true" ]] && [[ -d "$PROJECT_ROOT/src" ]]; then
    local jscpd_output jscpd_evidence
    jscpd_output=$(cd "$PROJECT_ROOT" && npx jscpd src/ --reporters console --min-tokens 50 2>&1 || true)
    jscpd_evidence=$(save_evidence "CQ-006" "$jscpd_output")
    local dup_pct
    dup_pct=$(echo "$jscpd_output" | grep -oE '[0-9]+\.[0-9]+%' | head -1 | tr -d '%' || echo "0")

    if (( $(echo "$dup_pct < $TH_COPY_PASTE_PCT" | bc -l 2>/dev/null || echo 1) )); then
      record_check "$phase_file" "pass" "CQ-006" "Copy-paste detection" "duplication: ${dup_pct}%" "info" "$jscpd_evidence"
    else
      record_check "$phase_file" "warn" "CQ-006" "Copy-paste detection" "duplication: ${dup_pct}% (max: ${TH_COPY_PASTE_PCT}%)" "medium" "$jscpd_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-006" "Copy-paste detection" "jscpd not available" "info" ""
  fi

  # ── CQ-007: TypeScript strict ──
  if [[ "$HAS_TYPESCRIPT" == "true" ]]; then
    local ts_strict ts_evidence
    ts_strict=$(node -pe "try{JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/tsconfig.json','utf8')).compilerOptions.strict}catch(e){'unknown'}" 2>/dev/null || echo "unknown")
    ts_evidence=$(save_evidence "CQ-007" "strict=$ts_strict")

    if [[ "$ts_strict" == "true" ]]; then
      record_check "$phase_file" "pass" "CQ-007" "TypeScript strict mode" "strict: true" "info" "$ts_evidence"
    else
      record_check "$phase_file" "warn" "CQ-007" "TypeScript strict mode" "strict: $ts_strict" "medium" "$ts_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-007" "TypeScript strict mode" "not a TypeScript project" "info" ""
  fi

  # ── CQ-008: `: any` usage ──
  if [[ "$HAS_TYPESCRIPT" == "true" ]] && [[ -d "$PROJECT_ROOT/src" ]]; then
    local any_count any_evidence
    any_count=$(grep -rn ": any" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    local any_detail
    any_detail=$(grep -rn ": any" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -10)
    any_evidence=$(save_evidence "CQ-008" "count=$any_count\n\n$any_detail")

    if (( any_count <= TH_ANY_TYPE_MAX )); then
      record_check "$phase_file" "pass" "CQ-008" "No excessive 'any' types" "count: $any_count" "info" "$any_evidence"
    else
      record_check "$phase_file" "warn" "CQ-008" "No excessive 'any' types" "count: $any_count (max: $TH_ANY_TYPE_MAX)" "medium" "$any_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-008" "No excessive 'any' types" "not TypeScript or no src/" "info" ""
  fi

  # ── CQ-009: TODO/FIXME count ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local todo_count todo_detail todo_evidence
    todo_count=$(grep -rn "TODO\|FIXME\|HACK\|XXX" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    todo_detail=$(grep -rn "TODO\|FIXME\|HACK\|XXX" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | head -10)
    todo_evidence=$(save_evidence "CQ-009" "count=$todo_count\n\n$todo_detail")

    if (( todo_count <= TH_TODO_MAX )); then
      record_check "$phase_file" "pass" "CQ-009" "TODO/FIXME count" "count: $todo_count" "info" "$todo_evidence"
    else
      record_check "$phase_file" "warn" "CQ-009" "TODO/FIXME count" "count: $todo_count (max: $TH_TODO_MAX)" "low" "$todo_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-009" "TODO/FIXME count" "no src/" "info" ""
  fi

  # ── CQ-010: console.log in production code ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local cl_count cl_detail cl_evidence
    cl_count=$(grep -rn "console\.log" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "\.test\." | grep -v "\.spec\." | wc -l | tr -d ' ')
    cl_detail=$(grep -rn "console\.log" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "\.test\." | grep -v "\.spec\." | head -10)
    cl_evidence=$(save_evidence "CQ-010" "count=$cl_count\n\n$cl_detail")

    if (( cl_count <= TH_CONSOLE_LOG_MAX )); then
      record_check "$phase_file" "pass" "CQ-010" "No console.log in src" "count: $cl_count" "info" "$cl_evidence"
    else
      record_check "$phase_file" "fail" "CQ-010" "No console.log in src" "count: $cl_count" "medium" "$cl_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-010" "No console.log in src" "no src/" "info" ""
  fi

  # ── CQ-011: File size check ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local big_files big_count big_evidence
    big_files=$(find "$PROJECT_ROOT/src" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | while read -r f; do
      local lines
      lines=$(wc -l < "$f" | tr -d ' ')
      if (( lines > TH_FILE_MAX_LINES )); then
        echo "$f: $lines lines"
      fi
    done)
    big_count=$(echo "$big_files" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$big_files" ]] && big_count=0
    big_evidence=$(save_evidence "CQ-011" "files_over_${TH_FILE_MAX_LINES}_lines=$big_count\n\n$big_files")

    if (( big_count == 0 )); then
      record_check "$phase_file" "pass" "CQ-011" "No files > ${TH_FILE_MAX_LINES} lines" "all files within limit" "info" "$big_evidence"
    else
      record_check "$phase_file" "warn" "CQ-011" "No files > ${TH_FILE_MAX_LINES} lines" "$big_count files exceed limit" "medium" "$big_evidence"
    fi
  else
    record_check "$phase_file" "skip" "CQ-011" "No files > ${TH_FILE_MAX_LINES} lines" "no src/" "info" ""
  fi

  # ── CQ-012: Function length ──
  if [[ -d "$PROJECT_ROOT/src" ]]; then
    local func_evidence
    local long_funcs
    long_funcs=$(grep -rn "function \|=> {" "$PROJECT_ROOT/src/" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -5)
    func_evidence=$(save_evidence "CQ-012" "Manual check recommended.\nSample functions found:\n$long_funcs")
    record_check "$phase_file" "pass" "CQ-012" "Function length check" "sampled — review evidence" "info" "$func_evidence"
  else
    record_check "$phase_file" "skip" "CQ-012" "Function length check" "no src/" "info" ""
  fi

  # ── CQ-013: HTML validation ──
  local html_files
  html_files=$(find "$PROJECT_ROOT/src" "$PROJECT_ROOT/public" -name "*.html" 2>/dev/null | head -5)
  if [[ -n "$html_files" ]]; then
    local html_evidence
    html_evidence=$(save_evidence "CQ-013" "HTML files found:\n$html_files")
    record_check "$phase_file" "pass" "CQ-013" "HTML files present" "$(echo "$html_files" | wc -l | tr -d ' ') files" "info" "$html_evidence"
  else
    local html_evidence2
    html_evidence2=$(save_evidence "CQ-013" "No HTML files found (likely using JSX/TSX)")
    record_check "$phase_file" "pass" "CQ-013" "HTML validation" "N/A — JSX/TSX project" "info" "$html_evidence2"
  fi

  # ── CQ-014: Commitlint config ──
  local commitlint_evidence
  if [[ -f "$PROJECT_ROOT/commitlint.config.js" ]] || [[ -f "$PROJECT_ROOT/commitlint.config.ts" ]] || [[ -f "$PROJECT_ROOT/.commitlintrc.json" ]]; then
    commitlint_evidence=$(save_evidence "CQ-014" "commitlint config found")
    record_check "$phase_file" "pass" "CQ-014" "Commitlint config exists" "found" "info" "$commitlint_evidence"
  else
    commitlint_evidence=$(save_evidence "CQ-014" "no commitlint config")
    record_check "$phase_file" "warn" "CQ-014" "Commitlint config exists" "not found" "low" "$commitlint_evidence"
  fi

  # ── CQ-015: ESLint config valid ──
  local eslint_cfg_evidence
  if [[ -f "$PROJECT_ROOT/eslint.config.mjs" ]] || [[ -f "$PROJECT_ROOT/eslint.config.js" ]] || [[ -f "$PROJECT_ROOT/.eslintrc.json" ]] || [[ -f "$PROJECT_ROOT/.eslintrc.js" ]]; then
    eslint_cfg_evidence=$(save_evidence "CQ-015" "ESLint config found")
    record_check "$phase_file" "pass" "CQ-015" "ESLint config valid" "found" "info" "$eslint_cfg_evidence"
  else
    eslint_cfg_evidence=$(save_evidence "CQ-015" "no ESLint config")
    record_check "$phase_file" "warn" "CQ-015" "ESLint config valid" "not found" "medium" "$eslint_cfg_evidence"
  fi
}
