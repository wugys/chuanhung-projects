#!/bin/bash
# 檢查 hook 是否還存在

curl -s -X POST \
  'https://djvyozmdenvzlbyieyss.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg' \
  -d '{"email":"wugys@chuanhung.local","password":"0403"}' | jq '.msg // .message // "OK"'
