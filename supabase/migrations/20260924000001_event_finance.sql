-- Phase 3: a shared financial truth for every event.

CREATE TABLE IF NOT EXISTS public.event_budget_lines (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    planned_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    committed_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'committed', 'paid')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_payments (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    supplier_id TEXT REFERENCES public.event_suppliers(id) ON DELETE SET NULL,
    payee_name TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'awaiting_approval', 'due', 'paid', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_budget_lines_event ON public.event_budget_lines (event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_payments_event ON public.event_payments (event_id, status, due_at);

ALTER TABLE public.event_budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access to event budget lines" ON public.event_budget_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to event payments" ON public.event_payments FOR ALL USING (true) WITH CHECK (true);
