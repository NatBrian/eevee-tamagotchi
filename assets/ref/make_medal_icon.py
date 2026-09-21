from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math

S = 240
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
cx, cy = S / 2, S / 2 + 8
R, r = 104, 44
pts = []
for i in range(10):
    ang = math.radians(-90 + i * 36)
    rad = R if i % 2 == 0 else r
    pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
d.polygon(pts, fill=(255, 255, 255, 255))

N = 17
small = img.resize((N, N), Image.NEAREST)
mask = small.split()[3]
# outline = mask dilated by 1px
outline = mask.filter(ImageFilter.MaxFilter(3))

GOLD = (244, 192, 70, 255)
DARK = (112, 74, 18, 255)
HILITE = (255, 236, 176, 255)

out = Image.new('RGBA', (N, N), (0, 0, 0, 0))
# dark outline under everything
ol = Image.new('RGBA', (N, N), DARK)
out.paste(ol, (0, 0), outline)
# gold body
gl = Image.new('RGBA', (N, N), GOLD)
out.paste(gl, (0, 0), mask)
# top-left highlight (upper 40%)
band = Image.new('L', (N, N), 0)
ImageDraw.Draw(band).rectangle([0, 0, N, 7], fill=255)
hl = ImageChops.multiply(mask, band)
hll = Image.new('RGBA', (N, N), HILITE)
out.paste(hll, (0, 0), hl)

out.save(r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\eevee_tama\prod_art\medal_star.png')
# also a big preview on dark
prev = Image.new('RGB', (N * 8, N * 8), (45, 42, 60))
prev.paste(out.resize((N * 8, N * 8), Image.NEAREST), (0, 0), out.resize((N * 8, N * 8), Image.NEAREST))
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\medal_star_preview.png')
print('saved', out.size)
