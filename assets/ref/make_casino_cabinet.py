"""Candy-pixel slot cabinet for the POKÉ CASINO (260x322 = 130x161 @2x).
The dark recessed screen area is where casino.js draws the reels/wheel/cards.
Screen recess in @2x coords: x 28..232, y 68..232 (204x164), center (130,150).
"""
from PIL import Image, ImageDraw

INK = (58, 40, 34, 255)
PINK = (247, 143, 179, 255)
PINK_LT = (255, 187, 214, 255)
PINK_DK = (206, 92, 141, 255)
CREAM = (255, 246, 227, 255)
GOLD = (247, 201, 72, 255)
DARK = (35, 35, 63, 255)
DARK_LT = (58, 58, 98, 255)

W, H = 130, 161
im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(im)

def rect(x0, y0, x1, y1, fill, outline=None, owidth=2):
    d.rectangle([x0, y0, x1, y1], fill=fill, outline=outline, width=owidth)

# body (drawn first, behind marquee)
rect(4, 26, 126, 148, PINK, INK, 2)
# side shading
for x in range(8, 123):
    if x < 14:
        d.line([(x, 28), (x, 146)], fill=PINK_LT)
    elif x > 116:
        d.line([(x, 28), (x, 146)], fill=PINK_DK)

# marquee
rect(8, 4, 122, 28, CREAM, INK, 2)
for bx in range(18, 122, 14):
    d.ellipse([bx - 2, 12, bx + 2, 16], fill=GOLD, outline=INK, width=1)

# screen recess
rect(14, 34, 116, 118, DARK, INK, 2)
# inner bevel
d.line([(16, 116), (114, 116)], fill=DARK_LT, width=2)
d.line([(114, 36), (114, 116)], fill=DARK_LT, width=2)

# button row
for cx in (38, 65, 92):
    d.ellipse([cx - 6, 126, cx + 6, 138], fill=CREAM, outline=INK, width=2)

# coin slot
rect(56, 141, 74, 146, INK)
d.rectangle([58, 142, 72, 145], fill=(35, 35, 63, 255))

# base
rect(8, 148, 122, 160, PINK_DK, INK, 2)

# lever (right side)
d.line([(126, 84), (129, 72)], fill=INK, width=3)
d.ellipse([124, 62, 130, 68], fill=GOLD, outline=INK, width=2)

# outline crisp pass: redraw full perimeter
for (x0, y0, x1, y1) in [(4, 26, 126, 148)]:
    d.rectangle([x0, y0, x1, y1], outline=INK, width=2)

big = im.resize((W * 2, H * 2), Image.NEAREST)
OUT = r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\eevee_tama\prod_art\slot_cabinet.png'
big.save(OUT)
print('saved', OUT, big.size)

# preview on cream at 4x of the @1x art
prev = Image.new('RGB', (W * 4 + 40, H * 4 + 40), (253, 246, 227))
pv = im.resize((W * 4, H * 4), Image.NEAREST)
prev.paste(pv, (20, 20), pv)
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\cabinet_preview.png')
print('preview saved')
