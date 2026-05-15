-- Secure team invite claims and harden new-user provisioning.

CREATE TABLE IF NOT EXISTS public.pending_invites (
  email       TEXT PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'team_member'
                CHECK (role IN ('finance_admin', 'manager', 'team_member')),
  full_name   TEXT,
  department  TEXT,
  invited_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days')
);

ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pending_invites_org_expires
  ON public.pending_invites(org_id, expires_at);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id UUID;
  org_name TEXT;
  pending_org_id UUID;
  pending_role TEXT;
  pending_full_name TEXT;
  pending_department TEXT;
  has_pending_invite BOOLEAN := FALSE;
BEGIN
  SELECT org_id, role, full_name, department
  INTO pending_org_id, pending_role, pending_full_name, pending_department
  FROM public.pending_invites
  WHERE email = lower(NEW.email)
    AND expires_at > NOW()
  LIMIT 1;

  has_pending_invite := pending_org_id IS NOT NULL;

  IF has_pending_invite THEN
    workspace_id := pending_org_id;
  ELSE
    org_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ) || '''s Workspace';

    INSERT INTO public.workspaces (name, created_by)
    VALUES (org_name, NEW.id)
    RETURNING id INTO workspace_id;

    INSERT INTO public.id_sequences (org_id)
    VALUES (workspace_id);
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, department, status, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(pending_full_name, ''), NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN has_pending_invite THEN pending_role
      ELSE 'finance_admin'
    END,
    COALESCE(NULLIF(pending_department, ''), NULLIF(NEW.raw_user_meta_data->>'department', '')),
    CASE
      WHEN has_pending_invite THEN 'pending'
      ELSE 'active'
    END,
    workspace_id
  );

  IF has_pending_invite THEN
    DELETE FROM public.pending_invites
    WHERE email = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
