#!/usr/bin/env python3
import os, re, json, sys, urllib.request, urllib.parse, hashlib

OUT = ".arena-fetch/raw"
IMG = ".arena-fetch/raw/images"
os.makedirs(OUT, exist_ok=True)
os.makedirs(IMG, exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"}

PAGES = ["", "services", "window-cleaning", "power-washing", "gutter-cleaning",
         "christmas-light-installation", "faq", "contact-us"]

def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")

htmls = {}
for p in PAGES:
    name = p or "home"
    url = "https://www.2sonswindows.com/" + p
    try:
        h = get(url)
        htmls[name] = h
        open(os.path.join(OUT, name + ".html"), "w").write(h)
        print("ok", name, len(h))
    except Exception as e:
        print("fail", name, e)

# collect image urls (strip wix transform params -> get high-res original)
urls = set()
for name, h in htmls.items():
    for m in re.finditer(r'https://static\.wixstatic\.com/media/[^"\'\s\\)<>]+', h):
        u = m.group(0)
        u = u.split('/v1/')[0]
        urls.add(u)

print("images found:", len(urls))
open(os.path.join(OUT, "image-urls.txt"), "w").write("\n".join(sorted(urls)))

for u in sorted(urls):
    base = u.split('/media/')[1].split('~mv2')[0]
    ext = os.path.splitext(u)[1] or ".jpg"
    ext = ext.split('?')[0]
    fn = os.path.join(IMG, base + ext)
    if os.path.exists(fn) and os.path.getsize(fn) > 1000:
        continue
    try:
        data = get(u, binary=True)
        open(fn, "wb").write(data)
        print("img", fn, len(data))
    except Exception as e:
        print("imgfail", u, e)
