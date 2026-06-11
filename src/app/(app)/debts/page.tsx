"use client"

import { motion } from "framer-motion"
import { Plus, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { DEMO_DEBTS } from "@/lib/demo-data"

const DEBT_EMOJI: Record<string, string> = {
  card: "💳", loan: "🏦", personal: "🤝", student: "🎓", mortgage: "🏠", other: "💸",
}

const STRATEGY_CONFIG: Record<string, { label: string; emoji: string; tip: string }> = {
  avalanche: { label: "Avalanche", emoji: "🏔️", tip: "Pagando o maior juro primeiro — economiza mais no longo prazo" },
  snowball: { label: "Bola de Neve", emoji: "⛄", tip: "Pagando a menor dívida primeiro — mantém a motivação alta" },
}

export default function DebtsPage() {
  const totalDebt = DEMO_DEBTS.reduce((s, d) => s + d.current_balance, 0)
  const totalOriginal = DEMO_DEBTS.reduce((s, d) => s + d.original_amount, 0)
  const totalPaid = totalOriginal - totalDebt
  const paidPct = Math.min((totalPaid / totalOriginal) * 100, 100)
  const ringCirc = 2 * Math.PI * 36
  const dash = (paidPct / 100) * ringCirc

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dívidas 🔓</h1>
          <p className="text-sm text-muted-foreground">Organize e acelere a quitação</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl nexo-gradient border-0 text-white shadow-sm shadow-primary/30">
          <Plus className="size-4" />Nova
        </Button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border bg-card p-5 flex items-center gap-5"
      >
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/25" />
            <circle
              cx="44" cy="44" r="36" fill="none"
              stroke="oklch(0.62 0.19 145)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${ringCirc - dash}`}
              strokeDashoffset={ringCirc / 4}
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black">{paidPct.toFixed(0)}%</span>
            <span className="text-xs text-muted-foreground">pago</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Ainda deve</p>
            <MoneyText value={totalDebt} size="xl" className="font-black text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Já quitou</p>
            <MoneyText value={totalPaid} size="lg" className="font-bold text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xs text-muted-foreground">Cada pagamento conta! 💪</p>
        </div>
      </motion.div>

      {/* Debt cards */}
      <div className="space-y-4">
        {DEMO_DEBTS.map((debt, i) => {
          const dPaidPct = Math.min(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100, 100)
          const monthsLeft = Math.ceil(debt.current_balance / debt.monthly_payment)
          const strategy = STRATEGY_CONFIG[debt.strategy] ?? STRATEGY_CONFIG.avalanche
          const dRingCirc = 2 * Math.PI * 26
          const dDash = (dPaidPct / 100) * dRingCirc

          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border bg-card p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-2xl shrink-0">
                  {DEBT_EMOJI[(debt as any).type ?? "other"] ?? "💸"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{debt.name}</p>
                  <p className="text-xs text-muted-foreground">{debt.creditor}</p>
                </div>
                <span className="text-xs bg-muted/50 px-2.5 py-1 rounded-full">
                  {strategy.emoji} {strategy.label}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4">
                {/* Mini ring */}
                <div className="relative shrink-0">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/25" />
                    <circle
                      cx="30" cy="30" r="26" fill="none"
                      stroke="oklch(0.62 0.19 145)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${dDash} ${dRingCirc - dDash}`}
                      strokeDashoffset={dRingCirc / 4}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black">{dPaidPct.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <MoneyText value={debt.current_balance} size="sm" className="font-bold text-red-500" />
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Parcela</p>
                    <MoneyText value={debt.monthly_payment} size="sm" className="font-bold" />
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Juros/mês</p>
                    <span className="text-sm font-bold">{debt.monthly_interest}%</span>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Faltam</p>
                    <span className="text-sm font-bold">{monthsLeft}m</span>
                  </div>
                </div>
              </div>

              {/* Strategy tip */}
              <div className="rounded-2xl bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
                💡 {strategy.tip}. No ritmo atual, quitação em{" "}
                <strong className="text-foreground">{monthsLeft} meses</strong>.
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 rounded-xl">
                  <Calculator className="size-3.5" />Simular
                </Button>
                <Button size="sm" variant="ghost" className="rounded-xl">Registrar pagamento</Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
