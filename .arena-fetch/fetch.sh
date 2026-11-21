#!/usr/bin/env bash
set -euo pipefail
OUT=.arena-fetch/raw
mkdir -p "$OUT"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
for p in "" "gallery" "our-work" "reviews" "about" "services"; do
  name=${p:-home}
  curl -sL --compressed -A "$UA" "https://www.2sonswindows.com/$p" -o "$OUT/$name.html" || true
done
ls -la "$OUT"
