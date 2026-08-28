// src/lib/store.ts
// Global reactive Zustand store connected directly to Supabase with Realtime sync

import { create } from 'zustand';
import {
  Organization,
  User,
  Venue,
  VenueZone,
  Event,
  Ticket,
  ZoneDensityReading,
  Incident,
  Alert,
  GateScan,
  CashlessWallet,
  Transaction,
  GuardianDevice,
  WaitlistEntry,
  UserRole,
  IncidentStatus,
  AlertSeverity,
} from '@/types/database';
import { soundManager } from '@/lib/audio';
import { createTicketQRPayload, getDeviceFingerprint } from '@/lib/qr';
import { triggerMpesaSTKPush } from '@/lib/mpesa';
import { supabaseService } from '@/lib/supabaseService';

interface AppState {
  // Loading & Connection state
  isLoadingInitialData: boolean;
  isSupabaseConnected: boolean;
  initData: () => Promise<void>;

  // Core Data
  currentUser: User;
  currentOrg: Organization;
  users: User[];
  venues: Venue[];
  events: Event[];
  tickets: Ticket[];
  densityReadings: ZoneDensityReading[];
  incidents: Incident[];
  alerts: Alert[];
  gateScans: GateScan[];
  wallets: Record<string, CashlessWallet>;
  transactions: Transaction[];
  guardianDevice: GuardianDevice | null;
  waitlist: WaitlistEntry[];

  // App UI State
  activeEventId: string;
  isSimulationActive: boolean;
  isAudioMuted: boolean;
  selectedZoneId: string | null;
  criticalFlashAlert: Alert | null;
  simulationTicks: number;
  scansPerMinuteByGate: Record<string, { in: number; out: number }>;

  // State Mutators
  setCurrentUser: (user: User) => void;
  setUserRole: (role: UserRole) => void;
  setActiveEventId: (eventId: string) => void;
  setSelectedZoneId: (zoneId: string | null) => void;
  toggleSimulation: () => void;
  setSimulationActive: (active: boolean) => void;
  toggleAudioMute: () => void;
  dismissCriticalFlash: () => void;

  // Gate Scan Actions
  processGateScan: (params: {
    ticketId: string;
    gateId: string;
    qrHash: string;
    staffId: string;
    direction: 'in' | 'out';
  }) => Promise<{ success: boolean; reason?: string; message: string; ticket?: Ticket }>;

  // Alert Actions
  triggerAlert: (alert: Omit<Alert, 'id' | 'created_at'>) => void;
  acknowledgeAlert: (alertId: string, userId?: string) => void;
  dismissAlert: (alertId: string) => void;

  // Incident Actions
  createIncident: (incident: Omit<Incident, 'id' | 'created_at'>) => Incident;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, assignedTo?: string) => void;

  // Venue & Event Actions
  createEvent: (eventData: Partial<Event>) => Event;
  updateEventStatus: (eventId: string, status: Event['status']) => void;
  addVenue: (venueData: Partial<Venue>) => Venue;
  addVenueZone: (venueId: string, zone: Partial<VenueZone>) => VenueZone;

  // Ticket & M-Pesa Actions
  purchaseTicket: (params: {
    eventId: string;
    tier: string;
    price: number;
    fullName: string;
    email: string;
    phone: string;
    mpesaPhone: string;
  }) => Promise<{ success: boolean; ticket: Ticket }>;

  // Cashless Wallet Actions
  topupWallet: (amount: number, mpesaPhone: string) => Promise<{ success: boolean; newBalance: number }>;
  spendCashless: (amount: number, description: string, vendorZoneId?: string) => Promise<{ success: boolean }>;

  // Guardian Mode Anti-Theft Actions
  toggleGuardianMode: (active: boolean, deviceName?: string) => void;
  triggerGuardianSOS: (reason?: string) => void;

  // Waitlist Action
  joinWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'created_at'>) => void;

  // Simulation Tick
  runSimulationTick: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoadingInitialData: true,
  isSupabaseConnected: false,

  // Clean empty initial state
  currentUser: {
    id: '',
    organization_id: '',
    full_name: 'Guest User',
    email: 'guest@antigravity.ke',
    role: 'super_admin',
    created_at: new Date().toISOString(),
  },
  currentOrg: {
    id: '',
    name: 'Antigravity Platform',
    email: 'admin@antigravity.ke',
    phone: '+254 700 000 000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  users: [],
  venues: [],
  events: [],
  tickets: [],
  densityReadings: [],
  incidents: [],
  alerts: [],
  gateScans: [],
  wallets: {},
  transactions: [],
  guardianDevice: null,
  waitlist: [],

  activeEventId: '',
  isSimulationActive: false,
  isAudioMuted: false,
  selectedZoneId: null,
  criticalFlashAlert: null,
  simulationTicks: 0,
  scansPerMinuteByGate: {},

  // Initial Data Fetcher from Supabase (with Realtime multi-browser sync)
  initData: async () => {
    try {
      const res = await supabaseService.fetchInitialDataset();
      if (res.success && res.data) {
        const d = res.data;
        const populatedVenues = d.venues || [];
        const venueMap = new Map(populatedVenues.map((v) => [v.id, v]));

        const populatedEvents = (d.events || []).map((e) => {
          const matchedVenue = venueMap.get(e.venue_id) || e.venue;
          return {
            ...e,
            venue: matchedVenue,
          };
        });

        const firstEventId = populatedEvents[0]?.id || '';
        const firstUser = d.users[0] || {
          id: 'user_admin',
          organization_id: d.organizations[0]?.id || '',
          full_name: 'Admin User',
          email: 'admin@antigravity.ke',
          role: 'super_admin' as const,
          created_at: new Date().toISOString(),
        };

        const liveEvent = populatedEvents.find((e) => e.status === 'live');

        set({
          isLoadingInitialData: false,
          isSupabaseConnected: true,
          currentOrg: d.organizations[0] || {
            id: 'org_main',
            name: 'Antigravity Organization',
            email: 'admin@antigravity.ke',
            phone: '+254 700 000 000',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          users: d.users,
          currentUser: firstUser,
          venues: populatedVenues,
          events: populatedEvents,
          activeEventId: liveEvent?.id || firstEventId,
          isSimulationActive: Boolean(liveEvent),
          tickets: d.tickets,
          densityReadings: d.densityReadings,
          incidents: d.incidents,
          alerts: d.alerts,
          wallets: d.wallets,
          transactions: d.transactions,
          scansPerMinuteByGate: {
            'c1111111-1111-1111-1111-111111111111': { in: 48, out: 4 },
            'c2222222-2222-2222-2222-222222222222': { in: 62, out: 7 },
            'c3333333-3333-3333-3333-333333333333': { in: 34, out: 2 },
            'c4444444-4444-4444-4444-444444444444': { in: 18, out: 1 },
          },
        });

        // Set up Realtime listeners to sync across all browsers
        supabaseService.subscribeToAllRealtime({
          onAlert: (newAlert) => {
            get().triggerAlert(newAlert);
          },
          onIncident: (updatedIncident) => {
            set((state) => {
              const exists = state.incidents.some((i) => i.id === updatedIncident.id);
              if (exists) {
                return {
                  incidents: state.incidents.map((i) =>
                    i.id === updatedIncident.id ? updatedIncident : i
                  ),
                };
              }
              return { incidents: [updatedIncident, ...state.incidents] };
            });
          },
          onDensity: (newDensity) => {
            set((state) => ({
              densityReadings: state.densityReadings.map((r) =>
                r.zone_id === newDensity.zone_id ? newDensity : r
              ),
            }));
          },
          onGateScan: (newScan) => {
            set((state) => ({
              gateScans: [newScan, ...state.gateScans.slice(0, 499)],
            }));
          },
          onTicket: (updatedTicket) => {
            set((state) => ({
              tickets: state.tickets.map((t) =>
                t.id === updatedTicket.id ? updatedTicket : t
              ),
            }));
          },
        });
      } else {
        set({
          isLoadingInitialData: false,
          isSupabaseConnected: false,
          users: [],
          venues: [],
          events: [],
          tickets: [],
          densityReadings: [],
          incidents: [],
          alerts: [],
          gateScans: [],
          wallets: {},
          transactions: [],
        });
      }
    } catch (err) {
      console.warn('initData error:', err);
      set({
        isLoadingInitialData: false,
        isSupabaseConnected: false,
        users: [],
        venues: [],
        events: [],
        tickets: [],
        densityReadings: [],
        incidents: [],
        alerts: [],
        gateScans: [],
        wallets: {},
        transactions: [],
      });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setUserRole: (role) => set((state) => ({ currentUser: { ...state.currentUser, role } })),
  setActiveEventId: (eventId) => set({ activeEventId: eventId }),
  setSelectedZoneId: (zoneId) => set({ selectedZoneId: zoneId }),
  toggleSimulation: () => set((state) => ({ isSimulationActive: !state.isSimulationActive })),
  setSimulationActive: (active) => set({ isSimulationActive: active }),
  toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  dismissCriticalFlash: () => set({ criticalFlashAlert: null }),

  processGateScan: async ({ ticketId, gateId, qrHash, staffId, direction }) => {
    const { tickets, events, activeEventId, isSupabaseConnected } = get();

    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      soundManager.playScanError();
      return {
        success: false,
        reason: 'ticket_not_found',
        message: 'Ticket not found in database.',
      };
    }

    if (ticket.status === 'scanned') {
      soundManager.playScanError();
      return {
        success: false,
        reason: 'already_scanned',
        message: `Already scanned at ${ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleTimeString() : 'entrance'}.`,
        ticket,
      };
    }

    if (ticket.status === 'revoked') {
      soundManager.playScanError();
      return {
        success: false,
        reason: 'revoked',
        message: 'This ticket has been revoked.',
        ticket,
      };
    }

    if (ticket.qr_code_hash !== qrHash) {
      soundManager.playScanError();
      return {
        success: false,
        reason: 'invalid_hash',
        message: 'Barcode security signature does not match.',
        ticket,
      };
    }

    const now = new Date().toISOString();
    const updatedTicket: Ticket = {
      ...ticket,
      status: 'scanned',
      scanned_at: now,
      scanned_by: staffId,
      gate_id: gateId,
    };

    const newGateScan: GateScan = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_id: activeEventId || ticket.event_id,
      gate_id: gateId,
      ticket_id: ticket.id,
      scanned_by: staffId,
      direction,
      scanned_at: now,
    };

    if (isSupabaseConnected) {
      supabaseService.updateTicketStatus(ticket.id, 'scanned', gateId, staffId);
      supabaseService.insertGateScan(newGateScan);
    }

    soundManager.playScanSuccess();

    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? updatedTicket : t)),
      gateScans: [newGateScan, ...state.gateScans],
      events: state.events.map((e) =>
        e.id === (activeEventId || ticket.event_id)
          ? {
              ...e,
              current_attendance:
                direction === 'in'
                  ? Math.min(e.max_capacity, e.current_attendance + 1)
                  : Math.max(0, e.current_attendance - 1),
            }
          : e
      ),
    }));

    return {
      success: true,
      message: 'Access Granted. Welcome!',
      ticket: updatedTicket,
    };
  },

  triggerAlert: (alertData) => {
    const { isAudioMuted, isSupabaseConnected } = get();

    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConnected && !alertData.auto_generated) {
      supabaseService.insertAlert(alertData);
    }

    if (!isAudioMuted) {
      if (newAlert.severity === 'critical') {
        soundManager.playCriticalAlert();
      } else {
        soundManager.playWarningAlert();
      }
    }

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      criticalFlashAlert: newAlert.severity === 'critical' ? newAlert : state.criticalFlashAlert,
    }));
  },

  acknowledgeAlert: (alertId, userId) => {
    const now = new Date().toISOString();
    const ackUser = userId || get().currentUser.id;

    if (get().isSupabaseConnected) {
      supabaseService.acknowledgeAlert(alertId, ackUser);
    }

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged_at: now, acknowledged_by: ackUser } : a
      ),
      criticalFlashAlert: state.criticalFlashAlert?.id === alertId ? null : state.criticalFlashAlert,
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
      criticalFlashAlert: state.criticalFlashAlert?.id === alertId ? null : state.criticalFlashAlert,
    }));
  },

  createIncident: (incidentData) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: incidentData.status || 'open',
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertIncident(newIncident);
    }

    set((state) => ({
      incidents: [newIncident, ...state.incidents],
    }));

    return newIncident;
  },

  updateIncidentStatus: (incidentId, status, assignedTo) => {
    const now = new Date().toISOString();

    if (get().isSupabaseConnected) {
      supabaseService.updateIncidentStatus(incidentId, status, assignedTo);
    }

    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status,
              assigned_to: assignedTo !== undefined ? assignedTo : i.assigned_to,
              resolved_at: status === 'resolved' ? now : i.resolved_at,
            }
          : i
      ),
    }));
  },

  createEvent: (eventData) => {
    const newEvent: Event = {
      id: `e_${Date.now()}`,
      organization_id: get().currentOrg.id || 'org_main',
      venue_id: eventData.venue_id || (get().venues[0]?.id || ''),
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      event_date: eventData.event_date || new Date().toISOString().split('T')[0],
      doors_open: eventData.doors_open || new Date().toISOString(),
      event_start: eventData.event_start || new Date().toISOString(),
      event_end: eventData.event_end || new Date().toISOString(),
      max_capacity: eventData.max_capacity || 10000,
      current_attendance: 0,
      status: eventData.status || 'published',
      cover_image_url: eventData.cover_image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      ticket_tiers: eventData.ticket_tiers || [
        { name: 'Regular', price: 2000, quantity: 5000, sold: 0 },
        { name: 'VIP', price: 5000, quantity: 1000, sold: 0 },
      ],
      safety_config: eventData.safety_config || {
        density_warning: 4.5,
        density_critical: 5.5,
        capacity_slow_at: 0.9,
        capacity_stop_at: 0.98,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      venue: get().venues.find((v) => v.id === eventData.venue_id) || get().venues[0],
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertEvent(newEvent);
    }

    set((state) => ({
      events: [newEvent, ...state.events],
      activeEventId: state.activeEventId || newEvent.id,
    }));

    return newEvent;
  },

  updateEventStatus: (eventId, status) => {
    if (get().isSupabaseConnected) {
      supabaseService.updateEventStatus(eventId, status);
    }

    set((state) => ({
      events: state.events.map((e) => (e.id === eventId ? { ...e, status } : e)),
    }));
  },

  addVenue: (venueData) => {
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      organization_id: get().currentOrg.id || 'org_main',
      name: venueData.name || 'Custom Venue',
      address: venueData.address || '',
      city: venueData.city || 'Nairobi',
      total_capacity: venueData.total_capacity || 10000,
      created_at: new Date().toISOString(),
      zones: [],
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertVenue(newVenue);
    }

    set((state) => ({
      venues: [...state.venues, newVenue],
    }));

    return newVenue;
  },

  addVenueZone: (venueId, zoneData) => {
    const newZone: VenueZone = {
      id: `z_${Date.now()}`,
      venue_id: venueId,
      name: zoneData.name || 'Zone',
      zone_type: zoneData.zone_type || 'floor_section',
      capacity: zoneData.capacity || 2000,
      sort_order: zoneData.sort_order || 1,
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertVenueZone(newZone);
    }

    set((state) => ({
      venues: state.venues.map((v) =>
        v.id === venueId ? { ...v, zones: [...(v.zones || []), newZone] } : v
      ),
    }));

    return newZone;
  },

  purchaseTicket: async ({ eventId, tier, price, fullName, email, phone, mpesaPhone }) => {
    const activeEvent = get().events.find((e) => e.id === eventId) || get().events[0];
    if (!activeEvent) throw new Error('Event not found');

    const mpesaRes = await triggerMpesaSTKPush({
      phoneNumber: mpesaPhone,
      amount: price,
      accountReference: `TKT-${activeEvent.title.substring(0, 10)}`,
      transactionDesc: `${tier} Ticket Purchase`,
    });

    if (!mpesaRes.success) {
      soundManager.playScanError();
      throw new Error(mpesaRes.errorMessage || 'M-Pesa payment failed. Please try again.');
    }

    const { hash: qrCodeHash } = await createTicketQRPayload(eventId, get().currentUser.id);
    const deviceFingerprint = getDeviceFingerprint();

    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      event_id: eventId,
      attendee_id: get().currentUser.id,
      tier,
      price,
      currency: 'KES',
      qr_code_hash: qrCodeHash,
      device_fingerprint: deviceFingerprint,
      status: 'valid',
      purchased_at: new Date().toISOString(),
      mpesa_transaction_id: mpesaRes.receiptNumber,
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertTicket(newTicket);
    }

    soundManager.playScanSuccess();

    set((state) => ({
      tickets: [newTicket, ...state.tickets],
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          ticket_tiers: e.ticket_tiers.map((tt) =>
            tt.name === tier ? { ...tt, sold: tt.sold + 1 } : tt
          ),
        };
      }),
    }));

    return { success: true, ticket: newTicket };
  },

  topupWallet: async (amount, mpesaPhone) => {
    const user = get().currentUser;
    const activeEvent = get().events.find((e) => e.id === get().activeEventId) || get().events[0];
    if (!activeEvent) throw new Error('No active event for wallet top-up');

    const result = await triggerMpesaSTKPush({
      phoneNumber: mpesaPhone,
      amount,
      accountReference: `WALLET-${user.full_name.substring(0, 8)}`,
      transactionDesc: 'Antigravity Cashless Wristband Top-Up',
    });

    if (!result.success) {
      throw new Error(result.errorMessage || 'Payment could not be completed.');
    }

    const currentWallet = get().wallets[user.id] || {
      id: `w_${user.id}`,
      user_id: user.id,
      event_id: activeEvent.id,
      wristband_nfc_id: `NFC_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      balance: 0,
      currency: 'KES',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newBalance = currentWallet.balance + amount;
    const updatedWallet: CashlessWallet = {
      ...currentWallet,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      wallet_id: updatedWallet.id,
      event_id: activeEvent.id,
      amount,
      transaction_type: 'topup',
      description: 'M-Pesa STK Wallet Top-Up',
      mpesa_reference: result.receiptNumber,
      created_at: new Date().toISOString(),
    };

    if (get().isSupabaseConnected) {
      supabaseService.upsertWallet(updatedWallet);
      supabaseService.insertTransaction(newTx);
    }

    set((state) => ({
      wallets: { ...state.wallets, [user.id]: updatedWallet },
      transactions: [newTx, ...state.transactions],
    }));

    return { success: true, newBalance };
  },

  spendCashless: async (amount, description, vendorZoneId) => {
    const user = get().currentUser;
    const activeEvent = get().events.find((e) => e.id === get().activeEventId) || get().events[0];
    if (!activeEvent) throw new Error('No active event');

    const currentWallet = get().wallets[user.id];

    if (!currentWallet || currentWallet.balance < amount) {
      soundManager.playScanError();
      throw new Error('Insufficient wallet balance. Please top up via M-Pesa.');
    }

    const updatedWallet: CashlessWallet = {
      ...currentWallet,
      balance: currentWallet.balance - amount,
      updated_at: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      wallet_id: updatedWallet.id,
      event_id: activeEvent.id,
      amount,
      transaction_type: 'purchase',
      vendor_zone_id: vendorZoneId,
      description,
      created_at: new Date().toISOString(),
    };

    if (get().isSupabaseConnected) {
      supabaseService.upsertWallet(updatedWallet);
      supabaseService.insertTransaction(newTx);
    }

    soundManager.playScanSuccess();
    set((state) => ({
      wallets: { ...state.wallets, [user.id]: updatedWallet },
      transactions: [newTx, ...state.transactions],
    }));

    return { success: true };
  },

  toggleGuardianMode: (active, deviceName) => {
    const { currentUser, activeEventId } = get();
    if (!active) {
      soundManager.stopGuardianSiren();
    }
    set((state) => ({
      guardianDevice: {
        id: state.guardianDevice?.id || `gd_${Date.now()}`,
        user_id: currentUser.id,
        event_id: activeEventId,
        device_name: deviceName || state.guardianDevice?.device_name || 'Personal Phone',
        device_fingerprint: 'fp_guardian_mesh_node_01',
        guardian_mode_active: active,
        last_known_lat: -1.30392,
        last_known_lng: 36.8231,
        last_ping: new Date().toISOString(),
        status: active ? 'active' : 'deactivated',
        activated_at: new Date().toISOString(),
      },
    }));
  },

  triggerGuardianSOS: (reason) => {
    soundManager.startGuardianSiren();
    const activeEventId = get().activeEventId;
    const alertMsg = `GUARDIAN EMERGENCY SOS: Attendee device distress alarm triggered. ${reason || 'Alert'}`;

    get().triggerAlert({
      event_id: activeEventId,
      alert_type: 'theft_detected',
      zone_id: null,
      message: alertMsg,
      severity: 'critical',
      target_audience: 'security',
      auto_generated: true,
      acknowledged_by: null,
      acknowledged_at: null,
    });

    get().createIncident({
      event_id: activeEventId,
      zone_id: null,
      incident_type: 'phone_theft',
      severity: 'high',
      title: 'Active Guardian Alarm SOS',
      description: alertMsg,
      reported_by: get().currentUser.id,
      assigned_to: null,
      status: 'open',
    });
  },

  joinWaitlist: (entry) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wl_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    supabaseService.insertWaitlist(entry);
    set((state) => ({ waitlist: [newEntry, ...state.waitlist] }));
  },

  runSimulationTick: () => {
    if (!get().isSimulationActive) return;

    const { events, activeEventId, densityReadings, simulationTicks, isSupabaseConnected } = get();
    if (events.length === 0 || densityReadings.length === 0) return;

    const liveEvent = events.find((e) => e.id === activeEventId) || events.find((e) => e.status === 'live');
    if (!liveEvent) return;

    const nextTick = simulationTicks + 1;
    const cyclePos = nextTick % 48;

    // Pick a zone from real readings
    const targetReading = densityReadings[0];
    const scanDelta = Math.floor(Math.random() * 4) + 1;

    const updatedReadings = densityReadings.map((r, idx) => {
      if (idx === 0) {
        let targetDensity = 2.4 + (cyclePos / 40) * 3.3;
        if (cyclePos >= 44) {
          targetDensity = 3.6;
        }
        const d = Number(targetDensity.toFixed(2));
        let risk: ZoneDensityReading['risk_level'] = 'safe';
        if (d >= 5.5) risk = 'critical';
        else if (d >= 4.5) risk = 'warning';
        else if (d >= 3.0) risk = 'elevated';

        const reading: ZoneDensityReading = {
          ...r,
          density_per_sqm: d,
          risk_level: risk,
          estimated_count: Math.round(d * 600),
          timestamp: new Date().toISOString(),
        };

        if (isSupabaseConnected && cyclePos % 4 === 0) {
          supabaseService.insertZoneDensityReading(reading);
        }

        return reading;
      }

      // Other zones fluctuate slightly
      const drift = (Math.random() - 0.5) * 0.06;
      const newDensity = Math.max(1.0, Math.min(4.2, Number((r.density_per_sqm + drift).toFixed(2))));
      let risk: ZoneDensityReading['risk_level'] = 'safe';
      if (newDensity >= 4.5) risk = 'warning';
      else if (newDensity >= 3.0) risk = 'elevated';

      return {
        ...r,
        density_per_sqm: newDensity,
        risk_level: risk,
        estimated_count: Math.round(r.estimated_count + drift * 100),
        timestamp: new Date().toISOString(),
      };
    });

    if (cyclePos === 24 && targetReading) {
      get().triggerAlert({
        event_id: liveEvent.id,
        zone_id: targetReading.zone_id,
        alert_type: 'density_warning',
        message: 'DENSITY WARNING: High crowd density detected in zone. Prepare holding lanes.',
        severity: 'warning',
        target_audience: 'security',
        auto_generated: true,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    } else if (cyclePos === 38 && targetReading) {
      get().triggerAlert({
        event_id: liveEvent.id,
        zone_id: targetReading.zone_id,
        alert_type: 'density_critical',
        message: 'CRITICAL CRUSH RISK: Extreme density detected. Open emergency relief exits immediately.',
        severity: 'critical',
        target_audience: 'all',
        auto_generated: true,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    }

    // Gate throughput update
    const randomGateId = Object.keys(get().scansPerMinuteByGate)[0] || 'c1111111-1111-1111-1111-111111111111';

    set((state) => ({
      simulationTicks: nextTick,
      events: state.events.map((e) =>
        e.id === liveEvent.id
          ? { ...e, current_attendance: Math.min(e.max_capacity, e.current_attendance + scanDelta) }
          : e
      ),
      densityReadings: updatedReadings,
      scansPerMinuteByGate: {
        ...state.scansPerMinuteByGate,
        [randomGateId]: {
          in: Math.floor(Math.random() * 30) + 35,
          out: Math.floor(Math.random() * 8) + 1,
        },
      },
    }));
  },
}));
