import type { Metadata } from "next"
import { ClarityPanel } from "@/components/dashboard/clarity-panel"
import { AccountCards } from "@/components/dashboard/account-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { MissionCard } from "@/components/dashboard/mission-card"
import { getDashboardData } from "@/lib/data"
import type { FinancialSummary, GamificationState } from "@/types"
import Link from "next/link"

export const metadata: Metadata = { title: "Início" }

export default async function DashboardPage() {
  const { user, accounts, transactions, gamification, income, expense, balance, totalBalance } = await getDashboardData()

  // Monta o FinancialSummary com dados reais
  const summary: FinancialSummary = {
    totalBalance,
    monthIncome:    income,
    monthExpenses:  expense,
    freeMoney:      balance,
    upcomingBills:  { amount: 0, count: 0, soonest: null },
    openInvoices:   0,
    healthScore:    gamification?.health_score ?? 0,
    alertLevel:     balance >= 0 ? "safe" : balance > -500 ? "attention" : "danger",
    topInsight:     income === 0
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

  // Gamification com fallback para usuário novo
  const gamificationData: GamificationState = gamification ?? {
    health_score: 0,
    total_points: 0,
    level: 1,
    streak_days: 0,
    achievements: [],
    weekly_missions: [],
  }

  const userName = (user?.user_metadata?.full_name as string)?.split(" ")[0] ?? "você"

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">

      {/* Boas-vindas para usuário novo */}
      {accounts.length === 0 && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-sm"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", color: "#7c3aed" }}>
          <span>👋</span>
          <span>Olá, <strong>{userName}</strong>! Comece criando sua primeira conta.{" "}
            <Link href="/accounts" className="underline font-semibold">Criar conta →</Link>
          </span>
        </div>
      )}

      {/* Hero: dinheiro livre */}
      <ClarityPanel summary={summary} />

      {/* Contas */}
      <AccountCards accounts={accounts as any} totalBalance={totalBalance} />

      {/* Gamificação + próximos vencimentos */}
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
