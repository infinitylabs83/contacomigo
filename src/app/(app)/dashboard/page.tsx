import type { Metadata } from "next"
import { ClarityPanel } from "@/components/dashboard/clarity-panel"
import { AccountCards } from "@/components/dashboard/account-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { MissionCard } from "@/components/dashboard/mission-card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { FinancialSummary, GamificationState } from "@/types"
import Link from "next/link"

export const metadata: Metadata = { title: "Início" }

export default async function DashboardPage() {
  // Verifica autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  // Busca dados — cada query independente com fallback
  const now   = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year  = now.getFullYear()
  const from  = `${year}-${month}-01`
  const to    = `${year}-${month}-31`

  const [accountsRes, transactionsRes, allTxnsRes, gamificationRes, tasksRes, budgetLimitsRes, goalsRes] = await Promise.allSettled([
    supabase.from("accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").gte("date", from).lte("date", to),
    supabase.from("transactions").select("date").order("date", { ascending: false }),
    supabase.from("gamification").select("*").maybeSingle(),
    supabase.from("financial_tasks").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(4),
    supabase.from("budget_limits").select("*").eq("month", Number(month)).eq("year", year),
    supabase.from("goals").select("id").limit(1),
  ])

  const accounts     = accountsRes.status      === "fulfilled" ? (accountsRes.value.data      ?? []) : []
  const transactions = transactionsRes.status  === "fulfilled" ? (transactionsRes.value.data  ?? []) : []
  const allTxns      = allTxnsRes.status       === "fulfilled" ? (allTxnsRes.value.data        ?? []) : []
  const gamification = gamificationRes.status  === "fulfilled" ? gamificationRes.value.data   : null
  const tasks        = tasksRes.status         === "fulfilled" ? (tasksRes.value.data         ?? []) : []
  const budgetLimits = budgetLimitsRes.status  === "fulfilled" ? (budgetLimitsRes.value.data  ?? []) : []
  const goals        = goalsRes.status         === "fulfilled" ? (goalsRes.value.data          ?? []) : []

  const income       = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0)
  const expense      = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0)
  const balance      = income - expense
  const totalBalance = accounts.reduce((s: number, a: any) => s + (a.current_balance ?? 0), 0)

  // Compute spending by category from notes field ("emoji|label")
  const spendingMap: Record<string, { label: string; emoji: string; total: number }> = {}
  for (const t of transactions.filter((t: any) => t.type === "expense")) {
    const parts = (t.notes ?? "").split("|")
    if (parts.length >= 2) {
      const key = parts[1]
      if (!spendingMap[key]) spendingMap[key] = { label: parts[1], emoji: parts[0], total: 0 }
      spendingMap[key].total += t.amount
    } else {
      if (!spendingMap["Outros"]) spendingMap["Outros"] = { label: "Outros", emoji: "💸", total: 0 }
      spendingMap["Outros"].total += t.amount
    }
  }
  const CATEGORY_COLORS: Record<string, string> = {
    "Comida":"#F97316","Mercado":"#84CC16","Transporte":"#3B82F6","Moradia":"#6B7280",
    "Saúde":"#EF4444","Lazer":"#EC4899","Assinatura":"#0EA5E9","Estudo":"#8B5CF6",
    "Academia":"#F59E0B","Internet":"#14B8A6","Impostos":"#6366F1","Outros":"#9CA3AF",
  }
  const spendingItems = Object.values(spendingMap)
    .sort((a, b) => b.total - a.total)
    .map(s => ({
      id: s.label, category_id: s.label, amount_limit: 0, amount_spent: s.total,
      category: { id: s.label, name: s.label, color: CATEGORY_COLORS[s.label] ?? "#7c3aed", emoji: s.emoji },
    }))

  // Calculate streak from all transaction dates
  const txnDates = [...new Set(allTxns.map((t: any) => t.date))].sort().reverse() as string[]
  let streak = 0
  if (txnDates.length > 0) {
    const todayISO = now.toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (txnDates[0] === todayISO || txnDates[0] === yesterday) {
      let prev = new Date(txnDates[0] + "T12:00:00")
      streak = 1
      for (let i = 1; i < txnDates.length; i++) {
        const cur = new Date(txnDates[i] + "T12:00:00")
        const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000)
        if (diff === 1) { streak++; prev = cur } else break
      }
    }
  }

  // Calculate points dynamically
  const allTxnCount = allTxns.length
  const rawPoints = allTxnCount * 10
    + accounts.length * 20
    + goals.length * 50
    + budgetLimits.length * 40
    + streak * 5
  const totalPoints = gamification?.total_points
    ? Math.max(gamification.total_points, rawPoints)
    : rawPoints

  // Level from points
  const levelThresholds = [0, 500, 1500, 3000, 6000, 10000]
  let level = 1
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i]) { level = i + 1; break }
  }

  // Health score from real data
  const hasIncome = income > 0
  let healthScore = 40
  if (hasIncome) healthScore += 15
  if (income > 0 && expense < income) healthScore += 20
  else if (expense > income && income > 0) healthScore -= 10
  if (budgetLimits.length > 0) healthScore += 10
  if (streak >= 3) healthScore += 5
  if (streak >= 7) healthScore += 5
  if (goals.length > 0) healthScore += 5
  healthScore = Math.max(10, Math.min(100, healthScore))

  // Auto-generate weekly missions based on user activity
  const txnCount  = transactions.filter((t: any) => t.type === "expense").length
  const hasAccount = accounts.length > 0
  const hasBudget  = budgetLimits.length > 0
  const weeklyMissions = [
    { id: "m1", title: "Registrar sua renda do mês",        description: "", icon: "💚", points: 50, is_completed: hasIncome,     progress: hasIncome ? 1 : 0,     total: 1 },
    { id: "m2", title: "Lançar pelo menos 5 gastos",        description: "", icon: "📝", points: 30, is_completed: txnCount >= 5, progress: Math.min(txnCount, 5), total: 5 },
    { id: "m3", title: "Criar uma conta bancária",          description: "", icon: "🏦", points: 20, is_completed: hasAccount,    progress: hasAccount ? 1 : 0,    total: 1 },
    { id: "m4", title: "Definir limite para uma categoria", description: "", icon: "🎯", points: 40, is_completed: hasBudget,     progress: hasBudget ? 1 : 0,     total: 1 },
  ]

  // When no income registered this month, show total account balance as "available"
  const noMonthlyData = income === 0 && expense === 0
  const displayFree   = noMonthlyData ? totalBalance : balance

  const summary: FinancialSummary = {
    totalBalance,
    monthIncome:   income,
    monthExpenses: expense,
    freeMoney:     displayFree,
    upcomingBills: { amount: 0, count: 0, soonest: null },
    openInvoices:  0,
    healthScore,
    alertLevel:    displayFree >= 0 ? "safe" : displayFree > -500 ? "attention" : "danger",
    topInsight:    noMonthlyData
      ? "Este é o saldo total das suas contas 🏦"
      : balance >= 0
        ? "Você está no azul este mês 🎉"
        : "Seus gastos superaram a renda este mês ⚠️",
    nextAction: accounts.length === 0
      ? { label: "Criar primeira conta", href: "/accounts" }
      : income === 0
        ? { label: "Registrar renda do mês", href: "/transactions" }
        : { label: "Ver movimentações", href: "/transactions" },
  }

  const gamificationData: GamificationState = {
    health_score:    healthScore,
    total_points:    totalPoints,
    level,
    streak_days:     streak,
    achievements:    [],
    weekly_missions: weeklyMissions,
  }

  const userName = (user.user_metadata?.full_name as string)?.split(" ")[0] ?? "você"

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">

      {accounts.length === 0 && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-sm"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", color: "#7c3aed" }}>
          <span>👋</span>
          <span>Olá, <strong>{userName}</strong>! Comece criando sua primeira conta.{" "}
            <Link href="/accounts" className="underline font-semibold">Criar conta →</Link>
          </span>
        </div>
      )}

      <ClarityPanel summary={summary} />
      <AccountCards accounts={accounts as any} totalBalance={totalBalance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MissionCard gamification={gamificationData} />
        <div className="space-y-4">
          <UpcomingBills tasks={tasks as any} />
          <SpendingChart items={spendingItems as any} />
        </div>
      </div>
    </div>
  )
}
