-- AFOCE autonomous engine schema

ALTER TABLE public.policies
  ADD COLUMN IF NOT EXISTS trigger_type TEXT NOT NULL DEFAULT 'expense.created'
    CHECK (trigger_type IN ('expense.created', 'invoice.created', 'bank_line.imported', 'vat.period_due')),
  ADD COLUMN IF NOT EXISTS conditions JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS effective_to TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.finance_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  event_type  TEXT NOT NULL
                CHECK (event_type IN ('expense.created', 'invoice.created', 'bank_line.imported', 'vat.period_due')),
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}'::JSONB,
  source      TEXT NOT NULL DEFAULT 'api',
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.decision_logs (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id             UUID NOT NULL REFERENCES public.workspaces(id),
  actor_id           UUID REFERENCES auth.users(id),
  event_type         TEXT NOT NULL
                       CHECK (event_type IN ('expense.created', 'invoice.created', 'bank_line.imported', 'vat.period_due')),
  entity_type        TEXT NOT NULL,
  entity_id          TEXT NOT NULL,
  outcome            TEXT NOT NULL
                       CHECK (outcome IN ('approve', 'require_review', 'block', 'record_only')),
  confidence         NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  matched_policy_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rationale          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  facts              JSONB NOT NULL DEFAULT '{}'::JSONB,
  actions            JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_actions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES public.workspaces(id),
  decision_log_id UUID REFERENCES public.decision_logs(id) ON DELETE SET NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  action_type     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned', 'executed', 'failed', 'skipped')),
  detail          JSONB NOT NULL DEFAULT '{}'::JSONB,
  error_message   TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at     TIMESTAMPTZ
);

ALTER TABLE public.finance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_events_select_org_member" ON public.finance_events;
CREATE POLICY "finance_events_select_org_member" ON public.finance_events FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "finance_events_insert_org_member" ON public.finance_events;
CREATE POLICY "finance_events_insert_org_member" ON public.finance_events FOR INSERT
  TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "decision_logs_select_org_member" ON public.decision_logs;
CREATE POLICY "decision_logs_select_org_member" ON public.decision_logs FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "decision_logs_insert_org_member" ON public.decision_logs;
CREATE POLICY "decision_logs_insert_org_member" ON public.decision_logs FOR INSERT
  TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "automation_actions_select_org_member" ON public.automation_actions;
CREATE POLICY "automation_actions_select_org_member" ON public.automation_actions FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "automation_actions_insert_org_member" ON public.automation_actions;
CREATE POLICY "automation_actions_insert_org_member" ON public.automation_actions FOR INSERT
  TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "automation_actions_update_org_member" ON public.automation_actions;
CREATE POLICY "automation_actions_update_org_member" ON public.automation_actions FOR UPDATE
  TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()))
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_policies_org_trigger ON public.policies(org_id, trigger_type, status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_finance_events_org_created ON public.finance_events(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_events_entity ON public.finance_events(org_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_org_created ON public.decision_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_logs_entity ON public.decision_logs(org_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_automation_actions_entity ON public.automation_actions(org_id, entity_type, entity_id);
