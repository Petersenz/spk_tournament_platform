#!/bin/bash
# Phase 07: Documentation Scanner
# README, CHANGELOG, .env.example, package.json, API docs

run_phase_07() {
  local phase_file="$SESSION_DIR/phase-07.txt"
  > "$phase_file"

  # ── DOC-001: README.md exists and not empty ──
  local readme_evidence
  if [[ -f "$PROJECT_ROOT/README.md" ]]; then
    local readme_lines
    readme_lines=$(wc -l < "$PROJECT_ROOT/README.md" | tr -d ' ')
    readme_evidence=$(save_evidence "DOC-001" "README.md exists, lines: $readme_lines")

    if (( readme_lines > 10 )); then
      record_check "$phase_file" "pass" "DOC-001" "README.md exists and not empty" "lines: $readme_lines" "info" "$readme_evidence"
    else
      record_check "$phase_file" "warn" "DOC-001" "README.md exists and not empty" "only $readme_lines lines — may be too short" "medium" "$readme_evidence"
    fi
  else
    readme_evidence=$(save_evidence "DOC-001" "README.md not found")
    record_check "$phase_file" "fail" "DOC-001" "README.md exists and not empty" "README.md not found" "high" "$readme_evidence"
  fi

  # ── DOC-002: CHANGELOG or git tags exist ──
  local changelog_evidence
  local has_changelog="false"
  local tag_count=0

  if [[ -f "$PROJECT_ROOT/CHANGELOG.md" ]] || [[ -f "$PROJECT_ROOT/changelog.md" ]] || [[ -f "$PROJECT_ROOT/CHANGELOG" ]]; then
    has_changelog="true"
  fi

  if [[ "$HAS_GIT" == "true" ]]; then
    tag_count=$(cd "$PROJECT_ROOT" && git tag 2>/dev/null | wc -l | tr -d ' ')
  fi

  changelog_evidence=$(save_evidence "DOC-002" "changelog_file=$has_changelog\ngit_tags=$tag_count")

  if [[ "$has_changelog" == "true" ]] || (( tag_count > 0 )); then
    local detail=""
    [[ "$has_changelog" == "true" ]] && detail="CHANGELOG found"
    (( tag_count > 0 )) && detail="$detail, $tag_count git tags"
    record_check "$phase_file" "pass" "DOC-002" "CHANGELOG or git tags exist" "${detail# , }" "info" "$changelog_evidence"
  else
    record_check "$phase_file" "warn" "DOC-002" "CHANGELOG or git tags exist" "no CHANGELOG.md and no git tags" "low" "$changelog_evidence"
  fi

  # ── DOC-003: .env.example documented ──
  if [[ -f "$PROJECT_ROOT/.env" ]]; then
    if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
      local env_keys example_keys missing_keys missing_count env_doc_evidence
      env_keys=$(grep -E "^[A-Za-z_]" "$PROJECT_ROOT/.env" 2>/dev/null | cut -d'=' -f1 | sort)
      example_keys=$(grep -E "^[A-Za-z_]" "$PROJECT_ROOT/.env.example" 2>/dev/null | cut -d'=' -f1 | sort)
      missing_keys=$(comm -23 <(echo "$env_keys") <(echo "$example_keys") 2>/dev/null || true)
      missing_count=$(echo "$missing_keys" | grep -c "." 2>/dev/null || echo 0)
      [[ -z "$missing_keys" ]] && missing_count=0
      env_doc_evidence=$(save_evidence "DOC-003" "env_keys=$(echo "$env_keys" | wc -l | tr -d ' ')\nexample_keys=$(echo "$example_keys" | wc -l | tr -d ' ')\nmissing_from_example=$missing_count\n\n$missing_keys")

      if (( missing_count == 0 )); then
        record_check "$phase_file" "pass" "DOC-003" ".env.example documented" "all .env keys present in .env.example" "info" "$env_doc_evidence"
      else
        record_check "$phase_file" "warn" "DOC-003" ".env.example documented" "$missing_count keys in .env but missing from .env.example" "medium" "$env_doc_evidence"
      fi
    else
      local ev=$(save_evidence "DOC-003" ".env exists but .env.example not found")
      record_check "$phase_file" "fail" "DOC-003" ".env.example documented" ".env exists but no .env.example" "high" "$ev"
    fi
  else
    local ev=$(save_evidence "DOC-003" "no .env file — skipping comparison")
    record_check "$phase_file" "skip" "DOC-003" ".env.example documented" "no .env file found" "info" "$ev"
  fi

  # ── DOC-004: Package.json has description + scripts ──
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local pkg_checks=0 pkg_missing="" pkg_evidence
    local has_name has_version has_description has_dev has_build has_test

    has_name=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).name}catch(e){false}" 2>/dev/null || echo "false")
    has_version=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).version}catch(e){false}" 2>/dev/null || echo "false")
    has_description=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).description}catch(e){false}" 2>/dev/null || echo "false")
    has_dev=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).scripts.dev}catch(e){false}" 2>/dev/null || echo "false")
    has_build=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).scripts.build}catch(e){false}" 2>/dev/null || echo "false")
    has_test=$(node -pe "try{!!JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).scripts.test}catch(e){false}" 2>/dev/null || echo "false")

    [[ "$has_name" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing name"
    [[ "$has_version" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing version"
    [[ "$has_description" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing description"
    [[ "$has_dev" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing scripts.dev"
    [[ "$has_build" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing scripts.build"
    [[ "$has_test" == "true" ]] && (( pkg_checks++ )) || pkg_missing="$pkg_missing scripts.test"

    pkg_evidence=$(save_evidence "DOC-004" "checked=6 found=$pkg_checks missing=$pkg_missing")

    if (( pkg_checks >= 5 )); then
      record_check "$phase_file" "pass" "DOC-004" "Package.json has description + scripts" "found: $pkg_checks/6" "info" "$pkg_evidence"
    elif (( pkg_checks >= 3 )); then
      record_check "$phase_file" "warn" "DOC-004" "Package.json has description + scripts" "found: $pkg_checks/6 — missing:$pkg_missing" "low" "$pkg_evidence"
    else
      record_check "$phase_file" "fail" "DOC-004" "Package.json has description + scripts" "found: $pkg_checks/6 — missing:$pkg_missing" "medium" "$pkg_evidence"
    fi
  else
    local ev=$(save_evidence "DOC-004" "no package.json")
    record_check "$phase_file" "fail" "DOC-004" "Package.json has description + scripts" "no package.json found" "high" "$ev"
  fi

  # ── DOC-005: API routes documented ──
  if [[ -d "$PROJECT_ROOT/src/app/api" ]]; then
    local api_routes api_count api_has_docs api_evidence
    api_routes=$(find "$PROJECT_ROOT/src/app/api" -name "route.ts" -o -name "route.js" 2>/dev/null)
    api_count=$(echo "$api_routes" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$api_routes" ]] && api_count=0

    # Check if any documentation exists for API
    api_has_docs="false"
    if [[ -f "$PROJECT_ROOT/src/app/api/README.md" ]] || [[ -f "$PROJECT_ROOT/docs/api.md" ]] || [[ -f "$PROJECT_ROOT/Docs/api.md" ]]; then
      api_has_docs="true"
    fi

    # Also check for JSDoc comments in route files
    local has_comments=0
    if [[ -n "$api_routes" ]]; then
      has_comments=$(echo "$api_routes" | head -5 | while read -r f; do
        grep -c "@description\|@param\|@returns\|/\*\*" "$f" 2>/dev/null || echo 0
      done | paste -sd+ - | bc 2>/dev/null || echo 0)
    fi

    api_evidence=$(save_evidence "DOC-005" "api_routes=$api_count\nhas_readme=$api_has_docs\njsdoc_comments=$has_comments\n\nRoutes:\n$api_routes")

    if [[ "$api_has_docs" == "true" ]] || (( has_comments > 0 )); then
      record_check "$phase_file" "pass" "DOC-005" "API routes documented" "$api_count routes, docs found" "info" "$api_evidence"
    else
      record_check "$phase_file" "warn" "DOC-005" "API routes documented" "$api_count routes but no API documentation found" "medium" "$api_evidence"
    fi
  else
    local ev=$(save_evidence "DOC-005" "no src/app/api directory — no API routes")
    record_check "$phase_file" "skip" "DOC-005" "API routes documented" "no src/app/api directory" "info" "$ev"
  fi
}
