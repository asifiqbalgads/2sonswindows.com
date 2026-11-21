#!/usr/bin/env python3
import os, json, asyncio
from playwright.async_api import async_playwright

OUT = ".arena-fetch/rendered"
os.makedirs(OUT, exist_ok=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        page = await ctx.new_page()
        await page.goto("https://www.2sonswindows.com/", wait_until="networkidle", timeout=120000)
        # scroll to trigger lazy widgets
        for i in range(12):
            await page.mouse.wheel(0, 1400)
            await page.wait_for_timeout(700)
        await page.wait_for_timeout(4000)
        html = await page.content()
        open(os.path.join(OUT, "home-rendered.html"), "w").write(html)

        frames = []
        for f in page.frames:
            frames.append({"url": f.url, "name": f.name})
            try:
                body = await f.evaluate("() => document.documentElement.outerHTML")
            except Exception as e:
                body = "ERR " + str(e)
            safe = f.url.replace("https://", "").replace("/", "_").replace("?", "_")[:120] or "main"
            open(os.path.join(OUT, f"frame_{len(frames):02d}_{safe[:80]}.html"), "w").write(body or "")
        open(os.path.join(OUT, "frames.json"), "w").write(json.dumps(frames, indent=1))

        # extract text of iframes that look like reviews
        for i, f in enumerate(page.frames):
            try:
                txt = await f.evaluate("() => document.body ? document.body.innerText : ''")
            except Exception:
                txt = ""
            if txt and ("review" in txt.lower() or "star" in txt.lower() or "google" in txt.lower()):
                open(os.path.join(OUT, f"reviewtext_{i:02d}.txt"), "w").write(txt)
        await page.screenshot(path=os.path.join(OUT, "desktop-full.png"), full_page=True)

        ctx2 = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        p2 = await ctx2.new_page()
        await p2.goto("https://www.2sonswindows.com/", wait_until="networkidle", timeout=120000)
        for i in range(14):
            await p2.mouse.wheel(0, 1200)
            await p2.wait_for_timeout(600)
        await p2.wait_for_timeout(3000)
        await p2.screenshot(path=os.path.join(OUT, "mobile-full.png"), full_page=True)
        await b.close()

asyncio.run(main())
