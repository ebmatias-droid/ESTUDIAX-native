#!/usr/bin/env python3
"""Generate the official ESTUDIAX book-and-spark icons for all platforms."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BG = (16, 24, 39, 255)
NAVY = (17, 29, 52, 255)
PAPER = (245, 248, 255, 255)
ORANGE = (255, 121, 0, 255)


def icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(image)
    scale = size / 512

    def points(values):
        return [(round(x * scale), round(y * scale)) for x, y in values]

    draw.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=round(112 * scale),
        fill=BG,
    )
    draw.polygon(
        points([(256, 58), (267, 107), (316, 118), (267, 129),
                (256, 178), (245, 129), (196, 118), (245, 107)]),
        fill=ORANGE,
    )
    left_page = [
        (76, 184), (190, 245), (227, 270), (256, 306), (256, 454),
        (222, 429), (176, 408), (126, 395), (76, 382),
    ]
    draw.polygon(points(left_page), fill=PAPER)
    draw.polygon(points([(512 - x, y) for x, y in left_page]), fill=PAPER)

    page_face = [
        (88, 201), (190, 256), (222, 280), (246, 307), (246, 435),
        (218, 415), (173, 395), (124, 383), (88, 374),
    ]
    draw.polygon(points(page_face), fill=NAVY)
    draw.polygon(points([(512 - x, y) for x, y in page_face]), fill=NAVY)

    draw.polygon(
        points([(128, 160), (202, 200), (231, 222), (256, 259),
                (256, 282), (236, 251), (204, 228), (128, 187)]),
        fill=ORANGE,
    )
    draw.polygon(
        points([(384, 160), (310, 200), (281, 222), (256, 259),
                (256, 282), (276, 251), (308, 228), (384, 187)]),
        fill=ORANGE,
    )
    draw.line(points([(256, 306), (256, 450)]), fill=PAPER, width=max(2, round(9 * scale)))
    return image


def save_icon_set():
    """Create the complete macOS .iconset required by iconutil."""
    iconset = ROOT / "ESTUDIAX.iconset"
    iconset.mkdir(parents=True, exist_ok=True)
    sizes = (
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    )
    for filename, size in sizes:
        icon(size).save(iconset / filename, optimize=True)


def main():
    save_icon_set()

    apple = ROOT / "AppleApps/ESTUDIAXiOS/Assets.xcassets/AppIcon.appiconset"
    apple.mkdir(parents=True, exist_ok=True)
    icon(1024).save(apple / "AppIcon-1024.png", optimize=True)

    desktop = ROOT / "desktop/src-tauri/icons"
    desktop.mkdir(parents=True, exist_ok=True)
    icon(256).save(desktop / "icon.png", optimize=True)
    icon(256).save(
        desktop / "icon.ico",
        format="ICO",
        sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)],
    )
    for filename, size in (
        ("32x32.png", 32),
        ("128x128.png", 128),
        ("128x128@2x.png", 256),
        ("256x256.png", 256),
    ):
        icon(size).save(desktop / filename, optimize=True)

    web = ROOT / "website/app/public/icons"
    web.mkdir(parents=True, exist_ok=True)
    for filename, size in (
        ("favicon.png", 64),
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
    ):
        icon(size).save(web / filename, optimize=True)

    print("Generated ESTUDIAX icon assets for macOS, iOS, desktop, and PWA.")


if __name__ == "__main__":
    main()
