"""Pixel playing cards for the Card Flip minigame.
Theme: Hearts=Fire(red) Diamonds=Water(blue) Clubs=Grass(green) Spades=Thunder(yellow).
52 faces + 1 back -> eevee_tama/cards/card<Suit><Rank>.png (44x60).
Rank/suit layout: corner index top-left + bottom-right (rotated), center suit.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\eevee_tama\cards'
os.makedirs(OUT, exist_ok=True)
FONT_PATH = r'C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\prod\font\PressStart2P-Regular.ttf'

INK = (58, 40, 34)
CREAM = (255, 246, 227)
PINK = (247, 143, 179)
GOLD = (247, 201, 72)

SUITS = {
    'Hearts':   {'color': (224, 82, 82),  'map': [
        '.XX...XX.',
        'XXXX.XXXX',
        'XXXXXXXXX',
        'XXXXXXXXX',
        '.XXXXXXX.',
        '..XXXXX..',
        '...XXX...',
        '....X....',
    ]},
    'Diamonds': {'color': (82, 114, 224), 'map': [
        '....X....',
        '...XXX...',
        '...XXX...',
        '..XXXXX..',
        '.XXXXXXX.',
        '.XXXXXXX.',
        '..XXXXX..',
        '...XXX...',
    ]},
    'Clubs':    {'color': (82, 180, 90),  'map': [
        '...XXX...',
        '...XXX...',
        '.XXXXXXX.',
        '.XXX.XXX.',
        '.XXXXXXX.',
        '..XXXXX..',
        '...XXX...',
        '...XXX...',
    ]},
    'Spades':   {'color': (232, 180, 10), 'map': [
        '....XXX.',
        '...XX...',
        '..XX....',
        '.XXXXXX.',
        '...XX...',
        '..XX....',
        '.XX.....',
        '.X......',
    ]},
}
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
W, H = 44, 60


def bake_suit(suit, sc=3):
    m = SUITS[suit]['map']
    w = max(len(r) for r in m)
    cv = Image.new('RGBA', (w * sc + 4, len(m) * sc + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(cv)
    col = SUITS[suit]['color']
    for y in range(len(m)):
        for x in range(len(m[y])):
            if m[y][x] == 'X':
                d.rectangle([x * sc + 2 - sc, y * sc + 2 - sc, x * sc + 2 + 2 * sc - 1, y * sc + 2 + 2 * sc - 1], fill=INK)
    for y in range(len(m)):
        for x in range(len(m[y])):
            if m[y][x] == 'X':
                d.rectangle([x * sc + 2, y * sc + 2, x * sc + 2 + sc - 1, y * sc + 2 + sc - 1], fill=col)
    return cv


def face_card(suit, rank):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # border + face
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=7, fill=CREAM, outline=INK, width=2)
    d.rounded_rectangle([2, 2, W - 3, H - 3], radius=5, outline=(255, 246, 227))
    f = ImageFont.truetype(FONT_PATH, 11)
    col = SUITS[suit]['color']
    # top-left index
    if rank == '10':
        d.text((4, 3), '1', font=f, fill=INK, anchor='la')
        d.text((4, 12), '0', font=f, fill=INK, anchor='la')
    else:
        d.text((4, 4), rank, font=f, fill=INK, anchor='la')
    # center suit
    big = bake_suit(suit, 3)
    im.paste(big, ((W - big.width) // 2, (H - big.height) // 2 - 2), big)
    # bottom-right index (rotated 180)
    corner = Image.new('RGBA', (16, 20), (0, 0, 0, 0))
    cd = ImageDraw.Draw(corner)
    if rank == '10':
        cd.text((2, 0), '1', font=f, fill=INK, anchor='la')
        cd.text((2, 9), '0', font=f, fill=INK, anchor='la')
    else:
        cd.text((2, 1), rank, font=f, fill=INK, anchor='la')
    corner = corner.rotate(180, expand=False)
    im.paste(corner, (W - 16, H - 20), corner)
    # suit tint frame accent
    d.rounded_rectangle([2, 2, W - 3, H - 3], radius=5, outline=col, width=1)
    return im


def back_card():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=7, fill=PINK, outline=INK, width=2)
    d.rounded_rectangle([4, 4, W - 5, H - 5], radius=5, outline=(255, 246, 227))
    # diamond pattern
    for y in range(8, H - 8, 10):
        for x in range(8, W - 8, 10):
            d.polygon([(x, y - 3), (x + 3, y), (x, y + 3), (x - 3, y)], fill=(255, 214, 232))
    d.polygon([(W // 2, 18), (W // 2 + 10, H // 2), (W // 2, H - 18), (W // 2 - 10, H // 2)], fill=GOLD, outline=INK)
    return im


count = 0
for suit in SUITS:
    for rank in RANKS:
        face_card(suit, rank).save(os.path.join(OUT, f'card{suit}{rank}.png'))
        count += 1
back_card().save(os.path.join(OUT, 'cardBack.png'))
count += 1

# preview: the 4 game cards + back at 3x
prev = Image.new('RGB', (5 * (W * 3 + 10) + 10, H * 3 + 20), (35, 35, 63))
for i, (s, r) in enumerate([('Hearts', 'A'), ('Diamonds', 'K'), ('Clubs', 'Q'), ('Spades', 'J')]):
    im = Image.open(os.path.join(OUT, f'card{s}{r}.png')).resize((W * 3, H * 3), Image.NEAREST)
    prev.paste(im, (10 + i * (W * 3 + 10), 10), im)
im = Image.open(os.path.join(OUT, 'cardBack.png')).resize((W * 3, H * 3), Image.NEAREST)
prev.paste(im, (10 + 4 * (W * 3 + 10), 10), im)
prev.save(r'C:\Users\Admin\AppData\Local\Temp\opencode\cards_preview.png')
print('saved', count, 'cards')
