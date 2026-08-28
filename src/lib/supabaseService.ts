// src/lib/supabaseService.ts
// Supabase End-to-End Database, Auth & Realtime Subscriptions

import { supabase } from './supabase';
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
  WaitlistEntry,
} from '@/types/database';

export interface SupabaseDataset {
  organizations: Organization[];
  users: User[];
  venues: Venue[];
  events: Event[];
  tickets: Ticket[];
  densityReadings: ZoneDensityReading[];
  incidents: Incident[];
  alerts: Alert[];
  wallets: Record<string, CashlessWallet>;
  transactions: Transaction[];
}

export const supabaseService = {
  // --- AUTHENTICATION ---
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      console.warn('Supabase Auth signIn note:', err.message);
      return { success: false, error: err.message };
    }
  },

  async signUp(email: string, password: string, fullName: string, orgName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            org_name: orgName,
          },
        },
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (err: any) {
      console.warn('Supabase Auth signUp note:', err.message);
      return { success: false, error: err.message };
    }
  },

  // --- INITIAL FULL DATASET FETCH ---
  async fetchInitialDataset(): Promise<{ success: boolean; data?: SupabaseDataset }> {
    try {
      const [
        orgsRes,
        usersRes,
        venuesRes,
        eventsRes,
        ticketsRes,
        densityRes,
        incidentsRes,
        alertsRes,
        walletsRes,
        transactionsRes,
      ] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('users').select('*'),
        supabase.from('venues').select('*, zones:venue_zones(*)'),
        supabase.from('events').select('*, venue:venues(*, zones:venue_zones(*))'),
        supabase.from('tickets').select('*'),
        supabase.from('zone_density_readings').select('*').order('timestamp', { ascending: false }),
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('cashless_wallets').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      ]);

      // If key tables errored out, signal failure to trigger offline demo fallback
      if (orgsRes.error && eventsRes.error) {
        return { success: false };
      }

      const walletsMap: Record<string, CashlessWallet> = {};
      if (walletsRes.data) {
        for (const w of walletsRes.data as CashlessWallet[]) {
          walletsMap[w.user_id] = w;
        }
      }

      return {
        success: true,
        data: {
          organizations: (orgsRes.data as Organization[]) || [],
          users: (usersRes.data as User[]) || [],
          venues: (venuesRes.data as Venue[]) || [],
          events: (eventsRes.data as Event[]) || [],
          tickets: (ticketsRes.data as Ticket[]) || [],
          densityReadings: (densityRes.data as ZoneDensityReading[]) || [],
          incidents: (incidentsRes.data as Incident[]) || [],
          alerts: (alertsRes.data as Alert[]) || [],
          wallets: walletsMap,
          transactions: (transactionsRes.data as Transaction[]) || [],
        },
      };
    } catch (err: any) {
      console.warn('Supabase fetchInitialDataset caught error:', err.message);
      return { success: false };
    }
  },

  // --- WRITES & MUTATIONS ---
  async insertWaitlist(entry: Omit<WaitlistEntry, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('waitlist').insert([entry]).select();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.warn('Supabase waitlist insert:', err.message);
      return { success: false, error: err.message };
    }
  },

  async insertAlert(alert: Omit<Alert, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('alerts').insert([alert]).select().single();
      if (error) throw error;
      return data as Alert;
    } catch (err) {
      return null;
    }
  },

  async acknowledgeAlert(alertId: string, userId?: string) {
    try {
      await supabase
        .from('alerts')
        .update({
          acknowledged_by: userId || null,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);
    } catch (err) {}
  },

  async insertIncident(incident: Omit<Incident, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('incidents').insert([incident]).select().single();
      if (error) throw error;
      return data as Incident;
    } catch (err) {
      return null;
    }
  },

  async updateIncident(incidentId: string, status: string, assignedTo?: string) {
    try {
      const updateData: any = { status };
      if (assignedTo) updateData.assigned_to = assignedTo;
      if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

      await supabase.from('incidents').update(updateData).eq('id', incidentId);
    } catch (err) {}
  },

  async insertGateScan(scan: Omit<GateScan, 'id' | 'scanned_at'>) {
    try {
      const { data, error } = await supabase.from('gate_scans').insert([scan]).select().single();
      if (error) throw error;
      return data as GateScan;
    } catch (err) {
      return null;
    }
  },

  async updateTicketScanStatus(ticketId: string, scannedBy: string, gateId: string) {
    try {
      await supabase
        .from('tickets')
        .update({
          status: 'scanned',
          scanned_at: new Date().toISOString(),
          scanned_by: scannedBy,
          gate_id: gateId,
        })
        .eq('id', ticketId);
    } catch (err) {}
  },

  async insertTicket(ticket: Ticket) {
    try {
      await supabase.from('tickets').insert([ticket]);
    } catch (err) {}
  },

  async updateEventAttendance(eventId: string, delta: number) {
    try {
      const { data: event } = await supabase.from('events').select('current_attendance').eq('id', eventId).single();
      if (event) {
        const next = Math.max(0, event.current_attendance + delta);
        await supabase.from('events').update({ current_attendance: next }).eq('id', eventId);
      }
    } catch (err) {}
  },

  async insertZoneDensityReading(reading: ZoneDensityReading) {
    try {
      await supabase.from('zone_density_readings').insert([reading]);
    } catch (err) {}
  },

  async upsertWallet(wallet: CashlessWallet) {
    try {
      await supabase.from('cashless_wallets').upsert([wallet]);
    } catch (err) {}
  },

  async insertTransaction(tx: Transaction) {
    try {
      await supabase.from('transactions').insert([tx]);
    } catch (err) {}
  },

  // --- REALTIME SUBSCRIPTIONS (MULTI-BROWSER SYNC) ---
  subscribeToAllRealtime(callbacks: {
    onAlert?: (alert: Alert) => void;
    onIncident?: (incident: Incident) => void;
    onDensity?: (reading: ZoneDensityReading) => void;
    onGateScan?: (scan: GateScan) => void;
    onTicket?: (ticket: Ticket) => void;
    onEvent?: (event: Event) => void;
  }) {
    try {
      const channel = supabase
        .channel('antigravity_global_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (p) =>
          callbacks.onAlert?.(p.new as Alert)
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (p) =>
          callbacks.onIncident?.(p.new as Incident)
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'zone_density_readings' }, (p) =>
          callbacks.onDensity?.(p.new as ZoneDensityReading)
        )
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gate_scans' }, (p) =>
          callbacks.onGateScan?.(p.new as GateScan)
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (p) =>
          callbacks.onTicket?.(p.new as Ticket)
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (p) =>
          callbacks.onEvent?.(p.new as Event)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      return () => {};
    }
  },
};
