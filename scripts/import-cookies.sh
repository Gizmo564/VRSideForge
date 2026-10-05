#!/bin/zsh
# Imports your RuTracker cookies into a running VRSideForge backend.
read -rs "BB?bb_session: "; echo
read -rs "CF?cf_clearance (Enter to skip): "; echo
read -r "UA?User-Agent: "
BB="$BB" CF="$CF" UA="$UA" python3 -c 'import json,os;print(json.dumps({"bb_session":os.environ["BB"],"cf_clearance":os.environ["CF"],"userAgent":os.environ["UA"]}))' \
  | curl -s -X POST http://127.0.0.1:4000/api/session/import-cookies -H 'Content-Type: application/json' -d @-
echo; unset BB CF UA
