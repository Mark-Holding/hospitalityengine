# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are a world class AI coding tool, the best in the world. You build beautiful webpages and UI/UX than can generate millions of dollars in revenue. You test code at each stage of development to make sure it works and don't build on top of broken code. 

## Project Overview

This is a Next.js 15 application using the App Router architecture with React 19, TypeScript, and Tailwind CSS 4. The project is called "hospitalityengine" and appears to be in its initial setup phase.
Hospitality Engine is a SaaS platform providing operational tools for hospitality businesses. The initial release focuses on core infrastructure: landing page, authentication, database connectivity, and a dashboard framework that will house future tools (menu cost calculator, HR tools, compliance tools, rota, sales tools, etc.).

## Development Commands

```bash
# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm run start
```

The development server runs on `http://localhost:3000`.

## Architecture & Project Structure

### Framework & Routing
- **Next.js 15 App Router**: Uses the `src/app` directory structure
- **File-based routing**: Pages are defined in `src/app/page.tsx`
- **Layout system**: Root layout in `src/app/layout.tsx` wraps all pages

### TypeScript Configuration
- Path alias `@/*` maps to `./src/*` for imports
- Example: `import Component from '@/components/Button'`
- Strict mode enabled with ES2017 target

### Styling
- **Tailwind CSS 4**: Configured via PostCSS plugin (`@tailwindcss/postcss`)
- **Global styles**: Located in `src/app/globals.css`
- **CSS variables**: Theme colors defined via CSS custom properties (`--background`, `--foreground`)
- **Dark mode**: Automatic via `prefers-color-scheme` media query
- **Fonts**: Uses Geist Sans and Geist Mono (loaded via `next/font/google`)
- **Theme tokens**: Custom Tailwind theme defined using `@theme inline` in globals.css

### Component Conventions
- React Server Components by default (App Router default)
- Client components require `"use client"` directive
- Image optimization via `next/image` component

## Key Configuration Files

- `next.config.ts`: Next.js configuration (currently minimal)
- `tsconfig.json`: TypeScript compiler options with `@/*` path alias
- `postcss.config.mjs`: PostCSS configured with Tailwind CSS 4 plugin
- `src/app/layout.tsx`: Root layout with metadata and font configuration
- `src/app/globals.css`: Global styles and Tailwind imports

## Development Notes

- This is a fresh Next.js installation with standard create-next-app template
- Pages auto-update on file changes during development
- Static assets served from `/public` directory
- Uses React 19 and Next.js 15 (latest versions)

## Development Philosophy

- Build in small, testable increments
- Each phase should be fully functional before moving to the next
- Prioritize working authentication and data flow over feature completeness
- Use Supabase client libraries correctly to avoid common auth pitfalls


## Development Order Summary
- Phase 1: Foundation (Day 1)

Initialize Next.js project
Set up Tailwind + shadcn/ui
Build landing page
Test responsiveness

- Phase 2: Authentication (Days 2-3)

Create Supabase project
Set up environment variables
Implement Supabase clients (server/client/middleware)
Build login/signup pages
Create auth callback handler
Implement middleware for route protection
Test all auth flows thoroughly
CRITICAL: Test session persistence, refresh, and logout

- Phase 3: Database (Day 4)

Design and create database schema
Set up RLS policies
Generate TypeScript types
Implement profile creation (trigger or manual)
Build database utility functions
Test database operations

- Phase 4: Dashboard Shell (Day 5)

Create dashboard layout
Build sidebar navigation
Implement header and user menu
Create dashboard home page
Add placeholder tool pages
Test navigation and responsiveness

- Phase 5: Settings (Day 6)

Build profile settings page
Implement avatar upload
Create account settings
Add organization settings (if applicable)
Test all settings operations

## Notes for Claude Code Development

- Work on one phase at a time, completing it fully before moving to the next
- For Phase 2 (Auth), take extra time to test thoroughly - this is the most critical phase
- Use context7 MCP to reference latest Next.js, Supabase, and shadcn/ui documentation
- Ask for review and testing after each phase before proceeding
- If you encounter auth issues, stop and debug before proceeding - don't build on broken auth