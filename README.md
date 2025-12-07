# Tapan Associate Project

## Overview
Logistics and cargo management platform for seamless nationwide transportation.

## Features
- **Dashboard:** Real-time metrics.
- **Invoices:** Create, manage, and track invoices.
- **Shipments:** Track shipment status and history.
- **Warehouse:** Manage inventory and capacity.
- **Customers:** Customer relationship management.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** shadcn/ui, Tailwind CSS
- **Database:** Supabase
- **Authentication:** Supabase Auth

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Scripts
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint.

## Cleanup & Build Status
- **Unused files removed:** Legacy smoke tests, setup scripts, backup folders, docs, and unused UI components.
- **Dependencies trimmed:** Removed unused packages like Puppeteer, Twilio, and extra Radix UI primitives.
- **Required deps restored:** AI chat (`ai`, `@ai-sdk/react`, `@ai-sdk/perplexity`), animations (`lottie-react`), barcodes/QR (`react-barcode`, `qrcode`), and rate limiting (`@upstash/ratelimit`, `@upstash/redis`).
- **Build health:** `npm run dev` and `npm run lint` both pass locally after cleanup.
