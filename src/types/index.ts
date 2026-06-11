// ─── Core Financial Types ───────────────────────────────────────────────────

export type TransactionType = "income" | "expense" | "transfer"
export type TransactionStatus = "confirmed" | "pending" | "ignored"

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  category_id: string
  subcategory?: string
  account_id: string
  card_id?: string
  is_installment: boolean
  installment_current?: number
  installment_total?: number
  installment_group_id?: string
  is_recurring: boolean
  recurring_id?: string
  tags: string[]
  notes?: string
  status: TransactionStatus
  created_at: string
  updated_at: string
  category?: Category
  account?: Account
  card?: CreditCard
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: "checking" | "savings" | "wallet" | "investment" | "loan" | "other"
  institution?: string
  initial_balance: number
  current_balance: number
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

export interface CreditCard {
  id: string
  user_id: string
  name: string
  bank: string
  limit_total: number
  limit_used: number
  best_purchase_day: number
  closing_day: number
  due_day: number
  account_id?: string
  color: string
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id?: string
  name: string
  type: "income" | "expense" | "both"
  color: string
  icon: string
  is_default: boolean
  is_hidden: boolean
  parent_id?: string
}

export interface Budget {
  id: string
  user_id: string
  month: number
  year: number
  created_at: string
}

export interface BudgetItem {
  id: string
  budget_id: string
  category_id: string
  amount_limit: number
  amount_spent: number
  category?: Category
}

export interface Goal {
  id: string
  user_id: string
  name: string
  type: "emergency" | "travel" | "purchase" | "debt" | "investment" | "other"
  target_amount: number
  current_amount: number
  target_date?: string
  monthly_contribution?: number
  account_id?: string
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused"
  color: string
  icon: string
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  name: string
  creditor: string
  original_amount: number
  current_balance: number
  monthly_interest: number
  monthly_payment: number
  due_day: number
  start_date: string
  strategy: "snowball" | "avalanche"
  status: "active" | "paid"
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  frequency: "monthly" | "quarterly" | "yearly" | "weekly"
  next_billing: string
  category_id?: string
  payment_method?: string
  is_active: boolean
  is_essential: boolean
  created_at: string
}

export interface FinancialTask {
  id: string
  user_id: string
  title: string
  description?: string
  due_date?: string
  priority: "urgent_important" | "important" | "urgent" | "low"
  estimated_impact?: number
  status: "pending" | "done" | "dismissed"
  category: string
  related_id?: string
  related_type?: "goal" | "debt" | "card" | "budget" | "subscription"
  is_auto: boolean
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  type: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface Mission {
  id: string
  title: string
  description: string
  points: number
  is_completed: boolean
  progress: number
  total: number
  icon: string
}

export interface GamificationState {
  health_score: number
  total_points: number
  level: number
  streak_days: number
  achievements: UserAchievement[]
  weekly_missions: Mission[]
}

export interface FinancialSummary {
  totalBalance: number
  monthIncome: number
  monthExpenses: number
  freeMoney: number
  upcomingBills: { amount: number; count: number; soonest: string | null }
  openInvoices: number
  healthScore: number
  alertLevel: "safe" | "attention" | "danger"
  topInsight: string
  nextAction: { label: string; href: string }
}

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  monthly_income?: number
  pay_day?: number
  main_goal?: string
  uses_credit_card: boolean
  has_debts: boolean
  plan: "free" | "pro" | "premium"
  onboarding_completed: boolean
  created_at: string
}

export interface ImportSession {
  id: string
  file_name: string
  total_rows: number
  imported_rows: number
  status: "pending" | "processing" | "done" | "error"
  created_at: string
}

export interface ImportRow {
  id: string
  import_id: string
  raw_data: Record<string, string>
  mapped_date?: string
  mapped_description?: string
  mapped_amount?: number
  mapped_type?: TransactionType
  mapped_category_id?: string
  is_duplicate: boolean
  is_imported: boolean
}
