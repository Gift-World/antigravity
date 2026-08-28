export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'event_manager' 
  | 'security' 
  | 'medical' 
  | 'vendor' 
  | 'attendee';

export type ZoneType = 
  | 'entry_gate' 
  | 'exit_gate' 
  | 'floor_section' 
  | 'vip' 
  | 'stage' 
  | 'vendor_area' 
  | 'medical_post' 
  | 'parking';

export type EventStatus = 
  | 'draft' 
  | 'published' 
  | 'live' 
  | 'ended' 
  | 'cancelled';

export type TicketStatus = 
  | 'valid' 
  | 'scanned' 
  | 'transferred' 
  | 'refunded' 
  | 'revoked';

export type RiskLevel = 
  | 'safe' 
  | 'elevated' 
  | 'warning' 
  | 'critical';

export type IncidentType = 
  | 'crush_risk' 
  | 'stampede' 
  | 'phone_theft' 
  | 'medical' 
  | 'fight' 
  | 'gate_breach' 
  | 'capacity_exceeded' 
  | 'weather' 
  | 'other';

export type IncidentSeverity = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type IncidentStatus = 
  | 'open' 
  | 'acknowledged' 
  | 'responding' 
  | 'resolved' 
  | 'escalated';

export type AlertType = 
  | 'density_warning' 
  | 'density_critical' 
  | 'capacity_threshold' 
  | 'capacity_locked' 
  | 'sos' 
  | 'theft_detected' 
  | 'gate_directive' 
  | 'weather' 
  | 'custom';

export type AlertSeverity = 
  | 'info' 
  | 'warning' 
  | 'critical';

export type TargetAudience = 
  | 'organizer' 
  | 'security' 
  | 'medical' 
  | 'attendees'
  | 'attendees_zone' 
  | 'attendees_all' 
  | 'all';

export type GuardianDeviceStatus = 
  | 'active' 
  | 'stolen' 
  | 'recovered' 
  | 'deactivated';

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Venue {
  id: string;
  organization_id?: string;
  name: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  total_capacity: number;
  venue_map_url?: string;
  created_at: string;
  zones?: VenueZone[];
}

export interface VenueZone {
  id: string;
  venue_id: string;
  name: string;
  zone_type: ZoneType;
  capacity: number;
  polygon_coords?: [number, number][];
  sort_order: number;
}

export interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface SafetyConfig {
  density_warning: number;
  density_critical: number;
  capacity_slow_at: number;
  capacity_stop_at: number;
}

export interface Event {
  id: string;
  organization_id: string;
  venue_id: string;
  title: string;
  description?: string;
  event_date: string;
  doors_open: string;
  event_start: string;
  event_end?: string;
  max_capacity: number;
  current_attendance: number;
  status: EventStatus;
  cover_image_url?: string;
  ticket_tiers: TicketTier[];
  safety_config: SafetyConfig;
  created_at: string;
  updated_at: string;
  venue?: Venue;
}

export interface Ticket {
  id: string;
  event_id: string;
  attendee_id?: string;
  tier: string;
  price: number;
  currency: string;
  qr_code_hash: string;
  device_fingerprint?: string;
  status: TicketStatus;
  purchased_at: string;
  scanned_at?: string | null;
  scanned_by?: string | null;
  gate_id?: string | null;
  mpesa_transaction_id?: string;
  event?: Event;
  attendee?: User;
}

export interface ZoneDensityReading {
  id: string;
  event_id: string;
  zone_id: string;
  timestamp: string;
  estimated_count: number;
  density_per_sqm: number;
  risk_level: RiskLevel;
  source: 'scan_count' | 'ble_mesh' | 'manual' | 'camera';
  zone?: VenueZone;
}

export interface Incident {
  id: string;
  event_id: string;
  zone_id?: string | null;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description?: string;
  reported_by?: string | null;
  assigned_to?: string | null;
  status: IncidentStatus;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, any>;
  created_at: string;
  resolved_at?: string | null;
  zone?: VenueZone;
  reporter?: User;
  assignee?: User;
}

export interface Alert {
  id: string;
  event_id: string;
  alert_type: AlertType;
  zone_id?: string | null;
  message: string;
  severity: AlertSeverity;
  target_audience: TargetAudience;
  auto_generated: boolean;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  created_at: string;
  zone?: VenueZone;
}

export interface GateScan {
  id: string;
  event_id: string;
  gate_id: string;
  ticket_id: string;
  scanned_by?: string | null;
  direction: 'in' | 'out';
  scanned_at: string;
  gate?: VenueZone;
  ticket?: Ticket;
}

export interface GuardianDevice {
  id: string;
  user_id: string;
  event_id: string;
  device_name?: string;
  device_fingerprint: string;
  ble_identifier?: string;
  paired_wristband_id?: string;
  guardian_mode_active: boolean;
  last_known_lat?: number;
  last_known_lng?: number;
  last_ping?: string;
  status: GuardianDeviceStatus;
  activated_at: string;
}

export interface CashlessWallet {
  id: string;
  user_id: string;
  event_id: string;
  balance: number;
  currency: string;
  mpesa_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  event_id: string;
  amount: number;
  transaction_type: 'topup' | 'purchase' | 'refund';
  vendor_zone_id?: string | null;
  description?: string;
  mpesa_reference?: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  company?: string;
  event_size?: string;
  message?: string;
  created_at: string;
}
