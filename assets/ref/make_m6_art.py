# make_m6_art.py: M6 art: 4 fashion items, berry bush, ghost Eevee
# Outputs into assets/ref/eevee_tama/prod_art/ (manifest keys via A.fashion)
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'eevee_tama', 'prod_art')
os.makedirs(OUT, exist_ok=True)

INK = (45, 35, 40, 255)
RED = (232, 67, 63, 255)
RED_D = (160, 34, 32, 255)
RED_H = (255, 154, 134, 255)
CREAM = (249, 236, 205, 255)
CREAM_D = (222, 200, 158, 255)
LEAF = (88, 190, 96, 255)
LEAF_D = (46, 118, 62, 255)
LEAF_H = (150, 226, 140, 255)
LEAF_V = (64, 156, 80, 255)
GOLD = (246, 199, 66, 255)
GOLD_D = (158, 106, 22, 255)
GOLD_H = (255, 236, 150, 255)


def ell(d, box, fill):
    d.ellipse(box, fill=fill)


def star_pts(cx, cy, R, r, n=5, rot=-90):
    import math
    pts = []
    for i in range(n * 2):
        rad = math.radians(rot + i * 360 / (n * 2))
        rr = R if i % 2 == 0 else r
        pts.append((cx + rr * math.cos(rad), cy + rr * math.sin(rad)))
    return pts


def save(im, name):
    im.save(os.path.join(OUT, name))
    print('wrote', name, im.size)


# ---------------- fashion_bow (56x42) ----------------
def bow():
    im = Image.new('RGBA', (56, 42), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # tails (behind)
    d.polygon([(19, 22), (26, 24), (20, 40), (13, 37)], fill=RED_D)
    d.polygon([(37, 22), (30, 24), (36, 40), (43, 37)], fill=RED_D)
    d.polygon([(20, 24), (26, 25), (21, 37), (16, 35)], fill=RED)
    d.polygon([(36, 24), (30, 25), (35, 37), (40, 35)], fill=RED)
    # loops: ink then fill
    ell(d, (1, 6, 31, 30), INK)
    ell(d, (25, 6, 55, 30), INK)
    ell(d, (4, 9, 28, 27), RED)
    ell(d, (28, 9, 52, 27), RED)
    # loop highlights
    ell(d, (8, 12, 18, 18), RED_H)
    ell(d, (38, 12, 48, 18), RED_H)
    # loop inner shade (toward knot)
    ell(d, (20, 12, 27, 24), RED_D)
    ell(d, (29, 12, 36, 24), RED_D)
    # knot
    d.rounded_rectangle((19, 13, 37, 28), radius=5, fill=INK)
    d.rounded_rectangle((21, 15, 35, 26), radius=4, fill=RED)
    d.rounded_rectangle((23, 17, 30, 21), radius=2, fill=RED_H)
    save(im, 'fashion_bow.png')


# ---------------- fashion_scarf (56x30) ----------------
def scarf():
    im = Image.new('RGBA', (56, 30), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # hanging tail (behind band right end)
    d.rounded_rectangle((33, 8, 49, 28), radius=3, fill=INK)
    d.rounded_rectangle((35, 10, 47, 26), radius=2, fill=CREAM)
    d.rectangle((39, 10, 43, 26), fill=RED)
    d.polygon([(35, 26), (41, 22), (41, 28)], fill=INK)  # notch
    d.polygon([(41, 26), (47, 22), (47, 28)], fill=INK)
    # band
    d.rounded_rectangle((2, 2, 54, 18), radius=6, fill=INK)
    d.rounded_rectangle((4, 4, 52, 16), radius=5, fill=CREAM)
    for x in (12, 26, 40):
        d.rectangle((x, 4, x + 5, 16), fill=RED)
    d.rounded_rectangle((6, 5, 20, 8), radius=2, fill=CREAM_D)
    save(im, 'fashion_scarf.png')


# ---------------- fashion_leaflow (56x40): leaf hat ----------------
def leaflow():
    im = Image.new('RGBA', (56, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # stem (left, behind leaf)
    d.line([(8, 30), (3, 37)], fill=LEAF_D, width=4)
    d.line([(8, 30), (4, 36)], fill=LEAF_V, width=2)
    # leaf: pointed ellipse (draw big, then crop to shape via two arcs)
    d.pieslice((2, 6, 56, 40), 180, 360, fill=INK)
    d.polygon([(2, 23), (56, 23), (2, 6)], fill=INK)
    d.polygon([(2, 23), (56, 23), (2, 40)], fill=INK)
    d.pieslice((5, 9, 53, 37), 180, 360, fill=LEAF)
    d.polygon([(5, 23), (53, 23), (5, 11)], fill=LEAF)
    d.polygon([(5, 23), (53, 23), (5, 35)], fill=LEAF)
    # midrib
    d.line([(7, 23), (50, 23)], fill=LEAF_V, width=2)
    # veins
    for x in (16, 26, 36):
        d.line([(x, 23), (x + 6, 15)], fill=LEAF_V, width=1)
        d.line([(x, 23), (x + 6, 31)], fill=LEAF_V, width=1)
    # highlight
    d.arc((10, 12, 44, 24), 200, 320, fill=LEAF_H, width=2)
    save(im, 'fashion_leaflow.png')


# ---------------- fashion_star (40x40): gold star clip ----------------
def star():
    im = Image.new('RGBA', (40, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon(star_pts(20, 21, 19.5, 8.5), fill=GOLD_D)
    d.polygon(star_pts(20, 21, 16.5, 7.0), fill=GOLD)
    # facet: darker lower-right
    d.polygon(star_pts(20, 21, 16.5, 7.0)[1::1], fill=GOLD)  # no-op safe
    d.polygon([(20, 21), (20, 5), (28, 15), (36, 21), (28, 28), (20, 21)], fill=(233, 172, 40, 255))
    # sparkle
    d.rectangle((11, 11, 14, 14), fill=GOLD_H)
    d.rectangle((12, 9, 13, 16), fill=GOLD_H)
    d.rectangle((9, 12, 16, 13), fill=GOLD_H)
    save(im, 'fashion_star.png')


# ---------------- berry_bush (18x18): existing bush + berries ----------------
def berry_bush():
    bush = Image.open(os.path.join(ROOT, 'prod', 'scene', 'bush.png')).convert('RGBA')
    im = bush.copy()
    d = ImageDraw.Draw(im)
    w, h = im.size
    px = im.load()
    # berries: 2x2 red with ink shadow + white glint
    spots = [(5, 7), (10, 5), (13, 9), (7, 11), (11, 12), (4, 10)]
    for (bx, by) in spots:
        # only place on visible (green-ish) pixels
        if px[bx, by][3] < 40:
            continue
        d.rectangle((bx - 1, by, bx, by + 2), fill=INK)  # left shadow
        d.rectangle((bx, by + 3, bx + 1, by + 3), fill=INK)  # bottom shadow
        d.rectangle((bx, by, bx + 1, by + 1), fill=(214, 46, 44, 255))
        d.rectangle((bx, by, bx, by), fill=(255, 255, 255, 255))
    save(im, 'berry_bush.png')


# ---------------- ghost_eevee: chibi -> spectral ----------------
def ghost_eevee():
    import math
    chibi = Image.open(os.path.join(ROOT, 'pokemonsleep', 'eevee_normal.png')).convert('RGBA')
    w, h = chibi.size
    orig_a = chibi.getchannel('A')                    # silhouette (keep it!)
    hsv = chibi.convert('HSV')
    H, S, V = hsv.split()
    H2 = H.point(lambda _: 175)                       # teal hue
    S2 = S.point(lambda v: v * 90 // 255)             # 35% saturation
    V2 = V.point(lambda v: min(255, v * 110 // 255))  # 10% brighter
    im2 = Image.merge('HSV', (H2, S2, V2)).convert('RGBA')
    # blend toward pale spectral teal
    pale = Image.new('RGBA', im2.size, (168, 235, 238, 255))
    im2 = Image.blend(im2, pale, 0.38)
    # alpha: original silhouette, fade bottom + scalloped ghost tail
    data = list(orig_a.getdata())
    for y in range(h):
        ys = y / (h - 1)
        fade = max(0.28, min(1.0, (1.0 - ys) / 0.55))
        for x in range(w):
            i = y * w + x
            v = data[i]
            if not v:
                continue
            f = fade
            if ys > 0.72:
                f *= 0.55 + 0.45 * math.sin((x / w) * math.pi * 7.0 + ys * 3.0)
            data[i] = int(v * f * 0.94)
    im2.putalpha(Image.frombytes('L', (w, h), bytes(data)))
    # soft glow: add a blurred halo
    halo = im2.filter(ImageFilter.GaussianBlur(3))
    out = Image.new('RGBA', im2.size, (0, 0, 0, 0))
    out = Image.alpha_composite(out, halo)
    out = Image.alpha_composite(out, im2)
    out = out.resize((140, 128), Image.LANCZOS)
    save(out, 'ghost_eevee.png')


bow()
scarf()
leaflow()
star()
berry_bush()
ghost_eevee()
print('done')
