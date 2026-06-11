"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, CheckCircle, AlertTriangle, Clock, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// ─── helpers ──────────────────────────────────────────────────────────────────

const GOAL_EMOJI: Record<string, string> = {
  emergency: "🛡️", travel: "✈️", purchase: "🛍️", debt: "🔓", investment: "📈", other: "⭐",
}
const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: "🔥 Alta",  bg: "bg-red-50 dark:bg-red-950/30",    text: "text-red-600 dark:text-red-400" },
  medium: { label: "⚡ Média", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
  low:    { label: "🌿 Baixa", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400" },
}

function RingProgress({ percent, color, size = 56 }: { percent: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(percent / 100, 1) * circ
  const isOver = percent > 100
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg] shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/60" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={isOver ? "#ef4444" : percent > 80 ? "#f59e0b" : color}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} />
    </svg>
  )
}

// ─── tab: Sonhos ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabSonhos({ goals }: { goals: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalSaved  = goals.reduce((s: number, g: any) => s + (g.current_amount ?? 0), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalTarget = goals.reduce((s: number, g: any) => s + (g.target_amount ?? 0), 0)
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/70 text-sm mb-1">Total guardado</p>
        <MoneyText value={totalSaved} size="2xl" className="text-white font-black" />
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <motion.div className="bg-white rounded-full h-2" initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
          <span className="text-white/80 text-sm font-bold">{overallPct}%</span>
        </div>
        <p className="text-white/60 text-xs mt-1">de {formatCurrency(totalTarget)} em metas</p>
      </motion.div>

      {goals.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">🎯</p>
          <p className="font-semibold mb-1">Nenhuma meta cadastrada ainda</p>
          <p className="text-sm text-muted-foreground">Crie metas na aba Metas para acompanhar aqui.</p>
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        goals.map((goal: any, i: number) => {
          const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
          const remaining = goal.target_amount - goal.current_amount
          const priority = PRIORITY_CONFIG[goal.priority ?? "medium"]
          const monthsLeft = (goal.monthly_contribution ?? 0) > 0 ? Math.ceil(remaining / goal.monthly_contribution) : null

          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl shrink-0">
                  {GOAL_EMOJI[goal.type ?? "other"] ?? "⭐"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{goal.name}</p>
                </div>
                {priority && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priority.bg} ${priority.text}`}>
                    {priority.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="relative shrink-0">
                  <RingProgress percent={pct} color="#7c3aed" size={60} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black">{pct}%</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm flex-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guardado</span>
                    <span className="font-bold text-primary">{formatCurrency(goal.current_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faltam</span>
                    <span className="font-semibold">{formatCurrency(remaining)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
                  </div>
                </div>
              </div>

              {monthsLeft !== null && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-2xl px-3 py-2">
                  Guardando <strong className="text-foreground">{formatCurrency(goal.monthly_contribution ?? 0)}/mês</strong> você chega lá em{" "}
                  <strong className="text-foreground">{monthsLeft} meses</strong> 🚀
                </p>
              )}
              <button className="w-full mt-3 py-2.5 rounded-2xl border text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                + Registrar aporte
              </button>
            </motion.div>
          )
        })
      )}
    </div>
  )
}

// ─── tab: Meu Limite ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabLimite({ budgetItems, categories }: { budgetItems: any[]; categories: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = budgetItems.map((item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cat = categories.find((c: any) => c.id === item.category_id)
    const percent = item.amount_limit > 0 ? (item.amount_spent / item.amount_limit) * 100 : 0
    return { ...item, cat, percent }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overBudget = items.filter((i: any) => i.percent > 100)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLimit = items.reduce((s: number, i: any) => s + i.amount_limit, 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalSpent = items.reduce((s: number, i: any) => s + i.amount_spent, 0)

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border bg-card p-5">
        <p className="text-sm text-muted-foreground mb-1">Orçamento do mês</p>
        <div className="flex items-end gap-2 mb-3">
          <p className="text-3xl font-black">{formatCurrency(totalSpent)}</p>
          <p className="text-muted-foreground text-sm mb-1">de {formatCurrency(totalLimit)}</p>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="h-2.5 rounded-full transition-all"
            style={{ width: `${Math.min(totalLimit > 0 ? (totalSpent/totalLimit)*100 : 0, 100)}%`, background: totalSpent > totalLimit ? "#ef4444" : "#7c3aed" }} />
        </div>
        {overBudget.length > 0 && (
          <p className="text-xs text-red-500 mt-2">⚠️ {overBudget.length} categoria{overBudget.length > 1 ? "s" : ""} estourada{overBudget.length > 1 ? "s" : ""}</p>
        )}
      </motion.div>

      {items.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">💰</p>
          <p className="font-semibold mb-1">Nenhum item de orçamento cadastrado</p>
          <p className="text-sm text-muted-foreground">Configure seu orçamento na aba Orçamento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {items.map((item: any, i: number) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative shrink-0">
                  <RingProgress percent={item.percent} color={item.cat?.color ?? "#7c3aed"} size={44} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-black">{Math.round(item.percent)}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.cat?.name ?? item.category_id}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.amount_spent)} de {formatCurrency(item.amount_limit)}</p>
                </div>
                {item.percent > 100 && (
                  <span className="text-xs bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                    +{formatCurrency(item.amount_spent - item.amount_limit)}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(item.percent, 100)}%`, background: item.percent > 100 ? "#ef4444" : item.percent > 80 ? "#f59e0b" : item.cat?.color ?? "#7c3aed" }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── tab: Próximos Vencimentos ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabProximos({ transactions, cards }: { transactions: any[]; cards: any[] }) {
  const today = new Date()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: { label: string; amount: number; daysLeft: number; emoji: string; type: "expense" | "income" | "card" }[] = []

  // Recurring transactions → next occurrence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions.filter((t: any) => t.is_recurring).forEach((t: any) => {
    const day = new Date(t.date).getDate()
    let next = new Date(today.getFullYear(), today.getMonth(), day)
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day)
    const daysLeft = Math.ceil((next.getTime() - today.getTime()) / 86400000)
    if (daysLeft <= 60) {
      events.push({
        label: t.description,
        amount: t.amount,
        daysLeft,
        emoji: t.type === "income" ? "💚" : "🔴",
        type: t.type as "expense" | "income",
      })
    }
  })

  // Card due dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cards.forEach((card: any) => {
    let due = new Date(today.getFullYear(), today.getMonth(), card.due_day)
    if (due <= today) due = new Date(today.getFullYear(), today.getMonth() + 1, card.due_day)
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000)
    if (daysLeft <= 60) {
      events.push({
        label: `Fatura ${card.name}`,
        amount: card.limit_used ?? 0,
        daysLeft,
        emoji: "💳",
        type: "card",
      })
    }
  })

  events.sort((a, b) => a.daysLeft - b.daysLeft)
  const urgentCount = events.filter((e) => e.daysLeft <= 7).length

  return (
    <div className="space-y-4">
      {urgentCount > 0 && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3.5 text-sm text-red-600 dark:text-red-400">
          ⚡ <strong>{urgentCount} vencimento{urgentCount > 1 ? "s" : ""}</strong> nos próximos 7 dias
        </div>
      )}

      <div className="space-y-2">
        {events.map((ev, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-2xl border bg-card p-4 flex items-center gap-3 ${ev.daysLeft <= 7 ? "border-red-200 dark:border-red-800" : ""}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
              ev.daysLeft <= 7 ? "bg-red-50 dark:bg-red-950/30" : "bg-muted/50"
            }`}>{ev.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{ev.label}</p>
              <p className={`text-xs font-semibold ${ev.daysLeft <= 3 ? "text-red-500" : ev.daysLeft <= 7 ? "text-amber-500" : "text-muted-foreground"}`}>
                {ev.daysLeft === 0 ? "Vence hoje!" : ev.daysLeft === 1 ? "Vence amanhã!" : `em ${ev.daysLeft} dias`}
              </p>
            </div>
            <p className={`text-sm font-black shrink-0 ${ev.type === "income" ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
              {ev.type === "income" ? "+" : "-"}{formatCurrency(ev.amount)}
            </p>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold">Nenhum vencimento nos próximos 60 dias</p>
        </div>
      )}
    </div>
  )
}

// ─── tab: O que fazer ─────────────────────────────────────────────────────────

const TASK_PRIORITY: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  urgent_important: { label: "🔥 Urgente e Importante", icon: AlertTriangle },
  important:        { label: "⚡ Importante",           icon: Clock         },
  urgent:           { label: "⏰ Urgente",              icon: AlertTriangle },
  low:              { label: "📌 Baixa prioridade",     icon: ArrowDown     },
}

function TabOQueFazer() {
  // Local tasks state — no dedicated table, so use empty array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pending = tasks.filter((t: any) => t.status === "pending")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const done    = tasks.filter((t: any) => t.status === "done")

  const markDone = (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTasks((prev: any[]) => prev.map((t: any) => t.id === id ? { ...t, status: "done" as const } : t))

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-semibold mb-1">Nenhuma tarefa cadastrada ainda</p>
          <p className="text-sm text-muted-foreground">Em breve você poderá criar tarefas financeiras aqui.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{pending.length} pendentes</span>
            <span>·</span>
            <span>{done.length} concluídas</span>
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {pending.map((task: any, i: number) => {
            const p = TASK_PRIORITY[task.priority] ?? TASK_PRIORITY.low
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="rounded-2xl border bg-card p-4 flex items-start gap-3">
                <button onClick={() => markDone(task.id)}
                  className="w-5 h-5 rounded-full border-2 border-border mt-0.5 shrink-0 hover:border-primary transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                  <span className="text-[10px] font-semibold mt-1 inline-block text-muted-foreground">{p.label}</span>
                </div>
                {task.amount && (
                  <p className="text-sm font-bold text-primary shrink-0">{formatCurrency(task.amount)}</p>
                )}
              </motion.div>
            )
          })}

          {done.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 mt-2">Concluídas ✓</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {done.map((task: any) => (
                <div key={task.id} className="rounded-2xl border bg-card p-4 flex items-center gap-3 opacity-50 mb-2">
                  <CheckCircle className="size-5 text-green-500 shrink-0" />
                  <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "sonhos",   label: "🎯 Sonhos"              },
  { id: "limite",   label: "⚖️ Meu limite"           },
  { id: "proximos", label: "📅 Próximos vencimentos" },
  { id: "tarefas",  label: "📋 O que fazer"          },
] as const
type TabId = typeof TABS[number]["id"]

export default function PlanPage() {
  const [tab, setTab] = useState<TabId>("sonhos")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [goals, setGoals] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [
        { data: goalsData },
        { data: itemsData },
        { data: catsData },
        { data: txnsData },
        { data: cardsData },
      ] = await Promise.all([
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
        supabase.from("budget_items").select("*"),
        supabase.from("categories").select("*"),
        supabase.from("transactions").select("*").order("date", { ascending: false }).limit(200),
        supabase.from("credit_cards").select("*").eq("is_active", true),
      ])
      setGoals(goalsData ?? [])
      setBudgetItems(itemsData ?? [])
      setCategories(catsData ?? [])
      setTransactions(txnsData ?? [])
      setCards(cardsData ?? [])
    }
    load()
  }, [])

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Planejar</h1>
        <Button size="sm" className="gap-1.5 rounded-xl border-0 text-white shadow-sm shadow-primary/30"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          <Plus className="size-4" />Novo
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b mb-5 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === "sonhos"   && <TabSonhos goals={goals} />}
      {tab === "limite"   && <TabLimite budgetItems={budgetItems} categories={categories} />}
      {tab === "proximos" && <TabProximos transactions={transactions} cards={cards} />}
      {tab === "tarefas"  && <TabOQueFazer />}
    </div>
  )
}
