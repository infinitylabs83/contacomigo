import type { Metadata } from "next"
import { ClarityPanel } from "@/components/dashboard/clarity-panel"
import { AccountCards } from "@/components/dashboard/account-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { MissionCard } from "@/components/dashboard/mission-card"
import {
  DEMO_ACCOUNTS, DEMO_BUDGET_ITEMS, DEMO_CATEGORIES, DEMO_TASKS,
  DEMO_GAMIFICATION, computeFinancialSummary
} from "@/lib/demo-data"

export const metadata: Metadata = { title: "Início" }

export default function DashboardPage() {
  const summary = computeFinancialSummary()

  const budgetWithCategories = DEMO_BUDGET_ITEMS.map((item) => ({
    ...item,
    category: DEMO_CATEGORIES.find((c) => c.id === item.category_id),
  }))

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">
      {/* Demo banner */}
      <div className="rounded-2xl bg-primary/8 border border-primary/15 px-4 py-2.5 flex items-center gap-2 text-sm text-primary">
        <span>👋</span>
        <span>Você está no modo demonstração do <strong>Conta Comigo</strong> —{" "}
          <a href="/register" className="underline font-semibold">criar minha conta grátis</a>
        </span>
      </div>

      {/* Hero: free money */}
      <ClarityPanel summary={summary} />

      {/* Accounts */}
      <AccountCards accounts={DEMO_ACCOUNTS} totalBalance={summary.totalBalance} />

      {/* Gamification + upcoming bills side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MissionCard gamification={DEMO_GAMIFICATION} />
        <div className="space-y-4">
          <UpcomingBills tasks={DEMO_TASKS} />
          <SpendingChart items={budgetWithCategories} />
        </div>
      </div>
    </div>
  )
}
