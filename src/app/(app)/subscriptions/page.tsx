"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { createClient } from "@/lib/supabase/client"

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

function getEmoji(name: string) {
  const key = Object.keys(SUB_EMOJI).find((k) => name.toLowerCase().includes(k.toLowerCase()))
  return key ? SUB_EMOJI[key] : "📱"
}

export default function SubscriptionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
      setSubscriptions(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active = subscriptions.filter((s: any) => s.status === "active" || s.status == null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalMonthly = active.reduce((s: number, sub: any) => s + monthlyEquiv(sub.amount ?? 0, sub.billing_cycle ?? "monthly"), 0)
  const totalYearly = totalMonthly * 12

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
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Carregando assinaturas...</p>
        </div>
      ) : active.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">🔄</p>
          <p className="font-semibold mb-1">Nenhuma assinatura cadastrada!</p>
          <p className="text-sm text-muted-foreground mb-4">Adicione suas assinaturas para acompanhar os gastos recorrentes.</p>
          <Button className="gap-2 nexo-gradient border-0 text-white rounded-xl">
            <Plus className="size-4" />Adicionar assinatura
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {active.map((sub: any, i: number) => {
            const freq = sub.billing_cycle ?? "monthly"
            const annual = yearlyAmount(sub.amount ?? 0, freq)
            const emoji = getEmoji(sub.name ?? "")
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border bg-card p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center text-2xl shrink-0">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{sub.name}</p>
                    {sub.category && (
                      <span className="text-xs bg-muted/60 px-2 py-0.5 rounded-full">{sub.category}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {freqLabel[freq] ?? freq} · Dia {sub.billing_day ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">R$ {annual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} por ano</p>
                </div>
                <div className="text-right shrink-0">
                  <MoneyText value={sub.amount ?? 0} size="sm" className="font-bold" />
                  <p className="text-xs text-muted-foreground">{freqLabel[freq] ?? freq}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
