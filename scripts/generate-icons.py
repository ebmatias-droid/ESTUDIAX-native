#!/usr/bin/env python3
"""Generate deterministic ESTUDIAX app icons for CI and local builds."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BG = (16, 24, 39, 255)
BLUE = (55, 111, 232, 255)
PAPER = (245, 248, 255, 255)

def icon(size: int) -> Image.Image:
    im = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(im)
    s = size / 256
    def box(v): return tuple(round(n*s) for n in v)
    d.rounded_rectangle(box((20,20,236,236)), radius=round(42*s), fill=BLUE)
    d.rounded_rectangle(box((62,46,194,210)), radius=round(12*s), fill=PAPER)
    d.line([box((128,62,128,194))[0:2],box((128,62,128,194))[2:4]], fill=BLUE, width=max(1,round(6*s)))
    for y in (88,112,136,160):
        d.rounded_rectangle(box((82,y,112,y+5)), radius=max(1,round(2*s)), fill=BLUE)
        d.rounded_rectangle(box((144,y,174,y+5)), radius=max(1,round(2*s)), fill=BLUE)
    return im

def main():
    apple = ROOT / "AppleApps/ESTUDIAXiOS/Assets.xcassets/AppIcon.appiconset"
    apple.mkdir(parents=True, exist_ok=True)
    icon(1024).save(apple / "AppIcon-1024.png")
    desktop = ROOT / "desktop/src-tauri/icons"
    desktop.mkdir(parents=True, exist_ok=True)
    icon(256).save(desktop / "icon.png")
    icon(256).save(desktop / "icon.ico", sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)])
    for size in (32, 128, 256):
        icon(size).save(desktop / f"{size}x{size}.png")
    print("Generated ESTUDIAX icons.")

if __name__ == "__main__":
    main()
