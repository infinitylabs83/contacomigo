"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

function RingProgress({ percent, color, size = 64 }: { percent: number; color: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(percent / 100, 1) * circ
  const isOver = percent > 100

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/60" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={isOver ? "#ef4444" : percent > 80 ? "#f59e0b" : color}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  )
}

export default function BudgetsPage() {
  const now = new Date()
  const monthName = getMonthName(now.getMonth())
  const year = now.getFullYear()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: items }, { data: cats }] = await Promise.all([
        supabase.from("budget_items").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
      ])
      setBudgetItems(items ?? [])
      setCategories(cats ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = budgetItems.map((item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cat = categories.find((c: any) => c.id === item.category_id)
    const percent = item.amount_limit > 0 ? (item.amount_spent / item.amount_limit) * 100 : 0
    return {
      ...item,
      cat,
      percent,
      isOver: item.amount_spent > item.amount_limit,
      remaining: item.amount_limit - item.amount_spent,
    }
  }).sort((a: any, b: any) => b.percent - a.percent)

  const totalLimit = items.reduce((s: number, i: any) => s + i.amount_limit, 0)
  const totalSpent = items.reduce((s: number, i: any) => s + i.amount_spent, 0)
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  const overCount = items.filter((i: any) => i.isOver).length

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orçamento</h1>
          <p className="text-sm text-muted-foreground">{monthName} {year}</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl nexo-gradient border-0 text-white shadow-sm shadow-primary/30">
          <Plus className="size-4" />Nova
        </Button>
      </div>

      {/* Overview hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 ${overCount > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-green-50 dark:bg-green-950/20"}`}
      >
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <RingProgress percent={totalPercent} color="#8b5cf6" size={80} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{Math.round(totalPercent)}%</span>
            </div>
          </div>
          <div className="flex-1">
            {overCount > 0 ? (
              <p className="text-base font-bold text-red-600 dark:text-red-400">
                {overCount} {overCount === 1 ? "categoria estourada" : "categorias estouradas"} 😬
              </p>
            ) : (
              <p className="text-base font-bold text-green-700 dark:text-green-400">
                {items.length === 0 ? "Nenhum orçamento ainda" : "Dentro do limite! 🎉"}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{formatCurrency(totalSpent)}</span>
              {" "}de{" "}
              <span className="font-semibold text-foreground">{formatCurrency(totalLimit)}</span>
              {" "}gastos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sobram {formatCurrency(Math.max(totalLimit - totalSpent, 0))} no orçamento total
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Carregando orçamento...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">💰</p>
          <p className="font-semibold mb-1">Nenhum item de orçamento cadastrado!</p>
          <p className="text-sm text-muted-foreground mb-4">Crie categorias de orçamento para controlar seus gastos.</p>
          <Button className="gap-2 nexo-gradient border-0 text-white rounded-xl">
            <Plus className="size-4" />Criar orçamento
          </Button>
        </div>
      ) : (
        <>
          {/* Category cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {items.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-3xl border bg-card p-4 flex items-center gap-4 ${item.isOver ? "border-red-200 dark:border-red-900" : ""}`}
              >
                {/* Ring */}
                <div className="relative shrink-0">
                  <RingProgress percent={item.percent} color={item.cat?.color ?? "#6b7280"} size={56} />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">
                    {item.cat?.icon ?? "💸"}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.cat?.name ?? "Outros"}</span>
                    {item.isOver && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                        Estourado
                      </span>
                    )}
                    {!item.isOver && item.percent >= 80 && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                        Quase lá
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.isOver
                      ? `⚠️ Passou ${formatCurrency(Math.abs(item.remaining))} do limite`
                      : item.remaining === 0
                      ? "✅ Limite exato!"
                      : `Restam ${formatCurrency(item.remaining)}`}
                  </p>
                </div>

                {/* Values */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${item.isOver ? "text-red-500" : ""}`}>
                    {formatCurrency(item.amount_spent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    de {formatCurrency(item.amount_limit)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="w-full py-3 rounded-2xl border-2 border-dashed border-muted-foreground/20 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            + Copiar orçamento do mês anterior
          </button>
        </>
      )}
    </div>
  )
}
