# 🎨 Advanced QR Code Generator

A modern, feature-rich QR code generator powered by QRCode Monkey API with extensive customization options.

## ✨ Features

### Content Types
- **Website URL** - Direct links to websites
- **Plain Text** - Any text content
- **Email** - Pre-filled email with subject and body
- **Phone** - Direct dial phone numbers
- **SMS** - Pre-filled text messages
- **vCard** - Digital business cards
- **WiFi** - WiFi network credentials

### Design Customization
- **22 Body Shapes**: Square, Mosaic, Dot, Circle, Circle-Zebra, Circle-Zebra-Vertical, Circular, Edge-Cut, Edge-Cut-Smooth, Japanese, Leaf, Pointed, Pointed-Edge-Cut, Pointed-In, Pointed-In-Smooth, Pointed-Smooth, Round, Rounded-In, Rounded-In-Smooth, Rounded-Pointed, Star, Diamond
- **15 Eye Frame Shapes**: Frame 0-8, Frame 10-14, Frame 16
- **18 Eye Ball Shapes**: Ball 0-3, Ball 5-8, Ball 10-19
- **3 Color Modes**: Single Color, Linear Gradient, Radial Gradient
- **Custom Colors**: Full color picker for all elements

### Advanced Features
- **Logo Integration**: Upload custom logos (PNG, JPG)
  - Live logo preview with transparency support
  - PNG transparency is preserved in output
  - Optional background removal for cleaner logos
  - Logos are uploaded to QRCode Monkey server
  - API generates QR code with logo integrated
  - QR code pattern is optimized for logo placement
- **Error Correction Levels**: Low (7%), Medium (15%), Quartile (25%), High (30%)
- **Multiple Export Formats**: PNG, SVG, PDF, EPS
- **Scalable Size**: 300px to 3000px
- **Quick Presets**: Classic, Modern, Neon, Gradient

### User Experience
- **Modern Dark UI**: Sleek, professional interface
- **Tabbed Navigation**: Organized controls
- **Live Preview**: See your QR code instantly
- **One-Click Download**: Save in your preferred format
- **Copy to Clipboard**: Quick sharing
- **Responsive Design**: Works on all devices

## 🚀 Getting Started

### Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Usage

1. Select your QR code type from the Content tab
2. Enter your data (URL, text, contact info, etc.)
3. Customize the design in the Design tab
4. Optionally add a logo in the Logo tab
5. Adjust advanced settings if needed
6. Click "Generate QR Code"
7. Download or copy your QR code

### Development Mode

For auto-restart on file changes:
```bash
npm run dev
```

## 🎨 Quick Presets

- **Classic**: Traditional black and white QR code
- **Modern**: Blue dots with rounded corners
- **Neon**: Pink to purple gradient on dark background
- **Gradient**: Cyan to blue gradient with mosaic pattern

## 💡 Tips

- Use higher error correction levels when adding logos
- Larger QR codes scan better from distance
- Test your QR codes before printing
- SVG format is best for print materials
- PNG format is best for digital use

## 🔧 Technical Details

- Node.js + Express backend server
- QRCode Monkey API integration via proxy endpoint
- Pure vanilla JavaScript frontend (no frameworks)
- Modern CSS with gradients and animations
- Responsive grid layout
- CORS-free architecture
- Cross-browser compatible

## 📱 Use Cases

- Business cards and marketing materials
- Event tickets and invitations
- Product packaging and labels
- Restaurant menus
- WiFi network sharing
- Contact information sharing
- Social media links
- Payment information

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📄 License

Free to use for personal and commercial projects.

---

Made with ❤️ using QRCode Monkey API
