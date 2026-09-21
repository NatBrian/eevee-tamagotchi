"""M1 PIL assets: title logo + PWA icons (contact-sheet verified by vision before use)."""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = r"C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref"
OUT = os.path.join(BASE, "eevee_tama")
os.makedirs(os.path.join(OUT, "prod_art"), exist_ok=True)
os.makedirs(os.path.join(OUT, "icon"), exist_ok=True)

INK = (74, 59, 50, 255)
CREAM = (255, 248, 239, 255)
GOLD = (247, 201, 72, 255)
SOFT = (217, 198, 174, 255)

def font(size):
    return ImageFont.truetype(os.path.join(BASE, "prod", "font", "PressStart2P-Regular.ttf"), size)

def tile_bg(img, w, h, tw, th):
    out = Image.new("RGBA", (w, h))
    for y in range(0, h, th):
        for x in range(0, w, tw):
            out.paste(img, (x, y))
    return out.crop((0, 0, w, h))

sky = Image.open(os.path.join(BASE, "prod", "scene", "sky_day.png")).convert("RGBA")
grass = Image.open(os.path.join(BASE, "prod", "scene", "grass_top_0.png")).convert("RGBA")
egg = Image.open(os.path.join(BASE, "serebii", "egg_colored.png")).convert("RGBA")

def meadow(w, h, sky_frac=0.55):
    skyh = int(h * sky_frac)
    sky_bg = sky.resize((w, skyh), Image.NEAREST)
    grass_bg = tile_bg(grass, w, h - skyh + 24, 36, 36).crop((0, 0, w, h - skyh))
    out = Image.new("RGBA", (w, h))
    out.paste(sky_bg, (0, 0))
    out.paste(grass_bg, (0, skyh - 24))
    # soft horizon
    d = ImageDraw.Draw(out)
    d.rectangle((0, skyh - 24, w, skyh), fill=(143, 191, 106, 255))
    return out

def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    return m

# ---------------- title logo 720x260 ----------------
W, H = 720, 260
logo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(logo)
d.rounded_rectangle((6, 6, W - 7, H - 7), 46, fill=CREAM, outline=INK, width=10)
# egg
eh = 170
ew = int(egg.width * eh / egg.height)
egg_r = egg.resize((ew, eh), Image.NEAREST)
logo.paste(egg_r, (90, (H - eh) // 2), egg_r)
# sparkles near egg
for (sx, sy, sz) in [(70, 60, 14), (290, 50, 10), (280, 190, 12), (60, 185, 10)]:
    d.ellipse((sx - sz // 2, sy - sz // 2, sx + sz // 2, sy + sz // 2), fill=GOLD)
# text
t1 = font(76)
t2 = font(44)
d.text((330, 62), "EEVEE", font=t1, fill=SOFT)          # shadow
d.text((330, 54), "EEVEE", font=t1, fill=INK)
d.text((332, 168), "TAMA", font=t2, fill=SOFT)
d.text((332, 160), "TAMA", font=t2, fill=(226, 109, 92, 255))
# little underline dots
for i in range(3):
    d.ellipse((334 + i * 34, 224, 350 + i * 34, 240), fill=GOLD)
logo.save(os.path.join(OUT, "prod_art", "logo_title.png"))
print("logo_title", logo.size)

# ---------------- PWA icons ----------------
def make_icon(size, maskable):
    skyh_frac = 0.52
    bg = meadow(size, size, skyh_frac)
    # egg centered (smaller for maskable safe zone)
    eh = int(size * (0.52 if maskable else 0.62))
    ew = int(egg.width * eh / egg.height)
    egg_r = egg.resize((ew, eh), Image.NEAREST)
    cx, cy = size // 2, int(size * 0.5)
    bg.paste(egg_r, (cx - ew // 2, cy - eh // 2), egg_r)
    d = ImageDraw.Draw(bg)
    if maskable:
        out = bg
    else:
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(bg, (0, 0), rounded_mask(size, size, int(size * 0.19)))
    out.save(os.path.join(OUT, "icon", f"icon-{size}" + ("-maskable" if maskable else "") + ".png"))
    print(f"icon-{size}", "maskable" if maskable else "")

make_icon(192, False)
make_icon(512, False)
make_icon(512, True)
print("done")
