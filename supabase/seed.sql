-- ==========================================================
-- ANTIGRAVITY SEED DATA
-- Organization: Pulse Events Kenya
-- Venue: Nyayo National Stadium
-- Event: Afrobeats Festival Nairobi 2026 (LIVE)
-- ==========================================================

-- 1. SEED ORGANIZATION
INSERT INTO public.organizations (id, name, email, phone, logo_url)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Pulse Events Kenya',
    'admin@antigravity.ke',
    '+254 712 345 678',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=128&auto=format&fit=crop&q=80'
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED USERS
INSERT INTO public.users (id, organization_id, full_name, email, phone, role, avatar_url)
VALUES
    ('01111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Commander Brian Ochieng', 'admin@antigravity.ke', '+254 700 000 001', 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'),
    ('02222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Wanjiru Kamau', 'wanjiru@pulseevents.co.ke', '+254 700 000 002', 'event_manager', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'),
    ('03333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Captain Evans Mutua (Sec Lead)', 'evans.security@antigravity.ke', '+254 700 000 003', 'security', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'),
    ('04444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Dr. Amina Abdi (Chief Paramedic)', 'amina.medical@antigravity.ke', '+254 700 000 004', 'medical', 'https://images.unsplash.com/photo-1594824813589-42b78a05c75f?w=120&auto=format&fit=crop&q=80'),
    ('05555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'Kevin Mwangi', 'kevin.attendee@gmail.com', '+254 722 998 877', 'attendee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED VENUES
INSERT INTO public.venues (id, organization_id, name, address, city, latitude, longitude, total_capacity, venue_map_url)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'Nyayo National Stadium',
        'Aerodrome Rd, Nairobi',
        'Nairobi',
        -1.3039645,
        36.8228392,
        18000,
        '/maps/nyayo_stadium_layout.svg'
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'a1111111-1111-1111-1111-111111111111',
        'KICC (Kenyatta Int. Convention Centre)',
        'Harambee Ave, CBD',
        'Nairobi',
        -1.2885994,
        36.8232977,
        10000,
        '/maps/kicc_layout.svg'
    ),
    (
        'b3333333-3333-3333-3333-333333333333',
        'a1111111-1111-1111-1111-111111111111',
        'Carnivore Grounds',
        'Langata Rd, Nairobi',
        'Nairobi',
        -1.3283281,
        36.8041512,
        15000,
        '/maps/carnivore_layout.svg'
    ),
    (
        'b4444444-4444-4444-4444-444444444444',
        'a1111111-1111-1111-1111-111111111111',
        'Uhuru Gardens Memorial Park',
        'Langata Rd, Nairobi',
        'Nairobi',
        -1.3327145,
        36.7978287,
        25000,
        '/maps/uhuru_gardens_layout.svg'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED VENUE ZONES FOR NYAYO STADIUM
INSERT INTO public.venue_zones (id, venue_id, name, zone_type, capacity, polygon_coords, sort_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Gate A (Main North Turnstiles)', 'entry_gate', 2500, '[[50, 10], [150, 10], [150, 60], [50, 60]]'::jsonb, 1),
    ('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Gate B (East Public Entrance)', 'entry_gate', 2500, '[[650, 200], [750, 200], [750, 300], [650, 300]]'::jsonb, 2),
    ('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Gate C (South Express Gate)', 'entry_gate', 2000, '[[650, 320], [750, 320], [750, 420], [650, 420]]'::jsonb, 3),
    ('c4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'Gate D (VIP & Artist Fast Track)', 'entry_gate', 1000, '[[50, 440], [150, 440], [150, 490], [50, 490]]'::jsonb, 4),
    ('c5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'Main Stage & Pit Barrier', 'stage', 1500, '[[320, 40], [480, 40], [480, 130], [320, 130]]'::jsonb, 5),
    ('c6666666-6666-6666-6666-666666666666', 'b1111111-1111-1111-1111-111111111111', 'Main Floor North (Front Pit)', 'floor_section', 3500, '[[220, 140], [580, 140], [580, 260], [220, 260]]'::jsonb, 6),
    ('c7777777-7777-7777-7777-777777777777', 'b1111111-1111-1111-1111-111111111111', 'Main Floor South (General Pitch)', 'floor_section', 4500, '[[220, 270], [580, 270], [580, 420], [220, 420]]'::jsonb, 7),
    ('c8888888-8888-8888-8888-888888888888', 'b1111111-1111-1111-1111-111111111111', 'VIP Lounge East', 'vip', 1200, '[[590, 140], [700, 140], [700, 260], [590, 260]]'::jsonb, 8),
    ('c9999999-9999-9999-9999-999999999999', 'b1111111-1111-1111-1111-111111111111', 'VIP Lounge West & Skybox', 'vip', 1200, '[[100, 140], [210, 140], [210, 260], [100, 260]]'::jsonb, 9),
    ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b1111111-1111-1111-1111-111111111111', 'Medical Post Alpha (Red Cross)', 'medical_post', 100, '[[80, 280], [180, 280], [180, 360], [80, 360]]'::jsonb, 10),
    ('cbbbbbb0-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-1111-1111-1111-111111111111', 'Medical Post Bravo (Triage)', 'medical_post', 100, '[[620, 280], [720, 280], [720, 360], [620, 360]]'::jsonb, 11),
    ('ccccccc0-cccc-cccc-cccc-cccccccccccc', 'b1111111-1111-1111-1111-111111111111', 'Food & Cashless Bar Court', 'vendor_area', 1800, '[[220, 430], [580, 430], [580, 480], [220, 480]]'::jsonb, 12),
    ('cdddddd0-dddd-dddd-dddd-dddddddddddd', 'b1111111-1111-1111-1111-111111111111', 'Emergency Exit 1 & 2 (North)', 'exit_gate', 4000, '[[20, 180], [70, 180], [70, 260], [20, 260]]'::jsonb, 13)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED LIVE EVENT
INSERT INTO public.events (
    id,
    organization_id,
    venue_id,
    title,
    description,
    event_date,
    doors_open,
    event_start,
    event_end,
    max_capacity,
    current_attendance,
    status,
    cover_image_url,
    ticket_tiers,
    safety_config
)
VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Afrobeats Festival Nairobi 2026',
    'Eastern Africa''s largest live music celebration featuring Burna Boy, Sauti Sol, and Ayra Starr. Powered with zero-tolerance crowd safety infrastructure.',
    CURRENT_DATE,
    now() - INTERVAL '3 hours 15 minutes',
    now() - INTERVAL '1 hour',
    now() + INTERVAL '4 hours',
    18000,
    12847,
    'live',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    '[
        {"name": "Early Bird", "price": 2000, "quantity": 5000, "sold": 5000},
        {"name": "Regular Pitch", "price": 3500, "quantity": 10000, "sold": 8847},
        {"name": "VIP Golden Circle", "price": 8000, "quantity": 3000, "sold": 2200}
    ]'::jsonb,
    '{"density_warning": 4.5, "density_critical": 5.5, "capacity_slow_at": 0.90, "capacity_stop_at": 0.98}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. SEED ZONE DENSITY READINGS (Live Snapshots)
INSERT INTO public.zone_density_readings (id, event_id, zone_id, timestamp, estimated_count, density_per_sqm, risk_level, source)
VALUES
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', now(), 340, 2.10, 'safe', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', now(), 820, 3.80, 'elevated', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', now(), 420, 2.40, 'safe', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', now(), 120, 1.20, 'safe', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c5555555-5555-5555-5555-555555555555', now(), 980, 4.85, 'warning', 'camera'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c6666666-6666-6666-6666-666666666666', now(), 3120, 5.20, 'warning', 'ble_mesh'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', now(), 3450, 3.40, 'elevated', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c8888888-8888-8888-8888-888888888888', now(), 920, 2.80, 'safe', 'scan_count'),
    (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c9999999-9999-9999-9999-999999999999', now(), 1050, 3.90, 'elevated', 'scan_count');

-- 7. SEED INCIDENTS
INSERT INTO public.incidents (id, event_id, zone_id, incident_type, severity, title, description, reported_by, assigned_to, status, latitude, longitude, metadata)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111',
        'e1111111-1111-1111-1111-111111111111',
        'c6666666-6666-6666-6666-666666666666',
        'crush_risk',
        'high',
        'Surge pressure towards Stage Barrier North',
        'Crowd pushing forward during headliner intro. Density approaching 5.2 persons/sqm. Security squad 3 dispatched for flow control.',
        '03333333-3333-3333-3333-333333333333',
        '03333333-3333-3333-3333-333333333333',
        'responding',
        -1.3038100,
        36.8229100,
        '{"surge_velocity": "0.8m/s", "barrier_load": "72%"}'::jsonb
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'e1111111-1111-1111-1111-111111111111',
        'c6666666-6666-6666-6666-666666666666',
        'phone_theft',
        'medium',
        'Guardian Mode Alarm: iPhone 15 Pro Max',
        'BLE tether severed in Main Floor North. Location actively pinging near vendor perimeter. Suspect beacon flagged.',
        '05555555-5555-5555-5555-555555555555',
        '03333333-3333-3333-3333-333333333333',
        'acknowledged',
        -1.3039200,
        36.8231000,
        '{"device_name": "Kevin iPhone", "rssi": -88, "signal_lost_at": "3m ago"}'::jsonb
    ),
    (
        'd3333333-3333-3333-3333-333333333333',
        'e1111111-1111-1111-1111-111111111111',
        'c8888888-8888-8888-8888-888888888888',
        'medical',
        'medium',
        'Attendee Dehydration / Fainting',
        'Female attendee fainted near VIP bar rail. Red Cross team responding with stretcher.',
        '04444444-4444-4444-4444-444444444444',
        '04444444-4444-4444-4444-444444444444',
        'responding',
        -1.3041000,
        36.8234000,
        '{"triage_status": "yellow", "vital_signs": "stable"}'::jsonb
    );

-- 8. SEED ALERTS
INSERT INTO public.alerts (id, event_id, alert_type, zone_id, message, severity, target_audience, auto_generated, created_at)
VALUES
    (
        'a1111111-aaaa-1111-aaaa-111111111111',
        'e1111111-1111-1111-1111-111111111111',
        'density_warning',
        'c6666666-6666-6666-6666-666666666666',
        'DENSITY WARNING: Main Floor North reached 5.2 people/m² (Threshold: 4.5). Slow entry at Gate A.',
        'warning',
        'all',
        true,
        now() - INTERVAL '4 minutes'
    ),
    (
        'a2222222-bbbb-2222-bbbb-222222222222',
        'e1111111-1111-1111-1111-111111111111',
        'capacity_threshold',
        'c8888888-8888-8888-8888-888888888888',
        'VIP East Lounge at 89% capacity. Prepare overflow holding at Skybox Corridor.',
        'info',
        'security',
        true,
        now() - INTERVAL '12 minutes'
    ),
    (
        'a3333333-cccc-3333-cccc-333333333333',
        'e1111111-1111-1111-1111-111111111111',
        'theft_detected',
        'c6666666-6666-6666-6666-666666666666',
        'GUARDIAN SOS: Phone theft reported in Main Floor North. Device tether disconnected.',
        'warning',
        'security',
        true,
        now() - INTERVAL '2 minutes'
    );

-- 9. SEED SAMPLE CASHLESS WALLET & TICKET FOR DEMO ATTENDEE
INSERT INTO public.cashless_wallets (id, user_id, event_id, balance, currency, mpesa_phone)
VALUES (
    'e1111111-1111-1111-1111-111111111111',
    '05555555-5555-5555-5555-555555555555',
    'e1111111-1111-1111-1111-111111111111',
    4250.00,
    'KES',
    '+254 722 998 877'
) ON CONFLICT (user_id, event_id) DO NOTHING;

INSERT INTO public.tickets (id, event_id, attendee_id, tier, price, currency, qr_code_hash, device_fingerprint, status, purchased_at, scanned_at, scanned_by, gate_id, mpesa_transaction_id)
VALUES (
    'f1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    '05555555-5555-5555-5555-555555555555',
    'Regular Pitch',
    3500.00,
    'KES',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'fp_kevin_android_chrome_9091',
    'valid',
    now() - INTERVAL '2 days',
    NULL,
    NULL,
    NULL,
    'QK782910AA'
) ON CONFLICT (id) DO NOTHING;
