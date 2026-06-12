"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"


const ACCOUNT_TYPES = [
  { id: "checking", emoji: "🏦", label: "Conta corrente" },
  { id: "savings",  emoji: "🐷", label: "Poupança" },
  { id: "wallet",   emoji: "👛", label: "Carteira / dinheiro" },
]

const INCOME_CATS = [
  { id: "salary",   emoji: "💼", label: "Salário" },
  { id: "freelance",emoji: "💻", label: "Freela" },
  { id: "rent",     emoji: "🏘️", label: "Aluguel" },
  { id: "other",    emoji: "💰", label: "Outros" },
]

const BUDGET_CATS = [
  { id: "Comida",    emoji: "🍔", color: "#F97316" },
  { id: "Mercado",   emoji: "🛒", color: "#84CC16" },
  { id: "Transporte",emoji: "🚗", color: "#3B82F6" },
  { id: "Moradia",   emoji: "🏠", color: "#6B7280" },
  { id: "Saúde",     emoji: "💊", color: "#EF4444" },
  { id: "Lazer",     emoji: "🎮", color: "#EC4899" },
  { id: "Assinatura",emoji: "📱", color: "#0EA5E9" },
  { id: "Estudo",    emoji: "📚", color: "#8B5CF6" },
]

const EXPENSE_CATS = [
  { id: "cat-food",       emoji: "🍔", label: "Comida" },
  { id: "cat-market",     emoji: "🛒", label: "Mercado" },
  { id: "cat-transport",  emoji: "🚗", label: "Transporte" },
  { id: "cat-housing",    emoji: "🏠", label: "Moradia" },
  { id: "cat-health",     emoji: "💊", label: "Saúde" },
  { id: "cat-leisure",    emoji: "🎮", label: "Lazer" },
  { id: "cat-subs",       emoji: "📱", label: "Assinatura" },
  { id: "cat-education",  emoji: "📚", label: "Estudo" },
  { id: "cat-other",      emoji: "💸", label: "Outros" },
]

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

const STEP_POINTS: Record<Step, number> = {
  1: 10, 2: 20, 3: 20, 4: 10, 5: 40, 6: 50, 7: 50
}

const TOTAL_STEPS = 7

export function Onboarding({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep]       = useState<Step>(1)
  const [earned, setEarned]   = useState(0)
  const [userId, setUserId]   = useState("")

  // Step 1
  const [name, setName] = useState(userName || "")

  // Step 2 — account
  const [accName, setAccName]     = useState("")
  const [accType, setAccType]     = useState("checking")
  const [accBalance, setAccBalance] = useState("")
  const [accSaving, setAccSaving] = useState(false)

  // Step 3 — income
  const [incCat, setIncCat]     = useState(INCOME_CATS[0])
  const [incAmount, setIncAmount] = useState("")
  const [incSaving, setIncSaving] = useState(false)

  // Step 4 — expense
  const [expCat, setExpCat]     = useState(EXPENSE_CATS[0])
  const [expAmount, setExpAmount] = useState("")
  const [expSaving, setExpSaving] = useState(false)

  // Step 5 — budget limit
  const [budCat, setBudCat]     = useState(BUDGET_CATS[0])
  const [budAmount, setBudAmount] = useState("")
  const [budSaving, setBudSaving] = useState(false)

  // Step 6 — goal
  const [goalName, setGoalName]   = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [goalMonthly, setGoalMonthly] = useState("")
  const [goalSaving, setGoalSaving]   = useState(false)

  // Step 7 — flash points
  const [showPoints, setShowPoints] = useState(false)

  useEffect(() => {
    setVisible(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  function addPoints(pts: number) {
    setEarned(prev => prev + pts)
    setShowPoints(true)
    setTimeout(() => setShowPoints(false), 1200)
  }

  function nextStep(current: Step) {
    addPoints(STEP_POINTS[current])
    setStep((current + 1) as Step)
  }

  async function finish() {
    addPoints(STEP_POINTS[7])
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { onboarding_done: true } })
    setTimeout(() => {
      setVisible(false)
      window.dispatchEvent(new CustomEvent("transaction-added"))
    }, 1800)
  }

  // ── Step 2: create account ────────────────────────────────────────────────
  async function handleCreateAccount() {
    if (!accName.trim()) return
    setAccSaving(true)
    const supabase = createClient()
    const balance = parseFloat(accBalance.replace(",", ".")) || 0
    const { error } = await supabase.from("accounts").insert({
      user_id: userId, name: accName.trim(), type: accType,
      color: "#7c3aed", icon: "bank",
      initial_balance: balance, current_balance: balance, is_active: true,
    })
    setAccSaving(false)
    if (!error) nextStep(2)
  }

  // ── Step 3: income ────────────────────────────────────────────────────────
  async function handleIncome() {
    const parsed = parseFloat(incAmount.replace(",", "."))
    if (!parsed || parsed <= 0) return
    setIncSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    const { error } = await supabase.from("transactions").insert({
      user_id: userId, type: "income",
      description: incCat.label, amount: parsed, date: today,
      status: "confirmed",
      notes: `${incCat.emoji}|${incCat.label}`,
      tags: [], is_recurring: false,
    })
    setIncSaving(false)
    if (!error) nextStep(3)
  }

  // ── Step 4: expense ───────────────────────────────────────────────────────
  async function handleExpense() {
    const parsed = parseFloat(expAmount.replace(",", "."))
    if (!parsed || parsed <= 0) return
    setExpSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    // Fetch first account to link
    const { data: accs } = await supabase.from("accounts").select("id").eq("is_active", true).limit(1)
    const accountId = accs?.[0]?.id ?? null

    const { error } = await supabase.from("transactions").insert({
      user_id: userId, type: "expense",
      description: expCat.label, amount: parsed, date: today,
      account_id: accountId, status: "confirmed",
      notes: `${expCat.emoji}|${expCat.label}`,
      tags: [], is_recurring: false,
    })
    setExpSaving(false)
    if (!error) nextStep(4)
  }

  // ── Step 5: budget limit ──────────────────────────────────────────────────
  async function handleBudget() {
    const val = parseFloat(budAmount.replace(",", "."))
    if (!val || val <= 0) return
    setBudSaving(true)
    const supabase = createClient()
    const now = new Date()
    const { error } = await supabase.from("budget_limits").insert({
      user_id: userId,
      category_key: budCat.id,
      category_label: budCat.id,
      emoji: budCat.emoji,
      amount_limit: val,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    })
    setBudSaving(false)
    if (!error) nextStep(5)
  }

  // ── Step 6: goal ──────────────────────────────────────────────────────────
  async function handleGoal() {
    const target = parseFloat(goalAmount.replace(",", "."))
    if (!goalName.trim() || !target) return
    setGoalSaving(true)
    const supabase = createClient()
    const monthly = parseFloat(goalMonthly.replace(",", ".")) || 0
    const { error } = await supabase.from("goals").insert({
      user_id: userId, name: goalName.trim(), type: "savings",
      target_amount: target, current_amount: 0,
      monthly_contribution: monthly, priority: "high",
    })
    setGoalSaving(false)
    if (!error) nextStep(6)
  }

  if (!visible) return null

  const progress = ((step - 1) / TOTAL_STEPS) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Points flash */}
        <AnimatePresence>
          {showPoints && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 z-10 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg"
            >
              +{STEP_POINTS[step > 1 ? (step - 1) as Step : 1]} pts ⭐
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(92dvh - 4px)" }}>
          <div className="p-6 pb-10">

            {/* Step indicator */}
            {step < 7 && (
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-muted-foreground font-semibold">
                  Etapa {step} de {TOTAL_STEPS - 1}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i < step ? "w-5 bg-primary" : "w-2 bg-muted"}`} />
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Welcome ─────────────────────────────────────── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="text-6xl">👋</div>
                    <h2 className="text-2xl font-black">Bem-vindo ao<br />Conta Comigo!</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Chega de chegar no fim do mês sem saber pra onde foi o dinheiro.
                      Em <strong className="text-foreground">menos de 3 minutos</strong> você vai ter controle total das suas finanças.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      ["📊", "Veja exatamente quanto pode gastar hoje"],
                      ["🎮", "Ganhe pontos e suba de nível organizando as finanças"],
                      ["🔔", "Nunca mais esqueça um vencimento"],
                    ].map(([emoji, text]) => (
                      <div key={text} className="flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3">
                        <span className="text-xl">{emoji}</span>
                        <span className="text-sm font-medium">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Como você quer ser chamado?</p>
                    <Input
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Seu primeiro nome"
                      className="rounded-2xl h-12 text-base"
                      onKeyDown={e => { if (e.key === "Enter" && name.trim()) nextStep(1) }}
                    />
                  </div>

                  <button onClick={() => name.trim() && nextStep(1)} disabled={!name.trim()}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    Vamos lá, {name || "..."} 🚀
                    <span className="text-xs opacity-70 font-normal">+10pts</span>
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: Create account ───────────────────────────────── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black mb-1">🏦 Onde fica seu dinheiro?</h2>
                    <p className="text-sm text-muted-foreground">Crie sua primeira conta para começar a controlar o saldo.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo de conta</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ACCOUNT_TYPES.map(t => (
                        <button key={t.id} onClick={() => setAccType(t.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-semibold transition-all ${accType === t.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                          <span className="text-2xl">{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Nome da conta</p>
                    <Input value={accName} onChange={e => setAccName(e.target.value)}
                      placeholder={accType === "wallet" ? "Carteira" : accType === "savings" ? "Poupança Nubank" : "Nubank, Itaú..."}
                      className="rounded-2xl h-12" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Saldo atual <span className="font-normal">(quanto tem agora?)</span></p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                      <Input value={accBalance} onChange={e => setAccBalance(e.target.value)}
                        inputMode="decimal" placeholder="0,00"
                        className="pl-10 rounded-2xl h-12 font-bold" />
                    </div>
                  </div>

                  <button onClick={handleCreateAccount} disabled={!accName.trim() || accSaving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    {accSaving ? "Criando..." : "Criar conta 🏦"}
                    {!accSaving && <span className="text-xs opacity-70 font-normal">+20pts</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 3: Register income ──────────────────────────────── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black mb-1">💚 Quanto você recebe?</h2>
                    <p className="text-sm text-muted-foreground">Registre sua renda principal deste mês. Isso define seu "dinheiro livre".</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo de renda</p>
                    <div className="grid grid-cols-2 gap-2">
                      {INCOME_CATS.map(c => (
                        <button key={c.id} onClick={() => setIncCat(c)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-xs font-semibold transition-all ${incCat.id === c.id ? "border-green-400 bg-green-50 text-green-700" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                          <span className="text-xl">{c.emoji}</span>{c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Valor recebido este mês</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                      <Input autoFocus value={incAmount} onChange={e => setIncAmount(e.target.value)}
                        inputMode="decimal" placeholder="0,00"
                        onKeyDown={e => { if (e.key === "Enter") handleIncome() }}
                        className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                    </div>
                  </div>

                  <button onClick={handleIncome} disabled={!incAmount || incSaving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                    {incSaving ? "Registrando..." : "Anotar renda 💚"}
                    {!incSaving && <span className="text-xs opacity-70 font-normal">+20pts</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 4: First expense ────────────────────────────────── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black mb-1">🔴 Registre um gasto</h2>
                    <p className="text-sm text-muted-foreground">Lembre de algo que você gastou hoje ou ontem. Qualquer coisa!</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Categoria</p>
                    <div className="grid grid-cols-3 gap-2">
                      {EXPENSE_CATS.slice(0, 6).map(c => (
                        <button key={c.id} onClick={() => setExpCat(c)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-[11px] font-semibold transition-all ${expCat.id === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                          <span className="text-xl">{c.emoji}</span>{c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Quanto gastou?</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                      <Input autoFocus value={expAmount} onChange={e => setExpAmount(e.target.value)}
                        inputMode="decimal" placeholder="0,00"
                        onKeyDown={e => { if (e.key === "Enter") handleExpense() }}
                        className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                    </div>
                  </div>

                  <button onClick={handleExpense} disabled={!expAmount || expSaving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    {expSaving ? "Registrando..." : "Registrar gasto 🔴"}
                    {!expSaving && <span className="text-xs opacity-70 font-normal">+10pts</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 5: Budget limit ─────────────────────────────────── */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black mb-1">🎯 Defina um teto de gastos</h2>
                    <p className="text-sm text-muted-foreground">Escolha uma categoria e coloque um limite mensal. O app vai te avisar quando estiver chegando perto.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Categoria</p>
                    <div className="grid grid-cols-4 gap-2">
                      {BUDGET_CATS.map(c => (
                        <button key={c.id} onClick={() => setBudCat(c)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-[10px] font-semibold transition-all ${budCat.id === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                          <span className="text-xl">{c.emoji}</span>
                          <span className="truncate w-full text-center">{c.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Limite mensal para {budCat.emoji} {budCat.id}</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                      <Input autoFocus value={budAmount} onChange={e => setBudAmount(e.target.value)}
                        inputMode="decimal" placeholder="ex: 500,00"
                        onKeyDown={e => { if (e.key === "Enter") handleBudget() }}
                        className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                    </div>
                  </div>

                  <button onClick={handleBudget} disabled={!budAmount || budSaving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    {budSaving ? "Salvando..." : "Definir limite 🎯"}
                    {!budSaving && <span className="text-xs opacity-70 font-normal">+40pts</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 6: Create goal ──────────────────────────────────── */}
              {step === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black mb-1">✈️ Qual é o seu sonho?</h2>
                    <p className="text-sm text-muted-foreground">Viagem, carro, reserva de emergência... Defina uma meta e acompanhe o progresso mês a mês.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[["✈️","Viagem"],["🚗","Carro"],["🏠","Imóvel"],["💎","Reserva"],["📱","Eletrônico"],["🎓","Educação"]].map(([e, l]) => (
                      <button key={l} onClick={() => setGoalName(l)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${goalName === l ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                        <span className="text-2xl">{e}</span>{l}
                      </button>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Ou escreva o nome do seu sonho</p>
                    <Input value={goalName} onChange={e => setGoalName(e.target.value)}
                      placeholder="ex: Viagem para Europa" className="rounded-2xl h-12" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Quanto custa?</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
                        <Input value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
                          inputMode="decimal" placeholder="0,00"
                          className="pl-8 rounded-2xl h-11 font-bold text-sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Poupar por mês</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
                        <Input value={goalMonthly} onChange={e => setGoalMonthly(e.target.value)}
                          inputMode="decimal" placeholder="0,00"
                          className="pl-8 rounded-2xl h-11 font-bold text-sm" />
                      </div>
                    </div>
                  </div>

                  {goalName && goalAmount && goalMonthly && (
                    <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 text-xs text-primary font-semibold">
                      ✨ Meta em aprox. {Math.ceil(parseFloat(goalAmount.replace(",",".") || "0") / (parseFloat(goalMonthly.replace(",",".") || "1") || 1))} meses
                    </div>
                  )}

                  <button onClick={handleGoal} disabled={!goalName.trim() || !goalAmount || goalSaving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    {goalSaving ? "Salvando..." : "Criar meta ✈️"}
                    {!goalSaving && <span className="text-xs opacity-70 font-normal">+50pts</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 7: Done ─────────────────────────────────────────── */}
              {step === 7 && (
                <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                    <div className="text-7xl mb-2">🏆</div>
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-black mb-2">Setup completo!</h2>
                    <p className="text-muted-foreground text-sm">
                      {name}, você acabou de desbloquear o controle financeiro que vai mudar o fim do seu mês.
                    </p>
                  </div>

                  <div className="rounded-3xl p-5 space-y-3" style={{ background: "linear-gradient(135deg,#7c3aed22,#7c3aed11)", border: "1px solid #7c3aed33" }}>
                    <p className="text-3xl font-black text-primary">{earned + STEP_POINTS[7]} pts</p>
                    <p className="text-sm text-muted-foreground">ganhos nessa sessão ⭐</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-left mt-2">
                      {[
                        ["🏦", "Conta criada"],
                        ["💚", "Renda registrada"],
                        ["🔴", "Gasto lançado"],
                        ["🎯", "Limite definido"],
                        ["✈️", "Meta criada"],
                        ["🏆", "Onboarding completo"],
                      ].map(([e, l]) => (
                        <div key={l} className="flex items-center gap-1.5 text-muted-foreground">
                          <Check className="size-3 text-green-500 shrink-0" />
                          {e} {l}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-left">
                    <p className="font-bold text-xs text-muted-foreground uppercase tracking-wide">O que fazer agora:</p>
                    {[
                      ["+ Lançar", "registre gastos do dia a dia"],
                      ["Planejar", "veja seu orçamento e próximos vencimentos"],
                      ["Início", "acompanhe seu score e missões semanais"],
                    ].map(([action, desc]) => (
                      <div key={action} className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2.5">
                        <ChevronRight className="size-4 text-primary shrink-0" />
                        <span><strong className="text-foreground">{action}</strong> — {desc}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={finish}
                    className="w-full h-14 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    Entrar no app 🚀
                    <span className="text-xs opacity-70 font-normal">+50pts</span>
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
