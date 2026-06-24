# Quick Start

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

## Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd doket
   npm run install:all
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in your Supabase and M-Pesa credentials
   ```

3. **Set up Supabase**
   - Create a project at supabase.com
   - Run `supabase-schema.sql` in the SQL editor
   - Copy your URL and anon key into `.env`

4. **Start the mobile app**
   ```bash
   npm run dev:mobile
   # Scan the QR code with Expo Go
   ```

5. **Start the API (optional)**
   ```bash
   npm run dev:api
   ```

## Environment Variables
See `.env.example` for all required variables.
