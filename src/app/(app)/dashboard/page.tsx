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

  const [accountsRes, transactionsRes, gamificationRes, tasksRes, budgetLimitsRes] = await Promise.allSettled([
    supabase.from("accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").gte("date", from).lte("date", to),
    supabase.from("gamification").select("*").maybeSingle(),
    supabase.from("financial_tasks").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(4),
    supabase.from("budget_limits").select("*").eq("month", Number(month)).eq("year", year),
  ])

  const accounts     = accountsRes.status      === "fulfilled" ? (accountsRes.value.data      ?? []) : []
  const transactions = transactionsRes.status  === "fulfilled" ? (transactionsRes.value.data  ?? []) : []
  const gamification = gamificationRes.status  === "fulfilled" ? gamificationRes.value.data   : null
  const tasks        = tasksRes.status         === "fulfilled" ? (tasksRes.value.data         ?? []) : []
  const budgetLimits = budgetLimitsRes.status  === "fulfilled" ? (budgetLimitsRes.value.data  ?? []) : []

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

  // Auto-generate weekly missions based on user activity
  const txnCount = transactions.filter((t: any) => t.type === "expense").length
  const hasIncome = income > 0
  const hasAccount = accounts.length > 0
  const hasBudget = budgetLimits.length > 0
  const weeklyMissions = gamification?.weekly_missions?.length
    ? gamification.weekly_missions
    : [
        { id: "m1", title: "Registrar sua renda do mês", points: 50, is_completed: hasIncome, progress: hasIncome ? 1 : 0, total: 1 },
        { id: "m2", title: "Lançar pelo menos 5 gastos", points: 30, is_completed: txnCount >= 5, progress: Math.min(txnCount, 5), total: 5 },
        { id: "m3", title: "Criar uma conta bancária", points: 20, is_completed: hasAccount, progress: hasAccount ? 1 : 0, total: 1 },
        { id: "m4", title: "Definir limite para uma categoria", points: 40, is_completed: hasBudget, progress: hasBudget ? 1 : 0, total: 1 },
      ]

  const summary: FinancialSummary = {
    totalBalance,
    monthIncome:   income,
    monthExpenses: expense,
    freeMoney:     balance,
    upcomingBills: { amount: 0, count: 0, soonest: null },
    openInvoices:  0,
    healthScore:   gamification?.health_score ?? 0,
    alertLevel:    balance >= 0 ? "safe" : balance > -500 ? "attention" : "danger",
    topInsight:    income === 0
      ? "Registre sua primeira renda para começar!"
      : balance >= 0
        ? "Você está no azul este mês 🎉"
        : "Seus gastos superaram a renda este mês ⚠️",
    nextAction: accounts.length === 0
      ? { label: "Criar primeira conta", href: "/accounts" }
      : income === 0
        ? { label: "Registrar renda", href: "/transactions" }
        : { label: "Ver movimentações", href: "/transactions" },
  }

  const gamificationData: GamificationState = {
    health_score:    gamification?.health_score ?? 0,
    total_points:    gamification?.total_points ?? 0,
    level:           gamification?.level        ?? 1,
    streak_days:     gamification?.streak_days  ?? 0,
    achievements:    Array.isArray(gamification?.achievements) ? gamification.achievements : [],
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
