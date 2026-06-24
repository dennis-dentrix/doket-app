# Doket — Your Business, Organized

Invoicing and receipt management for freelancers and small businesses, built for a global audience.

## Features

- **Multi-currency invoicing** — 30+ currencies across Africa, Americas, Europe, Middle East, and Asia Pacific with locale-aware formatting and per-region tax presets
- **M-Pesa payments** — one-tap payment links for East African users (Safaricom Daraja API)
- **AI receipt scanning** — OCR to digitize and categorize receipts from your camera or gallery
- **Offline-first** — works without internet; syncs automatically when back online
- **Dark / light / system theme** — full theme support across the app
- **Dashboard** — at-a-glance view of paid, pending, and overdue invoices

## Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native + Expo |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Offline | SQLite via expo-sqlite |
| State | Zustand |
| Payments | M-Pesa STK Push (Safaricom Daraja API) |
| API | Express (M-Pesa webhooks) |


