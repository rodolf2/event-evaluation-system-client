# Certificate Template Thumbnails

This directory is for storing thumbnail images for certificate templates.

## Current Setup
The templates are currently using SVG data URLs for thumbnails. To use local images instead:

1. Add your thumbnail images here (recommended size: 400x300px)
2. Name them exactly as the template IDs:
   - classic-blue.png
   - modern-red.png
   - elegant-gold.png
   - simple-black.png
   - professional-green.png
   - vintage-purple.png

3. Update `client/src/templates/index.js` to use local paths:
   ```javascript
   thumbnail: "/thumbnails/classic-blue.png"
   ```

## Image Formats
- Supported: PNG, JPG, JPEG, SVG
- Recommended format: PNG for best quality
- Size: 400x300px for consistent display

## Template Colors for Reference
- Classic Blue: #002474
- Modern Red: #DC2626
- Elegant Gold: #D97706
- Simple Black: #000000
- Professional Green: #059669
- Vintage Purple: #7C3AED