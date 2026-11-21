#!/usr/bin/env python3
import os, json, traceback
OUT = ".arena-fetch/rendered"
os.makedirs(OUT, exist_ok=True)
LOG = []
def log(*a):
    s = " ".join(str(x) for x in a)
    LOG.append(s)
    print(s, flush=True)
    open(os.path.join(OUT, "_status.txt"), "w").write("\n".join(LOG))

try:
    from playwright.sync_api import sync_playwright
except Exception as e:
    log("import fail", e); raise

URL = "https://www.2sonswindows.com/"

def run():
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-sandbox"])
        log("launched")
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        page = ctx.new_page()
        page.on("console", lambda m: None)
        try:
            page.goto(URL, wait_until="domcontentloaded", timeout=90000)
            log("domcontentloaded")
        except Exception as e:
            log("goto err", repr(e))
        page.wait_for_timeout(6000)
        for i in range(14):
            try:
                page.mouse.wheel(0, 1200)
            except Exception:
                pass
            page.wait_for_timeout(800)
        page.wait_for_timeout(5000)
        try:
            html = page.content()
            open(os.path.join(OUT, "home-rendered.html"), "w").write(html)
            log("html len", len(html))
        except Exception as e:
            log("content err", repr(e))

        frames = []
        for idx, f in enumerate(page.frames):
            info = {"i": idx, "url": f.url, "name": f.name}
            frames.append(info)
            body = ""
            try:
                body = f.evaluate("() => document.documentElement.outerHTML")
            except Exception as e:
                body = "ERR " + repr(e)
            fn = f"frame_{idx:02d}.html"
            open(os.path.join(OUT, fn), "w").write(body or "")
            info["len"] = len(body or "")
            try:
                txt = f.evaluate("() => document.body ? document.body.innerText : ''") or ""
            except Exception:
                txt = ""
            if txt.strip():
                open(os.path.join(OUT, f"text_{idx:02d}.txt"), "w").write(txt)
            log("frame", idx, info["url"][:100], info["len"])
        open(os.path.join(OUT, "frames.json"), "w").write(json.dumps(frames, indent=1))

        try:
            page.screenshot(path=os.path.join(OUT, "desktop-full.png"), full_page=True)
            log("desktop shot ok")
        except Exception as e:
            log("desktop shot err", repr(e))
        try:
            b.close()
        except Exception:
            pass

try:
    run()
    log("DONE")
except Exception:
    log("FATAL", traceback.format_exc())
