"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, CheckCircle, AlertTriangle, Clock, ArrowDown, X, Pencil, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// ─── helpers ──────────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  { id: "emergency", label: "Reserva",     emoji: "🛡️" },
  { id: "travel",    label: "Viagem",       emoji: "✈️" },
  { id: "purchase",  label: "Compra",       emoji: "🛍️" },
  { id: "debt",      label: "Quitar dívida",emoji: "🔓" },
  { id: "investment",label: "Investimento", emoji: "📈" },
  { id: "other",     label: "Outro",        emoji: "⭐" },
]
const GOAL_EMOJI: Record<string, string> = Object.fromEntries(GOAL_TYPES.map(t => [t.id, t.emoji]))

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: "🔥 Alta",  bg: "bg-red-50 dark:bg-red-950/30",    text: "text-red-600 dark:text-red-400" },
  medium: { label: "⚡ Média", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
  low:    { label: "🌿 Baixa", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400" },
}

// Categories used in QuickAdd / budget_limits
const BUDGET_CATS = [
  { id: "cat-food",      emoji: "🍔", label: "Comida"     },
  { id: "cat-market",    emoji: "🛒", label: "Mercado"    },
  { id: "cat-transport", emoji: "🚗", label: "Transporte" },
  { id: "cat-housing",   emoji: "🏠", label: "Moradia"    },
  { id: "cat-health",    emoji: "💊", label: "Saúde"      },
  { id: "cat-leisure",   emoji: "🎮", label: "Lazer"      },
  { id: "cat-subs",      emoji: "📱", label: "Assinatura" },
  { id: "cat-education", emoji: "📚", label: "Estudo"     },
  { id: "cat-gym",       emoji: "🏋️", label: "Academia"   },
  { id: "cat-internet",  emoji: "📶", label: "Internet"   },
  { id: "cat-other",     emoji: "💸", label: "Outros"     },
]

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

// ─── Goal Sheet ───────────────────────────────────────────────────────────────

function GoalSheet({ goal, userId, onClose, onSave }: { goal?: any; userId: string; onClose: () => void; onSave: (g: any) => void }) {
  const [name, setName]           = useState(goal?.name ?? "")
  const [type, setType]           = useState(goal?.type ?? "other")
  const [target, setTarget]       = useState(goal ? String(goal.target_amount) : "")
  const [current, setCurrent]     = useState(goal ? String(goal.current_amount ?? 0) : "")
  const [monthly, setMonthly]     = useState(goal ? String(goal.monthly_contribution ?? "") : "")
  const [priority, setPriority]   = useState(goal?.priority ?? "medium")
  const [saving, setSaving]       = useState(false)
  const [err, setErr]             = useState("")

  async function handleSave() {
    if (!name.trim() || !target) { setErr("Preencha nome e valor da meta."); return }
    setSaving(true); setErr("")
    const supabase = createClient()
    const payload = {
      user_id: userId, name: name.trim(), type, priority,
      target_amount: parseFloat(target.replace(",", ".")),
      current_amount: parseFloat((current || "0").replace(",", ".")),
      monthly_contribution: parseFloat((monthly || "0").replace(",", ".")),
    }
    if (goal) {
      const { data, error } = await supabase.from("goals").update(payload).eq("id", goal.id).select().single()
      if (error) { setErr(`Erro: ${error.message}`); setSaving(false); return }
      if (data) { onSave(data); onClose() }
    } else {
      const { data, error } = await supabase.from("goals").insert(payload).select().single()
      if (error) { setErr(`Erro: ${error.message}`); setSaving(false); return }
      if (data) { onSave(data); onClose() }
    }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{goal ? "Editar meta" : "Nova meta"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo</p>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className={`flex items-center gap-1.5 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${
                  type === t.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nome da meta</p>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem pra Europa, Reserva de emergência..." className="rounded-2xl" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Valor da meta</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
              <Input value={target} onChange={e => setTarget(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Já guardei</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
              <Input value={current} onChange={e => setCurrent(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Quanto vou guardar por mês</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
            <Input value={monthly} onChange={e => setMonthly(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Prioridade</p>
          <div className="grid grid-cols-3 gap-2">
            {[["high","🔥 Alta"],["medium","⚡ Média"],["low","🌿 Baixa"]].map(([id, label]) => (
              <button key={id} onClick={() => setPriority(id)}
                className={`py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${
                  priority === id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>{label}</button>
            ))}
          </div>
        </div>

        {err && <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-2xl text-white font-black text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {saving ? "Salvando..." : goal ? "Salvar alterações" : "Criar meta"}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Aporte Sheet ─────────────────────────────────────────────────────────────

function AporteSheet({ goal, onClose, onSave }: { goal: any; onClose: () => void; onSave: (newAmount: number) => void }) {
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const val = parseFloat(amount.replace(",", "."))
    if (!val || val <= 0) return
    setSaving(true)
    const supabase = createClient()
    const newCurrent = (goal.current_amount ?? 0) + val
    const { error } = await supabase.from("goals").update({ current_amount: newCurrent }).eq("id", goal.id)
    setSaving(false)
    if (!error) { onSave(newCurrent); onClose() }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Registrar aporte</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground">Meta: <strong className="text-foreground">{goal.name}</strong> · {formatCurrency(goal.current_amount ?? 0)} de {formatCurrency(goal.target_amount)} guardado</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
          <Input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"
            placeholder="Quanto você guardou agora?" className="pl-10 rounded-2xl text-lg h-14 font-bold" autoFocus />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-2xl text-white font-black text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {saving ? "Salvando..." : "Confirmar aporte"}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── tab: Sonhos ──────────────────────────────────────────────────────────────

function TabSonhos({ goals, userId, onGoalsChange }: { goals: any[]; userId: string; onGoalsChange: (g: any[]) => void }) {
  const [sheet, setSheet]     = useState<"add" | any | null>(null)
  const [aporte, setAporte]   = useState<any | null>(null)

  const totalSaved  = goals.reduce((s, g) => s + (g.current_amount ?? 0), 0)
  const totalTarget = goals.reduce((s, g) => s + (g.target_amount ?? 0), 0)
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  function handleSaved(saved: any) {
    const idx = goals.findIndex(g => g.id === saved.id)
    onGoalsChange(idx >= 0 ? goals.map(g => g.id === saved.id ? saved : g) : [saved, ...goals])
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("goals").delete().eq("id", id)
    onGoalsChange(goals.filter(g => g.id !== id))
  }

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
          <p className="font-semibold mb-4">Nenhuma meta ainda</p>
          <button onClick={() => setSheet("add")}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Criar primeira meta
          </button>
        </div>
      ) : (
        goals.map((goal, i) => {
          const pct = goal.target_amount > 0 ? Math.round(((goal.current_amount ?? 0) / goal.target_amount) * 100) : 0
          const remaining = goal.target_amount - (goal.current_amount ?? 0)
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
                <button onClick={() => setSheet(goal)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => handleDelete(goal.id)} className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500">
                  <Trash2 className="size-3.5" />
                </button>
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
                    <span className="font-bold text-primary">{formatCurrency(goal.current_amount ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faltam</span>
                    <span className="font-semibold">{formatCurrency(Math.max(remaining, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
                  </div>
                </div>
              </div>

              {monthsLeft !== null && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-2xl px-3 py-2 mb-3">
                  Guardando <strong className="text-foreground">{formatCurrency(goal.monthly_contribution ?? 0)}/mês</strong> você chega em{" "}
                  <strong className="text-foreground">{monthsLeft} meses</strong> 🚀
                </p>
              )}
              <button onClick={() => setAporte(goal)}
                className="w-full py-2.5 rounded-2xl border border-primary/30 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                + Registrar aporte
              </button>
            </motion.div>
          )
        })
      )}

      <AnimatePresence>
        {sheet !== null && (
          <GoalSheet
            goal={sheet === "add" ? undefined : sheet}
            userId={userId}
            onClose={() => setSheet(null)}
            onSave={handleSaved}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {aporte !== null && (
          <AporteSheet
            goal={aporte}
            onClose={() => setAporte(null)}
            onSave={newAmount => {
              onGoalsChange(goals.map(g => g.id === aporte.id ? { ...g, current_amount: newAmount } : g))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Budget Sheet ─────────────────────────────────────────────────────────────

function BudgetSheet({ userId, month, year, existing, onClose, onSave }: {
  userId: string; month: number; year: number; existing: any[]; onClose: () => void; onSave: (row: any) => void
}) {
  const [cat, setCat]       = useState(BUDGET_CATS[0])
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState("")

  const availableCats = BUDGET_CATS.filter(c => !existing.find(e => e.category_key === c.id))

  async function handleSave() {
    const val = parseFloat(amount.replace(",", "."))
    if (!val || val <= 0) { setErr("Digite um valor válido."); return }
    setSaving(true); setErr("")
    const supabase = createClient()
    const { data, error } = await supabase.from("budget_limits").upsert({
      user_id: userId, month, year,
      category_key: cat.id, category_emoji: cat.emoji, category_label: cat.label,
      amount_limit: val,
    }, { onConflict: "user_id,month,year,category_key" }).select().single()
    if (error) { setErr(`Erro: ${error.message}`); setSaving(false); return }
    if (data) { onSave(data); onClose() }
    setSaving(false)
  }

  if (availableCats.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 text-center space-y-4"
          onClick={e => e.stopPropagation()}>
          <p className="text-4xl">✅</p>
          <p className="font-bold">Todas as categorias já têm limite definido!</p>
          <p className="text-sm text-muted-foreground">Clique no lápis de uma categoria para editar seu limite.</p>
          <button onClick={onClose} className="w-full h-11 rounded-2xl bg-muted font-semibold text-sm">Fechar</button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Definir limite mensal</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Categoria</p>
          <div className="grid grid-cols-3 gap-2">
            {availableCats.map(c => (
              <button key={c.id} onClick={() => setCat(c)}
                className={`flex items-center gap-1.5 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${
                  cat.id === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>
                <span>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Limite mensal para {cat.emoji} {cat.label}</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
            <Input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"
              placeholder="0,00" className="pl-10 rounded-2xl text-lg h-14 font-bold" autoFocus />
          </div>
        </div>
        {err && <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-2xl text-white font-black text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {saving ? "Salvando..." : "Definir limite"}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── tab: Meu Limite ──────────────────────────────────────────────────────────

function TabLimite({ userId }: { userId: string }) {
  const [limits, setLimits]     = useState<any[]>([])
  const [txns, setTxns]         = useState<any[]>([])
  const [sheet, setSheet]       = useState(false)

  useEffect(() => {
    const handler = () => setSheet(true)
    window.addEventListener("plan-add-limite", handler)
    return () => window.removeEventListener("plan-add-limite", handler)
  }, [])
  const [editingLimit, setEditingLimit] = useState<any | null>(null)
  const [editAmount, setEditAmount]     = useState("")

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const supabase = createClient()
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`
    const monthEnd   = new Date(year, month, 0).toISOString().split("T")[0]
    const [{ data: limData }, { data: txData }] = await Promise.all([
      supabase.from("budget_limits").select("*").eq("month", month).eq("year", year),
      supabase.from("transactions").select("amount,notes").eq("type", "expense")
        .gte("date", monthStart).lte("date", monthEnd),
    ])
    setLimits(limData ?? [])
    setTxns(txData ?? [])
  }

  // Calculate spending per category from transactions this month
  const spendingByCategory: Record<string, number> = {}
  for (const t of txns) {
    if (!t.notes?.includes("|")) continue
    const catKey = t.notes.split("|")[1] // label
    // Match by label
    const cat = BUDGET_CATS.find(c => c.label === catKey)
    if (cat) spendingByCategory[cat.id] = (spendingByCategory[cat.id] ?? 0) + t.amount
  }

  const items = limits.map(l => ({
    ...l,
    amount_spent: spendingByCategory[l.category_key] ?? 0,
    percent: l.amount_limit > 0 ? ((spendingByCategory[l.category_key] ?? 0) / l.amount_limit) * 100 : 0,
  }))

  const overBudget  = items.filter(i => i.percent > 100)
  const totalLimit  = items.reduce((s, i) => s + i.amount_limit, 0)
  const totalSpent  = items.reduce((s, i) => s + i.amount_spent, 0)

  async function handleEditSave(lim: any) {
    const val = parseFloat(editAmount.replace(",", "."))
    if (!val || val <= 0) return
    const supabase = createClient()
    await supabase.from("budget_limits").update({ amount_limit: val }).eq("id", lim.id)
    setLimits(prev => prev.map(l => l.id === lim.id ? { ...l, amount_limit: val } : l))
    setEditingLimit(null)
  }

  async function handleDeleteLimit(id: string) {
    const supabase = createClient()
    await supabase.from("budget_limits").delete().eq("id", id)
    setLimits(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border bg-card p-5">
        <p className="text-sm text-muted-foreground mb-1">Orçamento — {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
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

      <div className="rounded-2xl bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
        💡 Os gastos são calculados automaticamente a partir dos seus lançamentos do mês atual.
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">💰</p>
          <p className="font-semibold mb-4">Nenhum limite definido ainda</p>
          <button onClick={() => setSheet(true)}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Definir primeiro limite
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="rounded-2xl border bg-card p-4">
              {editingLimit?.id === item.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.category_emoji}</span>
                  <span className="text-sm font-semibold flex-1">{item.category_label}</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                    <Input value={editAmount} onChange={e => setEditAmount(e.target.value)} inputMode="decimal"
                      className="pl-7 rounded-xl h-8 text-sm w-28" autoFocus />
                  </div>
                  <button onClick={() => handleEditSave(item)} className="p-1.5 rounded-xl bg-primary text-white"><Check className="size-3.5" /></button>
                  <button onClick={() => setEditingLimit(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-3.5" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative shrink-0">
                      <RingProgress percent={item.percent} color="#7c3aed" size={44} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-black">{Math.round(item.percent)}%</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.category_emoji} {item.category_label}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.amount_spent)} de {formatCurrency(item.amount_limit)}</p>
                    </div>
                    {item.percent > 100 && (
                      <span className="text-xs bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                        +{formatCurrency(item.amount_spent - item.amount_limit)}
                      </span>
                    )}
                    <button onClick={() => { setEditingLimit(item); setEditAmount(String(item.amount_limit)) }}
                      className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => handleDeleteLimit(item.id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(item.percent, 100)}%`, background: item.percent > 100 ? "#ef4444" : item.percent > 80 ? "#f59e0b" : "#7c3aed" }} />
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {sheet && (
          <BudgetSheet
            userId={userId} month={month} year={year} existing={limits}
            onClose={() => setSheet(false)}
            onSave={row => { setLimits(prev => [...prev, row]); setSheet(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── tab: Próximos Vencimentos ────────────────────────────────────────────────

function TabProximos({ transactions, cards }: { transactions: any[]; cards: any[] }) {
  const today = new Date()
  const events: { label: string; amount: number; daysLeft: number; emoji: string; type: "expense" | "income" | "card" }[] = []

  transactions.filter(t => t.is_recurring).forEach(t => {
    const day = new Date(t.date).getDate()
    let next = new Date(today.getFullYear(), today.getMonth(), day)
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day)
    const daysLeft = Math.ceil((next.getTime() - today.getTime()) / 86400000)
    if (daysLeft <= 60) {
      events.push({ label: t.description, amount: t.amount, daysLeft, emoji: t.type === "income" ? "💚" : "🔴", type: t.type })
    }
  })

  cards.forEach(card => {
    let due = new Date(today.getFullYear(), today.getMonth(), card.due_day)
    if (due <= today) due = new Date(today.getFullYear(), today.getMonth() + 1, card.due_day)
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000)
    if (daysLeft <= 60) {
      events.push({ label: `Fatura ${card.name}`, amount: card.limit_used ?? 0, daysLeft, emoji: "💳", type: "card" })
    }
  })

  events.sort((a, b) => a.daysLeft - b.daysLeft)
  const urgentCount = events.filter(e => e.daysLeft <= 7).length

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
        💡 Alimentado automaticamente pelas transações com <strong className="text-foreground">recorrente ativado</strong> e vencimentos dos seus cartões.
      </div>

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

// ─── Task Sheet ───────────────────────────────────────────────────────────────

function TaskSheet({ userId, onClose, onSave }: { userId: string; onClose: () => void; onSave: (t: any) => void }) {
  const [title, setTitle]       = useState("")
  const [desc, setDesc]         = useState("")
  const [priority, setPriority] = useState("important")
  const [amount, setAmount]     = useState("")
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState("")

  const PRIORITIES = [
    { id: "urgent_important", label: "🔥 Urgente e Importante" },
    { id: "important",        label: "⚡ Importante" },
    { id: "urgent",           label: "⏰ Urgente" },
    { id: "low",              label: "📌 Baixa" },
  ]

  async function handleSave() {
    if (!title.trim()) { setErr("Digite um título."); return }
    setSaving(true); setErr("")
    const supabase = createClient()
    const payload: any = {
      user_id: userId, title: title.trim(), description: desc.trim() || null,
      priority, status: "pending",
    }
    if (amount) payload.amount = parseFloat(amount.replace(",", "."))
    const { data, error } = await supabase.from("financial_tasks").insert(payload).select().single()
    if (error) { setErr(`Erro: ${error.message}`); setSaving(false); return }
    if (data) { onSave(data); onClose() }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Nova tarefa</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Título</p>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Ligar pro banco sobre taxa..." className="rounded-2xl" autoFocus />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Descrição (opcional)</p>
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalhes..." className="rounded-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Prioridade</p>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map(p => (
              <button key={p.id} onClick={() => setPriority(p.id)}
                className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-semibold transition-all text-left ${
                  priority === p.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>{p.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Valor relacionado (opcional)</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
            <Input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
          </div>
        </div>
        {err && <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-2xl text-white font-black text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {saving ? "Salvando..." : "Criar tarefa"}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── tab: O que fazer ─────────────────────────────────────────────────────────

const TASK_PRIORITY: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  urgent_important: { label: "🔥 Urgente e Importante", icon: AlertTriangle },
  important:        { label: "⚡ Importante",           icon: Clock         },
  urgent:           { label: "⏰ Urgente",              icon: AlertTriangle },
  low:              { label: "📌 Baixa prioridade",     icon: ArrowDown     },
}

function TabOQueFazer({ userId, tasks, onTasksChange, onAddTask }: {
  userId: string; tasks: any[]; onTasksChange: (t: any[]) => void; onAddTask: () => void
}) {
  const pending = tasks.filter(t => t.status === "pending")
  const done    = tasks.filter(t => t.status === "done")

  async function markDone(id: string) {
    const supabase = createClient()
    await supabase.from("financial_tasks").update({ status: "done" }).eq("id", id)
    onTasksChange(tasks.map(t => t.id === id ? { ...t, status: "done" } : t))
  }

  async function deleteTask(id: string) {
    const supabase = createClient()
    await supabase.from("financial_tasks").delete().eq("id", id)
    onTasksChange(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-semibold mb-4">Nenhuma tarefa ainda</p>
          <button onClick={onAddTask}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Criar primeira tarefa
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{pending.length} pendentes</span>
            <span>·</span>
            <span>{done.length} concluídas</span>
          </div>

          {pending.map((task, i) => {
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
                <div className="flex items-center gap-1">
                  {task.amount && (
                    <p className="text-sm font-bold text-primary shrink-0">{formatCurrency(task.amount)}</p>
                  )}
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}

          {done.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 mt-2">Concluídas ✓</p>
              {done.map(task => (
                <div key={task.id} className="rounded-2xl border bg-card p-4 flex items-center gap-3 opacity-50 mb-2">
                  <CheckCircle className="size-5 text-green-500 shrink-0" />
                  <p className="text-sm line-through text-muted-foreground flex-1">{task.title}</p>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500">
                    <Trash2 className="size-3.5" />
                  </button>
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
  const [tab, setTab]           = useState<TabId>("sonhos")
  const [goals, setGoals]       = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [cards, setCards]       = useState<any[]>([])
  const [tasks, setTasks]       = useState<any[]>([])
  const [userId, setUserId]     = useState("")
  const [addSheet, setAddSheet] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const [
        { data: goalsData },
        { data: txnsData },
        { data: cardsData },
        { data: tasksData },
      ] = await Promise.all([
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").order("date", { ascending: false }).limit(200),
        supabase.from("credit_cards").select("*").eq("is_active", true),
        supabase.from("financial_tasks").select("*").order("created_at", { ascending: false }),
      ])
      setGoals(goalsData ?? [])
      setTransactions(txnsData ?? [])
      setCards(cardsData ?? [])
      setTasks(tasksData ?? [])
    }
    load()
  }, [])

  const newLabel: Record<TabId, string> = {
    sonhos: "Meta", limite: "Limite", proximos: "", tarefas: "Tarefa"
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Planejar</h1>
        {tab !== "proximos" && (
          <Button size="sm" onClick={() => {
            if (tab === "limite") window.dispatchEvent(new CustomEvent("plan-add-limite"))
            else setAddSheet(true)
          }}
            className="gap-1.5 rounded-xl border-0 text-white shadow-sm shadow-primary/30"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            <Plus className="size-4" />{newLabel[tab]}
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b mb-5 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setAddSheet(false) }}
            className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === "sonhos" && (
        <>
          <TabSonhos goals={goals} userId={userId} onGoalsChange={setGoals} />
          <AnimatePresence>
            {addSheet && (
              <GoalSheet userId={userId} onClose={() => setAddSheet(false)}
                onSave={saved => { setGoals(prev => [saved, ...prev]); setAddSheet(false) }} />
            )}
          </AnimatePresence>
        </>
      )}

      {tab === "limite" && (
        <TabLimite userId={userId} />
      )}

      {tab === "proximos" && <TabProximos transactions={transactions} cards={cards} />}

      {tab === "tarefas" && (
        <>
          <TabOQueFazer userId={userId} tasks={tasks} onTasksChange={setTasks} onAddTask={() => setAddSheet(true)} />
          <AnimatePresence>
            {addSheet && (
              <TaskSheet userId={userId} onClose={() => setAddSheet(false)}
                onSave={saved => { setTasks(prev => [saved, ...prev]); setAddSheet(false) }} />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
