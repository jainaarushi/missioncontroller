"""
Split a 3x2 character sheet into 6 individual images.

Usage:
  python3 scripts/split-sheet.py <input-image> [output-dir] [name-prefix]

Examples:
  python3 scripts/split-sheet.py batch1.png
  python3 scripts/split-sheet.py batch1.png public/avatars agent

Output:
  {output-dir}/{prefix}-1.png through {prefix}-6.png
  Grid positions:
    1 | 2 | 3
    4 | 5 | 6
"""

import sys
import os
from PIL import Image

def split_sheet(input_path, output_dir=".", prefix="avatar"):
    img = Image.open(input_path)
    w, h = img.size
    cell_w = w // 3
    cell_h = h // 2

    os.makedirs(output_dir, exist_ok=True)

    for row in range(2):
        for col in range(3):
            idx = row * 3 + col + 1
            left = col * cell_w
            top = row * cell_h
            right = left + cell_w
            bottom = top + cell_h

            cropped = img.crop((left, top, right, bottom))
            out_path = os.path.join(output_dir, f"{prefix}-{idx}.png")
            cropped.save(out_path)
            print(f"  Saved: {out_path} ({cell_w}x{cell_h})")

    print(f"\nDone! 6 images saved to {output_dir}/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/split-sheet.py <image> [output-dir] [prefix]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    prefix = sys.argv[3] if len(sys.argv) > 3 else "avatar"

    split_sheet(input_file, output_dir, prefix)
