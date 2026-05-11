# SHAED.DEV - Premium Portfolio & CMS

A high-performance, dynamic portfolio website and content management system built with React, Vite, Tailwind CSS, and Firebase.

## 🚀 Overview

This project is a precision-engineered portfolio with a bento-grid aesthetic, featuring smooth motion animations, glassmorphism, and a robust administrative dashboard (CMS) that allows for real-time site updates without touching the code.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4.x
- **Animations:** Motion (formerly Framer Motion)
- **Database/Auth:** Firebase (Firestore & Authentication)
- **Icons:** Lucide React
- **Type Safety:** TypeScript

## 📂 Project Structure

```text
├── src/
│   ├── admin/              # CMS Dashboard and Tab Components
│   │   └── Dashboard.tsx   # Main Admin Interface
│   ├── components/         # Reusable UI Blocks
│   │   ├── DynamicSection.tsx # Handles User-Created Sections
│   │   ├── Hero.tsx        # Dynamic Hero Section
│   │   ├── Portfolio.tsx   # Project Showcase with Slider/Grid
│   │   └── ...             # About, Services, Blog, etc.
│   ├── hooks/              # Custom React Hooks (useAuth, etc.)
│   ├── lib/                # Firebase Initialization and Helpers
│   ├── pages/              # Page Components (Section Detail Pages)
│   ├── App.tsx             # Main App Router & Homepage Logic
│   └── main.tsx            # Entry Point
├── firestore.rules         # Hardened Security Rules
├── firebase-blueprint.json # Database Schema Definition
└── vite.config.ts          # Modern Build Configuration
```

## ✨ Key Features

1. **Section Builder:** Create custom collections (e.g., "Gallery", "Equipment") directly from the CMS.
2. **Homepage Orchestration:** Toggle visibility of standard modules (About, Services, Portfolio) with a single click.
3. **Advanced Sliders:** Automatic smooth-sliding carousels with dot navigation and responsive layouts.
4. **Custom Branding:** Real-time color palette updates (Primary/Secondary) applied site-wide.
5. **Secure Authentication:** Google OAuth integration for admin access.
6. **Detailed Slugs:** SEO-friendly URLs for custom sections and portfolio items.

## 📝 The Prompt (Conceptual Vision)

> "Build a premium, dark-themed portfolio for a creative developer that feels alive. Use a high-contrast palette with brand-pink accents. Every section should be modular. Implement an administrative dashboard that isn't just a static form, but a full orchestration layer where I can build new sections, toggle the homepage layout, and manage all content in real-time using Firebase. The UI should use glassmorphism, italicized display typography for headings, and staggered entrance animations."

## ⚙️ Setup & Deployment

1. **Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Provide your Firebase Configuration in `firebase-applet-config.json`.
   - Set `GEMINI_API_KEY` for AI-powered features if applicable.

2. **Installation:**
   ```bash
   npm install
   ```

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```

## 🔒 Security

This app uses **Attribute-Based Access Control (ABAC)** via Firestore Security Rules. All write operations to the configuration or collections are restricted to verified administrators.

---
Built by [Antigravity AI Agent]
