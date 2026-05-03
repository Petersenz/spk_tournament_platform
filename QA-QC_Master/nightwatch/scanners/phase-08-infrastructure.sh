#!/bin/bash
# Phase 08: Infrastructure Scanner
# Git hooks, CI/CD, Docker, env sync, Node version, build, env tracking

run_phase_08() {
  local phase_file="$SESSION_DIR/phase-08.txt"
  > "$phase_file"

  # ── IF-001: Git hooks installed ──
  local hooks_evidence
  if [[ -d "$PROJECT_ROOT/.husky" ]]; then
    local hook_files
    hook_files=$(find "$PROJECT_ROOT/.husky" -type f -not -name ".*" -not -name "_*" 2>/dev/null | head -10)
    local hook_count
    hook_count=$(echo "$hook_files" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$hook_files" ]] && hook_count=0
    hooks_evidence=$(save_evidence "IF-001" "husky_dir=found\nhook_files=$hook_count\n\n$hook_files")

    if (( hook_count > 0 )); then
      record_check "$phase_file" "pass" "IF-001" "Git hooks installed" ".husky/ found with $hook_count hooks" "info" "$hooks_evidence"
    else
      record_check "$phase_file" "warn" "IF-001" "Git hooks installed" ".husky/ exists but no hook files found" "medium" "$hooks_evidence"
    fi
  else
    hooks_evidence=$(save_evidence "IF-001" ".husky directory not found")
    record_check "$phase_file" "warn" "IF-001" "Git hooks installed" ".husky/ directory not found" "medium" "$hooks_evidence"
  fi

  # ── IF-002: Pre-commit hook works ──
  local precommit_evidence
  if [[ -f "$PROJECT_ROOT/.husky/pre-commit" ]]; then
    if [[ -x "$PROJECT_ROOT/.husky/pre-commit" ]]; then
      precommit_evidence=$(save_evidence "IF-002" "pre-commit exists and is executable")
      record_check "$phase_file" "pass" "IF-002" "Pre-commit hook works" "exists and executable" "info" "$precommit_evidence"
    else
      precommit_evidence=$(save_evidence "IF-002" "pre-commit exists but NOT executable")
      record_check "$phase_file" "warn" "IF-002" "Pre-commit hook works" "exists but not executable" "medium" "$precommit_evidence"
    fi
  else
    precommit_evidence=$(save_evidence "IF-002" "pre-commit hook not found")
    record_check "$phase_file" "warn" "IF-002" "Pre-commit hook works" ".husky/pre-commit not found" "medium" "$precommit_evidence"
  fi

  # ── IF-003: CI/CD config exists ──
  local cicd_evidence cicd_found=""
  if [[ -f "$PROJECT_ROOT/.gitlab-ci.yml" ]]; then
    cicd_found="GitLab CI"
  fi
  if [[ -d "$PROJECT_ROOT/.github/workflows" ]]; then
    local wf_count
    wf_count=$(find "$PROJECT_ROOT/.github/workflows" -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
    if (( wf_count > 0 )); then
      [[ -n "$cicd_found" ]] && cicd_found="$cicd_found + "
      cicd_found="${cicd_found}GitHub Actions ($wf_count workflows)"
    fi
  fi

  if [[ -n "$cicd_found" ]]; then
    cicd_evidence=$(save_evidence "IF-003" "ci_cd=$cicd_found")
    record_check "$phase_file" "pass" "IF-003" "CI/CD config exists" "$cicd_found" "info" "$cicd_evidence"
  else
    cicd_evidence=$(save_evidence "IF-003" "no CI/CD config found (.gitlab-ci.yml or .github/workflows/)")
    record_check "$phase_file" "warn" "IF-003" "CI/CD config exists" "no CI/CD config found" "medium" "$cicd_evidence"
  fi

  # ── IF-004: Docker config exists ──
  local docker_evidence docker_found=""
  [[ -f "$PROJECT_ROOT/Dockerfile" ]] && docker_found="Dockerfile"
  if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]] || [[ -f "$PROJECT_ROOT/docker-compose.yaml" ]]; then
    [[ -n "$docker_found" ]] && docker_found="$docker_found + "
    docker_found="${docker_found}docker-compose"
  fi

  if [[ -n "$docker_found" ]]; then
    docker_evidence=$(save_evidence "IF-004" "docker_config=$docker_found")
    record_check "$phase_file" "pass" "IF-004" "Docker config exists" "$docker_found found" "info" "$docker_evidence"
  else
    docker_evidence=$(save_evidence "IF-004" "no Docker config — not required for all projects")
    record_check "$phase_file" "skip" "IF-004" "Docker config exists" "not required" "info" "$docker_evidence"
  fi

  # ── IF-005: .env and .env.example key sync ──
  if [[ -f "$PROJECT_ROOT/.env" ]] && [[ -f "$PROJECT_ROOT/.env.example" ]]; then
    local env_keys example_keys missing_in_example missing_in_env sync_evidence
    env_keys=$(grep -E "^[A-Za-z_]" "$PROJECT_ROOT/.env" 2>/dev/null | cut -d'=' -f1 | sort)
    example_keys=$(grep -E "^[A-Za-z_]" "$PROJECT_ROOT/.env.example" 2>/dev/null | cut -d'=' -f1 | sort)
    missing_in_example=$(comm -23 <(echo "$env_keys") <(echo "$example_keys") 2>/dev/null || true)
    missing_in_env=$(comm -13 <(echo "$env_keys") <(echo "$example_keys") 2>/dev/null || true)
    local miss_ex_count miss_env_count
    miss_ex_count=$(echo "$missing_in_example" | grep -c "." 2>/dev/null || echo 0)
    miss_env_count=$(echo "$missing_in_env" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$missing_in_example" ]] && miss_ex_count=0
    [[ -z "$missing_in_env" ]] && miss_env_count=0
    sync_evidence=$(save_evidence "IF-005" "missing_from_example=$miss_ex_count\nmissing_from_env=$miss_env_count\n\nIn .env but not .env.example:\n$missing_in_example\n\nIn .env.example but not .env:\n$missing_in_env")

    if (( miss_ex_count == 0 )) && (( miss_env_count == 0 )); then
      record_check "$phase_file" "pass" "IF-005" ".env and .env.example key sync" "all keys in sync" "info" "$sync_evidence"
    else
      record_check "$phase_file" "warn" "IF-005" ".env and .env.example key sync" "$miss_ex_count missing from .env.example, $miss_env_count missing from .env" "medium" "$sync_evidence"
    fi
  elif [[ -f "$PROJECT_ROOT/.env" ]]; then
    local ev=$(save_evidence "IF-005" ".env exists but no .env.example")
    record_check "$phase_file" "fail" "IF-005" ".env and .env.example key sync" ".env exists but no .env.example" "high" "$ev"
  else
    local ev=$(save_evidence "IF-005" "no .env file")
    record_check "$phase_file" "skip" "IF-005" ".env and .env.example key sync" "no .env file" "info" "$ev"
  fi

  # ── IF-006: Node.js version specified ──
  local node_ver_evidence node_specified="false" node_detail=""
  if [[ -f "$PROJECT_ROOT/.nvmrc" ]]; then
    node_specified="true"
    node_detail=".nvmrc: $(cat "$PROJECT_ROOT/.nvmrc" | tr -d '\n')"
  fi
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local engines_node
    engines_node=$(node -pe "try{JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).engines.node||''}catch(e){''}" 2>/dev/null || echo "")
    if [[ -n "$engines_node" ]]; then
      node_specified="true"
      node_detail="$node_detail engines.node: $engines_node"
    fi
  fi
  if [[ -f "$PROJECT_ROOT/.node-version" ]]; then
    node_specified="true"
    node_detail="$node_detail .node-version: $(cat "$PROJECT_ROOT/.node-version" | tr -d '\n')"
  fi

  node_ver_evidence=$(save_evidence "IF-006" "specified=$node_specified\n$node_detail")

  if [[ "$node_specified" == "true" ]]; then
    record_check "$phase_file" "pass" "IF-006" "Node.js version specified" "${node_detail}" "info" "$node_ver_evidence"
  else
    record_check "$phase_file" "warn" "IF-006" "Node.js version specified" "no .nvmrc, .node-version, or engines.node in package.json" "low" "$node_ver_evidence"
  fi

  # ── IF-007: Build succeeds ──
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local build_cmd
    build_cmd=$(node -pe "try{JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8')).scripts.build||''}catch(e){''}" 2>/dev/null || echo "")

    if [[ -n "$build_cmd" ]]; then
      local build_output build_evidence build_exit
      build_output=$(cd "$PROJECT_ROOT" && timeout 120 npm run build 2>&1 || true)
      build_exit=$?
      build_evidence=$(save_evidence "IF-007" "exit_code=$build_exit\n\n$(echo "$build_output" | tail -30)")

      if (( build_exit == 0 )) && ! echo "$build_output" | grep -qi "error\|failed"; then
        record_check "$phase_file" "pass" "IF-007" "Build succeeds" "npm run build completed successfully" "info" "$build_evidence"
      else
        record_check "$phase_file" "fail" "IF-007" "Build succeeds" "build failed (exit: $build_exit)" "critical" "$build_evidence"
      fi
    else
      local ev=$(save_evidence "IF-007" "no build script in package.json")
      record_check "$phase_file" "skip" "IF-007" "Build succeeds" "no build script in package.json" "info" "$ev"
    fi
  else
    local ev=$(save_evidence "IF-007" "no package.json")
    record_check "$phase_file" "skip" "IF-007" "Build succeeds" "no package.json" "info" "$ev"
  fi

  # ── IF-008: No .env files tracked in git ──
  if [[ "$HAS_GIT" == "true" ]]; then
    local tracked_envs tracked_count env_track_evidence
    tracked_envs=$(cd "$PROJECT_ROOT" && git ls-files '*.env*' 2>/dev/null || true)
    tracked_count=$(echo "$tracked_envs" | grep -c "." 2>/dev/null || echo 0)
    [[ -z "$tracked_envs" ]] && tracked_count=0
    env_track_evidence=$(save_evidence "IF-008" "tracked_env_files=$tracked_count\n\n$tracked_envs")

    if (( tracked_count == 0 )); then
      record_check "$phase_file" "pass" "IF-008" "No .env files tracked in git" "clean — 0 env files tracked" "info" "$env_track_evidence"
    else
      record_check "$phase_file" "fail" "IF-008" "No .env files tracked in git" "$tracked_count .env files tracked: $tracked_envs" "critical" "$env_track_evidence"
    fi
  else
    local ev=$(save_evidence "IF-008" "not a git repo")
    record_check "$phase_file" "skip" "IF-008" "No .env files tracked in git" "not a git repo" "info" "$ev"
  fi
}
