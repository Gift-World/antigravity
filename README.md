# ANTIGRAVITY — Crowd Intelligence & Event Safety Platform

> **The force that counteracts the crushing gravity of crowds.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGift-World%2Fantigravity)

ANTIGRAVITY is a real-time crowd intelligence, life-safety, anti-theft, and cashless ticketing platform purpose-built for high-density live events across Kenya and Africa.

On December 20, 2025, 20-year-old Kenyan university student **Karen Lojore** was crushed to death in a stampede at Nyayo National Stadium during a concert. There was no crowd monitoring, no density tracking, no automated alerts, and no accountability. ANTIGRAVITY was engineered to eliminate stampedes and crowd crushes forever.

---

## 🚀 One-Click Cloud Deployment (Vercel)

Click the button below to deploy your own instance of ANTIGRAVITY to Vercel in 60 seconds with automated SPA rewrites and edge performance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGift-World%2Fantigravity)

---

## 🚀 Key Modules & Capabilities

### 1. Live Event Command Center (NASA Mission Control)
- **13-Sector Venue Heatmap**: Real-time spatial density ($people/m^2$) across stadium zones (Gates A–D, Main Floor North, VIP East/West, Stage Pit, Medical Posts, Food Court).
- **Autonomous Safety Directives**: Triggers warning audio at $4.5/m^2$, auto-commands emergency gate release at $5.5/m^2$ before crushes occur.
- **Gate Flow Radar**: Dual bar chart tracking ingress vs egress throughput per minute and highlighting bottlenecks.
- **Tactical Comms Broadcaster**: Push instantaneous notifications to Security Squads, Paramedics, or specific Stadium Sectors.
- **Web Audio Synthesizer**: Zero-dependency programmatic sound generator for scan chimes, warning pulses, and mission-control sirens.

### 2. Gate Scanner Mobile PWA (`/scanner`)
- Turnstile QR scanner with sub-second device-bound validation.
- Flags counterfeits, duplicates, and revoked passes with distinct audio chimes and red/green flash feedback.
- Offline sync queue for intermittent 3G stadium connectivity.

### 3. Attendee Mobile App (`/app`)
- **Smart Passes**: Unforgeable SHA-256 device-bound QR passes.
- **Guardian Mode**: Anti-theft BLE tethering with high-decibel alarm, tamper lock screen, and GPS location streaming.
- **Cashless Wristband Wallet**: M-Pesa STK push top-ups and instant 1-tap food/drink purchases.
- **Live Safety Exit Beacon**: Real-time crowd radar with dynamic directional compass pointing to nearest uncongested exit.

---

## 🛠️ Tech Stack
- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Zustand, QRCode.react.
- **Audio Engine**: Web Audio API Procedural Synthesizer.
- **Backend / Database**: Supabase (PostgreSQL, Realtime Pub/Sub, RLS Security Policies, Deno Edge Functions).
- **Payment Gateway**: Safaricom Daraja API (Lipa Na M-Pesa Online STK Push).
- **Deployment**: Vercel SPA with custom rewrites.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*(Note: ANTIGRAVITY includes a built-in reactive simulation engine that works out-of-the-box in standalone demo mode if Supabase credentials are not provided).*

### 3. Database & Edge Functions (Supabase)
1. Run the migration script in your Supabase SQL Editor:
   ```
   supabase/migrations/20260828000000_init_antigravity.sql
   ```
2. Populate the seed data for Nyayo Stadium & Afrobeats Festival:
   ```
   supabase/seed.sql
   ```
3. Deploy Edge Functions (Optional):
   ```bash
   supabase functions deploy process-gate-scan
   supabase functions deploy process-mpesa-callback
   supabase functions deploy calculate-zone-density
   supabase functions deploy send-attendee-alert
   supabase functions deploy generate-post-event-report
   ```

### 4. Start Development Server
```bash
npm run dev
```

---

## 🧭 Application Routes

| Route | Description |
|---|---|
| `/` | Cinematic Dark Landing Page & Karen Lojore Story |
| `/dashboard` | Organizer Dashboard Operations Center |
| `/dashboard/events` | Events List, Creation & Gate Safety Config |
| `/dashboard/events/:id/live` | **HERO: Live Command Center (NASA Mission Control)** |
| `/dashboard/venues` | Venue Topography & Spatial Sector Editor |
| `/dashboard/tickets` | Cryptographic QR Ticket Vault & Bulk Generator |
| `/dashboard/incidents` | Tactical Incident Triage & Responder Dispatch |
| `/dashboard/analytics` | Post-Event Safety Certification & PDF Export |
| `/scanner` | Mobile Gate Scanner PWA (Security Turnstiles) |
| `/app` | Attendee Mobile PWA (Passes, Guardian Mode, Wallet) |

---

## 🛡️ License
Built with ❤️ in Nairobi, Kenya. Dedicated to the memory of Karen Lojore.
