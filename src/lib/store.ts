// src/lib/store.ts
// Global reactive Zustand store with Supabase live backend, Realtime sync, and offline seed fallback

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
import {
  INITIAL_ORG,
  INITIAL_USERS,
  INITIAL_VENUES,
  INITIAL_EVENTS,
  INITIAL_DENSITY_READINGS,
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  INITIAL_TICKETS,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
} from '@/lib/seedData';
import { soundManager } from '@/lib/audio';
import { createTicketQRPayload } from '@/lib/qr';
import { triggerMpesaSTKPush } from '@/lib/mpesa';
import { supabaseService } from '@/lib/supabaseService';

interface AppState {
  // Loading & Connection state
  isLoadingInitialData: boolean;
  isSupabaseConnected: boolean;
  initData: () => Promise<void>;

  // Authentication & Context
  currentUser: User;
  currentOrg: Organization;
  users: User[];
  setCurrentUser: (user: User) => void;
  setUserRole: (role: UserRole) => void;

  // Data Collections
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

  // Live Command Center & UI States
  activeEventId: string;
  isSimulationActive: boolean;
  isAudioMuted: boolean;
  selectedZoneId: string | null;
  criticalFlashAlert: Alert | null;
  scansPerMinuteByGate: Record<string, { in: number; out: number }>;
  simulationTicks: number;

  // Actions
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

  // Fallback defaults initialized with seedData
  currentUser: INITIAL_USERS[0],
  currentOrg: INITIAL_ORG,
  users: INITIAL_USERS,
  venues: INITIAL_VENUES,
  events: INITIAL_EVENTS,
  tickets: INITIAL_TICKETS,
  densityReadings: INITIAL_DENSITY_READINGS,
  incidents: INITIAL_INCIDENTS,
  alerts: INITIAL_ALERTS,
  gateScans: [],
  wallets: { [INITIAL_WALLET.user_id]: INITIAL_WALLET },
  transactions: INITIAL_TRANSACTIONS,
  guardianDevice: {
    id: 'gd1',
    user_id: INITIAL_USERS[4].id,
    event_id: INITIAL_EVENTS[0].id,
    device_name: 'Kevin iPhone 15 Pro Max',
    device_fingerprint: 'fp_kevin_android_chrome_9091',
    ble_identifier: 'BLE_ANTIGRAVITY_TETHER_09',
    paired_wristband_id: 'WB_SILICONE_0921',
    guardian_mode_active: false,
    last_known_lat: -1.30392,
    last_known_lng: 36.8231,
    last_ping: new Date().toISOString(),
    status: 'active',
    activated_at: new Date().toISOString(),
  },
  waitlist: [],

  activeEventId: INITIAL_EVENTS[0].id,
  isSimulationActive: true,
  isAudioMuted: false,
  selectedZoneId: null,
  criticalFlashAlert: null,
  simulationTicks: 0,
  scansPerMinuteByGate: {
    'z1111111-1111-1111-1111-111111111111': { in: 48, out: 4 }, // Gate A
    'z2222222-2222-2222-2222-222222222222': { in: 62, out: 7 }, // Gate B
    'z3333333-3333-3333-3333-333333333333': { in: 34, out: 2 }, // Gate C
    'z4444444-4444-4444-4444-444444444444': { in: 18, out: 1 }, // Gate D
  },

  // Initial Data Fetcher from Supabase (with Realtime multi-browser sync)
  initData: async () => {
    try {
      const res = await supabaseService.fetchInitialDataset();
      if (res.success && res.data) {
        const d = res.data;
        set({
          isLoadingInitialData: false,
          isSupabaseConnected: true,
          currentOrg: d.organizations[0] || INITIAL_ORG,
          users: d.users.length ? d.users : INITIAL_USERS,
          currentUser: d.users[0] || INITIAL_USERS[0],
          venues: d.venues.length ? d.venues : INITIAL_VENUES,
          events: d.events.length ? d.events : INITIAL_EVENTS,
          activeEventId: d.events[0]?.id || INITIAL_EVENTS[0].id,
          tickets: d.tickets.length ? d.tickets : INITIAL_TICKETS,
          densityReadings: d.densityReadings.length ? d.densityReadings : INITIAL_DENSITY_READINGS,
          incidents: d.incidents.length ? d.incidents : INITIAL_INCIDENTS,
          alerts: d.alerts.length ? d.alerts : INITIAL_ALERTS,
          wallets: Object.keys(d.wallets).length ? d.wallets : { [INITIAL_WALLET.user_id]: INITIAL_WALLET },
          transactions: d.transactions.length ? d.transactions : INITIAL_TRANSACTIONS,
        });

        // Set up Realtime listener to sync changes across tabs/devices
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
          onEvent: (updatedEvent) => {
            set((state) => ({
              events: state.events.map((e) =>
                e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e
              ),
            }));
          },
        });
      } else {
        // Fallback to offline demo mode
        set({ isLoadingInitialData: false, isSupabaseConnected: false });
      }
    } catch (e) {
      set({ isLoadingInitialData: false, isSupabaseConnected: false });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setUserRole: (role) => {
    const user = get().users.find((u) => u.role === role) || {
      ...get().currentUser,
      role,
    };
    set({ currentUser: user });
  },

  setActiveEventId: (eventId) => set({ activeEventId: eventId }),
  setSelectedZoneId: (zoneId) => set({ selectedZoneId: zoneId }),
  toggleSimulation: () => set((state) => ({ isSimulationActive: !state.isSimulationActive })),
  setSimulationActive: (active) => set({ isSimulationActive: active }),
  toggleAudioMute: () => {
    const nextMute = soundManager.toggleMute();
    set({ isAudioMuted: nextMute });
  },
  dismissCriticalFlash: () => set({ criticalFlashAlert: null }),

  processGateScan: async ({ ticketId, gateId, qrHash, staffId, direction }) => {
    const { tickets, activeEventId, isSupabaseConnected } = get();
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      soundManager.playScanError();
      return { success: false, reason: 'not_found', message: 'Ticket not found in system.' };
    }

    if (ticket.qr_code_hash !== qrHash && qrHash !== 'direct_scanned_id') {
      soundManager.playScanError();
      return { success: false, reason: 'invalid_hash', message: 'Hash mismatch: Potential counterfeit.' };
    }

    if (ticket.status === 'scanned' && direction === 'in') {
      soundManager.playScanError();
      return {
        success: false,
        reason: 'already_scanned',
        message: `Ticket was already scanned at ${ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleTimeString() : 'an earlier gate'}.`,
        ticket,
      };
    }

    if (ticket.status === 'revoked' || ticket.status === 'refunded') {
      soundManager.playScanError();
      return { success: false, reason: 'revoked', message: `Ticket is marked ${ticket.status}. Entry forbidden.` };
    }

    // Success scan
    soundManager.playScanSuccess();
    const updatedTicket: Ticket = {
      ...ticket,
      status: direction === 'in' ? 'scanned' : 'valid',
      scanned_at: direction === 'in' ? new Date().toISOString() : null,
      scanned_by: staffId,
      gate_id: gateId,
    };

    const newScan: GateScan = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_id: activeEventId,
      gate_id: gateId,
      ticket_id: ticketId,
      scanned_by: staffId,
      direction,
      scanned_at: new Date().toISOString(),
    };

    // Write to Supabase
    if (isSupabaseConnected) {
      supabaseService.insertGateScan(newScan);
      if (direction === 'in') {
        supabaseService.updateTicketScanStatus(ticketId, staffId, gateId);
        supabaseService.updateEventAttendance(activeEventId, 1);
      }
    }

    set((state) => {
      const updatedTickets = state.tickets.map((t) => (t.id === ticketId ? updatedTicket : t));
      const delta = direction === 'in' ? 1 : -1;
      const updatedEvents = state.events.map((e) => {
        if (e.id === activeEventId) {
          return { ...e, current_attendance: Math.max(0, e.current_attendance + delta) };
        }
        return e;
      });

      return {
        tickets: updatedTickets,
        events: updatedEvents,
        gateScans: [newScan, ...state.gateScans.slice(0, 499)],
      };
    });

    return {
      success: true,
      message: `Authorized ${ticket.tier} Entry.`,
      ticket: updatedTicket,
    };
  },

  triggerAlert: (alertData) => {
    const rawAlert = alertData as any;
    const newAlert: Alert = {
      ...alertData,
      id: rawAlert.id || `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: rawAlert.created_at || new Date().toISOString(),
    };

    if (newAlert.severity === 'critical') {
      soundManager.playCriticalAlert();
      set({ criticalFlashAlert: newAlert });
      // Auto-dismiss red flash overlay after 2.5 seconds
      setTimeout(() => {
        if (get().criticalFlashAlert?.id === newAlert.id) {
          set({ criticalFlashAlert: null });
        }
      }, 2500);
    } else if (newAlert.severity === 'warning') {
      soundManager.playWarningAlert();
    }

    // Write to Supabase if connected
    if (get().isSupabaseConnected) {
      supabaseService.insertAlert(newAlert);
    }

    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },

  acknowledgeAlert: (alertId, userId) => {
    const user = userId || get().currentUser.id;

    if (get().isSupabaseConnected) {
      supabaseService.acknowledgeAlert(alertId, user);
    }

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? { ...a, acknowledged_by: user, acknowledged_at: new Date().toISOString() }
          : a
      ),
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== alertId) }));
  },

  createIncident: (incidentData) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      status: incidentData.status || 'open',
    };

    if (newIncident.severity === 'critical' || newIncident.severity === 'high') {
      soundManager.playCriticalAlert();
    }

    if (get().isSupabaseConnected) {
      supabaseService.insertIncident(newIncident);
    }

    set((state) => ({ incidents: [newIncident, ...state.incidents] }));
    return newIncident;
  },

  updateIncidentStatus: (incidentId, status, assignedTo) => {
    if (get().isSupabaseConnected) {
      supabaseService.updateIncident(incidentId, status, assignedTo);
    }

    set((state) => ({
      incidents: state.incidents.map((i) => {
        if (i.id === incidentId) {
          return {
            ...i,
            status,
            assigned_to: assignedTo !== undefined ? assignedTo : i.assigned_to,
            resolved_at: status === 'resolved' ? new Date().toISOString() : i.resolved_at,
          };
        }
        return i;
      }),
    }));
  },

  createEvent: (eventData) => {
    const newEvent: Event = {
      id: `e_${Date.now()}`,
      organization_id: get().currentOrg.id,
      venue_id: eventData.venue_id || get().venues[0].id,
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      event_date: eventData.event_date || new Date().toISOString().split('T')[0],
      doors_open: eventData.doors_open || new Date().toISOString(),
      event_start: eventData.event_start || new Date().toISOString(),
      event_end: eventData.event_end,
      max_capacity: eventData.max_capacity || 18000,
      current_attendance: 0,
      status: eventData.status || 'draft',
      cover_image_url:
        eventData.cover_image_url ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      ticket_tiers: eventData.ticket_tiers || [
        { name: 'Regular', price: 2500, quantity: 4000, sold: 0 },
        { name: 'VIP', price: 6000, quantity: 1000, sold: 0 },
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

    set((state) => ({ events: [newEvent, ...state.events] }));
    return newEvent;
  },

  updateEventStatus: (eventId, status) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === eventId ? { ...e, status } : e)),
    }));
  },

  addVenue: (venueData) => {
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      organization_id: get().currentOrg.id,
      name: venueData.name || 'New Venue',
      address: venueData.address || '',
      city: venueData.city || 'Nairobi',
      latitude: venueData.latitude || -1.286389,
      longitude: venueData.longitude || 36.817223,
      total_capacity: venueData.total_capacity || 10000,
      venue_map_url: venueData.venue_map_url,
      created_at: new Date().toISOString(),
      zones: venueData.zones || [],
    };
    set((state) => ({ venues: [...state.venues, newVenue] }));
    return newVenue;
  },

  addVenueZone: (venueId, zoneData) => {
    const newZone: VenueZone = {
      id: `z_${Date.now()}`,
      venue_id: venueId,
      name: zoneData.name || 'Zone',
      zone_type: zoneData.zone_type || 'floor_section',
      capacity: zoneData.capacity || 1000,
      sort_order: zoneData.sort_order || 1,
    };
    set((state) => ({
      venues: state.venues.map((v) =>
        v.id === venueId ? { ...v, zones: [...(v.zones || []), newZone] } : v
      ),
    }));
    return newZone;
  },

  purchaseTicket: async ({ eventId, tier, price, fullName, email, phone, mpesaPhone }) => {
    const mpesaResult = await triggerMpesaSTKPush({
      phoneNumber: mpesaPhone || phone,
      amount: price,
      accountReference: 'ANTIGRAVITY',
      transactionDesc: `Ticket: ${tier}`,
    });

    const ticketId = `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { hash } = await createTicketQRPayload(ticketId);

    const newTicket: Ticket = {
      id: ticketId,
      event_id: eventId,
      attendee_id: get().currentUser.id,
      tier,
      price,
      currency: 'KES',
      qr_code_hash: hash,
      device_fingerprint: `fp_${Date.now()}`,
      status: 'valid',
      purchased_at: new Date().toISOString(),
      mpesa_transaction_id: mpesaResult.receiptNumber,
      event: get().events.find((e) => e.id === eventId),
    };

    if (get().isSupabaseConnected) {
      supabaseService.insertTicket(newTicket);
    }

    set((state) => {
      const updatedEvents = state.events.map((e) => {
        if (e.id === eventId) {
          const updatedTiers = e.ticket_tiers.map((t) =>
            t.name === tier ? { ...t, sold: t.sold + 1 } : t
          );
          return { ...e, ticket_tiers: updatedTiers };
        }
        return e;
      });

      return {
        tickets: [newTicket, ...state.tickets],
        events: updatedEvents,
      };
    });

    return { success: true, ticket: newTicket };
  },

  topupWallet: async (amount, mpesaPhone) => {
    const user = get().currentUser;
    const activeEvent = get().events.find((e) => e.id === get().activeEventId) || get().events[0];

    const result = await triggerMpesaSTKPush({
      phoneNumber: mpesaPhone,
      amount,
      accountReference: 'CASHLESS_WALLET',
      transactionDesc: 'Antigravity Top Up',
    });

    const currentWallet = get().wallets[user.id] || {
      id: `w_${Date.now()}`,
      user_id: user.id,
      event_id: activeEvent.id,
      balance: 0,
      currency: 'KES',
      mpesa_phone: mpesaPhone,
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
      vendor_zone_id: vendorZoneId || 'zccccccc-cccc-cccc-cccc-cccccccccccc',
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
    const alertMsg = `GUARDIAN EMERGENCY SOS: Attendee device distress alarm triggered. Tether severed: ${reason || 'Physical detachment'}`;

    get().triggerAlert({
      event_id: activeEventId,
      alert_type: 'theft_detected',
      zone_id: 'z6666666-6666-6666-6666-666666666666',
      message: alertMsg,
      severity: 'critical',
      target_audience: 'security',
      auto_generated: true,
      acknowledged_by: null,
      acknowledged_at: null,
    });

    get().createIncident({
      event_id: activeEventId,
      zone_id: 'z6666666-6666-6666-6666-666666666666',
      incident_type: 'phone_theft',
      severity: 'high',
      title: 'Active Guardian Alarm SOS',
      description: alertMsg,
      reported_by: get().currentUser.id,
      assigned_to: 'u3333333-3333-3333-3333-333333333333',
      status: 'open',
      latitude: -1.30392,
      longitude: 36.8231,
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
    const liveEvent = events.find((e) => e.id === activeEventId);
    if (!liveEvent || liveEvent.status !== 'live') return;

    const nextTick = simulationTicks + 1;
    // 2.5s per tick: 48 ticks = 120 seconds (2 minutes cycle)
    const cyclePos = nextTick % 48;

    // Simulate 2-5 scans at turnstiles every tick
    const gates = [
      'z1111111-1111-1111-1111-111111111111',
      'z2222222-2222-2222-2222-222222222222',
      'z3333333-3333-3333-3333-333333333333',
      'z4444444-4444-4444-4444-444444444444',
    ];
    const randomGate = gates[Math.floor(Math.random() * gates.length)];
    const scanDelta = Math.floor(Math.random() * 4) + 2;

    // Main Floor North density escalation curve
    let targetNorthDensity = 2.4 + (cyclePos / 40) * 3.3;
    if (cyclePos >= 44) {
      targetNorthDensity = 3.6; // Egress gate relieved crowd
    }

    const updatedReadings = densityReadings.map((r) => {
      const isMainFloorNorth = r.zone_id === 'z6666666-6666-6666-6666-666666666666';
      if (isMainFloorNorth) {
        const d = Number(targetNorthDensity.toFixed(2));
        let risk: ZoneDensityReading['risk_level'] = 'safe';
        if (d >= 5.5) risk = 'critical';
        else if (d >= 4.5) risk = 'warning';
        else if (d >= 3.0) risk = 'elevated';

        const reading = {
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

      // Other zones fluctuate naturally
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

    // Escalation trigger points
    if (cyclePos === 24) {
      get().triggerAlert({
        event_id: activeEventId,
        zone_id: 'z6666666-6666-6666-6666-666666666666',
        alert_type: 'density_warning',
        message: 'DENSITY WARNING: Main Floor North reached 4.6 people/m². Prepare holding lanes.',
        severity: 'warning',
        target_audience: 'security',
        auto_generated: true,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    } else if (cyclePos === 38) {
      get().triggerAlert({
        event_id: activeEventId,
        zone_id: 'z6666666-6666-6666-6666-666666666666',
        alert_type: 'density_critical',
        message: 'CRITICAL CRUSH RISK: Main Floor North at 5.6 people/m²! Open Emergency Exit 1 & 2 immediately.',
        severity: 'critical',
        target_audience: 'all',
        auto_generated: true,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    }

    set((state) => ({
      simulationTicks: nextTick,
      events: state.events.map((e) =>
        e.id === activeEventId
          ? { ...e, current_attendance: Math.min(e.max_capacity, e.current_attendance + scanDelta) }
          : e
      ),
      densityReadings: updatedReadings,
      scansPerMinuteByGate: {
        ...state.scansPerMinuteByGate,
        [randomGate]: {
          in: Math.floor(Math.random() * 30) + 35,
          out: Math.floor(Math.random() * 8) + 1,
        },
      },
    }));
  },
}));
