"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, TrendingUp, TrendingDown, AlertTriangle, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Account } from "@/types"

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<string, string> = {
  checking: "🏦", savings: "🐷", wallet: "👛", investment: "📈", loan: "💳", other: "💰",
}
const TYPE_LABEL: Record<string, string> = {
  checking: "Conta corrente", savings: "Poupança", wallet: "Carteira",
  investment: "Investimento", loan: "Empréstimo", other: "Outro",
}
const DEBT_EMOJI: Record<string, string> = {
  card: "💳", loan: "🏦", personal: "🤝", student: "🎓", mortgage: "🏠", other: "💸",
}
const SUB_EMOJI: Record<string, string> = {
  netflix: "🎬", spotify: "🎵", amazon: "📦", disney: "🏰", youtube: "▶️",
  apple: "🍎", google: "🔍", microsoft: "💻", adobe: "🎨", academia: "🏋️",
  smart: "🏋️", internet: "📶", vivo: "📶", claro: "📶", tim: "📶", oi: "📶",
}
function subEmoji(name: string) {
  const lower = name.toLowerCase()
  const k = Object.keys(SUB_EMOJI).find(k => lower.includes(k))
  return k ? SUB_EMOJI[k] : "📱"
}

// Subscription-like category ids — recurring expenses that appear in "Assino todo mês"
const SUBSCRIPTION_CATS = new Set(["cat-subs", "cat-gym", "cat-internet", "cat-education", "cat-streaming"])

// Derive subscriptions from transactions (is_recurring + expense + subscription-like category OR tag "assinatura")
// subscriptions loaded dynamically per user

const ACCOUNT_COLORS = ["#8B5CF6","#F97316","#10B981","#3B82F6","#EC4899","#F59E0B","#14B8A6","#6366F1"]
const ACCOUNT_TYPES = [
  { id: "checking"   as const, label: "Conta corrente", emoji: "🏦" },
  { id: "savings"    as const, label: "Poupança",        emoji: "🐷" },
  { id: "wallet"     as const, label: "Carteira",        emoji: "👛" },
  { id: "investment" as const, label: "Investimento",    emoji: "📈" },
]

const TABS = [
  { id: "contas",   label: "🏦 Contas"        },
  { id: "cartoes",  label: "💳 Cartões"        },
  { id: "devo",     label: "🔓 O que devo"     },
  { id: "assino",   label: "📱 Assino todo mês" },
] as const
type TabId = typeof TABS[number]["id"]

// ─── Account Sheet ────────────────────────────────────────────────────────────

interface AccountSheetProps {
  account?: Account | null
  onClose: () => void
  onSave: (acc: Partial<Account> & { name: string; type: string; institution: string; current_balance: number; color: string }) => void
  onDelete?: () => void
}

function AccountSheet({ account, onClose, onSave, onDelete }: AccountSheetProps) {
  const [name, setName]         = useState(account?.name ?? "")
  const [type, setType]         = useState(account?.type ?? "checking")
  const [institution, setInstitution] = useState(account?.institution ?? "")
  const [balance, setBalance]   = useState(account ? String(account.current_balance) : "")
  const [color, setColor]       = useState(account?.color ?? ACCOUNT_COLORS[0])

  const isEdit = !!account

  function handleSave() {
    const val = parseFloat(balance.replace(",", "."))
    if (!name.trim() || isNaN(val)) return
    onSave({ name: name.trim(), type, institution: institution.trim(), current_balance: val, color })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{isEdit ? "Editar conta" : "Nova conta"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo</p>
          <div className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                  type === t.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nome da conta</p>
          <Input value={name} onChange={e => setName(e.target.value)}
            placeholder="Ex: Conta Nubank" className="rounded-2xl" />
        </div>

        {/* Institution */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Banco / Instituição</p>
          <Input value={institution} onChange={e => setInstitution(e.target.value)}
            placeholder="Ex: Nubank, Itaú, Bradesco..." className="rounded-2xl" />
        </div>

        {/* Balance */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Saldo atual</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
            <Input value={balance} onChange={e => setBalance(e.target.value)}
              inputMode="decimal" placeholder="0,00"
              className="pl-10 rounded-2xl" />
          </div>
        </div>

        {/* Color */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {ACCOUNT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: color === c ? "#1f2937" : "transparent" }}>
                {color === c && <Check className="size-3 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {isEdit && onDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
              <Trash2 className="size-3.5" />Excluir
            </button>
          )}
          <button onClick={handleSave}
            className="flex-1 h-11 rounded-2xl text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            {isEdit ? "Salvar alterações" : "Adicionar conta"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── sub-views ────────────────────────────────────────────────────────────────

function TabContas({ accounts, onEdit, onAdd, onDelete }: { accounts: Account[]; onEdit: (a: Account) => void; onAdd: () => void; onDelete: (id: string) => void }) {
  const active = accounts.filter(a => a.is_active)
  const totalBalance = active.reduce((s, a) => s + a.current_balance, 0)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/65 text-sm mb-1">Patrimônio total</p>
        <p className="text-4xl font-black">{formatCurrency(totalBalance)}</p>
        <p className="text-white/60 text-xs mt-1">soma de todas as contas ativas</p>
      </motion.div>

      {active.map((account, i) => {
        const income  = 0
        const expense = 0
        return (
          <motion.div key={account.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="rounded-3xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                   style={{ backgroundColor: `${account.color}20` }}>
                {TYPE_EMOJI[account.type] ?? "💰"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{account.name}</p>
                <p className="text-xs text-muted-foreground">{account.institution ?? TYPE_LABEL[account.type]}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
                  <p className="text-lg font-black" style={{ color: account.color }}>{formatCurrency(account.current_balance)}</p>
                </div>
                {/* ⋯ menu */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === account.id ? null : account.id)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                    <MoreHorizontal className="size-4" />
                  </button>
                  <AnimatePresence>
                    {menuOpen === account.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-10 z-20 bg-card border rounded-2xl shadow-lg overflow-hidden w-36">
                        <button onClick={() => { onEdit(account); setMenuOpen(null) }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted text-left">
                          <Pencil className="size-3.5 text-muted-foreground" />Editar
                        </button>
                        <button onClick={() => { onDelete(account.id); setMenuOpen(null) }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-500 text-left">
                          <Trash2 className="size-3.5" />Excluir
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-green-500 shrink-0" />
                <div><p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(income)}</p></div>
              </div>
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-3 flex items-center gap-2">
                <TrendingDown className="size-4 text-red-500 shrink-0" />
                <div><p className="text-xs text-muted-foreground">Saídas</p>
                  <p className="text-sm font-bold text-red-500">{formatCurrency(expense)}</p></div>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Add account CTA */}
      <button onClick={onAdd}
        className="w-full rounded-3xl border-2 border-dashed border-primary/30 p-5 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
        <Plus className="size-4" />Adicionar conta
      </button>
    </div>
  )
}

// ─── Card Sheet ───────────────────────────────────────────────────────────────

const CARD_COLORS = ["#8B5CF6","#3B82F6","#EC4899","#10B981","#F97316","#EF4444","#0EA5E9","#F59E0B"]

function CardSheet({ card, userId, onClose, onSave }: {
  card?: any; userId: string; onClose: () => void; onSave: (c: any) => void
}) {
  const [name, setName]       = useState(card?.name ?? "")
  const [bank, setBank]       = useState(card?.bank ?? "")
  const [color, setColor]     = useState(card?.color ?? CARD_COLORS[0])
  const [limitTotal, setLimitTotal] = useState(card ? String(card.limit_total) : "")
  const [dueDay, setDueDay]   = useState(card ? String(card.due_day) : "")
  const [closingDay, setClosingDay] = useState(card ? String(card.closing_day) : "")

  async function handleSave() {
    if (!name.trim() || !limitTotal) return
    const supabase = createClient()
    const payload = {
      user_id: userId, name: name.trim(), bank: bank.trim(), color,
      limit_total: parseFloat(limitTotal.replace(",", ".")),
      limit_used: card?.limit_used ?? 0,
      due_day: parseInt(dueDay) || 10,
      closing_day: parseInt(closingDay) || 3,
      is_active: true,
    }
    if (card) {
      const { data } = await supabase.from("credit_cards").update(payload).eq("id", card.id).select().single()
      if (data) onSave(data)
    } else {
      const { data } = await supabase.from("credit_cards").insert(payload).select().single()
      if (data) onSave(data)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{card ? "Editar cartão" : "Novo cartão"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nome do cartão</p>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank Roxinho" className="rounded-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Banco / Bandeira</p>
          <Input value={bank} onChange={e => setBank(e.target.value)} placeholder="Ex: Nubank, Itaú, Bradesco..." className="rounded-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Limite total</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
            <Input value={limitTotal} onChange={e => setLimitTotal(e.target.value)} inputMode="decimal"
              placeholder="0,00" className="pl-10 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Dia de fechamento</p>
            <Input value={closingDay} onChange={e => setClosingDay(e.target.value)} inputMode="numeric"
              placeholder="Ex: 3" className="rounded-2xl" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Dia de vencimento</p>
            <Input value={dueDay} onChange={e => setDueDay(e.target.value)} inputMode="numeric"
              placeholder="Ex: 10" className="rounded-2xl" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {CARD_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                style={{ backgroundColor: c, borderColor: color === c ? "#1f2937" : "transparent" }}>
                {color === c && <Check className="size-3 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSave}
          className="w-full h-11 rounded-2xl text-white font-black text-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {card ? "Salvar alterações" : "Adicionar cartão"}
        </button>
      </motion.div>
    </motion.div>
  )
}

function TabCartoes({ userId }: { userId: string }) {
  const [cards, setCards] = useState<any[]>([])
  const [cardTxns, setCardTxns] = useState<Record<string, any[]>>({})
  const [sheet, setSheet] = useState<"add" | any | null>(null)
  const [paySheet, setPaySheet] = useState<{ card: any; fatura: number } | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
    const handler = () => setSheet("add")
    window.addEventListener("accounts-add-cartoes", handler)
    window.addEventListener("transaction-added", loadCards)
    return () => {
      window.removeEventListener("accounts-add-cartoes", handler)
      window.removeEventListener("transaction-added", loadCards)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCards() {
    const supabase = createClient()
    const { data: cardData } = await supabase.from("credit_cards").select("*").order("created_at", { ascending: true })
    if (!cardData) return
    setCards(cardData)

    // For each card, fetch transactions in current billing period
    const now = new Date()
    const txnsMap: Record<string, any[]> = {}
    for (const card of cardData) {
      const closing = card.closing_day ?? 3
      // Current period: from last closing_day to today
      const periodStart = new Date(now.getFullYear(), now.getMonth(), closing)
      if (periodStart > now) periodStart.setMonth(periodStart.getMonth() - 1)
      const startStr = periodStart.toISOString().split("T")[0]

      const { data: txns } = await supabase
        .from("transactions")
        .select("id,description,amount,date,notes")
        .eq("card_id", card.id)
        .eq("type", "expense")
        .gte("date", startStr)
        .order("date", { ascending: false })
      txnsMap[card.id] = txns ?? []
    }
    setCardTxns(txnsMap)
  }

  const today = new Date()

  function handleSaved(saved: any) {
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]
    })
    setSheet(null)
  }

  return (
    <div className="space-y-4">
      {cards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">💳</p>
          <p className="font-medium mb-4">Nenhum cartão cadastrado ainda</p>
          <button onClick={() => setSheet("add")}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Adicionar cartão
          </button>
        </div>
      ) : (
        <>
          {cards.map((card, idx) => {
            const txns = cardTxns[card.id] ?? []
            const realUsed = txns.reduce((s, t) => s + (t.amount ?? 0), 0)
            const usedPct = Math.min((realUsed / (card.limit_total ?? 1)) * 100, 100)
            const available = (card.limit_total ?? 0) - realUsed
            const dueDate = new Date(today.getFullYear(), today.getMonth(), card.due_day)
            if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)
            const isUrgent = daysUntilDue <= 5
            const ringC = 2 * Math.PI * 30
            const dash = (usedPct / 100) * ringC
            const isExpanded = expandedCard === card.id
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-3xl border bg-card overflow-hidden ${isUrgent ? "border-red-300 dark:border-red-800" : ""}`}>
                <div className="p-5 text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg,${card.color}ee,${card.color}99)` }}>
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative">
                    <div><p className="font-bold text-lg">{card.name}</p>
                      <p className="text-white/70 text-xs">{card.bank}</p></div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white/70 text-xs mb-1">Vence em</p>
                        <p className="font-black text-lg">{daysUntilDue}d</p>
                      </div>
                      <button onClick={() => setSheet(card)} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30">
                        <Pencil className="size-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <p className="text-white/70 text-xs mb-1">Fatura atual (desde dia {card.closing_day ?? 3})</p>
                    <MoneyText value={realUsed} size="xl" className="text-white font-black" />
                  </div>
                </div>
                {isUrgent && (
                  <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Vence em {daysUntilDue} {daysUntilDue === 1 ? "dia" : "dias"}! ⚡</span>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <svg width="68" height="68" viewBox="0 0 68 68">
                        <circle cx="34" cy="34" r="30" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/25" />
                        <circle cx="34" cy="34" r="30" fill="none"
                          stroke={usedPct > 90 ? "#ef4444" : usedPct > 70 ? "#f59e0b" : card.color}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${dash} ${ringC - dash}`}
                          strokeDashoffset={ringC / 4} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black">{Math.round(usedPct)}%</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm flex-1">
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Usado</span>
                        <span className="font-semibold">{formatCurrency(realUsed)}</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Disponível</span>
                        <span className="font-semibold text-green-600">{formatCurrency(available)}</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Limite total</span>
                        <span className="font-semibold">{formatCurrency(card.limit_total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pay fatura button */}
                  {realUsed > 0 && (
                    <button
                      onClick={() => setPaySheet({ card, fatura: realUsed })}
                      className="w-full py-2.5 rounded-2xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                      💳 Pagar fatura · {formatCurrency(realUsed)}
                    </button>
                  )}

                  {/* Transactions toggle */}
                  {txns.length > 0 && (
                    <button onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                      className="w-full text-xs text-primary font-semibold py-1.5 hover:bg-primary/5 rounded-xl transition-colors">
                      {isExpanded ? "▲ Ocultar lançamentos" : `▼ Ver ${txns.length} lançamento${txns.length > 1 ? "s" : ""} da fatura`}
                    </button>
                  )}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-1.5">
                        {txns.map(t => (
                          <div key={t.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-xl px-3 py-2">
                            <div>
                              <p className="font-semibold">{t.description}</p>
                              <p className="text-muted-foreground">{new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                            </div>
                            <span className="font-bold text-red-500">-{formatCurrency(t.amount)}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
          <button onClick={() => setSheet("add")}
            className="w-full rounded-3xl border-2 border-dashed border-primary/30 p-5 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
            <Plus className="size-4" />Adicionar cartão
          </button>
        </>
      )}
      <AnimatePresence>
        {sheet !== null && (
          <CardSheet
            card={sheet === "add" ? undefined : sheet}
            userId={userId}
            onClose={() => setSheet(null)}
            onSave={handleSaved}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {paySheet !== null && (
          <PayFaturaSheet
            card={paySheet.card}
            fatura={paySheet.fatura}
            onClose={() => setPaySheet(null)}
            onPaid={() => { setPaySheet(null); loadCards() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Pay Fatura Sheet ─────────────────────────────────────────────────────────

function PayFaturaSheet({ card, fatura, onClose, onPaid }: {
  card: any; fatura: number; onClose: () => void; onPaid: () => void
}) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountId, setAccountId] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState("")
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    createClient().from("accounts").select("id,name,current_balance,color")
      .eq("is_active", true).order("created_at")
      .then(({ data }) => {
        if (data?.length) { setAccounts(data); setAccountId(data[0].id) }
      })
  }, [])

  async function handlePay() {
    if (!accountId) { setErr("Selecione uma conta"); return }
    setSaving(true); setErr("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id, type: "expense",
      description: `Pagamento fatura ${card.name}`,
      amount: fatura, date: today,
      account_id: accountId, status: "confirmed",
      notes: "💳|Cartão", tags: [],
    })
    if (error) { setErr(error.message); setSaving(false); return }
    window.dispatchEvent(new CustomEvent("transaction-added"))
    setDone(true)
    setTimeout(onPaid, 1400)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-w-lg mx-auto p-6 pb-10">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#7c3aed" }}>
              <Check className="size-8 text-white" />
            </div>
            <p className="text-lg font-black">Fatura paga! 🎉</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(fatura)} debitado da conta</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black">Pagar fatura</h3>
                <p className="text-sm text-muted-foreground">{card.name} · vence dia {card.due_day}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>

            {/* Fatura value */}
            <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: `linear-gradient(135deg,${card.color}22,${card.color}11)`, border: `1px solid ${card.color}44` }}>
              <p className="text-xs text-muted-foreground mb-1">Valor da fatura</p>
              <p className="text-3xl font-black" style={{ color: card.color }}>{formatCurrency(fatura)}</p>
            </div>

            {/* Account selector */}
            <p className="text-xs font-semibold text-muted-foreground mb-2">Pagar com qual conta?</p>
            <div className="space-y-2 mb-5">
              {accounts.map(acc => (
                <button key={acc.id} onClick={() => setAccountId(acc.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
                    accountId === acc.id ? "border-primary bg-primary/8" : "border-border/60 bg-muted/30"
                  }`}>
                  <span className={`text-sm font-semibold ${accountId === acc.id ? "text-primary" : "text-foreground"}`}>{acc.name}</span>
                  <span className="text-xs text-muted-foreground">saldo: {formatCurrency(acc.current_balance ?? 0)}</span>
                </button>
              ))}
              {accounts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">Nenhuma conta cadastrada</p>
              )}
            </div>

            {err && <p className="text-sm text-red-500 mb-3">⚠️ {err}</p>}

            <button onClick={handlePay} disabled={saving || accounts.length === 0}
              className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {saving ? "Registrando..." : `✓ Confirmar pagamento · ${formatCurrency(fatura)}`}
            </button>
          </>
        )}
      </motion.div>
    </>
  )
}

// ─── Debt Projection ─────────────────────────────────────────────────────────

function DebtProjection({ debt, onClose, onEdit }: { debt: any; onClose: () => void; onEdit: () => void }) {
  const rate = (debt.interest_rate ?? 0) / 100
  const payment = debt.monthly_payment ?? 0

  // Amortization table
  const rows: { month: number; balance: number; interest: number; principal: number; date: string }[] = []
  let balance = debt.current_balance ?? 0
  const now = new Date()
  for (let m = 0; m < 360 && balance > 0.01; m++) {
    const interest = balance * rate
    const principal = Math.min(payment - interest, balance)
    if (principal <= 0) break
    const d = new Date(now.getFullYear(), now.getMonth() + m + 1, 1)
    rows.push({
      month: m + 1,
      balance: Math.max(balance - principal, 0),
      interest,
      principal,
      date: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    })
    balance = Math.max(balance - principal, 0)
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0)
  const lastRow = rows[rows.length - 1]
  const payoffDate = lastRow
    ? new Date(now.getFullYear(), now.getMonth() + rows.length, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "—"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-black text-base">{debt.name}</h2>
            <p className="text-xs text-muted-foreground">{DEBT_EMOJI[debt.type ?? "other"]} {debt.creditor}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><Pencil className="size-3.5" /></button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Parcelas restantes</p>
              <p className="font-black text-lg">{rows.length}</p>
            </div>
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Total de juros</p>
              <p className="font-black text-sm text-red-500">{formatCurrency(totalInterest)}</p>
            </div>
            <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Quitação</p>
              <p className="font-black text-[11px] text-green-600 dark:text-green-400 leading-tight">{payoffDate}</p>
            </div>
          </div>

          {/* Amortization table - first 12 months */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Projeção mês a mês</p>
            <div className="space-y-1.5">
              {rows.slice(0, 24).map(r => (
                <div key={r.month} className="flex items-center gap-2 text-xs rounded-xl bg-muted/30 px-3 py-2">
                  <span className="w-10 font-bold text-muted-foreground shrink-0">{r.date}</span>
                  <div className="flex-1 flex justify-between gap-2">
                    <span className="text-red-400">-{formatCurrency(r.interest)} juros</span>
                    <span className="font-semibold">{formatCurrency(r.balance)} restante</span>
                  </div>
                </div>
              ))}
              {rows.length > 24 && (
                <p className="text-center text-xs text-muted-foreground py-2">... e mais {rows.length - 24} meses</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Debt Sheet ───────────────────────────────────────────────────────────────

const DEBT_TYPES = [
  { id: "card", label: "Cartão", emoji: "💳" },
  { id: "loan", label: "Empréstimo", emoji: "🏦" },
  { id: "personal", label: "Pessoal", emoji: "🤝" },
  { id: "mortgage", label: "Financiamento", emoji: "🏠" },
  { id: "other", label: "Outro", emoji: "💸" },
]

function DebtSheet({ debt, userId, onClose, onSave }: {
  debt?: any; userId: string; onClose: () => void; onSave: (d: any) => void
}) {
  const [name, setName]           = useState(debt?.name ?? "")
  const [type, setType]           = useState(debt?.type ?? "loan")
  const [creditor, setCreditor]   = useState(debt?.creditor ?? "")
  const [original, setOriginal]   = useState(debt ? String(debt.original_amount) : "")
  const [current, setCurrent]     = useState(debt ? String(debt.current_balance) : "")
  const [monthly, setMonthly]     = useState(debt ? String(debt.monthly_payment) : "")
  const [interest, setInterest]   = useState(debt ? String(debt.interest_rate ?? "") : "")
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState("")

  async function handleSave() {
    if (!name.trim() || !original) { setSaveError("Preencha nome e valor original."); return }
    setSaving(true); setSaveError("")
    const supabase = createClient()
    const payload = {
      user_id: userId, name: name.trim(), type, creditor: creditor.trim(),
      original_amount: parseFloat(original.replace(",", ".")),
      current_balance: parseFloat((current || original).replace(",", ".")),
      monthly_payment: parseFloat((monthly || "0").replace(",", ".")),
      interest_rate: parseFloat((interest || "0").replace(",", ".")),
    }
    if (debt) {
      const { data, error } = await supabase.from("debts").update(payload).eq("id", debt.id).select().single()
      if (error) { setSaveError(`Erro: ${error.message}`); setSaving(false); return }
      if (data) { onSave(data); onClose() }
    } else {
      const { data, error } = await supabase.from("debts").insert(payload).select().single()
      if (error) { setSaveError(`Erro: ${error.message}`); setSaving(false); return }
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
          <h2 className="text-lg font-black">{debt ? "Editar dívida" : "Nova dívida"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo</p>
          <div className="grid grid-cols-3 gap-2">
            {DEBT_TYPES.map(t => (
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
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nome da dívida</p>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Empréstimo pessoal Caixa" className="rounded-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Credor / Banco</p>
          <Input value={creditor} onChange={e => setCreditor(e.target.value)} placeholder="Ex: Caixa, Nubank, fulano..." className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Valor original</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
              <Input value={original} onChange={e => setOriginal(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Saldo restante</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
              <Input value={current} onChange={e => setCurrent(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Parcela mensal</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
              <Input value={monthly} onChange={e => setMonthly(e.target.value)} inputMode="decimal" placeholder="0,00" className="pl-8 rounded-2xl" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Juros ao mês (%)</p>
            <Input value={interest} onChange={e => setInterest(e.target.value)} inputMode="decimal" placeholder="Ex: 2.5" className="rounded-2xl" />
          </div>
        </div>
        {saveError && <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{saveError}</p>}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-2xl text-white font-black text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {saving ? "Salvando..." : debt ? "Salvar alterações" : "Adicionar dívida"}
        </button>
      </motion.div>
    </motion.div>
  )
}

function TabDevo({ userId }: { userId: string }) {
  const [debts, setDebts] = useState<any[]>([])
  const [sheet, setSheet] = useState<"add" | any | null>(null)
  const [projecting, setProjecting] = useState<any | null>(null)
  useEffect(() => {
    createClient().from("debts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setDebts(data ?? []))
    const handler = () => setSheet("add")
    window.addEventListener("accounts-add-devo", handler)
    return () => window.removeEventListener("accounts-add-devo", handler)
  }, [])

  function handleSaved(saved: any) {
    setDebts(prev => {
      const idx = prev.findIndex(d => d.id === saved.id)
      return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]
    })
    setSheet(null)
  }

  const totalDebt     = debts.reduce((s, d) => s + (d.current_balance ?? 0), 0)
  const totalOriginal = debts.reduce((s, d) => s + (d.original_amount ?? 0), 0)
  const totalPaid     = totalOriginal - totalDebt
  const paidPct       = totalOriginal > 0 ? Math.min((totalPaid / totalOriginal) * 100, 100) : 0
  const ringC = 2 * Math.PI * 36
  const dash  = (paidPct / 100) * ringC

  return (
    <div className="space-y-4">
      {debts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-medium mb-4">Nenhuma dívida cadastrada</p>
          <button onClick={() => setSheet("add")}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Adicionar dívida
          </button>
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border bg-card p-5 flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/25" />
                <circle cx="44" cy="44" r="36" fill="none" stroke="oklch(0.62 0.19 145)"
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${dash} ${ringC - dash}`} strokeDashoffset={ringC / 4} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black">{paidPct.toFixed(0)}%</span>
                <span className="text-xs text-muted-foreground">pago</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-black text-lg">{formatCurrency(totalDebt)}</p>
              <p className="text-sm text-muted-foreground">ainda a pagar</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ {formatCurrency(totalPaid)} já quitado</p>
            </div>
          </motion.div>

          {debts.map((debt, i) => {
            const pct = debt.original_amount > 0
              ? Math.min(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100, 100)
              : 0
            const r2 = 2 * Math.PI * 20
            const d2 = (pct / 100) * r2
            return (
              <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-3xl border bg-card p-5 cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => setProjecting(debt)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="20" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
                      <circle cx="26" cy="26" r="20" fill="none" stroke="oklch(0.62 0.19 145)"
                        strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${d2} ${r2 - d2}`} strokeDashoffset={r2 / 4} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{debt.name}</p>
                    <p className="text-xs text-muted-foreground">{DEBT_EMOJI[debt.type ?? "other"]} {debt.creditor ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right shrink-0">
                      <p className="font-black text-base text-red-500">{formatCurrency(debt.current_balance)}</p>
                      <p className="text-xs text-muted-foreground">restante</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSheet(debt) }} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-2xl px-3 py-2">
                  <span>Parcela: <strong className="text-foreground">{formatCurrency(debt.monthly_payment)}/mês</strong></span>
                  <span>Juros: <strong className="text-red-500">{(debt.interest_rate ?? 0).toFixed(1)}%</strong></span>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-2">Toque para ver projeção de parcelas →</p>
              </motion.div>
            )
          })}
          <button onClick={() => setSheet("add")}
            className="w-full rounded-3xl border-2 border-dashed border-primary/30 p-5 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
            <Plus className="size-4" />Adicionar dívida
          </button>
        </>
      )}
      <AnimatePresence>
        {sheet !== null && (
          <DebtSheet
            debt={sheet === "add" ? undefined : sheet}
            userId={userId}
            onClose={() => setSheet(null)}
            onSave={handleSaved}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {projecting !== null && (
          <DebtProjection
            debt={projecting}
            onClose={() => setProjecting(null)}
            onEdit={() => { setSheet(projecting); setProjecting(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Subscription Sheet ───────────────────────────────────────────────────────

const BILLING_CYCLES = [
  { id: "monthly", label: "Mensal" },
  { id: "quarterly", label: "Trimestral" },
  { id: "yearly", label: "Anual" },
]

function SubscriptionSheet({ sub, userId, onClose, onSave }: {
  sub?: any; userId: string; onClose: () => void; onSave: (s: any) => void
}) {
  const [name, setName]     = useState(sub?.name ?? "")
  const [amount, setAmount] = useState(sub ? String(sub.amount) : "")
  const [cycle, setCycle]   = useState(sub?.billing_cycle ?? "monthly")
  const [day, setDay]       = useState(sub ? String(sub.billing_day ?? "") : "")

  async function handleSave() {
    if (!name.trim() || !amount) return
    const supabase = createClient()
    const payload = {
      user_id: userId, name: name.trim(),
      amount: parseFloat(amount.replace(",", ".")),
      billing_cycle: cycle,
      billing_day: parseInt(day) || 1,
      status: "active",
    }
    if (sub) {
      const { data } = await supabase.from("subscriptions").update(payload).eq("id", sub.id).select().single()
      if (data) onSave(data)
    } else {
      const { data } = await supabase.from("subscriptions").insert(payload).select().single()
      if (data) onSave(data)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{sub ? "Editar assinatura" : "Nova assinatura"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nome do serviço</p>
          <Input value={name} onChange={e => setName(e.target.value)}
            placeholder="Ex: Netflix, Spotify, Academia..." className="rounded-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Valor</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
            <Input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"
              placeholder="0,00" className="pl-10 rounded-2xl" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Frequência</p>
          <div className="grid grid-cols-3 gap-2">
            {BILLING_CYCLES.map(c => (
              <button key={c.id} onClick={() => setCycle(c.id)}
                className={`py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${
                  cycle === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}>{c.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Dia de cobrança</p>
          <Input value={day} onChange={e => setDay(e.target.value)} inputMode="numeric"
            placeholder="Ex: 15" className="rounded-2xl" />
        </div>
        <button onClick={handleSave}
          className="w-full h-11 rounded-2xl text-white font-black text-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          {sub ? "Salvar alterações" : "Adicionar assinatura"}
        </button>
      </motion.div>
    </motion.div>
  )
}

function TabAssino({ userId }: { userId: string }) {
  const [subs, setSubs] = useState<any[]>([])
  const [sheet, setSheet] = useState<"add" | any | null>(null)

  useEffect(() => {
    loadSubs()
    const addHandler = () => setSheet("add")
    window.addEventListener("transaction-added", loadSubs)
    window.addEventListener("accounts-add-assino", addHandler)
    return () => {
      window.removeEventListener("transaction-added", loadSubs)
      window.removeEventListener("accounts-add-assino", addHandler)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSubs() {
    const supabase = createClient()

    // Busca transações da categoria Assinatura (notes começa com "📱|")
    // OU marcadas como is_recurring — dupla garantia
    const { data: txns } = await supabase
      .from("transactions")
      .select("id,description,amount,notes,date,is_recurring")
      .eq("type", "expense")
      .or("notes.like.📱|%,is_recurring.eq.true")
      .order("date", { ascending: false })

    // Busca assinaturas manuais (adicionadas pelo formulário)
    const { data: manualSubs } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })

    // Agrupa por nome (mais recente de cada serviço)
    const txnByName = new Map<string, any>()
    for (const t of txns ?? []) {
      const key = t.description?.toLowerCase() ?? ""
      if (!txnByName.has(key)) {
        txnByName.set(key, {
          id: `txn-${t.id}`,
          name: t.description,
          amount: t.amount,
          billing_cycle: "monthly",
          billing_day: null,
          _fromTxn: true,
          _emoji: "📱",
        })
      }
    }

    // Combina: manuais primeiro, depois transações sem duplicata
    const manualNames = new Set((manualSubs ?? []).map((s: any) => s.name?.toLowerCase()))
    const txnItems = [...txnByName.values()].filter(t => !manualNames.has(t.name?.toLowerCase()))

    setSubs([...(manualSubs ?? []), ...txnItems])
  }

  function handleSaved(saved: any) {
    setSubs(prev => {
      const idx = prev.findIndex(s => s.id === saved.id)
      return idx >= 0 ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev]
    })
    setSheet(null)
  }

  const totalMonthly = subs.reduce((s, t) => {
    const m: Record<string, number> = { monthly: 1, quarterly: 1/3, yearly: 1/12 }
    return s + (t.amount ?? 0) * (m[t.billing_cycle ?? "monthly"] ?? 1)
  }, 0)

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/70 text-sm mb-1">Gasto mensal em assinaturas</p>
        <MoneyText value={totalMonthly} size="2xl" className="text-white font-black" />
        <p className="text-white/60 text-xs mt-1">{formatCurrency(totalMonthly * 12)} por ano</p>
      </motion.div>

      <div className="rounded-2xl bg-muted/60 border border-border p-3.5 text-sm text-foreground">
        💡 Lançamentos da categoria <strong>Assinatura</strong> aparecem aqui automaticamente.
      </div>

      {subs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-4xl mb-3">📱</p>
          <p className="font-medium mb-4">Nenhuma assinatura ainda</p>
          <button onClick={() => setSheet("add")}
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            + Adicionar assinatura
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {subs.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border bg-card p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-muted/50">
                  {t._emoji ?? subEmoji(t.name ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">🔁 {t.billing_cycle === "yearly" ? "anual" : t.billing_cycle === "quarterly" ? "trimestral" : "todo mês"}</span>
                    {t.billing_day && <span className="text-xs text-muted-foreground">· dia {t.billing_day}</span>}
                    {t._fromTxn && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">via lançamento</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-right shrink-0 mr-1">
                    <p className="text-sm font-bold">{formatCurrency(t.amount)}</p>
                    <p className="text-xs text-muted-foreground">/{t.billing_cycle === "yearly" ? "ano" : t.billing_cycle === "quarterly" ? "trim" : "mês"}</p>
                  </div>
                  {!t._fromTxn ? (
                    <>
                      <button onClick={() => setSheet(t)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={async () => {
                        const supabase = createClient()
                        await supabase.from("subscriptions").delete().eq("id", t.id)
                        setSubs(prev => prev.filter(s => s.id !== t.id))
                      }} className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500">
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={() => setSheet("add")}
            className="w-full rounded-3xl border-2 border-dashed border-primary/30 p-5 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
            <Plus className="size-4" />Adicionar assinatura
          </button>
        </>
      )}
      <AnimatePresence>
        {sheet !== null && (
          <SubscriptionSheet
            sub={sheet === "add" ? undefined : sheet}
            userId={userId}
            onClose={() => setSheet(null)}
            onSave={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [tab, setTab]             = useState<TabId>("contas")
  const [accounts, setAccounts]   = useState<Account[]>([])
  const [sheet, setSheet]         = useState<"add" | Account | null>(null)
  const [userId, setUserId]       = useState<string>("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    supabase.from("accounts").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setAccounts(data ?? []))
  }, [])

  async function handleSave(data: Partial<Account> & { name: string; type: string; institution: string; current_balance: number; color: string }) {
    const supabase = createClient()
    if (sheet === "add") {
      const { data: newAcc } = await supabase.from("accounts").insert({
        user_id: userId, is_active: true, initial_balance: data.current_balance,
        icon: "building-2", ...data,
      }).select().single()
      if (newAcc) setAccounts(prev => [...prev, newAcc as Account])
    } else if (sheet && typeof sheet === "object") {
      await supabase.from("accounts").update(data).eq("id", (sheet as Account).id)
      setAccounts(prev => prev.map(a => a.id === (sheet as Account).id ? { ...a, ...data } : a))
    }
    setSheet(null)
  }

  async function handleDeleteById(id: string) {
    const supabase = createClient()
    await supabase.from("accounts").delete().eq("id", id)
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  async function handleDelete() {
    if (sheet && typeof sheet === "object") {
      await handleDeleteById((sheet as Account).id)
      setSheet(null)
    }
  }

  const newLabel: Record<TabId, string> = {
    contas: "Conta", cartoes: "Cartão", devo: "Dívida", assino: "Assinatura"
  }

  function handleHeaderAdd() {
    if (tab === "contas") { setSheet("add"); return }
    window.dispatchEvent(new CustomEvent(`accounts-add-${tab}`))
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Contas</h1>
        <Button size="sm" onClick={handleHeaderAdd}
          className="gap-1.5 rounded-xl border-0 text-white shadow-sm shadow-primary/30"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          <Plus className="size-4" />{newLabel[tab]}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b mb-5 overflow-x-auto pb-0 scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === "contas"  && <TabContas accounts={accounts} onEdit={setSheet} onAdd={() => setSheet("add")} onDelete={handleDeleteById} />}
      {tab === "cartoes" && <TabCartoes userId={userId} />}
      {tab === "devo"    && <TabDevo userId={userId} />}
      {tab === "assino"  && <TabAssino userId={userId} />}

      {/* Account sheet — only for contas tab */}
      <AnimatePresence>
        {sheet !== null && tab === "contas" && (
          <AccountSheet
            account={sheet === "add" ? null : sheet as Account}
            onClose={() => setSheet(null)}
            onSave={handleSave}
            onDelete={sheet !== "add" ? handleDelete : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
