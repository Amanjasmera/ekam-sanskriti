# Ekam Sanskriti 🇮🇳

A multilingual Indian cultural heritage web platform built with Next.js 14, Tailwind CSS, and Supabase.

## Features
- **Multilingual Support**: Read text and hear audio in multiple Indian languages using native Web Speech APIs.
- **Unified India**: Explore the core scriptures and teachings of major faiths originating from and practiced in India.
- **Explore Monuments**: Interactive reels of 25+ famous monuments with history and Leaflet mini-maps.
- **Heritage Map**: Interactive web map to locate monuments, food, and festivals.
- **Marketplace**: Support local artisans by browsing traditional crafts and enquiring directly via WhatsApp.
- **Learn Hub**: Video lessons from masters of traditional Indian crafts.
- **AI Quiz**: Generate interactive quizzes using the Gemini API.
- **Monument Scanner**: QR code scanner to quickly jump to physical monument details.

## Environment Variables
Create a `.env.local` file with the following keys (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`

## Setup & Run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Deployment
This project is configured for GitLab CI/CD. The `.gitlab-ci.yml` file is ready to build and deploy to GitLab Pages. You can also deploy directly to Vercel by importing the Git repository.
