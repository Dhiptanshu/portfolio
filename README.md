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

## Cloud Deployment

The platform is architected for frictionless deployment on Vercel, utilizing Supabase as the serverless backend.

### Quick Start Guide

1.  **Supabase Setup**: Create a new Supabase project. Run the SQL migration files located in `supabase/migrations/` to initialize the database schema and Row Level Security (RLS) policies.
2.  **Environment Variables**: Create a `.env.local` file at the root of the project:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3.  **Local Development**:
    ```bash
    npm install
    npm run dev
    ```
4.  **Production Deployment**: Connect your GitHub repository to Vercel and supply the Supabase environment variables in the Vercel dashboard.

## Administration Guide

### Access
Navigate to the secure admin route and authenticate with your Supabase administrative credentials to access the dynamic dashboard.

### Content Management
*   **Initialization**: Run the `018_populate_portfolio_data.sql` migration to seed the database with initial placeholder content.
*   **Live Editing**: Use the sidebar modules (Experience, Journey, Skills, Achievements, etc.) to Create, Read, Update, and Delete content. The public site pulls this data dynamically on every render or revalidation cycle.

## Project Structure

*   `app/`: Next.js App Router core (Global layout, Public pages, Admin routes).
*   `components/`: Reusable UI components, custom cursors, layout wrappers, and the DOOM modal.
*   `features/`: Domain-specific business logic (Split into `admin` dashboard views and public `sections`).
*   `lib/`: Utility functions, Supabase client initializers, and TypeScript type definitions.
*   `public/`: Static assets, including the JS-DOS `doom.jsdos` game bundle and `doom.html` emulator container.
*   `supabase/migrations/`: SQL files for defining the PostgreSQL schema, RLS policies, and seed data.

---
**Interactive Developer Portfolio**<br>
Created with ❤️ by [Dhiptanshu Malik](https://www.linkedin.com/in/dhiptanshu)
