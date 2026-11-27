from PIL import Image
from pathlib import Path

folder = Path("public/images/thika-walking-new")

for i in range(1, 6):
    name = "CAROUSEL.JPG" if i == 1 else f"CAROUSEL{i}.JPG"

    source = folder / name
    destination = folder / f"{source.stem}.webp"

    with Image.open(source) as img:
        img = img.convert("RGB")
        img.save(destination, "WEBP", quality=82, method=6)

    size = destination.stat().st_size / 1024
    print(f"{name} -> {destination.name}: {size:.0f} KB")

print("Image optimisation complete!")
