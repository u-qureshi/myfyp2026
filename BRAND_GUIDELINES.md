# 🎨 SmartScheduler.AI Brand Guidelines

## Official Brand Identity

---

## 🎯 Brand Name
**SmartScheduler.AI**

### Tagline
"AI-Powered Timetable Generation System"

### Official Color
Professional Blue: **#2563EB** (RGB: 37, 99, 235)

---

## 🎨 Color Palette

### Primary Color
```
Hex: #2563EB
RGB: 37, 99, 235
HSL: 216° 98% 52%
Name: Professional Blue
Usage: Main buttons, links, highlights
```

### Supporting Colors
```
Blue-600: #2563EB (Primary)
Blue-700: #1D4ED8 (Hover/Darker)
Blue-50:  #EFF6FF (Light background)
Blue-100: #DBEAFE (Very light background)
Blue-400: #60A5FA (Accent)
Blue-500: #3B82F6 (Medium)
```

### Dark Mode
```
Primary: #60A5FA (lighter for contrast)
Accent: #93C5FD
Background: #1F2937 + Blue overlay
```

---

## 📝 Logo

### Logo Format
Text-based: **"SmartScheduler.AI"**

### Logo Usage
- ✅ Always use full text "SmartScheduler.AI"
- ✅ No abbreviations (except in favicon as "SA")
- ✅ Font: Bold, professional sans-serif
- ✅ Size: Scale as needed, maintain readability
- ✅ Color: Always use Professional Blue (#2563EB)

### Favicon
```
Design: Blue square with "SA" initials
Sizes: 32x32px (favicon), 180x180px (Apple icon)
Format: SVG (scalable)
Color: #2563EB background, white text
```

### Logo Don'ts
- ❌ Don't use generic icons (brain, etc.)
- ❌ Don't change the color
- ❌ Don't distort proportions
- ❌ Don't abbreviate in main branding
- ❌ Don't use in non-blue colors

---

## 🎨 Design System

### Button Colors
```
Primary Button: #2563EB (blue-600)
Primary Hover: #1D4ED8 (blue-700)
Secondary Button: #F3F4F6 (gray)
Danger Button: #DC2626 (red)
```

### Text Colors
```
Primary Text: #1F2937 (dark gray)
Secondary Text: #6B7280 (medium gray)
Muted Text: #9CA3AF (light gray)
Accent Text: #2563EB (blue)
```

### Background Colors
```
Main Background: #FFFFFF (white)
Card Background: #FFFFFF (white)
Sidebar Background: Linear gradient blue-600 → blue-700
Login Background: Gradient blue-50 → indigo-50 → blue-100
```

---

## 📐 Typography

### Font Family
```
Primary: System fonts (San Francisco, Segoe UI, Roboto)
Monospace: Source Code Pro (for code)
```

### Font Sizes
```
Logo: 24px+ (large, bold)
Main Heading: 32px (bold)
Section Heading: 24px (bold)
Subheading: 18px (medium)
Body Text: 14px-16px (regular)
Small Text: 12px (regular)
Caption: 10px-12px (regular)
```

### Font Weights
```
Logo Text: Bold (700)
Headings: Bold (700)
Tagline: Medium (500)
Body: Regular (400)
Caption: Regular (400)
```

---

## 🎭 Visual Elements

### Gradients

**Sidebar Gradient:**
```css
background: linear-gradient(to bottom, #2563EB, #1D4ED8);
```

**Login Background:**
```css
background: linear-gradient(to bottom right, 
  #EFF6FF, #E0E7FF, #DBEAFE);
```

### Shadows
```
Card Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Button Shadow: 0 4px 6px rgba(37, 99, 235, 0.2)
```

### Border Radius
```
Cards: 8px
Buttons: 6px
Inputs: 6px
Images: 8px
```

---

## 📋 Application Areas

### Login Screen
- Background: Blue gradient
- Logo: "SmartScheduler.AI" (text)
- Tagline: Below logo
- Buttons: Blue primary
- Color: #2563EB dominant

### Sidebar Navigation
- Background: Blue gradient (600 → 700)
- Logo: "SmartScheduler.AI" text
- Text: White
- Hover: Lighter blue
- Active: Lighter blue background

### Dashboard
- Header: Include tagline
- Buttons: Blue primary
- Accents: Blue highlights
- Cards: White with blue accents

### All Forms
- Input Focus: Blue border
- Labels: Dark text
- Buttons: Blue primary
- Required: Blue asterisk

---

## 🚀 Brand Voice

### Tone
- Professional
- Approachable
- Modern
- Trustworthy

### Key Messages
1. "AI-Powered Timetable Generation System"
2. "Intelligent Scheduling"
3. "Smart Automation"
4. "Efficient Planning"

### Copy Guidelines
- Use "Schedule" terminology (not "Timetable" in UI)
- Keep language clear and direct
- Emphasize AI capabilities
- Focus on efficiency and intelligence

---

## 📱 Responsive Design

### Mobile (< 640px)
- Logo: Medium size, readable
- Buttons: Full width, touch-friendly
- Sidebar: Collapsible, overlay mode
- Colors: Maintained consistency

### Tablet (640px - 1024px)
- Logo: Standard size
- Layout: Flexible grid
- Sidebar: Visible with content
- Colors: Same palette

### Desktop (> 1024px)
- Logo: Full size display
- Sidebar: Always visible
- Full layout: Optimal spacing
- Colors: Full palette visible

---

## 🎨 Implementation Examples

### Button Styling
```jsx
// Primary Button
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Action
</Button>

// Secondary Button
<Button variant="outline" className="text-blue-600 border-blue-200">
  Secondary
</Button>
```

### Header Styling
```jsx
<div className="text-blue-600">
  <h1>SmartScheduler.AI</h1>
  <p className="text-sm font-medium text-blue-600">
    AI-Powered Timetable Generation System
  </p>
</div>
```

### Sidebar Styling
```jsx
<div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
  <span className="text-blue-400 font-bold text-xl">
    SmartScheduler.AI
  </span>
</div>
```

---

## ✅ Brand Checklist

Before deployment, verify:
- [x] Logo is "SmartScheduler.AI" (text)
- [x] Primary color is #2563EB
- [x] Tagline is visible on key screens
- [x] Favicon is "SA" in blue
- [x] Sidebar has blue gradient
- [x] All buttons use blue theme
- [x] Fonts are consistent
- [x] Mobile is responsive
- [x] Dark mode works
- [x] Accessibility standards met

---

## 📞 Brand Updates

If you need to update the brand:

1. **Change Color**: Update `app/globals.css` CSS variables
2. **Change Logo**: Update `app/page.js` logo text
3. **Change Tagline**: Search for tagline text in `app/page.js`
4. **Change Favicon**: Update SVG in `app/layout.js`

---

## 🎊 Brand Summary

**SmartScheduler.AI** is now a fully branded application with:

✅ Professional blue color (#2563EB)
✅ Text-based logo without generic icons
✅ SVG favicon "SA"
✅ Clear tagline placement
✅ Consistent design across all screens
✅ Modern, professional appearance
✅ Mobile responsive
✅ Accessible color scheme

**Ready for production! 🚀**

---

**Last Updated**: June 4, 2024
**Version**: 1.0.0
**Status**: Final Brand Guidelines
