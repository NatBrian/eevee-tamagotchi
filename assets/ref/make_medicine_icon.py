from PIL import Image

NW, NH = 20, 26
out = Image.new('RGBA', (NW, NH), (0, 0, 0, 0))
px = out.load()
AMBER = (206, 132, 46, 255); AMBER_D = (146, 86, 26, 255); AMBER_L = (236, 176, 96, 255)
CREAM = (248, 240, 222, 255); CREAM_D = (206, 192, 164, 255)
RED = (222, 58, 48, 255)

def put(x, y, c):
    if 0 <= x < NW and 0 <= y < NH: px[x, y] = c

# cap
for y in range(1, 6):
    for x in range(7, 13): put(x, y, (255, 252, 245, 255) if y == 1 else CREAM)
for x in range(7, 13): put(x, 5, CREAM_D)
# neck
for y in range(6, 8):
    for x in range(8, 12): put(x, y, AMBER)
# body (rounded)
for y in range(8, 25):
    half = 4 if (y <= 9 or y >= 24) else 5
    for x in range(10 - half, 10 + half + 1):
        edge = x in (10 - half, 10 + half) or y == 24
        put(x, y, AMBER_D if edge else AMBER)
# highlight
for y in range(9, 24): put(5, y, AMBER_L)
# label
for y in range(12, 21):
    for x in range(6, 14): put(x, y, CREAM)
for x in (6, 13):
    for y in range(12, 21): put(x, y, CREAM_D)
# red cross
for x in (9, 10):
    for y in range(13, 19): put(x, y, RED)
for y in (15, 16):
    for x in range(7, 13): put(x, y, RED)

out.save(r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\eevee_tama\prod_art\medicine.png')
prev = Image.new('RGB', (NW * 10, NH * 10), (253, 246, 227))
big = out.resize((NW * 10, NH * 10), Image.NEAREST)
prev.paste(big, (0, 0), big)
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\medicine_preview.png')
print('saved', out.size)
