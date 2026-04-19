-- ============================================================
-- AFOCE Database Schema
-- Supabase PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- WORKSPACES (multi-tenant org) - create first due to FK deps
-- ============================================================
CREATE TABLE public.workspaces (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  business_pan    TEXT,
  fiscal_year     TEXT NOT NULL DEFAULT '2081/82',
  active_period   TEXT NOT NULL DEFAULT 'Baisakh 2081',
  base_currency   TEXT NOT NULL DEFAULT 'NPR',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'team_member'
                CHECK (role IN ('finance_admin', 'manager', 'team_member')),
  department  TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'pending')),
  last_active TIMESTAMPTZ,
  org_id      UUID REFERENCES public.workspaces(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLIENTS / CONTACTS
-- ============================================================
CREATE TABLE public.clients (
  id          TEXT PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  name        TEXT NOT NULL,
  pan         TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  type        TEXT NOT NULL DEFAULT 'client'
                CHECK (type IN ('client', 'vendor')),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POLICIES
-- ============================================================
CREATE TABLE public.policies (
  id          TEXT PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL
                CHECK (category IN ('expenses', 'approvals', 'invoicing')),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive')),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id          TEXT PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  client_id   TEXT NOT NULL REFERENCES public.clients(id),
  bs_date     TEXT NOT NULL,
  ad_date     DATE NOT NULL,
  due_days    INTEGER NOT NULL DEFAULT 30,
  amount      NUMERIC(18,2) NOT NULL,
  vat         NUMERIC(18,2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'rejected')),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE public.expenses (
  id          TEXT PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  employee    TEXT NOT NULL,
  category    TEXT NOT NULL,
  amount      NUMERIC(18,2) NOT NULL,
  vat         NUMERIC(18,2) NOT NULL DEFAULT 0,
  bs_date     TEXT NOT NULL,
  ad_date     DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending_approval'
                CHECK (status IN ('pending_approval', 'manager_review', 'blocked', 'approved', 'rejected')),
  policy_id   TEXT REFERENCES public.policies(id),
  receipt_url TEXT,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BANK LINES (reconciliation)
-- ============================================================
CREATE TABLE public.bank_lines (
  id                  TEXT PRIMARY KEY,
  org_id              UUID NOT NULL REFERENCES public.workspaces(id),
  date                DATE NOT NULL,
  description         TEXT,
  amount              NUMERIC(18,2) NOT NULL,
  source              TEXT,
  matched_invoice_id  TEXT REFERENCES public.invoices(id),
  matched_expense_id  TEXT REFERENCES public.expenses(id),
  confidence         NUMERIC(5,2),
  state               TEXT NOT NULL DEFAULT 'needs_review'
                CHECK (state IN ('matched', 'needs_review', 'unmatched')),
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE public.audit_log (
  id          BIGSERIAL PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES public.workspaces(id),
  actor_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ID SEQUENCES (for human-readable IDs)
-- ============================================================
CREATE TABLE public.id_sequences (
  org_id      UUID PRIMARY KEY REFERENCES public.workspaces(id),
  client_seq  INTEGER NOT NULL DEFAULT 0,
  invoice_seq INTEGER NOT NULL DEFAULT 0,
  expense_seq INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- TRIGGERS: auto-set updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_workspaces_updated_at  BEFORE UPDATE ON workspaces  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_clients_updated_at     BEFORE UPDATE ON clients     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_invoices_updated_at    BEFORE UPDATE ON invoices   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_expenses_updated_at    BEFORE UPDATE ON expenses    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_policies_updated_at    BEFORE UPDATE ON policies    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_bank_lines_updated_at  BEFORE UPDATE ON bank_lines  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: auto-assign client ID (CL-XXX)
-- ============================================================
CREATE OR REPLACE FUNCTION assign_client_id()
RETURNS TRIGGER AS $$
DECLARE new_seq INTEGER;
BEGIN
  UPDATE id_sequences SET client_seq = client_seq + 1 WHERE org_id = NEW.org_id RETURNING client_seq INTO new_seq;
  NEW.id = 'CL-' || LPAD(new_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_client_id BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION assign_client_id();

-- ============================================================
-- TRIGGER: auto-assign invoice ID (INV-XXX)
-- ============================================================
CREATE OR REPLACE FUNCTION assign_invoice_id()
RETURNS TRIGGER AS $$
DECLARE new_seq INTEGER;
BEGIN
  UPDATE id_sequences SET invoice_seq = invoice_seq + 1 WHERE org_id = NEW.org_id RETURNING invoice_seq INTO new_seq;
  NEW.id = 'INV-' || LPAD(new_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_id BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION assign_invoice_id();

-- ============================================================
-- TRIGGER: auto-assign expense ID (EXP-XXX)
-- ============================================================
CREATE OR REPLACE FUNCTION assign_expense_id()
RETURNS TRIGGER AS $$
DECLARE new_seq INTEGER;
BEGIN
  UPDATE id_sequences SET expense_seq = expense_seq + 1 WHERE org_id = NEW.org_id RETURNING expense_seq INTO new_seq;
  NEW.id = 'EXP-' || LPAD(new_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_expense_id BEFORE INSERT ON expenses
  FOR EACH ROW EXECUTE FUNCTION assign_expense_id();

-- ============================================================
-- FUNCTION: get_user_org_id (used in RLS + API routes)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_org_id(auth_uid UUID)
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth_uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_lines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_sequences ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces (members can view their workspace)
CREATE POLICY "workspaces_select_member" ON workspaces FOR SELECT
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Clients
CREATE POLICY "clients_all_org_member" ON clients FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Invoices
CREATE POLICY "invoices_all_org_member" ON invoices FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Expenses
CREATE POLICY "expenses_all_org_member" ON expenses FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Policies
CREATE POLICY "policies_all_org_member" ON policies FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Bank Lines
CREATE POLICY "bank_lines_all_org_member" ON bank_lines FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Audit Log
CREATE POLICY "audit_log_select_org_member" ON audit_log FOR SELECT
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "audit_log_insert_org_member" ON audit_log FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

-- ID Sequences
CREATE POLICY "id_sequences_select_org_member" ON id_sequences FOR SELECT
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "id_sequences_update_org_member" ON id_sequences FOR UPDATE
  USING (org_id = public.get_user_org_id(auth.uid()));

-- ============================================================
-- FUNCTION: handle_new_user (auto-create profile + workspace)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id UUID;
  org_name TEXT;
  invited_org_id UUID;
BEGIN
  invited_org_id := NULLIF(NEW.raw_user_meta_data->>'org_id', '')::UUID;

  IF invited_org_id IS NOT NULL THEN
    workspace_id := invited_org_id;
  ELSE
    -- Create workspace for new user
    org_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ) || '''s Workspace';

    INSERT INTO public.workspaces (name, created_by)
    VALUES (org_name, NEW.id)
    RETURNING id INTO workspace_id;

    -- Create ID sequences only for newly created workspaces
    INSERT INTO public.id_sequences (org_id)
    VALUES (workspace_id);
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role, department, status, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'team_member'),
    NULLIF(NEW.raw_user_meta_data->>'department', ''),
    CASE
      WHEN invited_org_id IS NOT NULL THEN 'pending'
      ELSE 'active'
    END,
    workspace_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- NOTIFICATIONS (in-app notification center)
-- ============================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID REFERENCES public.workspaces(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  data        JSONB,
  read        BOOLEAN NOT NULL DEFAULT false,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECURRING INVOICES
-- ============================================================
CREATE TABLE public.recurring_invoices (
  id              TEXT PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES public.workspaces(id),
  client_id       TEXT NOT NULL REFERENCES public.clients(id),
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  amount          NUMERIC(18,2) NOT NULL,
  description     TEXT,
  next_due_date   DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADDITIONAL TRIGGERS AND INDEXES
-- ============================================================
CREATE TRIGGER set_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_recurring_invoices_updated_at BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX idx_expenses_org_status ON expenses(org_id, status);
CREATE INDEX idx_bank_lines_org_state ON bank_lines(org_id, state);
CREATE INDEX idx_audit_log_org_created ON audit_log(org_id, created_at DESC);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

-- RLS Policies for recurring invoices
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_invoices_all_org_member" ON recurring_invoices FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));
