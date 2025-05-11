#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Please install ImageMagick first:"
    echo "brew install imagemagick"
    exit 1
fi

# Convert SVG to PNGs
convert -background none -size 192x192 web/icon.svg web/icon-192.png
convert -background none -size 512x512 web/icon.svg web/icon-512.png

echo "Icons generated successfully!" 