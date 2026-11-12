#!/bin/bash
# double-click on a Mac: serves this folder and opens the hub (http://127.0.0.1:8970/hub/). Close the window or press Ctrl+C to stop.
cd "$(dirname "$0")" || exit 1
exec python3 serve.py "$@"
