-- ==========================================================
-- ANTIGRAVITY PLATFORM DATABASE INITIALIZATION SCHEMA
-- Real-Time Crowd Intelligence, Life-Safety & Event Management
-- ==========================================================

-- Enable UUID extension & PostGIS (if available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'event_manager', 'security', 'medical', 'vendor', 'attendee')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. VENUES
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'Nairobi',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    total_capacity INTEGER NOT NULL,
    venue_map_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. VENUE ZONES
CREATE TABLE IF NOT EXISTS public.venue_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('entry_gate', 'exit_gate', 'floor_section', 'vip', 'stage', 'vendor_area', 'medical_post', 'parking')),
    capacity INTEGER NOT NULL,
    polygon_coords JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    doors_open TIMESTAMPTZ NOT NULL,
    event_start TIMESTAMPTZ NOT NULL,
    event_end TIMESTAMPTZ,
    max_capacity INTEGER NOT NULL,
    current_attendance INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'ended', 'cancelled')),
    cover_image_url TEXT,
    ticket_tiers JSONB DEFAULT '[]'::jsonb,
    safety_config JSONB DEFAULT '{"density_warning": 4.5, "density_critical": 5.5, "capacity_slow_at": 0.90, "capacity_stop_at": 0.98}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tier TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    qr_code_hash TEXT NOT NULL UNIQUE,
    device_fingerprint TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'scanned', 'transferred', 'refunded', 'revoked')),
    purchased_at TIMESTAMPTZ DEFAULT now(),
    scanned_at TIMESTAMPTZ,
    scanned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    gate_id UUID REFERENCES public.venue_zones(id) ON DELETE SET NULL,
    mpesa_transaction_id TEXT
);

-- 7. ZONE DENSITY READINGS
CREATE TABLE IF NOT EXISTS public.zone_density_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.venue_zones(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    estimated_count INTEGER NOT NULL,
    density_per_sqm NUMERIC(4,2),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'elevated', 'warning', 'critical')),
    source TEXT DEFAULT 'scan_count' CHECK (source IN ('scan_count', 'ble_mesh', 'manual', 'camera'))
);

-- 8. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.venue_zones(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('crush_risk', 'stampede', 'phone_theft', 'medical', 'fight', 'gate_breach', 'capacity_exceeded', 'weather', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'responding', 'resolved', 'escalated')),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 9. ALERTS
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('density_warning', 'density_critical', 'capacity_threshold', 'capacity_locked', 'sos', 'theft_detected', 'gate_directive', 'weather', 'custom')),
    zone_id UUID REFERENCES public.venue_zones(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('organizer', 'security', 'medical', 'attendees_zone', 'attendees_all', 'all')),
    auto_generated BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. GATE SCANS
CREATE TABLE IF NOT EXISTS public.gate_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    gate_id UUID NOT NULL REFERENCES public.venue_zones(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    scanned_at TIMESTAMPTZ DEFAULT now()
);

-- 11. GUARDIAN DEVICES
CREATE TABLE IF NOT EXISTS public.guardian_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    device_name TEXT,
    device_fingerprint TEXT NOT NULL,
    ble_identifier TEXT,
    paired_wristband_id TEXT,
    guardian_mode_active BOOLEAN DEFAULT false,
    last_known_lat NUMERIC(10,7),
    last_known_lng NUMERIC(10,7),
    last_ping TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stolen', 'recovered', 'deactivated')),
    activated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CASHLESS WALLETS
CREATE TABLE IF NOT EXISTS public.cashless_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'KES',
    mpesa_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, event_id)
);

-- 13. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.cashless_wallets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('topup', 'purchase', 'refund')),
    vendor_zone_id UUID REFERENCES public.venue_zones(id) ON DELETE SET NULL,
    description TEXT,
    mpesa_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. WAITLIST (Landing Page)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    event_size TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_zone_density_reading_query ON public.zone_density_readings (event_id, zone_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gate_scans_query ON public.gate_scans (event_id, gate_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets (event_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_event ON public.incidents (event_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_event ON public.alerts (event_id, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_devices_event ON public.guardian_devices (event_id, guardian_mode_active);

-- REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.gate_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_density_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guardian_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- ROW LEVEL SECURITY
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_density_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashless_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public read access policies for events and tickets verification
CREATE POLICY "Public events can be viewed by all" ON public.events FOR SELECT USING (status IN ('published', 'live', 'ended') OR auth.role() = 'authenticated');
CREATE POLICY "Waitlist insert for all" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users view data" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Full access to events for authenticated" ON public.events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access to venue zones for authenticated" ON public.venue_zones FOR ALL USING (true);
CREATE POLICY "Full access to density readings for authenticated" ON public.zone_density_readings FOR ALL USING (true);
CREATE POLICY "Full access to incidents for authenticated" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Full access to alerts for authenticated" ON public.alerts FOR ALL USING (true);
CREATE POLICY "Security can insert gate scans" ON public.gate_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Full access to tickets" ON public.tickets FOR ALL USING (true);
CREATE POLICY "Full access to guardian devices" ON public.guardian_devices FOR ALL USING (true);
CREATE POLICY "Full access to cashless wallets" ON public.cashless_wallets FOR ALL USING (true);
CREATE POLICY "Full access to transactions" ON public.transactions FOR ALL USING (true);
