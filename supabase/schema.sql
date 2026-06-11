-- ============================================================
-- Nexo Money — Supabase Schema
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Profile ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  monthly_income NUMERIC(12,2),
  pay_day INTEGER CHECK (pay_day BETWEEN 1 AND 31),
  main_goal TEXT,
  uses_credit_card BOOLEAN DEFAULT false,
  has_debts BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── Accounts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'wallet', 'investment', 'loan', 'other')),
  institution TEXT,
  initial_balance NUMERIC(12,2) DEFAULT 0,
  current_balance NUMERIC(12,2) DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'building-2',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Credit Cards ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT,
  limit_total NUMERIC(12,2) DEFAULT 0,
  limit_used NUMERIC(12,2) DEFAULT 0,
  best_purchase_day INTEGER CHECK (best_purchase_day BETWEEN 1 AND 31),
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#8b5cf6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = default/system
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color TEXT DEFAULT '#6b7280',
  icon TEXT DEFAULT 'circle-dot',
  is_default BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  is_installment BOOLEAN DEFAULT false,
  installment_current INTEGER,
  installment_total INTEGER,
  installment_group_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  recurring_id UUID,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Budgets ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_spent NUMERIC(12,2) DEFAULT 0
);

-- ─── Goals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN ('emergency', 'travel', 'purchase', 'debt', 'investment', 'other')),
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  target_date DATE,
  monthly_contribution NUMERIC(12,2),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'target',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Debts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  creditor TEXT,
  original_amount NUMERIC(12,2) NOT NULL,
  current_balance NUMERIC(12,2) NOT NULL,
  monthly_interest NUMERIC(6,4) DEFAULT 0,
  monthly_payment NUMERIC(12,2),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  start_date DATE,
  strategy TEXT DEFAULT 'avalanche' CHECK (strategy IN ('snowball', 'avalanche')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subscriptions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'weekly')),
  next_billing DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  payment_method TEXT,
  is_active BOOLEAN DEFAULT true,
  is_essential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Financial Tasks ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL CHECK (priority IN ('urgent_important', 'important', 'urgent', 'low')),
  estimated_impact NUMERIC(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'dismissed')),
  category TEXT,
  related_id UUID,
  related_type TEXT CHECK (related_type IN ('goal', 'debt', 'card', 'budget', 'subscription')),
  is_auto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Gamification ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  type TEXT
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Imports ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  total_rows INTEGER DEFAULT 0,
  imported_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID NOT NULL REFERENCES imports(id) ON DELETE CASCADE,
  raw_data JSONB,
  mapped_date DATE,
  mapped_description TEXT,
  mapped_amount NUMERIC(12,2),
  mapped_type TEXT CHECK (mapped_type IN ('income', 'expense', 'transfer')),
  mapped_category_id UUID REFERENCES categories(id),
  is_duplicate BOOLEAN DEFAULT false,
  is_imported BOOLEAN DEFAULT false
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'BRL',
  locale TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── Consent Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Plans ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) DEFAULT 0,
  interval TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper: users can only access their own rows
CREATE OR REPLACE FUNCTION is_owner(uid UUID) RETURNS BOOLEAN AS $$
  SELECT auth.uid() = uid;
$$ LANGUAGE sql SECURITY DEFINER;

-- users_profile
CREATE POLICY "users_profile_self" ON users_profile FOR ALL USING (is_owner(user_id));

-- accounts
CREATE POLICY "accounts_self" ON accounts FOR ALL USING (is_owner(user_id));

-- credit_cards
CREATE POLICY "credit_cards_self" ON credit_cards FOR ALL USING (is_owner(user_id));

-- categories: users see their own AND system defaults
CREATE POLICY "categories_self_or_default" ON categories FOR SELECT
  USING (user_id IS NULL OR is_owner(user_id));
CREATE POLICY "categories_write_own" ON categories FOR INSERT WITH CHECK (is_owner(user_id));
CREATE POLICY "categories_update_own" ON categories FOR UPDATE USING (is_owner(user_id));
CREATE POLICY "categories_delete_own" ON categories FOR DELETE USING (is_owner(user_id));

-- transactions
CREATE POLICY "transactions_self" ON transactions FOR ALL USING (is_owner(user_id));

-- budgets
CREATE POLICY "budgets_self" ON budgets FOR ALL USING (is_owner(user_id));

-- budget_items (access via budget ownership)
CREATE POLICY "budget_items_self" ON budget_items FOR ALL
  USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND is_owner(budgets.user_id)));

-- goals
CREATE POLICY "goals_self" ON goals FOR ALL USING (is_owner(user_id));

-- debts
CREATE POLICY "debts_self" ON debts FOR ALL USING (is_owner(user_id));

-- subscriptions
CREATE POLICY "subscriptions_self" ON subscriptions FOR ALL USING (is_owner(user_id));

-- financial_tasks
CREATE POLICY "financial_tasks_self" ON financial_tasks FOR ALL USING (is_owner(user_id));

-- user_achievements
CREATE POLICY "user_achievements_self" ON user_achievements FOR ALL USING (is_owner(user_id));

-- gamification_events
CREATE POLICY "gamification_events_self" ON gamification_events FOR ALL USING (is_owner(user_id));

-- imports
CREATE POLICY "imports_self" ON imports FOR ALL USING (is_owner(user_id));

-- import_rows (access via import ownership)
CREATE POLICY "import_rows_self" ON import_rows FOR ALL
  USING (EXISTS (SELECT 1 FROM imports WHERE imports.id = import_rows.import_id AND is_owner(imports.user_id)));

-- notifications
CREATE POLICY "notifications_self" ON notifications FOR ALL USING (is_owner(user_id));

-- audit_logs (read only by owner, insert by service role)
CREATE POLICY "audit_logs_self_read" ON audit_logs FOR SELECT USING (is_owner(user_id));

-- user_settings
CREATE POLICY "user_settings_self" ON user_settings FOR ALL USING (is_owner(user_id));

-- consent_logs
CREATE POLICY "consent_logs_self" ON consent_logs FOR ALL USING (is_owner(user_id));

-- user_plan_subscriptions
CREATE POLICY "user_plan_subscriptions_self" ON user_plan_subscriptions FOR ALL USING (is_owner(user_id));

-- ═══════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA: Default categories
-- ═══════════════════════════════════════════════════════════
INSERT INTO categories (name, type, color, icon, is_default) VALUES
  ('Salário', 'income', '#10b981', 'briefcase', true),
  ('Pró-labore', 'income', '#059669', 'building', true),
  ('Freelance', 'income', '#3b82f6', 'laptop', true),
  ('Reembolso', 'income', '#6b7280', 'rotate-ccw', true),
  ('Investimentos', 'income', '#f59e0b', 'trending-up', true),
  ('Outros (receita)', 'income', '#9ca3af', 'circle-dot', true),
  ('Moradia', 'expense', '#6b7280', 'home', true),
  ('Alimentação', 'expense', '#f97316', 'utensils', true),
  ('Mercado', 'expense', '#84cc16', 'shopping-cart', true),
  ('Transporte', 'expense', '#3b82f6', 'car', true),
  ('Saúde', 'expense', '#ef4444', 'heart', true),
  ('Educação', 'expense', '#8b5cf6', 'graduation-cap', true),
  ('Lazer', 'expense', '#ec4899', 'gamepad-2', true),
  ('Compras', 'expense', '#f97316', 'shopping-bag', true),
  ('Assinaturas', 'expense', '#0ea5e9', 'tv', true),
  ('Internet', 'expense', '#14b8a6', 'wifi', true),
  ('Academia', 'expense', '#f59e0b', 'dumbbell', true),
  ('Pets', 'expense', '#a78bfa', 'paw-print', true),
  ('Família', 'expense', '#fb7185', 'users', true),
  ('Viagens', 'expense', '#22d3ee', 'plane', true),
  ('Impostos', 'expense', '#dc2626', 'receipt', true),
  ('Dívidas', 'expense', '#b91c1c', 'credit-card', true),
  ('Outros (despesa)', 'expense', '#9ca3af', 'circle-dot', true)
ON CONFLICT DO NOTHING;

-- SEED DATA: Plans
INSERT INTO plans (name, slug, price, interval, features) VALUES
  ('Grátis', 'free', 0, 'forever', '["Lançamentos manuais", "1 cartão", "2 metas", "Orçamento básico", "Relatórios básicos"]'),
  ('Pro', 'pro', 19.90, 'monthly', '["Cartões ilimitados", "Metas ilimitadas", "Importação CSV/OFX", "Dívidas", "Assinaturas", "Relatórios avançados", "Gamificação completa", "Plano de ação financeiro"]'),
  ('Premium', 'premium', 49.90, 'monthly', '["Open Finance (em breve)", "IA financeira", "Compartilhamento familiar", "Projeções avançadas", "Coach financeiro"]')
ON CONFLICT (slug) DO NOTHING;

-- SEED DATA: Achievements
INSERT INTO achievements (name, description, icon, points, type) VALUES
  ('Primeiro orçamento', 'Criou seu primeiro orçamento mensal', '📊', 50, 'budget'),
  ('7 dias no controle', 'Manteve o app atualizado por 7 dias seguidos', '🔥', 100, 'streak'),
  ('Fatura revisada', 'Revisou a fatura do cartão', '💳', 30, 'card'),
  ('Meta criada', 'Criou sua primeira meta financeira', '🎯', 50, 'goal'),
  ('Dívida monitorada', 'Adicionou uma dívida para acompanhar', '📋', 40, 'debt'),
  ('Reserva iniciada', 'Criou uma meta de reserva de emergência', '🛡️', 80, 'goal'),
  ('Mês positivo', 'Fechou o mês com mais receitas do que gastos', '✨', 150, 'month'),
  ('Assinatura cancelada', 'Cancelou uma assinatura desnecessária', '✂️', 60, 'subscription'),
  ('Cartão sob controle', 'Manteve o uso do cartão abaixo de 50% por 30 dias', '💰', 100, 'card')
ON CONFLICT DO NOTHING;
