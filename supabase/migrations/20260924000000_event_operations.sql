-- Phase 2: the organiser's operational plan, suppliers and proof of readiness.

CREATE TABLE IF NOT EXISTS public.event_tasks (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    workstream TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    due_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_suppliers (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    agreed_amount NUMERIC(12,2),
    deposit_paid NUMERIC(12,2) DEFAULT 0,
    balance_due NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contracted', 'confirmed', 'on_site', 'cancelled')),
    arrival_window TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_tasks_event_status ON public.event_tasks (event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_suppliers_event_status ON public.event_suppliers (event_id, status);

ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access to event tasks" ON public.event_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to event suppliers" ON public.event_suppliers FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.event_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_suppliers;
