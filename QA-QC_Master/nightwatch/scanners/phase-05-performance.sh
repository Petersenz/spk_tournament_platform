#!/bin/bash
# Phase 05: Performance Scanner
# Lighthouse, Web Vitals, bundle size, image optimization

run_phase_05() {
  local phase_file="$SESSION_DIR/phase-05.txt"
  > "$phase_file"

  # Check prerequisites for Lighthouse checks (PF-001 through PF-006)
  local skip_lighthouse=false
  local skip_reason=""

  if [[ "$HAS_LIGHTHOUSE" != "true" ]]; then
    skip_lighthouse=true
    skip_reason="lighthouse not installed"
  elif ! check_server_running; then
    skip_lighthouse=true
    skip_reason="dev server not running"
  fi

  # Run lighthouse once, reuse output for PF-001 through PF-006
  local lh_output="" lh_json=""
  if [[ "$skip_lighthouse" == "false" ]]; then
    lh_output=$(npx lighthouse "http://localhost:${DEV_PORT}" --output=json --chrome-flags="--headless --no-sandbox" 2>&1 || true)
    lh_json="$lh_output"
  fi

  # ── PF-001: Lighthouse Performance score ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-001" "$skip_reason")
    record_check "$phase_file" "skip" "PF-001" "Lighthouse Performance" "$skip_reason" "info" "$ev"
  else
    local perf_score perf_evidence
    perf_score=$(echo "$lh_json" | node -pe "try{Math.round(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).categories.performance.score*100)}catch(e){-1}" 2>/dev/null || echo "-1")
    perf_evidence=$(save_evidence "PF-001" "performance_score=$perf_score")

    if [[ "$perf_score" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-001" "Lighthouse Performance" "Could not parse lighthouse output" "medium" "$perf_evidence"
    elif (( perf_score >= TH_LIGHTHOUSE_PERF )); then
      record_check "$phase_file" "pass" "PF-001" "Lighthouse Performance" "score: $perf_score (min: $TH_LIGHTHOUSE_PERF)" "info" "$perf_evidence"
    else
      record_check "$phase_file" "fail" "PF-001" "Lighthouse Performance" "score: $perf_score (min: $TH_LIGHTHOUSE_PERF)" "high" "$perf_evidence"
    fi
  fi

  # ── PF-002: Lighthouse Best Practices ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-002" "$skip_reason")
    record_check "$phase_file" "skip" "PF-002" "Lighthouse Best Practices" "$skip_reason" "info" "$ev"
  else
    local bp_score bp_evidence
    bp_score=$(echo "$lh_json" | node -pe "try{Math.round(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).categories['best-practices'].score*100)}catch(e){-1}" 2>/dev/null || echo "-1")
    bp_evidence=$(save_evidence "PF-002" "best_practices_score=$bp_score")

    if [[ "$bp_score" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-002" "Lighthouse Best Practices" "Could not parse lighthouse output" "medium" "$bp_evidence"
    elif (( bp_score >= TH_LIGHTHOUSE_BP )); then
      record_check "$phase_file" "pass" "PF-002" "Lighthouse Best Practices" "score: $bp_score (min: $TH_LIGHTHOUSE_BP)" "info" "$bp_evidence"
    else
      record_check "$phase_file" "fail" "PF-002" "Lighthouse Best Practices" "score: $bp_score (min: $TH_LIGHTHOUSE_BP)" "medium" "$bp_evidence"
    fi
  fi

  # ── PF-003: First Contentful Paint ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-003" "$skip_reason")
    record_check "$phase_file" "skip" "PF-003" "First Contentful Paint" "$skip_reason" "info" "$ev"
  else
    local fcp_val fcp_evidence
    fcp_val=$(echo "$lh_json" | node -pe "try{Math.round(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).audits['first-contentful-paint'].numericValue)}catch(e){-1}" 2>/dev/null || echo "-1")
    fcp_evidence=$(save_evidence "PF-003" "fcp_ms=$fcp_val")

    if [[ "$fcp_val" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-003" "First Contentful Paint" "Could not parse FCP" "medium" "$fcp_evidence"
    elif (( fcp_val <= TH_FCP_MS )); then
      record_check "$phase_file" "pass" "PF-003" "First Contentful Paint" "FCP: ${fcp_val}ms (max: ${TH_FCP_MS}ms)" "info" "$fcp_evidence"
    else
      record_check "$phase_file" "fail" "PF-003" "First Contentful Paint" "FCP: ${fcp_val}ms (max: ${TH_FCP_MS}ms)" "high" "$fcp_evidence"
    fi
  fi

  # ── PF-004: Largest Contentful Paint ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-004" "$skip_reason")
    record_check "$phase_file" "skip" "PF-004" "Largest Contentful Paint" "$skip_reason" "info" "$ev"
  else
    local lcp_val lcp_evidence
    lcp_val=$(echo "$lh_json" | node -pe "try{Math.round(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).audits['largest-contentful-paint'].numericValue)}catch(e){-1}" 2>/dev/null || echo "-1")
    lcp_evidence=$(save_evidence "PF-004" "lcp_ms=$lcp_val")

    if [[ "$lcp_val" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-004" "Largest Contentful Paint" "Could not parse LCP" "medium" "$lcp_evidence"
    elif (( lcp_val <= TH_LCP_MS )); then
      record_check "$phase_file" "pass" "PF-004" "Largest Contentful Paint" "LCP: ${lcp_val}ms (max: ${TH_LCP_MS}ms)" "info" "$lcp_evidence"
    else
      record_check "$phase_file" "fail" "PF-004" "Largest Contentful Paint" "LCP: ${lcp_val}ms (max: ${TH_LCP_MS}ms)" "high" "$lcp_evidence"
    fi
  fi

  # ── PF-005: Cumulative Layout Shift ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-005" "$skip_reason")
    record_check "$phase_file" "skip" "PF-005" "Cumulative Layout Shift" "$skip_reason" "info" "$ev"
  else
    local cls_val cls_evidence
    cls_val=$(echo "$lh_json" | node -pe "try{JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).audits['cumulative-layout-shift'].numericValue.toFixed(3)}catch(e){-1}" 2>/dev/null || echo "-1")
    cls_evidence=$(save_evidence "PF-005" "cls=$cls_val")

    if [[ "$cls_val" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-005" "Cumulative Layout Shift" "Could not parse CLS" "medium" "$cls_evidence"
    else
      local cls_pass
      cls_pass=$(echo "$cls_val $TH_CLS" | awk '{print ($1 <= $2) ? 1 : 0}' 2>/dev/null || echo 0)
      if (( cls_pass == 1 )); then
        record_check "$phase_file" "pass" "PF-005" "Cumulative Layout Shift" "CLS: $cls_val (max: $TH_CLS)" "info" "$cls_evidence"
      else
        record_check "$phase_file" "fail" "PF-005" "Cumulative Layout Shift" "CLS: $cls_val (max: $TH_CLS)" "high" "$cls_evidence"
      fi
    fi
  fi

  # ── PF-006: Total Blocking Time ──
  if [[ "$skip_lighthouse" == "true" ]]; then
    local ev=$(save_evidence "PF-006" "$skip_reason")
    record_check "$phase_file" "skip" "PF-006" "Total Blocking Time" "$skip_reason" "info" "$ev"
  else
    local tbt_val tbt_evidence
    tbt_val=$(echo "$lh_json" | node -pe "try{Math.round(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).audits['total-blocking-time'].numericValue)}catch(e){-1}" 2>/dev/null || echo "-1")
    tbt_evidence=$(save_evidence "PF-006" "tbt_ms=$tbt_val")

    if [[ "$tbt_val" == "-1" ]]; then
      record_check "$phase_file" "warn" "PF-006" "Total Blocking Time" "Could not parse TBT" "medium" "$tbt_evidence"
    elif (( tbt_val <= TH_TBT_MS )); then
      record_check "$phase_file" "pass" "PF-006" "Total Blocking Time" "TBT: ${tbt_val}ms (max: ${TH_TBT_MS}ms)" "info" "$tbt_evidence"
    else
      record_check "$phase_file" "fail" "PF-006" "Total Blocking Time" "TBT: ${tbt_val}ms (max: ${TH_TBT_MS}ms)" "high" "$tbt_evidence"
    fi
  fi

  # ── PF-007: Bundle size ──
  local bundle_dir=""
  if [[ -d "$PROJECT_ROOT/.next" ]]; then
    bundle_dir="$PROJECT_ROOT/.next"
  elif [[ -d "$PROJECT_ROOT/dist" ]]; then
    bundle_dir="$PROJECT_ROOT/dist"
  elif [[ -d "$PROJECT_ROOT/build" ]]; then
    bundle_dir="$PROJECT_ROOT/build"
  fi

  if [[ -n "$bundle_dir" ]]; then
    local bundle_kb bundle_evidence
    bundle_kb=$(du -sk "$bundle_dir" 2>/dev/null | awk '{print $1}' || echo 0)
    local threshold_kb=$(( TH_BUNDLE_KB * 1024 ))
    bundle_evidence=$(save_evidence "PF-007" "bundle_dir=$bundle_dir\nbundle_size_kb=$bundle_kb\nthreshold_kb=$threshold_kb")

    if (( bundle_kb <= threshold_kb )); then
      record_check "$phase_file" "pass" "PF-007" "Bundle size" "size: ${bundle_kb}KB (max: ${threshold_kb}KB)" "info" "$bundle_evidence"
    else
      record_check "$phase_file" "warn" "PF-007" "Bundle size" "size: ${bundle_kb}KB (max: ${threshold_kb}KB)" "medium" "$bundle_evidence"
    fi
  else
    local ev=$(save_evidence "PF-007" "no build output found (.next/dist/build)")
    record_check "$phase_file" "skip" "PF-007" "Bundle size" "no build output directory found" "info" "$ev"
  fi

  # ── PF-008: No unoptimized images ──
  local img_dirs=("$PROJECT_ROOT/src" "$PROJECT_ROOT/public")
  local large_images="" large_count=0
  for dir in "${img_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      local found
      found=$(find "$dir" \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.bmp" -o -name "*.webp" \) -size +500k 2>/dev/null | grep -v "node_modules" || true)
      if [[ -n "$found" ]]; then
        large_images="$large_images$found"$'\n'
        large_count=$(( large_count + $(echo "$found" | wc -l | tr -d ' ') ))
      fi
    fi
  done
  local img_evidence
  img_evidence=$(save_evidence "PF-008" "large_images_over_500KB=$large_count\n\n$large_images")

  if (( large_count == 0 )); then
    record_check "$phase_file" "pass" "PF-008" "No unoptimized images" "large images (>500KB): 0" "info" "$img_evidence"
  else
    record_check "$phase_file" "warn" "PF-008" "No unoptimized images" "large images (>500KB): $large_count — consider optimization" "medium" "$img_evidence"
  fi
}
