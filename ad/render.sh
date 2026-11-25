#!/usr/bin/env bash
# Renders ad versions to out/<id>.mp4 (1080×1920) plus out/<id>-poster.png (the last frame, for thumbnails).
#   ./render.sh                 every version
#   ./render.sh v1-explainer    just one
set -euo pipefail
cd "$(dirname "$0")"
ids=("$@")
if [ ${#ids[@]} -eq 0 ]; then
  read -ra ids <<<"$(npx remotion compositions src/index.ts --quiet)"
fi
for id in "${ids[@]}"; do
  npx remotion render src/index.ts "$id" "out/$id.mp4" --scale=2 --crf=18
  ffmpeg -loglevel error -y -sseof -0.05 -i "out/$id.mp4" -frames:v 1 -update 1 "out/$id-poster.png"
  echo "→ out/$id.mp4, out/$id-poster.png"
done
