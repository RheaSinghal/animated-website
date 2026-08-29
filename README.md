# Scrollable Website Prototype

This is a Vite + React + Three.js prototype demonstrating a scrollable hero section with video scrubbing, a custom procedural explosion shader, and scroll-triggered content sections.

## Assets

Drop your placeholder assets into the `public/` directory:

1. `hero-video.mp4` -> `public/hero-video.mp4` (The raw footage to scrub)
2. `hero-final.png` -> `public/hero-final.png` (The final static resting background)

*Note: In the current setup, if you have already provided these files in the root folder, they should have been moved into the `public/` directory automatically.*

## Setup and Running

Install dependencies (if not already done):
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

## Tech Stack
- Vite + React
- Three.js + React Three Fiber + Drei
- GSAP + ScrollTrigger
- Lenis (Smooth Scrolling)
