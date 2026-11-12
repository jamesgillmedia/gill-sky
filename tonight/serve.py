#!/usr/bin/env python3
"""tonight · local static server (Python 3 standard library only).
Serves this folder with HTTP Range support (so video seeking works) and opens the hub in the browser.
Usage:  python3 serve.py [port] [--no-open]      default port 8970
Based on the lens-A serve.py."""
import os, sys, webbrowser, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))

class RangeHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript',
                      '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json',
                      '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg'}

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path.split("?", 1)[0].split("#", 1)[0])
        if os.path.isdir(path):
            return super().send_head()
        if not os.path.isfile(path):
            self.send_error(404, "File not found")
            return None
        ctype = self.guess_type(path)
        try:
            fs = os.stat(path)
        except OSError:
            self.send_error(404, "File not found")
            return None
        size = fs.st_size
        start, end = 0, size - 1
        rng = self.headers.get("Range")
        partial = False
        if rng and rng.startswith("bytes="):
            spec = rng.split("=", 1)[1].split(",")[0].strip()
            a, _, b = spec.partition("-")
            try:
                if a == "" and b != "":          # suffix range: the last N bytes
                    start, end = max(0, size - int(b)), size - 1
                else:
                    if a != "": start = int(a)
                    if b != "": end = int(b)
            except ValueError:
                start, end = 0, size - 1
            start = max(0, start); end = min(end, size - 1)
            if start > end:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None
            partial = True
        if partial:
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        f = open(path, "rb")
        if start:
            f.seek(start)
        self._range_len = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_len", None)
        if remaining is None:
            super().copyfile(source, outputfile)
            return
        del self._range_len
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            try:
                outputfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                break
            remaining -= len(chunk)

    def log_message(self, fmt, *args):
        return

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    port = int(args[0]) if args else 8970
    httpd = ThreadingHTTPServer(("127.0.0.1", port), RangeHandler)
    url = f"http://127.0.0.1:{port}/hub/"
    print(f"tonight · serving {ROOT}\n  hub:    {url}\n  opener: http://127.0.0.1:{port}/\nPress Ctrl+C to stop.", flush=True)
    if "--no-open" not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped.")
