#!/usr/bin/env bash
set -euo pipefail
base="${1:?usage: smoke-test.sh <base-url>}"
base="${base%/}"

status() {
  # New deployments can take a few seconds to propagate; retry on 404/5xx.
  local code i
  for i in 1 2 3 4 5 6; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$@")
    case "$code" in 404|5??|000) sleep 5 ;; *) break ;; esac
  done
  echo "$code"
}
expect() { [ "$1" = "$2" ] || { echo "FAIL: $3 (expected $2, got $1)"; exit 1; }; echo "ok: $3"; }

expect "$(status "$base/")" 200 "homepage"
expect "$(status "$base/config.js")" 200 "config.js"
expect "$(status "$base/app.js")" 200 "app.js"
expect "$(status "$base/assets/ryu-films-logo.png")" 200 "logo asset"
expect "$(status -X POST -H 'Content-Type: application/json' -d '{}' "$base/api/inquiry")" 400 "worker rejects empty inquiry"
expect "$(status "$base/api/inquiry")" 405 "worker rejects GET"