-- Completes Phase 5 for projects that already applied the initial access schema.
CREATE TABLE IF NOT EXISTS public.event_access_invites (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    workspace TEXT NOT NULL CHECK (workspace IN ('owner', 'event_control', 'finance', 'production', 'safety', 'gate_ops', 'supplier', 'guest_experience')),
    scope_label TEXT,
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'revoked', 'accepted')),
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_access_invites_event ON public.event_access_invites (event_id, status);
ALTER TABLE public.event_access_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Current app access to event access invites" ON public.event_access_invites FOR ALL USING (true) WITH CHECK (true);
