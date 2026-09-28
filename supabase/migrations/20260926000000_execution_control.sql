-- Event Flight Control: launch authorisation, command decisions and source health.
-- These records make an event's operational state auditable rather than a collection
-- of dashboard widgets. The current broad policies retain compatibility with the
-- existing app while identity-bound RLS is introduced in the next auth migration.

CREATE TABLE IF NOT EXISTS public.event_readiness_checks (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    title TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'pending', 'ready', 'blocked')),
    evidence_note TEXT,
    due_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_command_decisions (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    directive TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    audience TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'important', 'critical')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'acknowledged', 'completed')),
    issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_integrations (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('ticketing', 'gate_scanning', 'payments', 'messaging')),
    status TEXT NOT NULL DEFAULT 'not_connected' CHECK (status IN ('not_connected', 'connected', 'attention')),
    last_synced_at TIMESTAMPTZ,
    metric_label TEXT,
    metric_value TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_readiness_checks_event ON public.event_readiness_checks(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_command_decisions_event ON public.event_command_decisions(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_integrations_event ON public.event_integrations(event_id, kind);

ALTER TABLE public.event_readiness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_command_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Current app access to readiness checks" ON public.event_readiness_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Current app access to command decisions" ON public.event_command_decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Current app access to integrations" ON public.event_integrations FOR ALL USING (true) WITH CHECK (true);
