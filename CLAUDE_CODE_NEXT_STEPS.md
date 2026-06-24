# Doket — Next Steps

## Status: Phase 1G Complete ✓

### What's built
- Monorepo: `mobile/` (Expo SDK 52, JSX) + `api/` (Express)
- Supabase schema: users, invoices, invoice_items, receipts, sync_logs with RLS
- SQLite offline DB with async API (expo-sqlite v15)
- Zustand stores: authStore, invoiceStore
- Screens: WelcomeScreen, SignUpScreen, SignInScreen, DashboardScreen
- Bottom tab navigation (Home, Create, Receipts, Settings — last 3 are placeholders)
- Design system: Orange #FF6B35, Navy #004E89, Cream #FFF8F6, Manrope font

### How to launch
```bash
cd mobile
npx expo start --port 8082   # Docker occupies 8081
# Scan QR with Expo Go app on phone
```

---

## Phase 2: Core Invoice Flow

### CreateInvoiceScreen.jsx
- Client name field
- Line items (description, qty, unit_price) — dynamic add/remove
- Tax rate selector (0%, 8%, 16% VAT)
- Subtotal/tax/total summary card (orange)
- "Save as Draft" + "Preview & Share" buttons
- "Generate M-Pesa Link" button (navy, bottom)

### InvoicePreviewScreen.jsx
- Formatted invoice view matching the design (Doket header, INVOICE #, BILL TO, items table)
- "Generate M-Pesa Link" CTA
- "Share PDF" + "Edit Invoice" secondary actions
- "Delete Invoice" destructive action

### InvoiceListScreen.jsx (full list via "See all" on dashboard)
- FlashList of all invoices
- Filter chips: All, Pending, Paid, Draft
- Search by client name

---

## Phase 3: Receipts

### ReceiptsScreen.jsx
- "Scan New Receipt" orange CTA button
- FlashList of scanned receipts with sync status (Synced ✓ / Pending ●)

### ReceiptScannerScreen.jsx
- Camera view with orange scanning frame overlay
- "Pick from Gallery" option
- On capture: navigate to ReceiptDetailScreen with image

### ReceiptDetailScreen.jsx
- Scanned image at top
- Editable fields: Vendor, Amount (KES), Date, Category (dropdown)
- "Edit" + "Delete" actions

---

## Phase 4: M-Pesa Integration

- Wire up `api/src/server.js` STK Push endpoint with Safaricom Daraja API
- Add M-Pesa shortcode to user profile in Settings
- Generate payment link from InvoicePreviewScreen
- Handle Daraja callback → update invoice status to "paid"

---

## Phase 5: Settings & Sync

### SettingsScreen.jsx
- User profile display (name, phone, joined date)
- Edit Profile flow
- Dark Mode toggle (implement dark theme)
- Auto-Sync toggle
- Offline Status indicator
- Sign Out

### Background sync
- On app foreground: check network, flush sync_queue to Supabase
- Show last sync time on dashboard

---

## Environment Setup Needed
1. Create Supabase project → run `supabase-schema.sql`
2. Copy URL + anon key into `mobile/src/services/supabase.js`
3. For M-Pesa: register on Safaricom Daraja portal, fill `.env`
