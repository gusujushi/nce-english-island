"""打包：
- dist/新概念英语能力岛.html：可双击打开的电脑单文件版
- docs/：手机版（PWA：桌面图标、全屏、离线可用），发布到 GitHub Pages 后可“添加到主屏幕”
"""
import hashlib
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).parent
APP = ROOT / "app"


def inline(html):
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
                  lambda m: "<style>\n" + (APP / m.group(1)).read_text(encoding="utf-8") + "\n</style>", html)
    return re.sub(r'<script src="([^"]+)"></script>',
                  lambda m: "<script>\n" + (APP / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script") + "\n</script>", html)


html = inline((APP / "index.html").read_text(encoding="utf-8"))

# 电脑单文件版
dist = ROOT / "dist" / "新概念英语能力岛.html"
dist.parent.mkdir(exist_ok=True)
dist.write_text(html, encoding="utf-8")
print(f"已生成 {dist}（{dist.stat().st_size // 1024} KB）")

# 手机版（PWA）
PWA_HEAD = """  <link rel="manifest" href="manifest.webmanifest">
  <meta name="theme-color" content="#ff6b6b">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="新概念">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
"""
docs = ROOT / "docs"
docs.mkdir(exist_ok=True)
page = re.sub(r'<link rel="icon" href="[^"]*">', '<link rel="icon" href="icon-192.png">', html, count=1)
page = page.replace("</head>", PWA_HEAD + "</head>", 1)
(docs / "index.html").write_text(page, encoding="utf-8")
for icon in (APP / "icons").glob("*.png"):
    shutil.copy(icon, docs / icon.name)
(docs / ".nojekyll").write_text("", encoding="utf-8")

manifest = {
    "name": "新概念英语能力岛",
    "short_name": "新概念",
    "description": "新概念英语 1–4 册：彩色句子分析、英式发音、闯关学习计划",
    "lang": "zh-CN",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#fff8f0",
    "theme_color": "#ff6b6b",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
(docs / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

# 缓存名随内容变化：更新后手机会自动拿到新版本
version = hashlib.md5(page.encode("utf-8")).hexdigest()[:10]
shell = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"]
sw = f"""// 离线缓存（由 build.py 生成，请勿手改）
const CACHE = "nce-island-{version}";
const SHELL = {json.dumps(shell)};

self.addEventListener("install", (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
}});

self.addEventListener("activate", (e) => {{
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
}});

self.addEventListener("fetch", (e) => {{
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // 页面优先走网络（拿到最新版），断网时用缓存；图标等静态文件优先用缓存
  if (e.request.mode === "navigate") {{
    e.respondWith(fetch(e.request).then((r) => {{ const copy = r.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return r; }})
      .catch(() => caches.match("index.html")));
    return;
  }}
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
}});
"""
(docs / "sw.js").write_text(sw, encoding="utf-8")
print(f"已生成手机版 {docs}/（缓存版本 {version}）")
