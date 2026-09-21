from PIL import Image, ImageDraw

N = 18
# wooden crate / gift box placeholder
out = Image.new('RGBA', (N, N), (0, 0, 0, 0))
px = out.load()
BROWN = (150, 101, 55)
BROWN_D = (104, 66, 33)
BROWN_L = (196, 143, 84)
BAND = (214, 178, 96)
def put(x, y, c):
    if 0 <= x < N and 0 <= y < N:
        px[x, y] = c

# body 2..15 (x), 5..15 (y)
for x in range(2, 16):
    for y in range(5, 16):
        edge = (x in (2, 15)) or (y in (5, 15))
        px[x, y] = BROWN_D if edge else BROWN
# light top highlight row
for x in range(3, 15):
    px[x, 6] = BROWN_L
# vertical plank band
for y in range(5, 16):
    px[8, y] = BROWN_L
    px[9, y] = BROWN_L
# diagonal cross planks
for i in range(9):
    put(3 + i, 7 + i, BAND)
    put(14 - i, 7 + i, BAND)
# lid / ribbon bow on top
for x in range(5, 13):
    px[x, 3] = BAND
    px[x, 4] = BROWN_L
# ribbon knot
px[8, 4] = BROWN_D
px[9, 4] = BROWN_D
# tiny bow loops
put(6, 2, BAND); put(7, 2, BAND); put(10, 2, BAND); put(11, 2, BAND)
put(6, 3, BAND); put(7, 3, BROWN_L); put(10, 3, BROWN_L); put(11, 3, BAND)

out.save(r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\eevee_tama\prod_art\item_crate.png')
prev = Image.new('RGB', (N * 8, N * 8), (253, 246, 227))
big = out.resize((N * 8, N * 8), Image.NEAREST)
prev.paste(big, (0, 0), big)
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\item_crate_preview.png')
print('saved', out.size)
