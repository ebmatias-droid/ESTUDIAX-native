#!/usr/bin/env python3
"""Generate the official ESTUDIAX book-and-spark icon for native and PWA builds."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
BG, NAVY, PAPER, ORANGE = (16,24,39,255), (17,29,52,255), (245,248,255,255), (255,121,0,255)
def icon(size):
    im=Image.new("RGBA",(size,size),BG); d=ImageDraw.Draw(im); s=size/512
    def p(points): return [(round(x*s),round(y*s)) for x,y in points]
    d.rounded_rectangle((0,0,size-1,size-1),radius=round(112*s),fill=BG)
    d.polygon(p([(256,58),(267,107),(316,118),(267,129),(256,178),(245,129),(196,118),(245,107)]),fill=ORANGE)
    left=[(76,184),(190,245),(227,270),(256,306),(256,454),(222,429),(176,408),(126,395),(76,382)]
    d.polygon(p(left),fill=PAPER); d.polygon(p([(512-x,y) for x,y in left]),fill=PAPER)
    face=[(88,201),(190,256),(222,280),(246,307),(246,435),(218,415),(173,395),(124,383),(88,374)]
    d.polygon(p(face),fill=NAVY); d.polygon(p([(512-x,y) for x,y in face]),fill=NAVY)
    d.polygon(p([(128,160),(202,200),(231,222),(256,259),(256,282),(236,251),(204,228),(128,187)]),fill=ORANGE)
    d.polygon(p([(384,160),(310,200),(281,222),(256,259),(256,282),(276,251),(308,228),(384,187)]),fill=ORANGE)
    d.line(p([(256,306),(256,450)]),fill=PAPER,width=max(2,round(9*s)))
    return im
def main():
    apple=ROOT/"AppleApps/ESTUDIAXiOS/Assets.xcassets/AppIcon.appiconset"; apple.mkdir(parents=True,exist_ok=True)
    icon(1024).save(apple/"AppIcon-1024.png")
    desktop=ROOT/"desktop/src-tauri/icons"; desktop.mkdir(parents=True,exist_ok=True)
    icon(256).save(desktop/"icon.png"); icon(256).save(desktop/"icon.ico",sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)])
    for name,size in (("32x32.png",32),("128x128.png",128),("128x128@2x.png",256),("256x256.png",256)): icon(size).save(desktop/name)
    web=ROOT/"website/app/public/icons"; web.mkdir(parents=True,exist_ok=True)
    for name,size in (("favicon.png",64),("apple-touch-icon.png",180),("icon-192.png",192),("icon-512.png",512)): icon(size).save(web/name,optimize=True)
    print("Generated official ESTUDIAX book icons for Apple, desktop, and PWA.")
if __name__=="__main__": main()
