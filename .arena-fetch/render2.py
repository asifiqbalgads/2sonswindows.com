#!/usr/bin/env python3
import os, json, traceback
OUT = ".arena-fetch/rendered2"
os.makedirs(OUT, exist_ok=True)
URL = "https://www-2sonswindows-com.filesusr.com/html/ed32d8_f24ce38183886a17ccf98ede3966daa9.html"
def log(*a):
    print(*a, flush=True)
    open(os.path.join(OUT, "_status.txt"), "a").write(" ".join(map(str, a)) + "\n")
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    for w, tag in ((1400, "desktop"), (390, "mobile")):
        ctx = b.new_context(viewport={"width": w, "height": 1000}, device_scale_factor=2)
        page = ctx.new_page()
        try:
            page.goto(URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(9000)
            page.screenshot(path=os.path.join(OUT, f"widget-{tag}.png"), full_page=True)
            html = page.content()
            open(os.path.join(OUT, f"widget-{tag}.html"), "w").write(html)
            log(tag, "ok", len(html))
            if tag == "desktop":
                info = page.evaluate("""() => {
                  const pick = ["font-family","font-size","font-weight","line-height","color","background-color","border-radius","padding","margin","box-shadow","border","width","height","letter-spacing","text-transform","gap","display","grid-template-columns"];
                  const sel = ['body','[class*=header]','[class*=Header]','[class*=title]','[class*=rating]','[class*=star]','[class*=review-item]','[class*=reviewItem]','[class*=review]','[class*=avatar]','[class*=name]','[class*=date]','[class*=text]','[class*=button]','[class*=footer]','[class*=Google]','a'];
                  const out = [];
                  const seen = new Set();
                  for (const s of sel) {
                    const els = [...document.querySelectorAll(s)].slice(0, 6);
                    for (const el of els) {
                      const cls = el.className && el.className.toString().slice(0,120);
                      const key = el.tagName + '|' + cls;
                      if (seen.has(key)) continue;
                      seen.add(key);
                      const cs = getComputedStyle(el);
                      const o = {tag: el.tagName, cls, text: (el.innerText||'').slice(0,60)};
                      for (const p of pick) o[p] = cs.getPropertyValue(p);
                      out.push(o);
                    }
                  }
                  return out;
                }""")
                open(os.path.join(OUT, "styles.json"), "w").write(json.dumps(info, indent=1))
                log("styles", len(info))
        except Exception:
            log(tag, "ERR", traceback.format_exc()[:2000])
        ctx.close()
    b.close()
