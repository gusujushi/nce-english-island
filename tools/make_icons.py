"""生成手机桌面图标（app/icons/）。只需在修改图标设计时运行一次。"""
import pathlib
from PIL import Image, ImageDraw, ImageFont

OUT = pathlib.Path(__file__).resolve().parent.parent / "app" / "icons"
OUT.mkdir(exist_ok=True)
CJK = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
STOPS = [(255, 107, 107), (249, 168, 38), (18, 164, 182), (155, 93, 229)]  # 四册配色


def gradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1)) * (len(STOPS) - 1)
            i = min(int(t), len(STOPS) - 2)
            f = t - i
            a, b = STOPS[i], STOPS[i + 1]
            px[x, y] = tuple(round(a[k] + (b[k] - a[k]) * f) for k in range(3))
    return img


def make(size, safe, rounded):
    img = gradient(size).convert("RGBA")
    d = ImageDraw.Draw(img)
    s = size * safe  # 内容区域边长（maskable 图标要留安全区）
    c = size / 2
    # 白色圆形“岛屿”
    r = s * 0.42
    d.ellipse([c - r, c - r * 1.02, c + r, c + r * 0.98], fill=(255, 255, 255, 235))
    f1 = ImageFont.truetype(CJK, int(s * 0.42))
    d.text((c, c - s * 0.05), "新", font=f1, fill=(43, 45, 66), anchor="mm")
    f2 = ImageFont.truetype(LATIN, int(s * 0.13))
    d.text((c, c + s * 0.25), "1–4", font=f2, fill=(155, 93, 229), anchor="mm")
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
        img.putalpha(mask)
    return img


make(192, 0.92, True).save(OUT / "icon-192.png")
make(512, 0.92, True).save(OUT / "icon-512.png")
make(512, 0.72, False).save(OUT / "icon-maskable-512.png")
make(180, 0.92, False).convert("RGB").save(OUT / "apple-touch-icon.png")
print("icons ->", OUT)
