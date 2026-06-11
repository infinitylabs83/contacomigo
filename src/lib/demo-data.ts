import type {
  Account, CreditCard, Category, Transaction, Goal,
  Debt, Subscription, BudgetItem, FinancialTask, GamificationState, FinancialSummary
} from "@/types"

const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()
const d = today.getDate()

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "acc-1", user_id: "demo", name: "Conta Corrente Nubank", type: "checking",
    institution: "Nubank", initial_balance: 0, current_balance: 3420.50,
    color: "#8B5CF6", icon: "building-2", is_active: true, created_at: "2024-01-01",
  },
  {
    id: "acc-2", user_id: "demo", name: "Poupança Itaú", type: "savings",
    institution: "Itaú", initial_balance: 0, current_balance: 8750.00,
    color: "#F97316", icon: "piggy-bank", is_active: true, created_at: "2024-01-01",
  },
  {
    id: "acc-3", user_id: "demo", name: "Carteira", type: "wallet",
    institution: undefined, initial_balance: 0, current_balance: 280.00,
    color: "#10B981", icon: "wallet", is_active: true, created_at: "2024-01-01",
  },
]

export const DEMO_CARDS: CreditCard[] = [
  {
    id: "card-1", user_id: "demo", name: "Nubank Roxinho", bank: "Nubank",
    limit_total: 8000, limit_used: 2847.92, best_purchase_day: 5,
    closing_day: 20, due_day: 27, account_id: "acc-1",
    color: "#8B5CF6", is_active: true, created_at: "2024-01-01",
  },
  {
    id: "card-2", user_id: "demo", name: "Itaú Visa", bank: "Itaú",
    limit_total: 5000, limit_used: 1250.00, best_purchase_day: 10,
    closing_day: 15, due_day: 22, account_id: "acc-2",
    color: "#F97316", is_active: true, created_at: "2024-01-01",
  },
]

export const DEMO_CATEGORIES: Category[] = [
  { id: "cat-salary", name: "Salário", type: "income", color: "#10B981", icon: "briefcase", is_default: true, is_hidden: false },
  { id: "cat-freelance", name: "Freelance", type: "income", color: "#3B82F6", icon: "laptop", is_default: true, is_hidden: false },
  { id: "cat-reimbursement", name: "Reembolso", type: "income", color: "#6B7280", icon: "rotate-ccw", is_default: true, is_hidden: false },
  { id: "cat-housing", name: "Moradia", type: "expense", color: "#6B7280", icon: "home", is_default: true, is_hidden: false },
  { id: "cat-food", name: "Alimentação", type: "expense", color: "#F97316", icon: "utensils", is_default: true, is_hidden: false },
  { id: "cat-market", name: "Mercado", type: "expense", color: "#84CC16", icon: "shopping-cart", is_default: true, is_hidden: false },
  { id: "cat-transport", name: "Transporte", type: "expense", color: "#3B82F6", icon: "car", is_default: true, is_hidden: false },
  { id: "cat-health", name: "Saúde", type: "expense", color: "#EF4444", icon: "heart", is_default: true, is_hidden: false },
  { id: "cat-education", name: "Educação", type: "expense", color: "#8B5CF6", icon: "graduation-cap", is_default: true, is_hidden: false },
  { id: "cat-leisure", name: "Lazer", type: "expense", color: "#EC4899", icon: "gamepad-2", is_default: true, is_hidden: false },
  { id: "cat-subs", name: "Assinaturas", type: "expense", color: "#0EA5E9", icon: "tv", is_default: true, is_hidden: false },
  { id: "cat-internet", name: "Internet", type: "expense", color: "#14B8A6", icon: "wifi", is_default: true, is_hidden: false },
  { id: "cat-gym", name: "Academia", type: "expense", color: "#F59E0B", icon: "dumbbell", is_default: true, is_hidden: false },
  { id: "cat-other", name: "Outros", type: "expense", color: "#9CA3AF", icon: "circle-dot", is_default: true, is_hidden: false },
]

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t-1", user_id: "demo", type: "income", description: "Salário", amount: 7500, date: `${y}-${String(m + 1).padStart(2, "0")}-05`, category_id: "cat-salary", account_id: "acc-1", is_installment: false, is_recurring: true, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-2", user_id: "demo", type: "expense", description: "Aluguel", amount: 1800, date: `${y}-${String(m + 1).padStart(2, "0")}-10`, category_id: "cat-housing", account_id: "acc-1", is_installment: false, is_recurring: true, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-3", user_id: "demo", type: "expense", description: "Mercado Extra", amount: 420, date: `${y}-${String(m + 1).padStart(2, "0")}-07`, category_id: "cat-market", account_id: "acc-1", card_id: "card-1", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-4", user_id: "demo", type: "expense", description: "iFood", amount: 89.90, date: `${y}-${String(m + 1).padStart(2, "0")}-08`, category_id: "cat-food", account_id: "acc-1", card_id: "card-1", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-5", user_id: "demo", type: "expense", description: "Uber", amount: 34.50, date: `${y}-${String(m + 1).padStart(2, "0")}-09`, category_id: "cat-transport", account_id: "acc-1", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-6", user_id: "demo", type: "expense", description: "Netflix", amount: 55.90, date: `${y}-${String(m + 1).padStart(2, "0")}-03`, category_id: "cat-subs", account_id: "acc-1", card_id: "card-1", is_installment: false, is_recurring: true, tags: ["assinatura"], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-7", user_id: "demo", type: "expense", description: "Spotify", amount: 21.90, date: `${y}-${String(m + 1).padStart(2, "0")}-03`, category_id: "cat-subs", account_id: "acc-1", card_id: "card-1", is_installment: false, is_recurring: true, tags: ["assinatura"], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-8", user_id: "demo", type: "expense", description: "Academia Smart Fit", amount: 99.90, date: `${y}-${String(m + 1).padStart(2, "0")}-05`, category_id: "cat-gym", account_id: "acc-1", is_installment: false, is_recurring: true, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-9", user_id: "demo", type: "expense", description: "Internet Vivo", amount: 119.90, date: `${y}-${String(m + 1).padStart(2, "0")}-12`, category_id: "cat-internet", account_id: "acc-1", is_installment: false, is_recurring: true, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-10", user_id: "demo", type: "income", description: "Projeto Freelance", amount: 1200, date: `${y}-${String(m + 1).padStart(2, "0")}-15`, category_id: "cat-freelance", account_id: "acc-1", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-11", user_id: "demo", type: "expense", description: "Farmácia", amount: 68.40, date: `${y}-${String(m + 1).padStart(2, "0")}-14`, category_id: "cat-health", account_id: "acc-3", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
  { id: "t-12", user_id: "demo", type: "expense", description: "Cinema", amount: 52, date: `${y}-${String(m + 1).padStart(2, "0")}-11`, category_id: "cat-leisure", account_id: "acc-1", card_id: "card-1", is_installment: false, is_recurring: false, tags: [], status: "confirmed", created_at: "", updated_at: "" },
]

export const DEMO_GOALS: Goal[] = [
  {
    id: "goal-1", user_id: "demo", name: "Reserva de Emergência", type: "emergency",
    target_amount: 22500, current_amount: 8750,
    target_date: `${y + 1}-${String(m + 1).padStart(2, "0")}-01`,
    monthly_contribution: 500, account_id: "acc-2",
    priority: "high", status: "active", color: "#10B981", icon: "shield", created_at: "2024-01-01",
  },
  {
    id: "goal-2", user_id: "demo", name: "Viagem para Portugal", type: "travel",
    target_amount: 12000, current_amount: 2400,
    target_date: `${y + 1}-06-01`,
    monthly_contribution: 800, account_id: "acc-2",
    priority: "medium", status: "active", color: "#3B82F6", icon: "plane", created_at: "2024-01-01",
  },
]

export const DEMO_DEBTS: Debt[] = [
  {
    id: "debt-1", user_id: "demo", name: "Empréstimo Pessoal", creditor: "Banco Itaú",
    original_amount: 15000, current_balance: 9840, monthly_interest: 1.9,
    monthly_payment: 620, due_day: 15, start_date: "2023-06-01",
    strategy: "avalanche", status: "active", created_at: "2023-06-01",
  },
]

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub-1", user_id: "demo", name: "Netflix", amount: 55.90, frequency: "monthly", next_billing: `${y}-${String(m + 2).padStart(2, "0")}-03`, category_id: "cat-subs", is_active: true, is_essential: false, created_at: "" },
  { id: "sub-2", user_id: "demo", name: "Spotify", amount: 21.90, frequency: "monthly", next_billing: `${y}-${String(m + 2).padStart(2, "0")}-03`, category_id: "cat-subs", is_active: true, is_essential: false, created_at: "" },
  { id: "sub-3", user_id: "demo", name: "Academia Smart Fit", amount: 99.90, frequency: "monthly", next_billing: `${y}-${String(m + 2).padStart(2, "0")}-05`, category_id: "cat-gym", is_active: true, is_essential: true, created_at: "" },
  { id: "sub-4", user_id: "demo", name: "Internet Vivo", amount: 119.90, frequency: "monthly", next_billing: `${y}-${String(m + 2).padStart(2, "0")}-12`, category_id: "cat-internet", is_active: true, is_essential: true, created_at: "" },
  { id: "sub-5", user_id: "demo", name: "Adobe Creative Cloud", amount: 228, frequency: "monthly", next_billing: `${y}-${String(m + 2).padStart(2, "0")}-20`, category_id: "cat-subs", is_active: true, is_essential: false, created_at: "" },
]

export const DEMO_BUDGET_ITEMS: BudgetItem[] = [
  { id: "bi-1", budget_id: "b-1", category_id: "cat-housing", amount_limit: 1800, amount_spent: 1800 },
  { id: "bi-2", budget_id: "b-1", category_id: "cat-food", amount_limit: 500, amount_spent: 574 },
  { id: "bi-3", budget_id: "b-1", category_id: "cat-market", amount_limit: 600, amount_spent: 420 },
  { id: "bi-4", budget_id: "b-1", category_id: "cat-transport", amount_limit: 200, amount_spent: 134.50 },
  { id: "bi-5", budget_id: "b-1", category_id: "cat-health", amount_limit: 150, amount_spent: 68.40 },
  { id: "bi-6", budget_id: "b-1", category_id: "cat-leisure", amount_limit: 300, amount_spent: 252 },
  { id: "bi-7", budget_id: "b-1", category_id: "cat-subs", amount_limit: 200, amount_spent: 405.70 },
]

export const DEMO_TASKS: FinancialTask[] = [
  { id: "task-1", user_id: "demo", title: "Fatura Nubank vence em 4 dias", description: "Sua fatura de R$ 2.847,92 vence em breve. Não deixe acumular juros.", due_date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d + 4).padStart(2, "0")}`, priority: "urgent_important", estimated_impact: 2847.92, status: "pending", category: "card", related_id: "card-1", related_type: "card", is_auto: true, created_at: "" },
  { id: "task-2", user_id: "demo", title: "Orçamento de Assinaturas estourado", description: "Você gastou R$ 205,70 a mais do que planejou em assinaturas este mês.", priority: "important", estimated_impact: 205.70, status: "pending", category: "budget", related_id: "bi-7", related_type: "budget", is_auto: true, created_at: "" },
  { id: "task-3", user_id: "demo", title: "Revisar Adobe Creative Cloud", description: "Custa R$ 2.736 por ano. Você ainda usa com frequência?", priority: "important", estimated_impact: 228, status: "pending", category: "subscription", related_id: "sub-5", related_type: "subscription", is_auto: true, created_at: "" },
  { id: "task-4", user_id: "demo", title: "Contribuir para reserva de emergência", description: "Você planejou guardar R$ 500 este mês. Já fez isso?", priority: "important", estimated_impact: 500, status: "pending", category: "goal", related_id: "goal-1", related_type: "goal", is_auto: false, created_at: "" },
]

export const DEMO_GAMIFICATION: GamificationState = {
  health_score: 68,
  total_points: 1240,
  level: 3,
  streak_days: 5,
  achievements: [],
  weekly_missions: [
    { id: "m-1", title: "Revisar fatura do cartão", description: "Abra e revise os lançamentos da fatura", points: 50, is_completed: false, progress: 0, total: 1, icon: "credit-card" },
    { id: "m-2", title: "Categorizar transações", description: "Categorize todas as transações da semana", points: 30, is_completed: true, progress: 8, total: 8, icon: "tag" },
    { id: "m-3", title: "Não estourar orçamento", description: "Mantenha os gastos dentro do limite por 3 dias", points: 40, is_completed: false, progress: 2, total: 3, icon: "shield-check" },
    { id: "m-4", title: "Guardar algum valor", description: "Adicione qualquer valor à sua reserva ou meta", points: 60, is_completed: false, progress: 0, total: 1, icon: "piggy-bank" },
  ],
}

export function computeFinancialSummary(): FinancialSummary {
  const totalBalance = DEMO_ACCOUNTS.reduce((sum, a) => sum + a.current_balance, 0)
  const monthIncome = DEMO_TRANSACTIONS
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const monthExpenses = DEMO_TRANSACTIONS
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const openInvoices = DEMO_CARDS.reduce((sum, c) => sum + c.limit_used, 0)
  const upcomingBillsAmount = 620
  const freeMoney = monthIncome - monthExpenses - upcomingBillsAmount
  const invoicePercent = Math.round((openInvoices / monthIncome) * 100)

  return {
    totalBalance,
    monthIncome,
    monthExpenses,
    freeMoney: Math.max(0, freeMoney),
    upcomingBills: {
      amount: upcomingBillsAmount,
      count: 3,
      soonest: `${y}-${String(m + 1).padStart(2, "0")}-${String(d + 4).padStart(2, "0")}`,
    },
    openInvoices,
    healthScore: DEMO_GAMIFICATION.health_score,
    alertLevel: "attention",
    topInsight: `Sua fatura do cartão já compromete ${invoicePercent}% da sua renda. Vale revisar antes do fechamento.`,
    nextAction: { label: "Revisar fatura", href: "/cards" },
  }
}
