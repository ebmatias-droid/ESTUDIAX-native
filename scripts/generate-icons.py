#!/usr/bin/env python3
"""Generate deterministic ESTUDIAX icons for Apple and desktop CI builds."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
BG, BLUE, PAPER = (16,24,39,255), (55,111,232,255), (245,248,255,255)
def icon(size):
    im=Image.new("RGBA",(size,size),BG); d=ImageDraw.Draw(im); s=size/256
    def b(v): return tuple(round(n*s) for n in v)
    d.rounded_rectangle(b((20,20,236,236)),radius=round(42*s),fill=BLUE)
    d.rounded_rectangle(b((62,46,194,210)),radius=round(12*s),fill=PAPER)
    d.line((round(128*s),round(62*s),round(128*s),round(194*s)),fill=BLUE,width=max(1,round(6*s)))
    for y in (88,112,136,160):
        d.rounded_rectangle(b((82,y,112,y+5)),radius=max(1,round(2*s)),fill=BLUE)
        d.rounded_rectangle(b((144,y,174,y+5)),radius=max(1,round(2*s)),fill=BLUE)
    return im
def main():
    root=ROOT/"AppleApps/ESTUDIAXiOS/Assets.xcassets/AppIcon.appiconset"; root.mkdir(parents=True,exist_ok=True)
    icon(1024).save(root/"AppIcon-1024.png")
    p=ROOT/"desktop/src-tauri/icons"; p.mkdir(parents=True,exist_ok=True)
    icon(256).save(p/"icon.png"); icon(256).save(p/"icon.ico",sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)])
    for n in (32,128,256): icon(n).save(p/f"{n}x{n}.png")
    print("Generated ESTUDIAX icons.")
if __name__=="__main__": main()
