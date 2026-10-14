#!/usr/bin/env bash
set -euo pipefail
base="${1:?usage: smoke-test.sh <base-url>}"
base="${base%/}"

status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
expect() { [ "$1" = "$2" ] || { echo "FAIL: $3 (expected $2, got $1)"; exit 1; }; echo "ok: $3"; }

expect "$(status "$base/")" 200 "homepage"
expect "$(status "$base/config.js")" 200 "config.js"
expect "$(status "$base/app.js")" 200 "app.js"
expect "$(status "$base/assets/ryu-films-logo.png")" 200 "logo asset"
expect "$(status -X POST -H 'Content-Type: application/json' -d '{}' "$base/api/inquiry")" 400 "worker rejects empty inquiry"
expect "$(status "$base/api/inquiry")" 405 "worker rejects GET"