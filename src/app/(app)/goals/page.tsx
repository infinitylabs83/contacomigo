"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { createClient } from "@/lib/supabase/client"

const GOAL_EMOJI: Record<string, string> = {
  emergency: "🛡️", travel: "✈️", purchase: "🛍️", debt: "🔓", investment: "📈", other: "⭐",
}
const GOAL_LABEL: Record<string, string> = {
  emergency: "Reserva de Emergência", travel: "Viagem", purchase: "Compra Planejada",
  debt: "Quitar Dívida", investment: "Investimento", other: "Outro",
}
const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: "🔥 Alta", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400" },
  medium: { label: "⚡ Média", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
  low: { label: "🌿 Baixa", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400" },
}

export default function GoalsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false })
      setGoals(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalSaved = goals.reduce((s: number, g: any) => s + (g.current_amount ?? 0), 0)
  const totalTarget = goals.reduce((s: number, g: any) => s + (g.target_amount ?? 0), 0)
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Metas 🎯</h1>
          <p className="text-sm text-muted-foreground">Seus sonhos com prazo e progresso</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl nexo-gradient border-0 text-white shadow-sm shadow-primary/30">
          <Plus className="size-4" />Nova
        </Button>
      </div>

      {/* Hero summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl nexo-gradient p-6 text-white relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/70 text-sm mb-1">Total guardado</p>
        <MoneyText value={totalSaved} size="2xl" className="text-white font-black" />
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2.5">
            <motion.div
              className="bg-white rounded-full h-2.5"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <span className="text-white/80 text-sm font-bold">{overallPct}%</span>
        </div>
        <p className="text-white/60 text-xs mt-1">de <MoneyText value={totalTarget} size="sm" className="text-white/60" /> em metas</p>
      </motion.div>

      {loading ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Carregando metas...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">🎯</p>
          <p className="font-semibold mb-1">Ainda sem metas!</p>
          <p className="text-sm text-muted-foreground mb-4">Crie sua primeira meta e comece a guardar com propósito.</p>
          <Button className="gap-2 nexo-gradient border-0 text-white rounded-xl">
            <Plus className="size-4" />Criar primeira meta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {goals.map((goal: any, i: number) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const remaining = goal.target_amount - goal.current_amount
            const monthsLeft = goal.monthly_contribution
              ? Math.ceil(remaining / goal.monthly_contribution) : null
            const priority = PRIORITY_CONFIG[goal.priority] ?? PRIORITY_CONFIG.medium
            const ringCirc = 2 * Math.PI * 28
            const dash = (pct / 100) * ringCirc

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border bg-card p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${goal.color ?? "#8b5cf6"}20` }}
                  >
                    {GOAL_EMOJI[goal.type] ?? "⭐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">{GOAL_LABEL[goal.type] ?? "Meta"}</p>
                  </div>
                  {priority && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priority.bg} ${priority.text}`}>
                      {priority.label}
                    </span>
                  )}
                </div>

                {/* Ring + numbers */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/25" />
                      <circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke={goal.color ?? "#8b5cf6"}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${ringCirc - dash}`}
                        strokeDashoffset={ringCirc / 4}
                        style={{ transition: "stroke-dasharray 0.8s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guardado</span>
                      <span className="font-bold" style={{ color: goal.color ?? "#8b5cf6" }}>
                        <MoneyText value={goal.current_amount} size="sm" />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Faltam</span>
                      <span className="font-semibold"><MoneyText value={remaining} size="sm" /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-semibold"><MoneyText value={goal.target_amount} size="sm" /></span>
                    </div>
                  </div>
                </div>

                {/* Insight */}
                {monthsLeft && (
                  <div className="rounded-2xl bg-muted/40 px-3.5 py-2.5 text-sm">
                    <span className="text-muted-foreground">
                      Guardando <strong className="text-foreground">R$ {goal.monthly_contribution?.toFixed(0)}/mês</strong> você chega lá em{" "}
                      <strong className="text-foreground">{monthsLeft} {monthsLeft === 1 ? "mês" : "meses"}</strong> 🚀
                    </span>
                  </div>
                )}

                <Button size="sm" className="w-full rounded-xl" variant="outline">
                  + Registrar aporte
                </Button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
