"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, TrendingUp, TrendingDown, AlertTriangle, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency } from "@/lib/utils"
import {
  DEMO_ACCOUNTS, DEMO_TRANSACTIONS, DEMO_CARDS,
  DEMO_DEBTS,
} from "@/lib/demo-data"
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
const DERIVED_SUBS = DEMO_TRANSACTIONS.filter(
  t => t.type === "expense" && t.is_recurring &&
    (SUBSCRIPTION_CATS.has(t.category_id) || t.tags?.includes("assinatura"))
)

const ACCOUNT_COLORS = ["#8B5CF6","#F97316","#10B981","#3B82F6","#EC4899","#F59E0B","#14B8A6","#6366F1"]
const ACCOUNT_TYPES = [
  { id: "checking",   label: "Conta corrente", emoji: "🏦" },
  { id: "savings",    label: "Poupança",        emoji: "🐷" },
  { id: "wallet",     label: "Carteira",        emoji: "👛" },
  { id: "investment", label: "Investimento",    emoji: "📈" },
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

function TabContas({ accounts, onEdit, onAdd }: { accounts: Account[]; onEdit: (a: Account) => void; onAdd: () => void }) {
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
        const txns    = DEMO_TRANSACTIONS.filter(t => t.account_id === account.id)
        const income  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
        const expense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
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
                        <button className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-500 text-left">
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

function TabCartoes() {
  const today = new Date()
  return (
    <div className="space-y-4">
      {DEMO_CARDS.map((card, idx) => {
        const usedPct = Math.min((card.limit_used / card.limit_total) * 100, 100)
        const available = card.limit_total - card.limit_used
        const dueDate = new Date(today.getFullYear(), today.getMonth(), card.due_day)
        if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)
        const isUrgent = daysUntilDue <= 5
        const ringC = 2 * Math.PI * 30
        const dash = (usedPct / 100) * ringC
        const cardTxns = DEMO_TRANSACTIONS.filter(t => t.card_id === card.id)

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
                <div className="text-right">
                  <p className="text-white/70 text-xs mb-1">Vence em</p>
                  <p className="font-black text-lg">{daysUntilDue}d</p>
                </div>
              </div>
              <div className="relative">
                <p className="text-white/70 text-xs mb-1">Fatura atual</p>
                <MoneyText value={card.limit_used} size="xl" className="text-white font-black" />
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
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-muted-foreground">Usado</span>
                    <span className="font-semibold">{formatCurrency(card.limit_used)}</span>
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
              {cardTxns.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Últimas compras</p>
                  <div className="space-y-1.5">
                    {cardTxns.slice(0, 3).map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate">{t.description}</span>
                        <span className="font-semibold ml-4 shrink-0">{formatCurrency(t.amount)}</span>
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
  )
}

function TabDevo() {
  const totalDebt    = DEMO_DEBTS.reduce((s, d) => s + d.current_balance, 0)
  const totalOriginal = DEMO_DEBTS.reduce((s, d) => s + d.original_amount, 0)
  const totalPaid    = totalOriginal - totalDebt
  const paidPct      = Math.min((totalPaid / totalOriginal) * 100, 100)
  const ringC = 2 * Math.PI * 36
  const dash  = (paidPct / 100) * ringC

  return (
    <div className="space-y-4">
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

      {DEMO_DEBTS.map((debt, i) => {
        const pct = Math.min(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100, 100)
        const r2 = 2 * Math.PI * 20
        const d2 = (pct / 100) * r2
        return (
          <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="rounded-3xl border bg-card p-5">
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
                <p className="text-xs text-muted-foreground">{DEBT_EMOJI[(debt as any).type ?? "other"]} {(debt as any).institution ?? debt.creditor ?? ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-base text-red-500">{formatCurrency(debt.current_balance)}</p>
                <p className="text-xs text-muted-foreground">restante</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-2xl px-3 py-2">
              <span>Parcela: <strong className="text-foreground">{formatCurrency(debt.monthly_payment)}/mês</strong></span>
              <span>Juros: <strong className="text-red-500">{(debt.monthly_interest ?? 0).toFixed(1)}%</strong></span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function TabAssino() {
  // Derived directly from transactions — is_recurring + expense + subscription-like category
  const subs = DERIVED_SUBS
  const totalMonthly = subs.reduce((s, t) => s + t.amount, 0)
  const toReview = subs.filter(t => t.tags?.includes("assinatura") && t.category_id === "cat-subs")

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <p className="text-white/70 text-sm mb-1">Gasto mensal em assinaturas</p>
        <MoneyText value={totalMonthly} size="2xl" className="text-white font-black" />
        <p className="text-white/60 text-xs mt-1">{formatCurrency(totalMonthly * 12)} por ano</p>
        {toReview.length > 0 && (
          <div className="mt-3 bg-amber-400/25 rounded-2xl px-3 py-1.5 inline-flex text-sm text-amber-100">
            ⚠️ {toReview.length} pra revisar
          </div>
        )}
      </motion.div>

      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3.5 text-sm text-blue-700 dark:text-blue-400">
        💡 Tudo aqui veio do <strong>Lançar</strong> — qualquer gasto recorrente (academia, streaming, internet) aparece automaticamente nesta lista.
      </div>

      {toReview.length > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3.5 text-sm text-amber-700 dark:text-amber-400">
          💡 Você tem <strong>{toReview.length} assinaturas não essenciais</strong>. Ainda valem todas elas?
        </div>
      )}

      <div className="space-y-2">
        {subs.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-muted/50">
              {subEmoji(t.description)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">🔁 todo mês</span>
                {t.tags?.includes("assinatura") && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded-full">revisar</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold">{formatCurrency(t.amount)}</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [tab, setTab]             = useState<TabId>("contas")
  const [accounts, setAccounts]   = useState<Account[]>(DEMO_ACCOUNTS)
  const [sheet, setSheet]         = useState<"add" | Account | null>(null)

  function handleSave(data: Partial<Account> & { name: string; type: string; institution: string; current_balance: number; color: string }) {
    if (sheet === "add") {
      const newAcc: Account = {
        id: `acc-${Date.now()}`, user_id: "demo", is_active: true,
        initial_balance: data.current_balance, icon: "building-2",
        created_at: new Date().toISOString(),
        ...data,
      }
      setAccounts(prev => [...prev, newAcc])
    } else if (sheet && typeof sheet === "object") {
      setAccounts(prev => prev.map(a => a.id === sheet.id ? { ...a, ...data } : a))
    }
    setSheet(null)
  }

  function handleDelete() {
    if (sheet && typeof sheet === "object") {
      setAccounts(prev => prev.filter(a => a.id !== (sheet as Account).id))
      setSheet(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Contas</h1>
        <Button size="sm" onClick={() => setSheet("add")}
          className="gap-1.5 rounded-xl border-0 text-white shadow-sm shadow-primary/30"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          <Plus className="size-4" />Nova
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

      {tab === "contas"  && <TabContas accounts={accounts} onEdit={setSheet} onAdd={() => setSheet("add")} />}
      {tab === "cartoes" && <TabCartoes />}
      {tab === "devo"    && <TabDevo />}
      {tab === "assino"  && <TabAssino />}

      {/* Sheet */}
      <AnimatePresence>
        {sheet !== null && (
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
