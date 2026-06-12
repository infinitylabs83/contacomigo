"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

const ACCOUNT_TYPES = [
  { id: "checking", emoji: "🏦", label: "Conta corrente" },
  { id: "savings",  emoji: "🐷", label: "Poupança" },
  { id: "wallet",   emoji: "👛", label: "Carteira / dinheiro" },
]
const INCOME_CATS = [
  { id: "salary",    emoji: "💼", label: "Salário" },
  { id: "freelance", emoji: "💻", label: "Freela" },
  { id: "rent",      emoji: "🏘️", label: "Aluguel" },
  { id: "other",     emoji: "💰", label: "Outros" },
]
const BUDGET_CATS = [
  { id: "Comida",     emoji: "🍔", color: "#F97316" },
  { id: "Mercado",    emoji: "🛒", color: "#84CC16" },
  { id: "Transporte", emoji: "🚗", color: "#3B82F6" },
  { id: "Moradia",    emoji: "🏠", color: "#6B7280" },
  { id: "Saúde",      emoji: "💊", color: "#EF4444" },
  { id: "Lazer",      emoji: "🎮", color: "#EC4899" },
  { id: "Assinatura", emoji: "📱", color: "#0EA5E9" },
  { id: "Estudo",     emoji: "📚", color: "#8B5CF6" },
]
const EXPENSE_CATS = [
  { id: "cat-food",      emoji: "🍔", label: "Comida" },
  { id: "cat-market",    emoji: "🛒", label: "Mercado" },
  { id: "cat-transport", emoji: "🚗", label: "Transporte" },
  { id: "cat-housing",   emoji: "🏠", label: "Moradia" },
  { id: "cat-health",    emoji: "💊", label: "Saúde" },
  { id: "cat-leisure",   emoji: "🎮", label: "Lazer" },
]

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7
const STEP_POINTS: Record<Step, number> = { 1: 10, 2: 20, 3: 20, 4: 10, 5: 40, 6: 50, 7: 50 }
const TOTAL_STEPS = 7

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]   = useState<Step>(1)
  const [earned, setEarned] = useState(0)
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [showFlash, setShowFlash] = useState(false)
  const [lastPts, setLastPts] = useState(0)

  // Step 1
  const [name, setName] = useState("")
  // Step 2
  const [accName, setAccName]       = useState("")
  const [accType, setAccType]       = useState("checking")
  const [accBalance, setAccBalance] = useState("")
  const [accSaving, setAccSaving]   = useState(false)
  // Step 3
  const [incCat, setIncCat]       = useState(INCOME_CATS[0])
  const [incAmount, setIncAmount] = useState("")
  const [incSaving, setIncSaving] = useState(false)
  // Step 4
  const [expCat, setExpCat]       = useState(EXPENSE_CATS[0])
  const [expAmount, setExpAmount] = useState("")
  const [expSaving, setExpSaving] = useState(false)
  // Step 5
  const [budCat, setBudCat]       = useState(BUDGET_CATS[0])
  const [budAmount, setBudAmount] = useState("")
  const [budSaving, setBudSaving] = useState(false)
  // Step 6
  const [goalName, setGoalName]       = useState("")
  const [goalAmount, setGoalAmount]   = useState("")
  const [goalMonthly, setGoalMonthly] = useState("")
  const [goalSaving, setGoalSaving]   = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return }
      setUserId(data.user.id)
      const n = (data.user.user_metadata?.full_name as string)?.split(" ")[0] ?? ""
      setUserName(n)
      setName(n)
    })
  }, [router])

  function flash(pts: number) {
    setLastPts(pts)
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 1200)
  }

  function advance(from: Step) {
    flash(STEP_POINTS[from])
    setEarned(p => p + STEP_POINTS[from])
    setStep((from + 1) as Step)
  }

  async function handleAccount() {
    if (!accName.trim()) return
    setAccSaving(true)
    const supabase = createClient()
    const balance = parseFloat(accBalance.replace(",", ".")) || 0
    await supabase.from("accounts").insert({
      user_id: userId, name: accName.trim(), type: accType,
      color: "#7c3aed", icon: "bank",
      initial_balance: balance, current_balance: balance, is_active: true,
    })
    setAccSaving(false)
    advance(2)
  }

  async function handleIncome() {
    const parsed = parseFloat(incAmount.replace(",", "."))
    if (!parsed || parsed <= 0) return
    setIncSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("transactions").insert({
      user_id: userId, type: "income",
      description: incCat.label, amount: parsed, date: today,
      status: "confirmed", notes: `${incCat.emoji}|${incCat.label}`,
      tags: [], is_recurring: false,
    })
    setIncSaving(false)
    advance(3)
  }

  async function handleExpense() {
    const parsed = parseFloat(expAmount.replace(",", "."))
    if (!parsed || parsed <= 0) return
    setExpSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    const { data: accs } = await supabase.from("accounts").select("id").eq("is_active", true).limit(1)
    await supabase.from("transactions").insert({
      user_id: userId, type: "expense",
      description: expCat.label, amount: parsed, date: today,
      account_id: accs?.[0]?.id ?? null, status: "confirmed",
      notes: `${expCat.emoji}|${expCat.label}`,
      tags: [], is_recurring: false,
    })
    setExpSaving(false)
    advance(4)
  }

  async function handleBudget() {
    const val = parseFloat(budAmount.replace(",", "."))
    if (!val || val <= 0) return
    setBudSaving(true)
    const supabase = createClient()
    const now = new Date()
    await supabase.from("budget_limits").insert({
      user_id: userId, category_key: budCat.id, category_label: budCat.id,
      emoji: budCat.emoji, amount_limit: val,
      month: now.getMonth() + 1, year: now.getFullYear(),
    })
    setBudSaving(false)
    advance(5)
  }

  async function handleGoal() {
    const target = parseFloat(goalAmount.replace(",", "."))
    if (!goalName.trim() || !target) return
    setGoalSaving(true)
    const supabase = createClient()
    const monthly = parseFloat(goalMonthly.replace(",", ".")) || 0
    await supabase.from("goals").insert({
      user_id: userId, name: goalName.trim(), type: "savings",
      target_amount: target, current_amount: 0,
      monthly_contribution: monthly, priority: "high",
    })
    setGoalSaving(false)
    advance(6)
  }

  async function finish() {
    flash(STEP_POINTS[7])
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { onboarding_done: true } })
    setTimeout(() => router.replace("/dashboard"), 1800)
  }

  const progress = ((step - 1) / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative">

        {/* Points flash */}
        <AnimatePresence>
          {showFlash && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute -top-10 right-0 bg-amber-400 text-amber-900 text-sm font-black px-4 py-1.5 rounded-full shadow-lg z-10">
              +{lastPts} pts ⭐
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        {step < 7 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Etapa {step} de {TOTAL_STEPS - 1}</span>
              <span className="font-semibold text-primary">{earned} pts ganhos</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 transition-all ${i < step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Welcome ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div className="text-center space-y-3">
                <div className="text-6xl">👋</div>
                <h2 className="text-2xl font-black">Bem-vindo ao<br />Conta Comigo!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chega de chegar no fim do mês sem saber pra onde foi o dinheiro.
                  Em <strong className="text-foreground">menos de 3 minutos</strong> você vai ter controle total das suas finanças.
                </p>
              </div>
              <div className="space-y-2">
                {[["📊","Veja exatamente quanto pode gastar hoje"],["🎮","Ganhe pontos organizando as finanças"],["🔔","Nunca mais esqueça um vencimento"]].map(([e,t]) => (
                  <div key={t} className="flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3">
                    <span className="text-xl">{e}</span><span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Como você quer ser chamado?</p>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu primeiro nome"
                  className="rounded-2xl h-12 text-base" onKeyDown={e => { if (e.key === "Enter" && name.trim()) advance(1) }} />
              </div>
              <button onClick={() => name.trim() && advance(1)} disabled={!name.trim()}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                Vamos lá, {name || "..."} 🚀 <span className="text-xs opacity-70 font-normal">+10pts</span>
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Account ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">🏦 Onde fica seu dinheiro?</h2>
                <p className="text-sm text-muted-foreground">Crie sua primeira conta para controlar o saldo.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo de conta</p>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map(t => (
                    <button key={t.id} onClick={() => setAccType(t.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-semibold transition-all ${accType === t.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                      <span className="text-2xl">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Nome da conta</p>
                <Input value={accName} onChange={e => setAccName(e.target.value)}
                  placeholder={accType === "wallet" ? "Carteira" : "Nubank, Itaú, BTG..."}
                  className="rounded-2xl h-12" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Saldo atual <span className="font-normal opacity-60">(quanto tem agora?)</span></p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                  <Input value={accBalance} onChange={e => setAccBalance(e.target.value)} inputMode="decimal" placeholder="0,00"
                    className="pl-10 rounded-2xl h-12 font-bold" />
                </div>
              </div>
              <button onClick={handleAccount} disabled={!accName.trim() || accSaving}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                {accSaving ? "Criando..." : <> Criar conta 🏦 <span className="text-xs opacity-70 font-normal">+20pts</span> </>}
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Income ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">💚 Quanto você recebe?</h2>
                <p className="text-sm text-muted-foreground">Registre sua renda deste mês. Isso define seu "dinheiro livre".</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {INCOME_CATS.map(c => (
                  <button key={c.id} onClick={() => setIncCat(c)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-xs font-semibold transition-all ${incCat.id === c.id ? "border-green-400 bg-green-50 text-green-700" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                    <span className="text-xl">{c.emoji}</span>{c.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Valor recebido este mês</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                  <Input autoFocus value={incAmount} onChange={e => setIncAmount(e.target.value)} inputMode="decimal" placeholder="0,00"
                    onKeyDown={e => { if (e.key === "Enter") handleIncome() }}
                    className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                </div>
              </div>
              <button onClick={handleIncome} disabled={!incAmount || incSaving}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                {incSaving ? "Registrando..." : <> Anotar renda 💚 <span className="text-xs opacity-70 font-normal">+20pts</span> </>}
              </button>
            </motion.div>
          )}

          {/* ── STEP 4: Expense ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">🔴 Registre um gasto</h2>
                <p className="text-sm text-muted-foreground">Pense em algo que você gastou hoje ou ontem. Qualquer coisa!</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATS.map(c => (
                  <button key={c.id} onClick={() => setExpCat(c)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-[11px] font-semibold transition-all ${expCat.id === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                    <span className="text-xl">{c.emoji}</span>{c.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Quanto gastou?</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                  <Input autoFocus value={expAmount} onChange={e => setExpAmount(e.target.value)} inputMode="decimal" placeholder="0,00"
                    onKeyDown={e => { if (e.key === "Enter") handleExpense() }}
                    className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                </div>
              </div>
              <button onClick={handleExpense} disabled={!expAmount || expSaving}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                {expSaving ? "Registrando..." : <> Registrar gasto 🔴 <span className="text-xs opacity-70 font-normal">+10pts</span> </>}
              </button>
            </motion.div>
          )}

          {/* ── STEP 5: Budget ── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">🎯 Defina um teto de gastos</h2>
                <p className="text-sm text-muted-foreground">O app te avisa quando estiver chegando no limite da categoria.</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BUDGET_CATS.map(c => (
                  <button key={c.id} onClick={() => setBudCat(c)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 text-[10px] font-semibold transition-all ${budCat.id === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                    <span className="text-xl">{c.emoji}</span>
                    <span className="truncate w-full text-center">{c.id}</span>
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Limite mensal para {budCat.emoji} {budCat.id}</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                  <Input autoFocus value={budAmount} onChange={e => setBudAmount(e.target.value)} inputMode="decimal" placeholder="ex: 500,00"
                    onKeyDown={e => { if (e.key === "Enter") handleBudget() }}
                    className="pl-10 rounded-2xl h-14 text-2xl font-black" />
                </div>
              </div>
              <button onClick={handleBudget} disabled={!budAmount || budSaving}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                {budSaving ? "Salvando..." : <> Definir limite 🎯 <span className="text-xs opacity-70 font-normal">+40pts</span> </>}
              </button>
            </motion.div>
          )}

          {/* ── STEP 6: Goal ── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">✈️ Qual é o seu sonho?</h2>
                <p className="text-sm text-muted-foreground">Defina uma meta e acompanhe o progresso mês a mês.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[["✈️","Viagem"],["🚗","Carro"],["🏠","Imóvel"],["💎","Reserva"],["📱","Eletrônico"],["🎓","Educação"]].map(([e,l]) => (
                  <button key={l} onClick={() => setGoalName(l as string)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${goalName === l ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                    <span className="text-2xl">{e}</span>{l}
                  </button>
                ))}
              </div>
              <Input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="ou escreva o nome do sonho..."
                className="rounded-2xl h-11 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Quanto custa?</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
                    <Input value={goalAmount} onChange={e => setGoalAmount(e.target.value)} inputMode="decimal" placeholder="0,00"
                      className="pl-8 rounded-2xl h-11 font-bold text-sm" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Poupar/mês</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
                    <Input value={goalMonthly} onChange={e => setGoalMonthly(e.target.value)} inputMode="decimal" placeholder="0,00"
                      className="pl-8 rounded-2xl h-11 font-bold text-sm" />
                  </div>
                </div>
              </div>
              {goalName && goalAmount && goalMonthly && (
                <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-2.5 text-xs text-primary font-semibold">
                  ✨ Meta em aprox. {Math.ceil(parseFloat(goalAmount.replace(",",".") || "0") / (parseFloat(goalMonthly.replace(",",".") || "1") || 1))} meses
                </div>
              )}
              <button onClick={handleGoal} disabled={!goalName.trim() || !goalAmount || goalSaving}
                className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                {goalSaving ? "Salvando..." : <> Criar meta ✈️ <span className="text-xs opacity-70 font-normal">+50pts</span> </>}
              </button>
            </motion.div>
          )}

          {/* ── STEP 7: Done ── */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-3xl shadow-xl p-6 space-y-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                <div className="text-7xl mb-2">🏆</div>
              </motion.div>
              <div>
                <h2 className="text-2xl font-black mb-2">Setup completo!</h2>
                <p className="text-sm text-muted-foreground">
                  {name || userName}, você acabou de desbloquear o controle financeiro que vai mudar o fim do seu mês.
                </p>
              </div>
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <p className="text-3xl font-black text-primary">{earned + STEP_POINTS[7]} pts</p>
                <p className="text-xs text-muted-foreground">ganhos nessa sessão ⭐</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-left mt-2">
                  {[["🏦","Conta criada"],["💚","Renda registrada"],["🔴","Gasto lançado"],["🎯","Limite definido"],["✈️","Meta criada"],["🏆","Setup completo"]].map(([e,l]) => (
                    <div key={l} className="flex items-center gap-1.5 text-muted-foreground">
                      <Check className="size-3 text-green-500 shrink-0" />{e} {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm text-left">
                <p className="font-bold text-xs text-muted-foreground uppercase tracking-wide">O que fazer agora:</p>
                {[["+ Lançar","registre gastos do dia a dia"],["Planejar","orçamento e próximos vencimentos"],["Início","seu score e missões semanais"]].map(([a,d]) => (
                  <div key={a} className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2.5">
                    <ChevronRight className="size-4 text-primary shrink-0" />
                    <span><strong className="text-foreground">{a}</strong> — {d}</span>
                  </div>
                ))}
              </div>
              <button onClick={finish}
                className="w-full h-14 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                Entrar no app 🚀 <span className="text-xs opacity-70 font-normal">+50pts</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
