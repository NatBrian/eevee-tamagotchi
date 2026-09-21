"""Regenerate the 5 evolution stones in a consistent pixel-gem style.
Template = the water stone gem (13x12) from the Kenney set; recolor per palette.
Output: 44x44 RGBA, gem scaled 3x and centered (crisp 1:1 in the 44px shop cells).
"""
from PIL import Image

SRC = r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\prod\stones\water_stone.png'
OUT = r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\prod\stones'

gem = Image.open(SRC).convert('RGBA').crop((26, 26, 39, 38))
W, H = gem.size  # 13x12
gp = gem.load()

# water color roles -> (base, mid, dark, mid2)
WATER = {
    (160, 232, 248): 'base',
    (64, 192, 248): 'mid',
    (0, 56, 168): 'dark',
    (32, 128, 208): 'mid2',
}
SPEC = (248, 248, 248)
INK = (0, 0, 0)

# per-pixel role map from the template
roles = {}
for y in range(H):
    for x in range(W):
        r, g, b, a = gp[x, y]
        if a < 128:
            continue
        key = (r, g, b)
        if key in WATER:
            roles[(x, y)] = WATER[key]
        elif key == SPEC:
            roles[(x, y)] = 'spec'
        elif key == INK:
            roles[(x, y)] = 'ink'
        else:
            roles[(x, y)] = 'base'  # safety

PALETTES = {
    'water':   dict(base=(160, 232, 248), mid=(64, 192, 248), dark=(0, 56, 168), mid2=(32, 128, 208)),
    'thunder': dict(base=(248, 240, 0), mid=(216, 176, 0), dark=(112, 56, 0), mid2=(160, 104, 0)),
    'fire':    dict(base=(255, 152, 80), mid=(232, 88, 40), dark=(136, 28, 12), mid2=(184, 56, 20)),
    'leaf':    dict(base=(152, 224, 96), mid=(88, 184, 56), dark=(28, 104, 20), mid2=(56, 144, 32)),
    'ice':     dict(base=(200, 220, 252), mid=(140, 170, 236), dark=(64, 88, 168), mid2=(96, 128, 200)),
}
WHITE = (255, 255, 255)

def build(pal):
    small = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sp = small.load()
    for (x, y), role in roles.items():
        if role == 'ink':
            sp[x, y] = INK + (255,)
        elif role == 'spec':
            sp[x, y] = WHITE + (255,)
        else:
            sp[x, y] = pal[role] + (255,)
    big = small.resize((W * 3, H * 3), Image.NEAREST)
    canvas = Image.new('RGBA', (44, 44), (0, 0, 0, 0))
    canvas.paste(big, ((44 - W * 3) // 2, (44 - H * 3) // 2), big)
    return canvas

for name, pal in PALETTES.items():
    build(pal).save(OUT + r'\%s_stone.png' % name)
    print('saved', name)

# preview montage on cream
M = 6
pad = 14
prev = Image.new('RGB', (5 * (44 * M + pad) + pad, 44 * M + pad * 2), (253, 246, 227))
for i, name in enumerate(PALETTES):
    im = Image.open(OUT + r'\%s_stone.png' % name)
    big = im.resize((im.width * M, im.height * M), Image.NEAREST)
    prev.paste(big, (pad + i * (44 * M + pad), pad), big)
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\stones_new.png')
print('preview saved')
