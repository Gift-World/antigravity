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

export const supabaseService = {
  // --- AUTHENTICATION ---
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      console.warn('Supabase Auth signIn fallback:', err.message);
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
      console.warn('Supabase Auth signUp fallback:', err.message);
      return { success: false, error: err.message };
    }
  },

  // --- DATA FETCHING ---
  async fetchEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, venue:venues(*, zones:venue_zones(*))');
      if (error || !data || data.length === 0) return [];
      return data as Event[];
    } catch (err) {
      return [];
    }
  },

  async fetchVenues(): Promise<Venue[]> {
    try {
      const { data, error } = await supabase.from('venues').select('*, zones:venue_zones(*)');
      if (error || !data || data.length === 0) return [];
      return data as Venue[];
    } catch (err) {
      return [];
    }
  },

  async fetchAlerts(eventId: string): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data as Alert[];
    } catch (err) {
      return [];
    }
  },

  async fetchIncidents(eventId: string): Promise<Incident[]> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data as Incident[];
    } catch (err) {
      return [];
    }
  },

  async fetchDensityReadings(eventId: string): Promise<ZoneDensityReading[]> {
    try {
      const { data, error } = await supabase
        .from('zone_density_readings')
        .select('*')
        .eq('event_id', eventId);
      if (error || !data) return [];
      return data as ZoneDensityReading[];
    } catch (err) {
      return [];
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

  // --- REALTIME SUBSCRIPTIONS ---
  subscribeToLiveTelemetry(
    eventId: string,
    onAlert: (alert: Alert) => void,
    onIncident: (incident: Incident) => void,
    onDensity: (reading: ZoneDensityReading) => void,
    onGateScan: (scan: GateScan) => void
  ) {
    try {
      const channel = supabase
        .channel(`event_live_${eventId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alerts', filter: `event_id=eq.${eventId}` },
          (payload) => onAlert(payload.new as Alert)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'incidents', filter: `event_id=eq.${eventId}` },
          (payload) => onIncident(payload.new as Incident)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'zone_density_readings', filter: `event_id=eq.${eventId}` },
          (payload) => onDensity(payload.new as ZoneDensityReading)
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'gate_scans', filter: `event_id=eq.${eventId}` },
          (payload) => onGateScan(payload.new as GateScan)
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
