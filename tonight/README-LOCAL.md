# tonight · run it on your Mac

Everything the site needs is inside this folder (nothing links outside it; scripts, fonts and media are all bundled, so it runs offline).

**Easiest:** double-click `start.command`. A Terminal window opens, the server starts, and your browser opens the hub at
http://127.0.0.1:8970/hub/ . The opener is at http://127.0.0.1:8970/ . Close the Terminal window (or press Ctrl+C) to stop.

If macOS says it can't open `start.command` because it is from an unidentified developer: right-click it → Open → Open (once).
If it says "permission denied", run once in Terminal: `chmod +x start.command`.

**From Terminal:**

    cd path/to/tonight
    python3 serve.py            # port 8970, opens the hub
    python3 serve.py 9000       # another port
    python3 serve.py --no-open  # don't open a browser

Needs only Python 3 (built into macOS with the Command Line Tools; or python.org). The server supports HTTP Range requests,
so videos can be scrubbed / seeked. Opening `index.html` straight from Finder (file://) will not work for most pieces — use the server.

