#!/usr/bin/env bash
set -euo pipefail
# Requires Python dependencies in tests/requirements.txt and Playwright installed locally.
mkdir -p .sites-runtime/test-output
python tests/local-services.py > .sites-runtime/test-output/services.log 2>&1 &
toolnest_services_pid=$!
UPSTASH_REDIS_REST_URL=http://127.0.0.1:8877 UPSTASH_REDIS_REST_TOKEN=local-only WHATSAPP_ENABLED=true WHATSAPP_ACCESS_TOKEN=local-test-only WHATSAPP_PHONE_NUMBER_ID=123456789 WHATSAPP_API_VERSION=v24.0 WHATSAPP_APP_SECRET=local-meta-app-secret-1234567890 WHATSAPP_WEBHOOK_VERIFY_TOKEN=local-verify-token TOOLNEST_STAFF_PASSWORD=local-staff-password-1234567890 CRON_SECRET=local-cron-secret-1234567890 NODE_OPTIONS="--import $(pwd)/tests/mock-meta.mjs" pnpm dev --hostname 127.0.0.1 --port 4173 > .sites-runtime/test-output/app.log 2>&1 &
toolnest_app_pid=$!
trap 'kill "$toolnest_app_pid" "$toolnest_services_pid" 2>/dev/null || true' EXIT
node --input-type=module - <<'JS'
for(let n=0;n<100;n++){try{await fetch('http://127.0.0.1:8877');const r=await fetch('http://127.0.0.1:4173/api/account');if(r.ok)process.exit(0);}catch{}await new Promise(r=>setTimeout(r,150));}throw Error('Test services did not become ready');
JS
node tests/live-flow.mjs
node tests/browser-flow.mjs
