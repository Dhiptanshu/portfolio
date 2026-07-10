# Dhiptanshu Malik — Portfolio

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

## Overview
A dynamic, highly interactive developer portfolio featuring a unique "Manual vs CRT" dual-theme system. Built with Next.js 15 and Supabase, it includes a robust headless content management system allowing real-time, database-driven updates without any code deployments. As an interactive bonus, it seamlessly embeds a playable WebAssembly DOS emulator running DOOM (1993).

**LIVE Demo:** [dhiptanshu.vercel.app](#) *(Replace with actual URL)*  
*(Currently deployed and hosted on **Vercel**)*

## Demo & Screenshots

<details>
<summary><b>View Screenshots (Click to Expand)</b></summary>

### Public Portfolio
*(Add your screenshots to the `public/` folder to display them here)*
![Hero Section](public/hero_screenshot.png)
![Experience Timeline](public/experience_screenshot.png)
![DOOM Emulator](public/doom_screenshot.png)

### Administration Panel
![Dashboard](public/admin_dashboard.png)
![Manage Projects](public/admin_projects.png)
![Inbox Messages](public/admin_inbox.png)

</details>

## Key Features

### Interactive User Experience
*   **Thematic Dual-State Design**: "The Manual vs. The Save File" concept. Light mode resembles a crisp, printed game manual, while Dark mode mimics a glowing CRT screen running a live game.
*   **Playable DOOM (1993)**: Integrated JS-DOS v8 emulator allowing users to instantly play classic DOOM via a modal popup. It is **fully playable on both PC (keyboard) and Mobile (automatic virtual touch gamepad overlay)** natively within the browser.
*   **Custom Micro-Interactions**: Features a custom rapid-fire laser cursor, magnetic sticky headers, and fluid scroll-spy navigation powered by Framer Motion.
*   **Responsive Architecture**: Pixel-perfect grid alignments tailored to scale flawlessly down to extra-narrow mobile displays (like the Galaxy Z Fold).

### Dynamic Administration & Control
*   **Secure Admin Console**: A comprehensive, authenticated dashboard hidden behind a secure route for full platform management.
*   **Headless Content Management**: 
    *   Dynamically manage everything: Skills, Projects, Achievements, Experience timelines, and Hero text directly from the dashboard.
    *   No hardcoded content. Changes in the dashboard instantly reflect on the live site.
*   **Message Inbox**: Contact form submissions are routed directly into a secure backend inbox interface instead of relying solely on email forwarding.
*   **Media Library**: Built-in asset manager to handle project thumbnails and gallery images via Supabase Storage.

## Technology Stack

*   **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript
*   **Styling & Animation**: Tailwind CSS, Framer Motion
*   **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
*   **WebAssembly Emulation**: JS-DOS v8 (Running via static HTML integration)
*   **Deployment**: Vercel

## System Architecture

The platform is architected for frictionless, high-performance delivery using a modern serverless stack.

### Backend Infrastructure
*   **Database**: Supabase (PostgreSQL) handles all relational data, from project descriptions to experience timelines.
*   **Authentication**: Secured via Supabase Auth. The admin dashboard is strictly route-protected and requires verified credentials.
*   **Security**: Row Level Security (RLS) policies ensure that public visitors only have read access, while write/update operations are strictly limited to authenticated admins.

### Frontend Delivery
*   **Hosting**: Deployed on Vercel's Edge Network for global low-latency access.
*   **Rendering**: Utilizes Next.js App Router for optimal Server-Side Rendering (SSR) and Static Site Generation (SSG), ensuring lightning-fast load times and SEO optimization.
*   **Styling**: Tailwind CSS combined with Framer Motion provides fluid, responsive layouts scaling from 4K desktop monitors down to foldable mobile displays.

## Administration Ecosystem

Unlike traditional static portfolios, this site functions as a full-fledged Content Management System (CMS). 

*   **Dynamic State**: The underlying PostgreSQL database serves as the single source of truth. Every skill, project, achievement, and experience entry on the site is pulled dynamically from the database.
*   **Live Editing**: Through a hidden administrative route, content can be created, updated, or deleted via a custom GUI without ever touching the source code or triggering a new build.
*   **Integrated Messaging**: Instead of relying on static `mailto:` links, the contact form pipes messages directly into a secure backend inbox interface within the admin panel.

## Project Structure

*   `app/`: Next.js App Router core (Global layout, Public pages, Admin routes).
*   `components/`: Reusable UI components, custom cursors, layout wrappers, and the DOOM modal.
*   `features/`: Domain-specific business logic (Split into `admin` dashboard views and public `sections`).
*   `lib/`: Utility functions, Supabase client initializers, and TypeScript type definitions.
*   `public/`: Static assets, including the JS-DOS WebAssembly game bundle (`doom.jsdos`) and the emulator's `doom.html` container.

---
**Interactive Developer Portfolio**<br>
Created with ❤️ by [Dhiptanshu Malik](https://www.linkedin.com/in/dhiptanshu)
