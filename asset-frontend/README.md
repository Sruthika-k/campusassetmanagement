# Asset Management System

A React frontend application for managing assets with a Minimalist Monochrome design system.

## Design System

This application follows the **Minimalist Monochrome** design philosophy:

- **Pure Black & White Palette**: Only #000000 and #FFFFFF colors
- **Serif Typography**: Playfair Display for headlines, Source Serif 4 for body text
- **Sharp Geometry**: Zero border radius everywhere
- **Typography as Graphics**: Large, dramatic headlines (up to 9xl)
- **Line-Based Visuals**: Borders and horizontal rules instead of shadows
- **Editorial Aesthetic**: Like a high-end fashion magazine or museum catalog

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Fetch API** - HTTP requests (no axios)

## Features

- **Dashboard**: View all assets with editorial-style layout
- **Asset Details**: Detailed view with drop caps and textures
- **Create Asset**: Form-based asset creation
- **Responsive Design**: Mobile-first with dramatic typography

## Project Structure

```
src/
├── api/                    # API service layer
│   └── assetService.js     # Backend communication
├── components/
│   ├── layout/            # Layout components
│   │   └── Header.jsx     # Navigation header
│   └── primitives/        # Reusable UI primitives
│       ├── Button.jsx      # Monochrome buttons
│       ├── Card.jsx       # Asset cards
│       ├── Container.jsx  # Layout container
│       ├── Divider.jsx    # Horizontal rules
│       ├── EditorialHeading.jsx # Typography
│       ├── Input.jsx      # Form inputs
│       └── Section.jsx    # Page sections
├── pages/                 # Route components
│   ├── Dashboard.jsx       # Asset listing
│   ├── AssetDetails.jsx    # Asset details
│   └── CreateAsset.jsx     # Asset creation
├── App.jsx               # Main app component
├── index.jsx             # Entry point
└── index.css            # Global styles and design tokens
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Configuration

Backend API endpoint: `http://192.168.29.122:8080/api`

The application expects the following API endpoints:
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

## Design Tokens

### Colors
- Background: #FFFFFF
- Foreground: #000000
- Muted: #F5F5F5
- Muted Foreground: #525252
- Border: #000000
- Border Light: #E5E5E5

### Typography
- Display: Playfair Display
- Body: Source Serif 4
- Mono: JetBrains Mono

### Borders
- Hairline: 1px
- Thin: 1px
- Medium: 2px
- Thick: 4px
- Ultra: 8px

## Key Features

### Editorial Typography
- Oversized headlines (8xl, 9xl)
- Tight tracking for headlines
- Drop caps with borders
- Serif fonts throughout

### Visual Effects
- Color inversion on hover
- Instant transitions (100ms max)
- Subtle texture patterns
- No shadows or gradients

### Accessibility
- WCAG AAA contrast (21:1 ratio)
- Focus-visible states
- Keyboard navigation
- Screen reader support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
