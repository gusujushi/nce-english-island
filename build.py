"""把 app/index.html 及其 CSS/JS 打包成一个可双击打开的单文件：dist/新概念英语能力岛.html"""
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
APP = ROOT / "app"
html = (APP / "index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: "<style>\n" + (APP / m.group(1)).read_text(encoding="utf-8") + "\n</style>", html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: "<script>\n" + (APP / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script") + "\n</script>", html)
out = ROOT / "dist" / "新概念英语能力岛.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"已生成 {out}（{out.stat().st_size // 1024} KB）")
