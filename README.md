# PSM (Problem Solving Mind) — Website

Awwwards-level React website for **Problem Solving Mind (PSM)**, a technology products & digital solutions studio. Automated deployment to GitHub Pages.

**Live site:** https://Maniyarasan10.github.io/new-psm/

## Features

- **Products:** Boowa, EYD, Aura (with detail pages)
- **Digital Solutions:** 6 solution areas (AI, business systems, automation, web/mobile, product engineering, hardware/IoT)
- **Pages:** Home, Products, Solutions, Industries, Case Studies, About, Careers, Contact, Partner
- **Premium design:** glassmorphism nav, massive display typography, scroll-reveal animations, micro-interactions, Lenis smooth scroll

## Tech Stack

- React 19 + TypeScript + Vite
- React Router (HashRouter for GitHub Pages)
- GSAP + ScrollTrigger, Lenis (smooth scroll), zustand
- Deployed via GitHub Actions → GitHub Pages

## Getting Started

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve production build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes the site to GitHub Pages automatically.

> Note: The app uses `HashRouter` and Vite `base: '/new-psm/'` so it works under a project Pages URL without server-side routing config.
