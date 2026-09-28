-- Phase 5: event-scoped collaboration. These records make it possible to give
-- a person a focused workspace for one event instead of broad organisation access.

CREATE TABLE IF NOT EXISTS public.event_memberships (
    id TEXT PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workspace TEXT NOT NULL CHECK (workspace IN ('owner', 'event_control', 'finance', 'production', 'safety', 'gate_ops', 'supplier', 'guest_experience')),
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('active', 'invited', 'suspended')),
    scope_label TEXT,
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.access_audit_logs (
    id TEXT PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_name TEXT,
    detail TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_memberships_event ON public.event_memberships (event_id, status);
CREATE INDEX IF NOT EXISTS idx_access_audit_logs_event ON public.access_audit_logs (event_id, created_at DESC);

ALTER TABLE public.event_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit_logs ENABLE ROW LEVEL SECURITY;

-- Existing project authentication is being migrated separately. These policies
-- preserve the current application behaviour until identity-backed RLS lands.
CREATE POLICY "Current app access to event memberships" ON public.event_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Current app access to access audit logs" ON public.access_audit_logs FOR ALL USING (true) WITH CHECK (true);
