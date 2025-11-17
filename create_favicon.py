#!/usr/bin/env python3
from PIL import Image
import os

# Load the original image
img = Image.open('nailong.jpg')

# Convert to RGB if necessary
if img.mode != 'RGB':
    img = img.convert('RGB')

# Get dimensions and crop to square (center crop)
width, height = img.size
min_dim = min(width, height)
left = (width - min_dim) // 2
top = (height - min_dim) // 2
right = left + min_dim
bottom = top + min_dim
img_cropped = img.crop((left, top, right, bottom))

# Create output directory
os.makedirs('images/favicon', exist_ok=True)

# Generate different sizes
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

for filename, size in sizes.items():
    resized = img_cropped.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'images/favicon/{filename}')
    print(f"Created {filename}")

# Create .ico file (multiple sizes)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [img_cropped.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
ico_images[0].save('images/favicon/favicon.ico', format='ICO', sizes=ico_sizes)
print("Created favicon.ico")

print("\nAll favicon files created successfully!")
