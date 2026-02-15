# Icon Files for Home Assistant Addon

Home Assistant addons require PNG icon files. I've created an SVG template (`icon.svg`) that you can convert to PNG.

## Required Files

1. **icon.png** - 256x256px - Shows in addon store
2. **logo.png** - (optional) 256x256px - Shows in addon documentation

## Converting SVG to PNG

### Option 1: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set dimensions to 256x256
4. Download as `icon.png`

### Option 2: Using Inkscape (if installed)
```bash
inkscape icon.svg --export-type=png --export-width=256 --export-filename=icon.png
```

### Option 3: Using ImageMagick
```bash
convert -background none -resize 256x256 icon.svg icon.png
```

### Option 4: Using Node.js (sharp)
```bash
npm install -g sharp-cli
sharp -i icon.svg -o icon.png resize 256 256
```

## Alternative: Use Material Design Icon

If you prefer, you can use a simple colored square with the Material Design fridge icon that's already referenced in `config.json`:

The addon will work with just the mdi:fridge icon defined in config.json, but having custom icon.png and logo.png files makes it look more professional in the addon store.

## Color Scheme

The provided SVG uses:
- Background: #41BDF5 (light blue)
- Fridge: White with light blue interior
- AI Sparkle: Gold (#FFD700)

Feel free to modify colors to match your preferences!
