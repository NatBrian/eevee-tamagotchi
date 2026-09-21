from PIL import Image
from collections import deque
import sys

src = r"C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\serebii\egg.png"
im = Image.open(src).convert("RGBA")
w,h = im.size
px = im.load()

def is_white(p):
    return p[0]>235 and p[1]>235 and p[2]>235

# flood fill outer white from edges -> transparent
seen=[[False]*w for _ in range(h)]
q=deque()
for x in range(w):
    for y in (0,h-1):
        if is_white(px[x,y]) and not seen[y][x]:
            seen[y][x]=True; q.append((x,y))
for y in range(h):
    for x in (0,w-1):
        if is_white(px[x,y]) and not seen[y][x]:
            seen[y][x]=True; q.append((x,y))
while q:
    x,y=q.popleft()
    px[x,y]=(0,0,0,0)
    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx,ny=x+dx,y+dy
        if 0<=nx<w and 0<=ny<h and not seen[ny][nx] and is_white(px[nx,ny]):
            seen[ny][nx]=True; q.append((nx,ny))

# recolor remaining pixels
CREAM=(243,226,196,255); BROWN=(96,64,42,255); CREAM2=(233,210,178,255)
out=Image.new("RGBA",(w,h),(0,0,0,0)); op=out.load()
for y in range(h):
    for x in range(w):
        r,g,b,a=px[x,y]
        if a==0:
            continue
        if r>235 and g>235 and b>235:
            op[x,y]=CREAM          # interior
        elif r<120 and g<120 and b<120:
            op[x,y]=BROWN          # outline/speckles
        else:
            op[x,y]=(r,g,b,a)
# add a couple darker speckles for character
out.save(r"C:\Users\Admin\Documents\Github\eevee-tamagotchi\assets\ref\serebii\egg_colored.png")
print("saved", out.size)
