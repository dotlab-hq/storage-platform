# Dot Storage Landing Page

A world-class, fully modular SaaS landing page for Dot Storage featuring immersive Three.js animations, smooth scrolling, and responsive design.

## Access the Landing Page

Navigate to: `/landing`

## Architecture & Component Structure

The landing page is built with a fully modular architecture, keeping each component focused and under 200 lines as per project standards.

```
src/
├── routes/
│   └── landing/
│       └── index.tsx              # Main landing route (TanStack Router)
│
└── components/
    └── landing/
        ├── hero-section.tsx       # Hero wrapper component
        ├── hero-3d-scene.tsx      # Three.js particle system
        ├── hero-content.tsx       # Hero text content & metrics
        ├── story-panels.tsx       # Horizontal scrolling story sections
        ├── architecture-section.tsx # Interactive 3D infrastructure
        ├── features-section.tsx   # Feature showcase cards
        ├── timeline-section.tsx   # Timeline with events
        ├── stats-dashboard.tsx    # Animated metrics dashboard
        ├── enterprise-section.tsx # Trust & compliance section
        ├── final-cta.tsx          # Final CTA with particle convergence
        │
        └── utils/
            └── scene.ts           # Shared utilities for 3D scenes
```

## Core Technologies

- **Three.js** (`three`) - 3D graphics engine
- **React Three Fiber** (`@react-three/fiber`) - React renderer for Three.js
- **Drei** (`@react-three/drei`) - Useful helpers for React Three Fiber
- **GSAP** (`gsap`) - Animation library with ScrollTrigger
- **Lenis** (`lenis`) - Smooth scroll library
- **Tailwind CSS** - Styling

## Component Details

### 1. Hero Section (`hero-section.tsx`)
- **Wrapper component** for the hero experience
- Combines 3D scene and content layers
- Scroll indicator with bounce animation
- **Suspension boundary** for loading state

### 2. Hero 3D Scene (`hero-3d-scene.tsx`)
- **Particle system** with 5000+ particles (mobile: 500, tablet: 2000)
- Animated particles that flow in 3D space
- Green glowing particles (#00ff88)
- Device-aware rendering

### 3. Hero Content (`hero-content.tsx`)
- Main headline: "Storage Built For The Internet"
- Supporting description
- CTA buttons (Get Started, Learn More)
- **4 floating metric cards** with animated entrance:
  - Objects Stored
  - Requests Served
  - Regions Connected
  - Storage Throughput

### 4. Story Panels (`story-panels.tsx`)
- **Horizontal scroll section** (pinned during scroll)
- 4 story panels:
  - Object Storage
  - Global Distribution
  - Developer APIs
  - Reliability
- GSAP ScrollTrigger orchestrates the horizontal scroll
- Animated entrance for each panel

### 5. Architecture Section (`architecture-section.tsx`)
- **Interactive 3D visualization** with Five layers:
  - Applications (green wireframe)
  - APIs (blue wireframe)
  - Object Storage (purple wireframe)
  - Replication (yellow wireframe)
  - Infrastructure (orange wireframe)
- Mouse-reactive rotation
- 6 layer indicator cards below the canvas

### 6. Features Section (`features-section.tsx`)
- **6 feature cards** in responsive grid:
  - S3 Compatible APIs
  - Instant File Delivery
  - Massive Scale
  - Secure Access
  - Analytics
  - Compliance
- Each card has highlights/bullets
- Hover effects with green glow

### 7. Timeline Section (`timeline-section.tsx`)
- **Alternating timeline layout** (left/right)
- 4 events from 2024-2027
- Animated timeline dots
- Gradient line connecting events
- Scroll-triggered animations

### 8. Stats Dashboard (`stats-dashboard.tsx`)
- **Animated counter component** using GSAP
- 4 key metrics with counters
- SVG line chart visualization
- Background gradient section
- Intersection Observer for performance

### 9. Enterprise Section (`enterprise-section.tsx`)
- **6 trust/compliance cards**:
  - Enterprise Reliability
  - Compliance
  - Global Availability
  - Monitoring
  - Security
  - Performance
- Background grid pattern
- Hover effects

### 10. Final CTA (`final-cta.tsx`)
- **Converging particle system** - particles flow to center
- Large CTA text: "Join the Future"
- Two CTA buttons with hover effects
- Footer with links (Product, Company, Legal, Social)
- "No credit card required" message

## Utilities (`utils/scene.ts`)

Shared functions for all 3D scenes:

- **`useDeviceDetection()`** - Detects mobile/tablet/desktop
- **`getParticleCount(device)`** - Returns particle count based on device:
  - Mobile: 500
  - Tablet: 2000
  - Desktop: 5000
- **`createStorageParticles(count)`** - Generates random particle positions
- **`createNetworkConnections(count)`** - Creates particle connection indices
- **`ScrollConfig`** - Lenis scroll configuration

## Scroll & Animation Orchestration

The landing page uses a sophisticated scroll system:

### Lenis Smooth Scrolling
- Set up in the main landing route (`/landing/index.tsx`)
- 1.2s duration with custom easing
- Synced with GSAP ScrollTrigger

### GSAP ScrollTrigger
- **Pinning**: Story panels section pins during horizontal scroll
- **Scroll-linked animations**: Components fade/slide in as you scroll
- **Staggered animations**: Multiple elements animate with delays

## Responsive Design

### Mobile (< 768px)
- Reduced particle count (500 vs 5000)
- Smaller text sizes
- Single column layouts
- Simplified 3D scenes

### Tablet (768px - 1024px)
- Medium particle count (2000)
- Medium text sizes
- Optimized grid layouts

### Desktop (> 1024px)
- Full particle count (5000)
- Large text sizes
- Complete animations
- Full complexity 3D scenes

## Performance Optimizations

1. **Device-aware rendering** - Particle counts based on screen size
2. **Intersection Observer** - Stats component only animates when visible
3. **Suspense boundaries** - Lazy load 3D scenes
4. **RequestAnimationFrame** - Smooth 60fps animations
5. **useFrame from React Three Fiber** - Optimized 3D updates

## Color Palette

- **Primary**: Green (#00ff88)
- **Accent 1**: Blue (#0088ff)
- **Accent 2**: Purple (#ff00ff)
- **Accent 3**: Yellow (#ffff00)
- **Accent 4**: Orange (#ff8800)
- **Background**: Black (#000000)
- **Text**: White with gray variations

## Interactive Features

- **Mouse-reactive camera** in architecture section
- **Particle animations** that respond to scroll
- **Hover effects** on feature cards
- **Counter animations** in stats dashboard
- **Smooth scroll transitions** between sections
- **Parallax depth effects** throughout

## File Size Compliance

All components strictly adhere to the 200-line limit:
- `hero-3d-scene.tsx`: 71 lines
- `hero-content.tsx`: 99 lines
- `hero-section.tsx`: 23 lines
- `story-panels.tsx`: 74 lines
- `architecture-section.tsx`: 103 lines
- `features-section.tsx`: 123 lines
- `timeline-section.tsx`: 118 lines
- `stats-dashboard.tsx`: 132 lines
- `enterprise-section.tsx`: 113 lines
- `final-cta.tsx`: 174 lines

## Future Enhancements

- Add sound effects for particle interactions
- Implement advanced shader effects
- Add API integration for live metrics
- Create mobile-specific touch interactions
- Add analytics tracking
- Implement A/B testing for CTAs
- Add dark/light theme toggle
- Create variant designs for different products

## Browser Support

- Modern browsers with WebGL support
- Chrome/Firefox/Safari/Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

The landing page is fully client-side rendered and doesn't require any backend services. All animations are purely client-side using Three.js and GSAP.

To modify:
1. Edit individual component files in `src/components/landing/`
2. Adjust particles in `utils/scene.ts`
3. Modify scroll behavior in the main route
4. Update Tailwind classes for styling

All components follow the project's strict TypeScript typing and don't use `any` type.
