#!/usr/bin/env bash
# Restricts the Firebase web API key ("Browser key (auto created by Firebase)") so it only
# works from our domains. Uses the credentials from `npm run auth:admin` (no gcloud login).
set -euo pipefail

export CLOUDSDK_CONFIG="${CLOUDSDK_CONFIG:-$HOME/.config/gcloud-ultrastar}"
PROJECT=ultrastar-songs
API="https://apikeys.googleapis.com/v2/projects/$PROJECT/locations/global/keys"
REFERRERS='["https://ultrastar-songs.web.app/*","https://ultrastar-songs.firebaseapp.com/*","http://localhost:5173/*","http://localhost:4173/*"]'

TOKEN=$(gcloud auth application-default print-access-token)
auth=(-H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT")

KEY=$(curl -s "${auth[@]}" "$API" | python3 -c '
import json, sys
keys = json.load(sys.stdin).get("keys", [])
print(next((k["name"].split("/")[-1] for k in keys if k.get("displayName") == "Browser key (auto created by Firebase)"), ""))')
if [[ -z "$KEY" ]]; then
  echo "Firebase browser key not found (is the API Keys API enabled?)." >&2
  exit 1
fi

echo "Restricting $KEY to $REFERRERS"
curl -s -X PATCH "${auth[@]}" -H "Content-Type: application/json" \
  "$API/$KEY?updateMask=restrictions.browserKeyRestrictions" \
  -d "{\"restrictions\":{\"browserKeyRestrictions\":{\"allowedReferrers\":$REFERRERS}}}" >/dev/null
echo "Done. Changes take a minute or two to apply."
