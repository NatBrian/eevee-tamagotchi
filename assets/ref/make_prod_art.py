import os, colorsys
from PIL import Image, ImageDraw, ImageFont

REF = r"C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref"
PROD = os.path.join(REF, "prod")
K = os.path.join(PROD, "kenney")
OUT = os.path.join(PROD, "kenney_tiles")

def crop_tiles(sheet, tile, gap, outdir, prefix):
    os.makedirs(outdir, exist_ok=True)
    im = Image.open(sheet).convert("RGBA")
    w, h = im.size
    cols = (w + gap) // (tile + gap)
    rows = (h + gap) // (tile + gap)
    n = 0
    for r in range(rows):
        for c in range(cols):
            x = c * (tile + gap); y = r * (tile + gap)
            t = im.crop((x, y, x + tile, y + tile))
            if t.getcolors(maxcolors=200000) is None or len(t.getcolors(maxcolors=200000)) > 2:
                t.save(os.path.join(outdir, f"{prefix}_r{r}c{c}.png"))
                n += 1
    print(f"{prefix}: {cols}x{rows} sheet {w}x{h} -> {n} non-blank tiles")

# 1) crop all tilemaps
crop_tiles(os.path.join(K, "pixel-platformer", "Tilemap", "tilemap.png"), 18, 1, os.path.join(OUT, "pp"), "pp")
crop_tiles(os.path.join(K, "pixel-platformer", "Tilemap", "tilemap-backgrounds.png"), 24, 1, os.path.join(OUT, "ppbg"), "ppbg")
food_sheet = os.path.join(K, "pixel-platformer-food-expansion", "Tilemap", "tilemap.png")
crop_tiles(food_sheet, 18, 1, os.path.join(OUT, "food"), "food")

# 2) stones: recolor PMD water stone -> leaf + ice
stone = Image.open(os.path.join(REF, "eeveelution-assets/eeveelution_sprites/vaporeon/water_stone.png")).convert("RGBA")
os.makedirs(os.path.join(PROD, "stones"), exist_ok=True)
stone.save(os.path.join(PROD, "stones", "water_stone.png"))

def recolor(img, hue_shift, sat, val):
    hsv = img.convert("HSV")
    h, s, v = hsv.split()
    def shift_h(px):
        if px == 0: return px
        return (px + hue_shift * 255) % 256
    h = h.point(shift_h)
    s = s.point(lambda p: min(255, int(p * sat)))
    v = v.point(lambda p: min(255, int(p * val)))
    out = Image.merge("HSV", (h, s, v)).convert("RGBA")
    return out

leaf = recolor(stone, 90, 1.15, 1.0)     # blue -> green
leaf.save(os.path.join(PROD, "stones", "leaf_stone.png"))
ice = recolor(stone, -20, 0.55, 1.25)    # pale icy blue
ice.save(os.path.join(PROD, "stones", "ice_stone.png"))
thunder = Image.open(os.path.join(REF, "eeveelution-assets/eeveelution_sprites/jolteon/thunder_stone.png")).convert("RGBA")
fire = Image.open(os.path.join(REF, "eeveelution-assets/eeveelution_sprites/flareon/fire_stone.png")).convert("RGBA")
thunder.save(os.path.join(PROD, "stones", "thunder_stone.png"))
fire.save(os.path.join(PROD, "stones", "fire_stone.png"))

# 3) furball poop (2 sizes)
def furball(size, fname):
    s = size
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = s // 2, s // 2 + 1
    r = s // 2 - 2
    outline, base, dark, light = (74, 44, 26, 255), (166, 106, 66, 255), (128, 76, 44, 255), (196, 140, 92, 255)
    # fluffy bumps around the rim
    import math
    for a in range(0, 360, 30):
        bx = cx + int(r * 0.82 * math.cos(math.radians(a)))
        by = cy + int(r * 0.82 * math.sin(math.radians(a)))
        d.ellipse([bx - r // 3, by - r // 3, bx + r // 3 + 1, by + r // 3 + 1], fill=base)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=base, outline=outline)
    # top swirl (spiral-ish)
    r2 = r // 2
    d.ellipse([cx - r2, cy - r - 1, cx + r2, cy - r + r2 + 1], fill=light, outline=outline)
    # shading + tufts
    d.arc([cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2], 20, 140, fill=dark, width=max(1, s // 18))
    for (tx, ty) in [(-r // 3, 1), (r // 4, 3), (0, -1)]:
        d.line([cx + tx, cy + ty, cx + tx + 1, cy + ty + 2], fill=dark, width=1)
    # shadow
    sh = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sh)
    ds.ellipse([cx - r - 1, cy + r - 2, cx + r + 1, cy + r + 4], fill=(0, 0, 0, 90))
    out = Image.alpha_composite(sh, im)
    out.save(os.path.join(PROD, "fx", fname))
    print("furball", fname, out.size)

os.makedirs(os.path.join(PROD, "fx"), exist_ok=True)
furball(30, "furball.png")
furball(22, "furball_small.png")

# 4) pet bed (pixel ellipse, pastel)
def petbed(w, h, fname):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rim, rim_dark, cush, cush_dark = (226, 154, 175, 255), (178, 106, 132, 255), (255, 240, 224, 255), (233, 205, 178, 255)
    d.ellipse([0, 0, w - 1, h - 1], fill=rim, outline=(94, 60, 46, 255), width=2)
    d.ellipse([8, 6, w - 9, h - 7], fill=cush, outline=cush_dark)
    d.ellipse([16, 12, w - 17, h - 13], fill=(255, 248, 238, 255))
    # stitches
    for x in range(20, w - 20, 14):
        d.line([x, h // 2 - 4, x + 4, h // 2 - 4], fill=cush_dark, width=1)
    im.save(os.path.join(PROD, "fx", fname))
    print("petbed", fname, im.size)
petbed(150, 74, "petbed.png")

# 5) tombstone
def tombstone(fname):
    w, h = 90, 110
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    g1, g2, outline = (178, 186, 194, 255), (138, 146, 156, 255), (66, 72, 80, 255)
    r = w // 2
    d.pieslice([2, 2, w - 3, 2 + 2 * r], 180, 360, fill=g1, outline=outline, width=2)
    d.rectangle([2, 2 + r, w - 3, h - 6], fill=g1, outline=outline, width=2)
    d.rectangle([8, 10, w - 9, h - 12], outline=g2, width=2)
    try:
        f = ImageFont.truetype(os.path.join(PROD, "font", "PressStart2P-Regular.ttf"), 12)
    except Exception:
        f = ImageFont.load_default()
    txt = "R.I.P."
    tw = d.textlength(txt, font=f)
    d.text(((w - tw) / 2, 34), txt, font=f, fill=g2)
    d.line([w // 2 - 14, 62, w // 2 + 14, 62], fill=g2, width=2)
    # grass base
    d.rectangle([0, h - 8, w - 1, h - 1], fill=(110, 168, 86, 255))
    im.save(os.path.join(PROD, "fx", fname))
    print("tombstone", fname, im.size)
tombstone("tombstone.png")

# 6) egg crack frames (from egg_colored)
egg = Image.open(os.path.join(REF, "serebii/egg_colored.png")).convert("RGBA")
w, h = egg.size
import random
random.seed(7)
def crack(frame, fname, n_pts, depth):
    im = egg.copy()
    d = ImageDraw.Draw(im)
    x = w // 2 + random.randint(-6, 6)
    y = h // 4
    pts = []
    for i in range(n_pts):
        x += random.randint(-6, 6)
        y += max(2, depth // n_pts) + random.randint(0, 2)
        pts.append((x, y))
    d.line(pts, fill=(96, 62, 44, 255), width=2)
    if frame == 2:
        x2 = x - 8; y2 = y - 6
        pts2 = [(x2, y2)]
        for i in range(4):
            x2 += random.randint(-5, 5); y2 += random.randint(2, 5)
            pts2.append((x2, y2))
        d.line(pts2, fill=(96, 62, 44, 255), width=2)
    im.save(os.path.join(PROD, "fx", fname))
    print("egg", fname, im.size)
crack(1, "egg_crack1.png", 6, h // 3)
crack(2, "egg_crack2.png", 9, h // 2)

print("DONE")
