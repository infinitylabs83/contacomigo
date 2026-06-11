"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Calendar, ArrowUp, ArrowDown, Pencil, Trash2, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { formatCurrency, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { TransactionType, Transaction, Category, Account, CreditCard } from "@/types"

// ─── color / emoji maps ────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  "cat-food": "#F97316", "cat-market": "#84CC16", "cat-transport": "#3B82F6",
  "cat-leisure": "#EC4899", "cat-health": "#EF4444", "cat-subs": "#0EA5E9",
  "cat-education": "#8B5CF6", "cat-other": "#9CA3AF", "cat-housing": "#6B7280",
  "cat-gym": "#F59E0B", "cat-internet": "#14B8A6",
  "__none__": "#7c3aed",
}
const CAT_EMOJI: Record<string, string> = {
  "cat-food": "🍔", "cat-market": "🛒", "cat-transport": "🚗", "cat-leisure": "🎮",
  "cat-health": "💊", "cat-subs": "📱", "cat-education": "📚", "cat-other": "💸",
  "cat-housing": "🏠", "cat-salary": "💼", "cat-freelance": "💻", "cat-reimbursement": "🔄",
  "cat-gym": "🏋️", "cat-internet": "📶",
  "__none__": "💸",
}
const DAY_LABELS  = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

// ─── helpers ──────────────────────────────────────────────────────────────────
function getMondayOf(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function buildDailyData(weekOffset: number, txns: any[] = []) {
  const today  = new Date()
  const monday = getMondayOf(today)
  monday.setDate(monday.getDate() + weekOffset * 7)
  const expTxns  = txns.filter(t => t.type === "expense")
  const rawCatIds = [...new Set(expTxns.map((t: any) => t.category_id ?? "__none__"))] as string[]
  const todayStr = today.toISOString().slice(0, 10)

  return Array.from({ length: 7 }, (_, i) => {
    const date    = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const row: Record<string, unknown> = {
      day: DAY_LABELS[i], date: dateStr,
      dayNum: date.getDate(), month: date.getMonth() + 1,
      isToday: dateStr === todayStr,
      isFuture: date > today,
    }
    rawCatIds.forEach(cid => {
      row[cid] = expTxns
        .filter(t => t.date === dateStr && (t.category_id ?? "__none__") === cid)
        .reduce((s, t) => s + t.amount, 0)
    })
    return row
  })
}

function getWeekTotal(weekOffset: number, txns: any[] = []) {
  const today  = new Date()
  const monday = getMondayOf(today)
  monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  return txns
    .filter((t: any) => t.type === "expense")
    .filter((t: any) => { const d = new Date(t.date); return d >= monday && d <= sunday })
    .reduce((s: number, t: any) => s + t.amount, 0)
}

function getWeekLabel(weekOffset: number) {
  const today  = new Date()
  const monday = getMondayOf(today)
  monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  if (weekOffset === 0)  return "Esta semana"
  if (weekOffset === -1) return "Semana passada"
  return `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()]} – ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()]}`
}

// Monthly evolution — last 5 months
function buildMonthlyEvolution(txns: any[] = []) {
  const today = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (4 - i), 1)
    const y = d.getFullYear(); const m = d.getMonth()
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`
    const gastos  = txns
      .filter((t: any) => t.type === "expense" && t.date.startsWith(prefix))
      .reduce((s: number, t: any) => s + t.amount, 0)
    const entradas = txns
      .filter((t: any) => t.type === "income" && t.date.startsWith(prefix))
      .reduce((s: number, t: any) => s + t.amount, 0)
    const isCurrent = m === today.getMonth() && y === today.getFullYear()
    return { label: MONTH_NAMES[m], gastos, entradas, isCurrent }
  })
}

// Calendar helpers
function getCalendarWeeks(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const weeks: Date[][] = []
  let week: Date[] = []
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1
  for (let i = 0; i < startDay; i++) week.push(new Date(year, month, 1 - startDay + i))
  for (let d = 1; d <= last.getDate(); d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) { const l = week[week.length-1]; const n = new Date(l); n.setDate(l.getDate()+1); week.push(n) }
    weeks.push(week)
  }
  return weeks
}

const FILTERS = [
  { key: "all",      label: "Tudo"       },
  { key: "income",   label: "💚 Entrou"  },
  { key: "expense",  label: "🔴 Saiu"    },
  { key: "credit",   label: "💳 Crédito" },
  { key: "recurring",label: "🔁 Fixo"    },
] as const
type FilterKey = typeof FILTERS[number]["key"]

const BUDGET_CATS = [
  { id: "food",      emoji: "🍔", label: "Comida" },
  { id: "market",    emoji: "🛒", label: "Mercado" },
  { id: "transport", emoji: "🚗", label: "Transporte" },
  { id: "housing",   emoji: "🏠", label: "Moradia" },
  { id: "health",    emoji: "💊", label: "Saúde" },
  { id: "leisure",   emoji: "🎮", label: "Lazer" },
  { id: "subs",      emoji: "📱", label: "Assinatura" },
  { id: "education", emoji: "📚", label: "Estudo" },
  { id: "pet",       emoji: "🐾", label: "Pet" },
  { id: "other",     emoji: "💸", label: "Outros" },
]
// ─── Expectativa x Realidade ──────────────────────────────────────────────────
function BudgetVsReal({ transactions }: { transactions: any[] }) {
  const [dbRows, setDbRows]   = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newCat, setNewCat]   = useState(BUDGET_CATS[0].id)
  const [newAmt, setNewAmt]   = useState("")
  const [saving, setSaving]   = useState(false)

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const loadLimits = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("budget_limits")
      .select("*")
      .eq("month", month)
      .eq("year", year)
    setDbRows(data ?? [])
  }

  useEffect(() => { loadLimits() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddLimit = async () => {
    const amt = parseFloat(newAmt.replace(",", "."))
    if (!amt || amt <= 0) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const cat = BUDGET_CATS.find(c => c.id === newCat)!
    await supabase.from("budget_limits").upsert({
      user_id:        user.id,
      month,
      year,
      category_key:   cat.id,
      category_emoji: cat.emoji,
      category_label: cat.label,
      amount_limit:   amt,
      updated_at:     new Date().toISOString(),
    }, { onConflict: "user_id,month,year,category_key" })
    setNewAmt(""); setShowAdd(false); setSaving(false)
    loadLimits()
  }

  const handleRemove = async (categoryKey: string) => {
    const supabase = createClient()
    await supabase.from("budget_limits")
      .delete()
      .eq("category_key", categoryKey)
      .eq("month", month)
      .eq("year", year)
    setDbRows(prev => prev.filter(r => r.category_key !== categoryKey))
  }

  // Compute actual spending this month from transactions, matched by emoji in notes
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`
  const spent: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type !== "expense") continue
    if (!(t.date ?? "").startsWith(monthPrefix)) continue
    const emoji = t.notes?.includes("|") ? t.notes.split("|")[0] : null
    if (!emoji) continue
    const cat = BUDGET_CATS.find(c => c.emoji === emoji)
    if (cat) spent[cat.id] = (spent[cat.id] ?? 0) + t.amount
  }

  // Build rows from DB limits + any spending without a limit
  const limitedKeys = new Set(dbRows.map((r: any) => r.category_key))
  const spentOnlyKeys = Object.keys(spent).filter(k => !limitedKeys.has(k))

  const rows = [
    ...dbRows.map((r: any) => {
      const actual = spent[r.category_key] ?? 0
      const limit  = Number(r.amount_limit)
      const pct    = limit > 0 ? (actual / limit) * 100 : 0
      return { id: r.category_key, emoji: r.category_emoji, label: r.category_label, limit, actual, pct, over: limit > 0 && actual > limit }
    }),
    ...spentOnlyKeys.map(k => {
      const cat = BUDGET_CATS.find(c => c.id === k)
      return { id: k, emoji: cat?.emoji ?? "💸", label: cat?.label ?? k, limit: 0, actual: spent[k], pct: 0, over: false }
    }),
  ].sort((a, b) => b.pct - a.pct)

  const totalLimit = rows.reduce((s, r) => s + r.limit, 0)
  const totalSpent = rows.reduce((s, r) => s + r.actual, 0)
  const totalPct   = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  const overCount  = rows.filter(r => r.over).length

  return (
    <div className="rounded-3xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-base">🎯 Esperava vs Gastou</p>
          <p className="text-xs text-muted-foreground">Quanto você planejou gastar x quanto saiu de verdade este mês.</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: showAdd ? "#f3f4f6" : "rgba(124,58,237,0.1)", color: showAdd ? "#6b7280" : "#7c3aed" }}>
          {showAdd ? "✕ Cancelar" : "+ Adicionar limite"}
        </button>
      </div>

      {/* Add limit form */}
      {showAdd && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(124,58,237,0.05)", border: "1.5px solid rgba(124,58,237,0.15)" }}>
          <p className="text-sm font-bold">Defina quanto quer gastar este mês:</p>
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            className="w-full rounded-xl border px-3 h-11 text-sm bg-card">
            {BUDGET_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
            <input
              type="number" inputMode="decimal" placeholder="0,00"
              value={newAmt} onChange={e => setNewAmt(e.target.value)}
              className="w-full pl-9 h-11 rounded-xl border text-sm bg-card px-3"
            />
          </div>
          <button onClick={handleAddLimit} disabled={!newAmt || saving}
            className="w-full h-10 rounded-xl text-white text-sm font-bold disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            {saving ? "Salvando..." : "✓ Salvar limite"}
          </button>
        </div>
      )}

      {/* Total header — only if limits exist */}
      {totalLimit > 0 && (
        <div className={`rounded-2xl p-4 flex items-center justify-between ${
          totalPct > 100 ? "bg-red-50" : totalPct > 85 ? "bg-amber-50" : "bg-green-50"
        }`}>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Total do mês</p>
            <p className="font-black text-lg">
              {formatCurrency(totalSpent)}
              <span className="text-sm font-normal text-muted-foreground"> / {formatCurrency(totalLimit)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${totalPct > 100 ? "text-red-500" : totalPct > 85 ? "text-amber-500" : "text-green-600"}`}>
              {totalPct.toFixed(0)}%
            </p>
            {overCount > 0 && <p className="text-xs text-red-500">{overCount} categoria{overCount > 1 ? "s" : ""} estourou</p>}
          </div>
        </div>
      )}

      {/* Per category rows */}
      <div className="space-y-3">
        {rows.map(row => {
          const barW = Math.min(row.pct, 100)
          const barColor = row.over ? "#ef4444" : row.pct > 85 ? "#f59e0b" : "#7c3aed"
          return (
            <div key={row.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">{row.emoji} {row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatCurrency(row.actual)}</span>
                  {row.limit > 0 && <>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(row.limit)}</span>
                    <span className={`text-xs font-bold ${row.over ? "text-red-500" : "text-green-600"}`}>
                      {row.over ? `+${(row.pct - 100).toFixed(0)}%` : `-${(100 - row.pct).toFixed(0)}%`}
                    </span>
                  </>}
                  <button onClick={() => handleRemove(row.id)} className="text-muted-foreground hover:text-red-500 text-xs ml-1">✕</button>
                </div>
              </div>
              {row.limit > 0 && (
                <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ background: barColor }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {rows.length === 0 && !showAdd && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Toque em <strong>+ Adicionar limite</strong> para definir quanto quer gastar por categoria.
        </p>
      )}
    </div>
  )
}

// ─── Transaction Edit Sheet ───────────────────────────────────────────────────

const ALL_CATS = [
  { id: "cat-food",      emoji: "🍔", label: "Comida",      type: "expense" },
  { id: "cat-market",    emoji: "🛒", label: "Mercado",     type: "expense" },
  { id: "cat-transport", emoji: "🚗", label: "Transporte",  type: "expense" },
  { id: "cat-housing",   emoji: "🏠", label: "Moradia",     type: "expense" },
  { id: "cat-health",    emoji: "💊", label: "Saúde",       type: "expense" },
  { id: "cat-pet",       emoji: "🐾", label: "Pet",         type: "expense" },
  { id: "cat-leisure",   emoji: "🎮", label: "Lazer",       type: "expense" },
  { id: "cat-subs",      emoji: "📱", label: "Assinatura",  type: "expense" },
  { id: "cat-education", emoji: "📚", label: "Estudo",      type: "expense" },
  { id: "cat-tax",       emoji: "📄", label: "Impostos",    type: "expense" },
  { id: "cat-other",     emoji: "💸", label: "Outros",      type: "expense" },
  { id: "cat-salary",    emoji: "💼", label: "Salário",     type: "income"  },
  { id: "cat-freelance", emoji: "💻", label: "Freela",      type: "income"  },
  { id: "cat-investment",emoji: "📈", label: "Rendimento",  type: "income"  },
  { id: "cat-sale",      emoji: "🤝", label: "Venda",       type: "income"  },
  { id: "cat-gift",      emoji: "🎁", label: "Presente",    type: "income"  },
  { id: "cat-other-in",  emoji: "💰", label: "Outros",      type: "income"  },
]

function TransactionEditSheet({ transaction, accounts, onClose, onSaved, onDeleted }: {
  transaction: any
  accounts: any[]
  onClose: () => void
  onSaved: (updated: any) => void
  onDeleted: (id: string) => void
}) {
  const notesParts = transaction.notes?.includes("|") ? transaction.notes.split("|") : null
  const initEmoji  = notesParts?.[0] ?? (transaction.type === "income" ? "💚" : "💸")
  const initCatId  = ALL_CATS.find(c => c.emoji === initEmoji && c.type === transaction.type)?.id ?? ""

  const [description, setDescription] = useState<string>(transaction.description ?? "")
  const [amount, setAmount]           = useState<string>(String(transaction.amount ?? ""))
  const [date, setDate]               = useState<string>(transaction.date ?? "")
  const [accountId, setAccountId]     = useState<string>(transaction.account_id ?? "")
  const [catId, setCatId]             = useState<string>(initCatId)
  const [isRecurring, setIsRecurring] = useState<boolean>(!!transaction.is_recurring)
  const [saving, setSaving]           = useState(false)
  const [confirming, setConfirming]   = useState(false)

  const cats = ALL_CATS.filter(c => c.type === transaction.type)
  const selectedCat = ALL_CATS.find(c => c.id === catId)

  async function handleSave() {
    const parsed = parseFloat(String(amount).replace(",", "."))
    if (!parsed || parsed <= 0) return
    setSaving(true)
    const supabase = createClient()
    const notes = selectedCat ? `${selectedCat.emoji}|${selectedCat.label}` : transaction.notes
    const { data, error } = await supabase.from("transactions").update({
      description: description.trim() || transaction.description,
      amount: parsed,
      date,
      account_id: accountId || transaction.account_id,
      is_recurring: isRecurring,
      notes,
    }).eq("id", transaction.id).select().single()
    setSaving(false)
    if (!error && data) { onSaved(data); window.dispatchEvent(new CustomEvent("transaction-added")) }
  }

  async function handleDelete() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transaction.id)
      .eq("user_id", transaction.user_id)
    setSaving(false)
    if (error) {
      alert(`Erro ao apagar: ${error.message}`)
      setConfirming(false)
      return
    }
    onDeleted(transaction.id)
    window.dispatchEvent(new CustomEvent("transaction-added"))
  }

  const isIncome = transaction.type === "income"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-lg bg-card rounded-t-3xl shadow-2xl pb-10"
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="px-5 pb-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCat?.emoji ?? initEmoji}</span>
              <div>
                <p className="font-black text-base">Editar lançamento</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>{isIncome ? "💚 Entrada" : "🔴 Saída"}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted">
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Categoria</p>
            <div className="grid grid-cols-4 gap-2">
              {cats.map(c => (
                <button key={c.id} onClick={() => setCatId(c.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${
                    catId === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground"
                  }`}>
                  <span className="text-lg">{c.emoji}</span>
                  <span className="leading-tight text-center">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Descrição</p>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Netflix, almoço, salário..." autoComplete="off"
              className="w-full h-11 rounded-2xl border px-4 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Valor (R$)</p>
              <input value={amount} onChange={e => setAmount(e.target.value)}
                inputMode="decimal" placeholder="0,00"
                className="w-full h-11 rounded-2xl border px-4 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Data</p>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full h-11 rounded-2xl border px-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>

          {/* Account */}
          {accounts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Conta</p>
              <div className="flex gap-2 flex-wrap">
                {accounts.map(a => (
                  <button key={a.id} onClick={() => setAccountId(a.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border-2 transition-all ${
                      accountId === a.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                    }`}>{a.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring */}
          <button onClick={() => setIsRecurring(v => !v)}
            className={`flex items-center gap-2.5 w-full p-3 rounded-2xl border-2 text-left transition-all ${
              isRecurring ? "border-primary bg-primary/8" : "border-border/50 bg-muted/20"
            }`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              isRecurring ? "border-primary bg-primary" : "border-muted-foreground"
            }`}>
              {isRecurring && <Check className="size-3 text-white" />}
            </div>
            <p className={`text-xs font-bold ${isRecurring ? "text-primary" : "text-foreground"}`}>
              🔁 Recorrente — aparece em "Assino todo mês"
            </p>
          </button>

          {/* Actions */}
          {confirming ? (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 p-4 space-y-3">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 text-center">Apagar este lançamento?</p>
              <p className="text-xs text-muted-foreground text-center">O saldo da conta será ajustado automaticamente.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)}
                  className="flex-1 h-10 rounded-2xl border text-sm font-semibold hover:bg-muted">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 h-10 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Apagando..." : "Apagar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
                <Trash2 className="size-3.5" />Apagar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-12 rounded-2xl text-white font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                {saving ? "Salvando..." : <><Check className="size-4" />Salvar alterações</>}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [search, setSearch]         = useState("")
  const [filter, setFilter]         = useState<FilterKey>("all")
  const [weekOffset, setWeekOffset] = useState(0)
  const [showCal, setShowCal]       = useState(false)
  const [calYear, setCalYear]       = useState(new Date().getFullYear())
  const [calMonth, setCalMonth]     = useState(new Date().getMonth())

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [allCategories, setAllCategories]     = useState<Category[]>([])
  const [allAccounts, setAllAccounts]         = useState<Account[]>([])
  const [allCards, setAllCards]               = useState<CreditCard[]>([])
  const [loading, setLoading]                 = useState(true)
  const [editingTx, setEditingTx]             = useState<Transaction | null>(null)

  const fetchData = () => {
    const supabase = createClient()
    Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("accounts").select("*"),
      supabase.from("credit_cards").select("*"),
    ]).then(([t, c, a, cc]) => {
      setAllTransactions(t.data ?? [])
      setAllCategories(c.data ?? [])
      setAllAccounts(a.data ?? [])
      setAllCards(cc.data ?? [])
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
    window.addEventListener("transaction-added", fetchData)
    return () => window.removeEventListener("transaction-added", fetchData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dailyData  = buildDailyData(weekOffset, allTransactions)
  const weekLabel  = getWeekLabel(weekOffset)
  const thisWeek   = getWeekTotal(weekOffset, allTransactions)
  const prevWeek   = getWeekTotal(weekOffset - 1, allTransactions)
  const weekDiff   = prevWeek > 0 ? ((thisWeek - prevWeek) / prevWeek) * 100 : 0
  const monthlyData = buildMonthlyEvolution(allTransactions)

  const catIds = [...new Set(allTransactions.filter(t => t.type === "expense").map(t => t.category_id ?? "__none__"))] as string[]
  const catTotals = catIds
    .map(id => ({ id, total: dailyData.reduce((s, row) => s + (Number(row[id]) || 0), 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
  const grandTotal = catTotals.reduce((s, c) => s + c.total, 0)

  const totalIncome   = allTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const cashExpense   = allTransactions.filter(t => t.type === "expense" && !t.card_id).reduce((s, t) => s + t.amount, 0)
  const creditExpense = allTransactions.filter(t => t.type === "expense" && !!t.card_id).reduce((s, t) => s + t.amount, 0)

  const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]))
  const accountMap  = Object.fromEntries(allAccounts.map(a => [a.id, a]))
  const cardMap     = Object.fromEntries(allCards.map(c => [c.id, c]))

  const transactions = allTransactions
    .filter(t => {
      if (filter === "credit")    return !!t.card_id
      if (filter === "recurring") return t.is_recurring
      if (filter === "all")       return true
      return t.type === (filter as TransactionType)
    })
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function jumpToWeek(date: Date) {
    const today = new Date(); today.setHours(0,0,0,0)
    const mondayToday  = getMondayOf(today)
    const mondayTarget = getMondayOf(date)
    setWeekOffset(Math.round((mondayTarget.getTime() - mondayToday.getTime()) / (7 * 86400000)))
    setShowCal(false)
  }

  const calWeeks  = getCalendarWeeks(calYear, calMonth)
  const todayStr  = new Date().toISOString().slice(0, 10)
  const monday    = getMondayOf(new Date()); monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday    = new Date(monday); sunday.setDate(monday.getDate() + 6)

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-5">

      {/* ─── DAILY CHART ─── */}
      <div className="rounded-3xl border bg-card p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-black text-base">📊 Onde foi seu dinheiro?</p>
            <p className="text-xs text-muted-foreground">Gastos por dia. Crédito contado no dia que você gastou.</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowCal(v => !v)}
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Calendar className="size-4" />
            </button>
            <AnimatePresence>
              {showCal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-10 z-50 bg-card border rounded-3xl shadow-xl p-4 w-72"
                >
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => { const d = new Date(calYear, calMonth-1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                      className="p-1 rounded-lg hover:bg-muted"><ChevronLeft className="size-4" /></button>
                    <span className="text-sm font-bold">{MONTH_NAMES[calMonth]} {calYear}</span>
                    <button onClick={() => { const d = new Date(calYear, calMonth+1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                      className="p-1 rounded-lg hover:bg-muted"><ChevronRight className="size-4" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {["S","T","Q","Q","S","S","D"].map((d,i) => (
                      <div key={i} className="text-[10px] text-muted-foreground font-semibold py-1">{d}</div>
                    ))}
                    {calWeeks.flat().map((date, i) => {
                      const ds = date.toISOString().slice(0, 10)
                      const inMonth = date.getMonth() === calMonth
                      const isHighlighted = date >= monday && date <= sunday && inMonth
                      const isToday = ds === todayStr
                      return (
                        <button key={i} onClick={() => jumpToWeek(date)}
                          className={`text-xs h-7 w-full rounded-lg transition-all font-semibold ${
                            isHighlighted ? "bg-primary text-white" :
                            isToday ? "ring-2 ring-primary text-primary" :
                            inMonth ? "hover:bg-muted text-foreground" : "text-muted-foreground/40"
                          }`}>{date.getDate()}</button>
                      )
                    })}
                  </div>
                  <button onClick={() => { setWeekOffset(0); setShowCal(false) }}
                    className="mt-3 w-full text-xs text-primary font-semibold py-1.5 rounded-xl hover:bg-primary/8">
                    Ir para esta semana
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Week nav + summary */}
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekOffset(v => v - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-3.5" />Anterior
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">{weekLabel}</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-sm font-black">{formatCurrency(thisWeek)}</span>
              {prevWeek > 0 && (
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  weekDiff > 0 ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                               : "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                }`}>
                  {weekDiff > 0 ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
                  {Math.abs(weekDiff).toFixed(0)}% vs anterior
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setWeekOffset(v => Math.min(v + 1, 0))}
            disabled={weekOffset >= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
            Próxima<ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Bar chart — 7 days, thin bars */}
        <div className="h-44">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barSize={22}>
              <XAxis
                dataKey="day"
                tick={({ x, y, payload, index }: any) => {
                  const row = dailyData[index]
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={12} textAnchor="middle" fontSize={11}
                        fill={row?.isToday ? "#7c3aed" : "#6b7280"}
                        fontWeight={row?.isToday ? 800 : 400}>{payload.value}</text>
                      <text x={0} y={0} dy={24} textAnchor="middle" fontSize={9} fill="#9ca3af">
                        {(row as any)?.dayNum}/{(row as any)?.month}
                      </text>
                    </g>
                  )
                }}
                height={32} axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v: unknown, name: unknown) => {
                  const cat = allCategories.find((c: any) => c.id === String(name))
                  return [formatCurrency(Number(v)), `${CAT_EMOJI[String(name)] ?? "💸"} ${cat?.name ?? String(name)}`]
                }}
                labelFormatter={(_: unknown, payload: readonly any[]) => {
                  if (payload?.[0]) { const r = payload[0].payload as any; return `${r.day}, ${r.dayNum}/${r.month}` }
                  return ""
                }}
                contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
              {catTotals.map((c, idx) => (
                <Bar key={c.id} dataKey={c.id} stackId="a"
                  fill={CAT_COLOR[c.id] ?? "#6b7280"}
                  radius={idx === catTotals.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
          {catTotals.map(c => {
            const cat = allCategories.find((x: any) => x.id === c.id)
            const pct = grandTotal > 0 ? Math.round((c.total / grandTotal) * 100) : 0
            return (
              <div key={c.id} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: CAT_COLOR[c.id] ?? "#6b7280" }} />
                <span className="text-muted-foreground truncate">{CAT_EMOJI[c.id] ?? "💸"} {cat?.name ?? c.id}</span>
                <span className="font-bold ml-auto shrink-0">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── MONTHLY EVOLUTION ─── */}
      <div className="rounded-3xl border bg-card p-5 space-y-4">
        <div>
          <p className="font-black text-base">📅 Evolução mensal</p>
          <p className="text-xs text-muted-foreground">Gastos e entradas dos últimos 5 meses.</p>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barSize={16} barGap={4}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v: unknown, name: unknown) =>
                  [formatCurrency(Number(v)), name === "gastos" ? "💸 Saiu" : "💚 Entrou"]
                }
                contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="entradas" fill="#10B981" radius={[4,4,0,0]} name="entradas" />
              <Bar dataKey="gastos"   fill="#7c3aed" radius={[4,4,0,0]} name="gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /><span className="text-muted-foreground">Entrou</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#7c3aed]" /><span className="text-muted-foreground">Saiu</span></div>
        </div>
      </div>

      {/* ─── EXPECTATIVA x REALIDADE ─── */}
      <BudgetVsReal transactions={allTransactions} />

      {/* ─── SUMMARY ─── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="size-3.5 text-green-500" />
            <p className="text-xs text-muted-foreground">Entrou</p>
          </div>
          <p className="text-sm font-black text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="size-3.5 text-red-500" />
            <p className="text-xs text-muted-foreground">Saiu (à vista)</p>
          </div>
          <p className="text-sm font-black text-red-500">{formatCurrency(cashExpense)}</p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: "#7c3aed18" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">💳</span>
            <p className="text-xs text-muted-foreground">No crédito</p>
          </div>
          <p className="text-sm font-black" style={{ color: "#7c3aed" }}>{formatCurrency(creditExpense)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">vai pra fatura</p>
        </div>
      </div>

      {/* ─── HISTORY ─── */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-10 rounded-2xl border-border/60"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  filter === key ? "text-white" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
                style={filter === key ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)" } : {}}
              >{label}</button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {transactions.map((t, i) => {
            const cat      = categoryMap[t.category_id]
            const acc      = accountMap[t.account_id]
            const card     = t.card_id ? cardMap[t.card_id] : null
            const isIncome = t.type === "income"

            // Category from DB or from notes field (saved by QuickAdd as "emoji|label")
            const notesParts  = t.notes?.includes("|") ? t.notes.split("|") : null
            const catEmoji    = cat ? (CAT_EMOJI[t.category_id] ?? "💸") : (notesParts?.[0] ?? (t.type === "income" ? "💚" : "💸"))
            const catLabel    = cat?.name ?? notesParts?.[1] ?? null
            const iconBg      = cat?.color ? `${cat.color}18` : isIncome ? "#10b98118" : "#7c3aed18"

            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border bg-card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors active:scale-[0.99]"
                onClick={() => setEditingTx(t as any)}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                     style={{ backgroundColor: iconBg }}>{catEmoji}</div>
                <div className="flex-1 min-w-0">
                  {catLabel ? (
                    <>
                      <p className="text-sm font-semibold truncate">{catLabel}</p>
                      {t.description && t.description !== catLabel && (
                        <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold truncate">{t.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{formatDate(t.date, "short")}</span>
                    {card && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#7c3aed18", color: "#7c3aed" }}>💳 {card.name}</span>}
                    {t.is_recurring && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">🔁 fixo</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isIncome ? "text-green-600 dark:text-green-400" : card ? "text-purple-600 dark:text-purple-400" : "text-foreground"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card ? "fatura" : acc ? acc.name.split(" ")[0] : ""}
                    </p>
                  </div>
                  <Pencil className="size-3.5 text-muted-foreground/50 shrink-0" />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {transactions.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhuma movimentação encontrada
          </div>
        )}
      </div>

      {/* Edit sheet */}
      <AnimatePresence>
        {editingTx && (
          <TransactionEditSheet
            transaction={editingTx}
            accounts={allAccounts}
            onClose={() => setEditingTx(null)}
            onSaved={updated => {
              setAllTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))
              setEditingTx(null)
            }}
            onDeleted={id => {
              setAllTransactions(prev => prev.filter(t => t.id !== id))
              setEditingTx(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
