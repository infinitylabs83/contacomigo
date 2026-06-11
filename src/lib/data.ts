import { createClient } from "@/lib/supabase/server"

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getAccounts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true })
  return data ?? []
}

export async function getTransactions(month?: number, year?: number) {
  const supabase = await createClient()
  let query = supabase
    .from("transactions")
    .select("*, category:categories(*), account:accounts(*)")
    .order("date", { ascending: false })

  if (month !== undefined && year !== undefined) {
    const from = `${year}-${String(month).padStart(2, "0")}-01`
    const to   = `${year}-${String(month).padStart(2, "0")}-31`
    query = query.gte("date", from).lte("date", to)
  }
  const { data } = await query
  return data ?? []
}

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })
  return data ?? []
}

export async function getCards() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("credit_cards")
    .select("*")
    .order("created_at", { ascending: true })
  return data ?? []
}

export async function getGoals() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getDebts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debts")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getSubscriptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getGamification() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("gamification")
    .select("*")
    .maybeSingle()
  return data ?? null
}

export async function getDashboardData() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [user, accounts, transactions, gamification] = await Promise.all([
    getUser(),
    getAccounts(),
    getTransactions(month, year),
    getGamification(),
  ])

  const income  = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0)
  const expense = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0)
  const balance = income - expense
  const totalBalance = accounts.reduce((s: number, a: any) => s + (a.current_balance ?? 0), 0)

  return { user, accounts, transactions, gamification, income, expense, balance, totalBalance }
}
