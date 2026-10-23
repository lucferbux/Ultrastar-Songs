#!/usr/bin/env bash
# Restricts the Firebase browser API key so it only works from our domains.
# Uses the isolated gcloud profile created by `npm run auth:admin`.
set -euo pipefail

export CLOUDSDK_CONFIG="${CLOUDSDK_CONFIG:-$HOME/.config/gcloud-ultrastar}"
PROJECT=ultrastar-songs
REFERRERS="https://ultrastar-songs.web.app/*,https://ultrastar-songs.firebaseapp.com/*,http://localhost:5173/*,http://localhost:4173/*"


KEY=$(gcloud services api-keys list --project "$PROJECT" \
  --filter='displayName~"Browser key"' --format='value(name)' | head -1)
if [[ -z "$KEY" ]]; then
  echo "No 'Browser key' found in $PROJECT. Restrict it manually in Google Cloud → APIs & Services → Credentials." >&2
  exit 1
fi

echo "Restricting $KEY to: $REFERRERS"
gcloud services api-keys update "$KEY" --project "$PROJECT" --allowed-referrers="$REFERRERS"
