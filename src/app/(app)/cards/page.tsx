"use client"

import { motion } from "framer-motion"
import { Plus, AlertTriangle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { formatRelativeDate } from "@/lib/utils"
import { DEMO_CARDS, DEMO_TRANSACTIONS } from "@/lib/demo-data"

const CARD_EMOJI = ["💳", "🃏", "💜"]

export default function CardsPage() {
  const today = new Date()

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cartões 💳</h1>
          <p className="text-sm text-muted-foreground">Faturas, limites e datas</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl nexo-gradient border-0 text-white shadow-sm shadow-primary/30">
          <Plus className="size-4" />Novo
        </Button>
      </div>

      <div className="space-y-4">
        {DEMO_CARDS.map((card, idx) => {
          const usedPercent = Math.min((card.limit_used / card.limit_total) * 100, 100)
          const available = card.limit_total - card.limit_used
          const dueDate = new Date(today.getFullYear(), today.getMonth(), card.due_day)
          if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
          const closingDate = new Date(today.getFullYear(), today.getMonth(), card.closing_day)
          if (closingDate < today) closingDate.setMonth(closingDate.getMonth() + 1)
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysUntilDue <= 5
          const cardTxns = DEMO_TRANSACTIONS.filter((t) => t.card_id === card.id)
          const ringCirc = 2 * Math.PI * 30
          const dash = (usedPercent / 100) * ringCirc

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-3xl border bg-card overflow-hidden ${isUrgent ? "border-red-300 dark:border-red-800" : ""}`}
            >
              {/* Card visual */}
              <div
                className="p-5 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${card.color}ee, ${card.color}99)` }}
              >
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative">
                  <div>
                    <p className="font-bold text-lg">{card.name}</p>
                    <p className="text-white/70 text-xs">{card.bank}</p>
                  </div>
                  <span className="text-3xl">{CARD_EMOJI[idx % CARD_EMOJI.length]}</span>
                </div>
                <div className="flex items-end justify-between relative">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Fatura atual</p>
                    <MoneyText value={card.limit_used} size="xl" className="text-white font-black" />
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs mb-1">Vence em</p>
                    <p className="font-bold">{daysUntilDue}d</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {isUrgent && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Fatura vence em {daysUntilDue} {daysUntilDue === 1 ? "dia" : "dias"}! ⚡</span>
                  </div>
                )}

                {/* Ring progress + stats */}
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                      <circle
                        cx="36" cy="36" r="30" fill="none"
                        stroke={usedPercent > 80 ? "#ef4444" : usedPercent > 60 ? "#f59e0b" : card.color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${ringCirc - dash}`}
                        strokeDashoffset={ringCirc / 4}
                        style={{ transition: "stroke-dasharray 0.6s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black">{usedPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usado</span>
                      <span className="font-semibold"><MoneyText value={card.limit_used} size="sm" /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Disponível</span>
                      <span className="font-semibold text-green-600 dark:text-green-400"><MoneyText value={available} size="sm" /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Limite total</span>
                      <span className="font-semibold"><MoneyText value={card.limit_total} size="sm" /></span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Fechamento</p>
                    </div>
                    <p className="font-semibold text-sm">Dia {card.closing_day}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(closingDate.toISOString().split("T")[0])}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Vencimento</p>
                    </div>
                    <p className="font-semibold text-sm">Dia {card.due_day}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(dueDate.toISOString().split("T")[0])}</p>
                  </div>
                </div>

                {/* Tip */}
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                  💡 Essa fatura é <strong>{Math.round((card.limit_used / 7500) * 100)}% da sua renda estimada</strong>
                  {card.limit_used / 7500 > 0.3 ? " — vale revisar antes de novas compras!" : " — dentro do controle 👍"}
                </div>

                {/* Recent txns */}
                {cardTxns.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Últimas compras</p>
                    <div className="space-y-1.5">
                      {cardTxns.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1">{t.description}</span>
                          <MoneyText value={t.amount} size="sm" className="font-medium ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
