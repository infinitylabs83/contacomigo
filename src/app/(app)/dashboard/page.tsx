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

  const [accountsRes, transactionsRes, gamificationRes] = await Promise.allSettled([
    supabase.from("accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").gte("date", from).lte("date", to),
    supabase.from("gamification").select("*").maybeSingle(),
  ])

  const accounts     = accountsRes.status     === "fulfilled" ? (accountsRes.value.data     ?? []) : []
  const transactions = transactionsRes.status === "fulfilled" ? (transactionsRes.value.data ?? []) : []
  const gamification = gamificationRes.status === "fulfilled" ? gamificationRes.value.data  : null

  const income       = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0)
  const expense      = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0)
  const balance      = income - expense
  const totalBalance = accounts.reduce((s: number, a: any) => s + (a.current_balance ?? 0), 0)

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
    health_score:    gamification?.health_score    ?? 0,
    total_points:    gamification?.total_points    ?? 0,
    level:           gamification?.level           ?? 1,
    streak_days:     gamification?.streak_days     ?? 0,
    achievements:    Array.isArray(gamification?.achievements)    ? gamification.achievements    : [],
    weekly_missions: Array.isArray(gamification?.weekly_missions) ? gamification.weekly_missions : [],
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
          <UpcomingBills tasks={[]} />
          <SpendingChart items={[]} />
        </div>
      </div>
    </div>
  )
}
