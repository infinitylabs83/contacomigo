"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { formatRelativeDate } from "@/lib/utils"
import { DEMO_SUBSCRIPTIONS } from "@/lib/demo-data"

const freqLabel: Record<string, string> = {
  monthly: "mensal", quarterly: "trimestral", yearly: "anual", weekly: "semanal",
}

const SUB_EMOJI: Record<string, string> = {
  Netflix: "🎬", Spotify: "🎵", Amazon: "📦", Disney: "🏰", YouTube: "▶️",
  Apple: "🍎", Google: "🔍", Microsoft: "💻", Adobe: "🎨", Gym: "🏋️",
}

function monthlyEquiv(amount: number, freq: string): number {
  const m: Record<string, number> = { monthly: 1, quarterly: 1 / 3, yearly: 1 / 12, weekly: 4.33 }
  return amount * (m[freq] ?? 1)
}
function yearlyAmount(amount: number, freq: string): number {
  const m: Record<string, number> = { monthly: 12, quarterly: 4, yearly: 1, weekly: 52 }
  return amount * (m[freq] ?? 12)
}

export default function SubscriptionsPage() {
  const active = DEMO_SUBSCRIPTIONS.filter((s) => s.is_active)
  const totalMonthly = active.reduce((s, sub) => s + monthlyEquiv(sub.amount, sub.frequency), 0)
  const totalYearly = totalMonthly * 12
  const toReview = active.filter((s) => !s.is_essential)

  function getEmoji(name: string) {
    const key = Object.keys(SUB_EMOJI).find((k) => name.toLowerCase().includes(k.toLowerCase()))
    return key ? SUB_EMOJI[key] : "📱"
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas 🔄</h1>
          <p className="text-sm text-muted-foreground">Tudo que você paga todo mês</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl nexo-gradient border-0 text-white shadow-sm shadow-primary/30">
          <Plus className="size-4" />Nova
        </Button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl nexo-gradient p-6 text-white relative overflow-hidden"
      >
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/70 text-sm mb-1">Gasto mensal em assinaturas</p>
        <MoneyText value={totalMonthly} size="2xl" className="text-white font-black" />
        <div className="mt-3 flex items-center gap-4">
          <div className="bg-white/15 rounded-2xl px-3 py-1.5 text-sm">
            <span className="text-white/70">Por ano: </span>
            <span className="font-bold"><MoneyText value={totalYearly} size="sm" className="text-white" /></span>
          </div>
          {toReview.length > 0 && (
            <div className="bg-amber-400/25 rounded-2xl px-3 py-1.5 text-sm text-amber-100">
              ⚠️ {toReview.length} pra revisar
            </div>
          )}
        </div>
      </motion.div>

      {/* Warning if many non-essential */}
      {toReview.length > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3.5 text-sm text-amber-700 dark:text-amber-400">
          💡 Você tem <strong>{toReview.length} assinaturas não essenciais</strong>. Ainda valem todas elas?
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {active.map((sub, i) => {
          const annual = yearlyAmount(sub.amount, sub.frequency)
          const emoji = getEmoji(sub.name)
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border bg-card p-4 flex items-center gap-3 ${!sub.is_essential ? "border-amber-200 dark:border-amber-800" : ""}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center text-2xl shrink-0">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{sub.name}</p>
                  {sub.is_essential ? (
                    <span className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">✅ essencial</span>
                  ) : (
                    <span className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">⚠️ revisar</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Próx. {formatRelativeDate(sub.next_billing)} · {freqLabel[sub.frequency]}
                </p>
                <p className="text-xs text-muted-foreground">R$ {annual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} por ano</p>
              </div>
              <div className="text-right shrink-0">
                <MoneyText value={sub.amount} size="sm" className="font-bold" />
                <p className="text-xs text-muted-foreground">{freqLabel[sub.frequency]}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
