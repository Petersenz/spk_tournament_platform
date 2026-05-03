#!/bin/bash
# QA Night Watch — Dev Server Manager
# Auto start/stop dev server for phases that need it
# !! ตรวจว่า server เป็นของ project นี้จริง ไม่ใช่ project อื่นบนเครื่องเดียวกัน

SERVER_PID=""
SERVER_STARTED_BY_US=false

# ตรวจว่า port นี้มี process รันอยู่ไหม + เป็นของ project นี้หรือเปล่า
check_our_server() {
  local port="$1"
  local pid_on_port

  # หา PID ที่ฟัง port นี้
  pid_on_port=$(lsof -ti "tcp:${port}" 2>/dev/null | head -1 || true)

  if [[ -z "$pid_on_port" ]]; then
    return 1  # ไม่มี process บน port นี้
  fi

  # ตรวจว่า process นี้ทำงานจาก PROJECT_ROOT ของเราจริงไหม
  local proc_cwd
  proc_cwd=$(lsof -p "$pid_on_port" 2>/dev/null | grep cwd | awk '{print $NF}' || true)

  if [[ -n "$proc_cwd" ]] && [[ "$proc_cwd" == "$PROJECT_ROOT"* ]]; then
    return 0  # ใช่ server ของเรา
  fi

  # ถ้าดู cwd ไม่ได้ → ตรวจจาก cmdline
  local proc_cmd
  proc_cmd=$(ps -p "$pid_on_port" -o command= 2>/dev/null || true)

  if echo "$proc_cmd" | grep -q "$PROJECT_ROOT"; then
    return 0  # ใช่ server ของเรา
  fi

  # มี server อยู่ แต่ไม่ใช่ของ project นี้
  echo -e "  ${YELLOW}⚠${NC} Port $port ถูกใช้โดย project อื่น:"
  echo -e "  ${DIM}  PID: $pid_on_port${NC}"
  echo -e "  ${DIM}  CWD: $proc_cwd${NC}"
  echo -e "  ${DIM}  CMD: $(echo "$proc_cmd" | head -c 80)${NC}"
  log_progress "SERVER" "Port $port used by ANOTHER project (PID: $pid_on_port, CWD: $proc_cwd)"
  return 2  # port ถูกใช้โดย project อื่น
}

start_dev_server() {
  local port="$DEV_PORT"

  # ตรวจว่า port นี้ถูกใช้อยู่ไหม + เป็นของ project เราหรือเปล่า
  check_our_server "$port"
  local check_result=$?

  if [[ $check_result -eq 0 ]]; then
    # server ของเรารันอยู่แล้ว
    log_progress "SERVER" "Our dev server already running on port $port"
    echo -e "  ${GREEN}✓${NC} Dev server already running on port $port (verified: this project)"
    return 0
  elif [[ $check_result -eq 2 ]]; then
    # port ถูกใช้โดย project อื่น → ห้ามใช้ ต้อง skip
    echo -e "  ${RED}✗${NC} Port $port ถูกใช้โดย project อื่น — ข้าม performance/a11y scans"
    log_progress "SERVER" "SKIP: port $port used by another project"
    return 1
  fi

  # port ว่าง → เปิด server ของเรา
  echo -e "  ${CYAN}→${NC} Starting dev server on port $port..."
  log_progress "SERVER" "Starting dev server on port $port from $PROJECT_ROOT"

  # Start server in background — จาก PROJECT_ROOT เท่านั้น
  cd "$PROJECT_ROOT" || return 1

  if [[ "$PKG_MANAGER" == "pnpm" ]]; then
    pnpm dev > "$SESSION_DIR/server.log" 2>&1 &
  elif [[ "$PKG_MANAGER" == "yarn" ]]; then
    yarn dev > "$SESSION_DIR/server.log" 2>&1 &
  else
    npm run dev > "$SESSION_DIR/server.log" 2>&1 &
  fi

  SERVER_PID=$!
  SERVER_STARTED_BY_US=true

  # Wait for server to be ready (max 60s)
  local attempts=0
  local max_attempts=60
  while (( attempts < max_attempts )); do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}" 2>/dev/null | grep -qE "200|301|302|304"; then
      echo -e "  ${GREEN}✓${NC} Dev server ready on port $port (${attempts}s)"
      log_progress "SERVER" "Dev server ready on port $port after ${attempts}s"
      return 0
    fi
    sleep 1
    (( attempts++ ))
  done

  echo -e "  ${YELLOW}⚠${NC} Dev server may not be ready (timeout after ${max_attempts}s)"
  log_progress "SERVER" "Dev server timeout after ${max_attempts}s — continuing anyway"
  return 1
}

stop_dev_server() {
  if [[ "$SERVER_STARTED_BY_US" == "true" ]] && [[ -n "$SERVER_PID" ]]; then
    echo -e "  ${CYAN}→${NC} Stopping dev server (PID: $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    log_progress "SERVER" "Dev server stopped (PID: $SERVER_PID)"
    echo -e "  ${GREEN}✓${NC} Dev server stopped"
  fi
}

check_server_running() {
  local port="$DEV_PORT"
  check_our_server "$port"
  return $?
}
