"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Wallet, PiggyBank, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

const TOTAL_STEPS = 9
const STEP_POINTS: Record<Step, number> = {
  1: 10, 2: 20, 3: 20, 4: 10, 5: 20, 6: 10, 7: 40, 8: 50, 9: 50,
}

// ─── Mockup helpers ───────────────────────────────────────────────────────────

function MockBottomNav({ highlight }: { highlight?: string }) {
  const tabs = [
    { id: "home",    emoji: "🏠", label: "Início" },
    { id: "plan",    emoji: "📋", label: "Planejar" },
    { id: "add",     fab: true },
    { id: "cards",   emoji: "💳", label: "Contas" },
    { id: "profile", emoji: "👤", label: "Perfil" },
  ]
  return (
    <div className="flex items-center justify-around bg-card border-t border-border/50 px-1 py-1.5">
      {tabs.map(t => (
        <div key={t.id} className={`flex flex-col items-center gap-0.5 ${t.fab ? "relative -top-3" : ""}`}>
          {t.fab ? (
            <motion.div
              animate={highlight === "add" ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white font-black text-xl ${highlight === "add" ? "ring-4 ring-primary/40" : ""}`}
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              +
            </motion.div>
          ) : (
            <div className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl ${highlight === t.id ? "bg-primary/10" : ""}`}>
              <span className="text-base">{t.emoji}</span>
              <span className={`text-[9px] font-semibold ${highlight === t.id ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
              {highlight === t.id && <div className="w-4 h-0.5 rounded-full bg-primary" />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PhoneMock({ children, highlight }: { children: React.ReactNode; highlight?: string }) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="rounded-[2rem] border-4 border-foreground/10 bg-card shadow-2xl overflow-hidden">
        <div className="h-5 bg-primary/10 flex items-center justify-center">
          <div className="w-14 h-1 bg-foreground/20 rounded-full" />
        </div>
        {children}
        <MockBottomNav highlight={highlight} />
      </div>
    </div>
  )
}

// ─── Reusable UI pieces ───────────────────────────────────────────────────────

function RangeSelector({ label, options, value, onChange }: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
              value === o.value
                ? "border-primary bg-primary/8 text-primary"
                : "border-border/50 bg-muted/30 text-muted-foreground"
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PrimaryBtn({ onClick, disabled, loading, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="w-full rounded-2xl text-white font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2 py-4"
      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
      {loading ? "Salvando..." : children}
    </button>
  )
}

function SkipBtn({ onSkip }: { onSkip: () => void }) {
  return (
    <button onClick={onSkip} className="w-full text-center text-sm text-muted-foreground py-1.5 hover:text-foreground transition-colors">
      Pular por agora →
    </button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
      ← Voltar
    </button>
  )
}

function StepTitle({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-black leading-tight">{title}</h2>
      </div>
      <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const incomeCategories = [
  { id: "Salário",   emoji: "💼" },
  { id: "Autônomo",  emoji: "💻" },
  { id: "Aluguel",   emoji: "🏘️" },
  { id: "Outros",    emoji: "💰" },
]
const incomeCatIdMap: Record<string, string> = {
  "Salário":  "cat-salary",
  "Autônomo": "cat-freelance",
  "Aluguel":  "cat-rent-in",
  "Outros":   "cat-other-in",
}
const expenseCategories = [
  { id: "🍔|Comida",      emoji: "🍔", label: "Comida" },
  { id: "🛒|Mercado",     emoji: "🛒", label: "Mercado" },
  { id: "🚗|Transporte",  emoji: "🚗", label: "Transporte" },
  { id: "🏠|Moradia",     emoji: "🏠", label: "Moradia" },
  { id: "💊|Saúde",       emoji: "💊", label: "Saúde" },
  { id: "🐾|Pet",         emoji: "🐾", label: "Pet" },
  { id: "🎮|Lazer",       emoji: "🎮", label: "Lazer" },
]
const expenseCatIdMap: Record<string, string> = {
  "🍔|Comida":     "cat-food",
  "🛒|Mercado":    "cat-market",
  "🚗|Transporte": "cat-transport",
  "🏠|Moradia":    "cat-housing",
  "💊|Saúde":      "cat-health",
  "🐾|Pet":        "cat-pet",
  "🎮|Lazer":      "cat-leisure",
}
const budgetCategories = [
  { id: "🍔|Comida",      emoji: "🍔", label: "Comida" },
  { id: "🛒|Mercado",     emoji: "🛒", label: "Mercado" },
  { id: "🚗|Transporte",  emoji: "🚗", label: "Transporte" },
  { id: "🏠|Moradia",     emoji: "🏠", label: "Moradia" },
  { id: "💊|Saúde",       emoji: "💊", label: "Saúde" },
  { id: "🐾|Pet",         emoji: "🐾", label: "Pet" },
  { id: "🎮|Lazer",       emoji: "🎮", label: "Lazer" },
  { id: "📱|Assinatura",  emoji: "📱", label: "Assinatura" },
  { id: "📚|Estudo",      emoji: "📚", label: "Estudo" },
]
const goalOptions = [
  { emoji: "✈️", label: "Viagem" },
  { emoji: "🚗", label: "Carro" },
  { emoji: "🏠", label: "Imóvel" },
  { emoji: "💎", label: "Reserva" },
  { emoji: "📱", label: "Eletrônico" },
  { emoji: "🎓", label: "Faculdade" },
  { emoji: "🐾", label: "Pet" },
  { emoji: "🎁", label: "Outro" },
]
const accTypes = [
  { id: "checking", Icon: Building2, label: "Conta corrente" },
  { id: "savings",  Icon: PiggyBank,  label: "Poupança" },
  { id: "wallet",   Icon: Wallet,     label: "Carteira / dinheiro" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]     = useState<Step>(1)
  const [earned, setEarned] = useState(0)
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [flashPts, setFlashPts] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // step 2
  const [accName, setAccName]   = useState("")
  const [accType, setAccType]   = useState("checking")
  const [accRange, setAccRange] = useState("")
  // step 3
  const [hasCard, setHasCard]     = useState<boolean | null>(null)
  const [cardName, setCardName]   = useState("")
  const [cardLimit, setCardLimit] = useState("")
  // step 5
  const [incCat, setIncCat]     = useState("Salário")
  const [incRange, setIncRange] = useState("")
  // step 6
  const [expCat, setExpCat]     = useState("🍔|Comida")
  const [expRange, setExpRange] = useState("")
  // step 7
  const [budCat, setBudCat]     = useState("🍔|Comida")
  const [budRange, setBudRange] = useState("")
  // step 8
  const [goalName, setGoalName]   = useState("")
  const [goalRange, setGoalRange] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return }
      setUserId(data.user.id)
      const n = (data.user.user_metadata?.full_name as string)?.split(" ")[0] ?? "você"
      setUserName(n)
    })
  }, [router])

  function flash(pts: number) {
    setFlashPts(pts)
    setTimeout(() => setFlashPts(null), 1300)
  }

  function advance(from: Step, skip = false) {
    const pts = skip ? Math.floor(STEP_POINTS[from] / 2) : STEP_POINTS[from]
    flash(pts)
    setEarned(p => p + pts)
    setStep((from + 1) as Step)
  }

  function goBack() {
    if (step > 1) setStep((step - 1) as Step)
  }

  async function saveAccount(skip = false) {
    if (!skip && accName.trim()) {
      setSaving(true)
      const supabase = createClient()
      const balanceMap: Record<string, number> = { "ate-1k": 500, "1k-5k": 2500, "5k-15k": 8000, "15k+": 20000 }
      const bal = balanceMap[accRange] ?? 0
      await supabase.from("accounts").insert({
        user_id: userId, name: accName.trim(), type: accType,
        color: "#7c3aed", icon: "bank",
        initial_balance: bal, current_balance: bal, is_active: true,
      })
      setSaving(false)
    }
    advance(2, skip)
  }

  async function saveCard(skip = false) {
    if (!skip && hasCard && cardName.trim()) {
      setSaving(true)
      const supabase = createClient()
      const limitMap: Record<string, number> = { "ate-2k": 1000, "2k-5k": 3000, "5k-10k": 7000, "10k+": 15000 }
      await supabase.from("accounts").insert({
        user_id: userId, name: cardName.trim(), type: "credit",
        color: "#6d28d9", icon: "credit-card",
        initial_balance: 0, current_balance: 0, is_active: true,
        credit_limit: limitMap[cardLimit] ?? 0,
      })
      setSaving(false)
    }
    advance(3, skip)
  }

  async function saveIncome(skip = false) {
    if (!skip && incRange) {
      setSaving(true)
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      const uid = u?.id ?? userId
      const valMap: Record<string, number> = { "ate-2k": 1500, "2k-5k": 3500, "5k-10k": 7500, "10k+": 12000 }
      const emojis: Record<string, string> = { Salário: "💼", Autônomo: "💻", Aluguel: "🏘️", Outros: "💰" }
      const today = new Date().toISOString().split("T")[0]
      await supabase.from("transactions").insert({
        user_id: uid, type: "income", description: incCat,
        amount: valMap[incRange] ?? 1000, date: today, status: "confirmed",
        category_id: incomeCatIdMap[incCat] ?? null,
        notes: `${emojis[incCat] ?? "💰"}|${incCat}`, tags: [], is_recurring: false,
      })
      setSaving(false)
    }
    advance(5, skip)
  }

  async function saveExpense(skip = false) {
    if (!skip && expRange) {
      setSaving(true)
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      const uid = u?.id ?? userId
      const valMap: Record<string, number> = { "ate-50": 30, "50-200": 100, "200-500": 300, "500+": 700 }
      const today = new Date().toISOString().split("T")[0]
      const [emoji, label] = expCat.split("|")
      const { data: accs } = await supabase.from("accounts").select("id").eq("is_active", true).limit(1)
      await supabase.from("transactions").insert({
        user_id: uid, type: "expense", description: label,
        amount: valMap[expRange] ?? 50, date: today,
        account_id: accs?.[0]?.id ?? null, status: "confirmed",
        category_id: expenseCatIdMap[expCat] ?? null,
        notes: `${emoji}|${label}`, tags: [], is_recurring: false,
      })
      setSaving(false)
    }
    advance(6, skip)
  }

  async function saveBudget(skip = false) {
    if (!skip && budRange) {
      setSaving(true)
      const supabase = createClient()
      const valMap: Record<string, number> = { "ate-300": 200, "300-800": 500, "800-2k": 1200, "2k+": 3000 }
      const now = new Date()
      const [emoji, label] = budCat.split("|")
      await supabase.from("budget_limits").insert({
        user_id: userId, category_key: label, category_label: label, emoji,
        amount_limit: valMap[budRange] ?? 300,
        month: now.getMonth() + 1, year: now.getFullYear(),
      })
      setSaving(false)
    }
    advance(7, skip)
  }

  async function saveGoal(skip = false) {
    if (!skip && goalName.trim() && goalRange) {
      setSaving(true)
      const supabase = createClient()
      const valMap: Record<string, number> = { "ate-2k": 1000, "2k-10k": 5000, "10k-50k": 25000, "50k+": 80000 }
      await supabase.from("goals").insert({
        user_id: userId, name: goalName.trim(), type: "savings",
        target_amount: valMap[goalRange] ?? 2000,
        current_amount: 0, monthly_contribution: 0, priority: "high",
      })
      setSaving(false)
    }
    advance(8, skip)
  }

  async function finish() {
    flash(STEP_POINTS[9])
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { onboarding_done: true } })
    setTimeout(() => router.replace("/dashboard"), 1800)
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100
  const budCatLabel = budCat.split("|")[1] ?? budCat

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.replace("/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-primary/5 to-background px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-4 pb-8">

        {/* Botão sair — sempre visível no topo */}
        <div className="flex justify-end">
          <button onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200">
            Sair da conta →
          </button>
        </div>

        {/* Flash de pontos */}
        <AnimatePresence>
          {flashPts !== null && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-4 right-4 z-50 bg-amber-400 text-amber-900 text-sm font-black px-4 py-2 rounded-full shadow-lg pointer-events-none">
              +{flashPts} pts ⭐
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progresso */}
        {step < TOTAL_STEPS && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Etapa {step} de {TOTAL_STEPS - 1}</span>
              <span className="font-semibold text-primary">{earned} pts ganhos</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── ETAPA 1: Boas-vindas ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              {/* Mockup */}
              <div className="bg-primary/5 p-4">
                <PhoneMock highlight="home">
                  <div className="px-3 py-2 bg-primary/5">
                    <p className="text-[9px] text-muted-foreground">Bem-vindo ao</p>
                    <p className="text-sm font-black">Conta Comigo 👋</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="h-12 rounded-xl bg-primary/10 flex items-center px-3 gap-2">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Disponível hoje</p>
                        <p className="text-sm font-black text-primary">Vamos configurar!</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {["📊 Score","🎯 Meta","📋 Limites"].map(l => (
                        <div key={l} className="h-8 rounded-lg bg-muted/60 flex items-center justify-center text-[8px] font-semibold text-muted-foreground">{l}</div>
                      ))}
                    </div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black">Olá, {userName}! 🎉</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vou te mostrar cada parte do app enquanto a gente configura tudo juntos.
                    <strong className="text-foreground"> Vai levar menos de 3 minutos!</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    ["🗺️", "Você vai ver exatamente onde fica cada coisa"],
                    ["💡", "Decide o que quer preencher — sem pressão"],
                    ["⭐", "Ganha pontos a cada etapa concluída"],
                  ].map(([e, t]) => (
                    <div key={t} className="flex items-center gap-3 bg-muted/40 rounded-2xl px-4 py-2.5">
                      <span className="text-xl">{e}</span>
                      <span className="text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>
                <PrimaryBtn onClick={() => advance(1)}>
                  Vamos lá! 🚀 <span className="text-xs opacity-70 font-normal">+10 pts</span>
                </PrimaryBtn>
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 2: Conta bancária ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary text-center mb-2 uppercase tracking-wide">📍 Aqui no app → Aba Contas</p>
                <PhoneMock highlight="cards">
                  <div className="px-3 py-2 bg-primary/5">
                    <p className="text-[9px] text-muted-foreground">Aba Contas →</p>
                    <p className="text-sm font-black">Minhas Contas</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)", "0 0 0 4px rgba(124,58,237,0.3)", "0 0 0 0 rgba(124,58,237,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-14 rounded-xl border-2 border-primary/40 bg-primary/8 flex items-center px-3 gap-2">
                      <Building2 className="size-5 text-primary" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Sua conta vai aparecer aqui</p>
                        <p className="text-xs font-black text-primary">+ Adicionar conta</p>
                      </div>
                    </motion.div>
                    <div className="h-7 rounded-xl bg-muted/30 flex items-center px-3">
                      <span className="text-[9px] text-muted-foreground">💳 Cartão → próxima etapa</span>
                    </div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="🏦" title="Onde fica seu dinheiro?"
                  desc="Na aba Contas você vê o saldo de tudo num lugar só — banco, poupança, carteira. O app soma automaticamente e mostra quanto você tem disponível." />

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Que tipo de conta você usa mais?</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {accTypes.map(({ id, Icon, label }) => (
                      <button key={id} onClick={() => setAccType(id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${accType === id ? "border-primary bg-primary/8 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                        <Icon className="size-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Como você chama essa conta?</p>
                  <input value={accName} onChange={e => setAccName(e.target.value)}
                    placeholder={accType === "wallet" ? "ex: Carteira" : "ex: Nubank, Itaú, Inter..."}
                    className="w-full h-11 rounded-2xl border border-border/60 bg-muted/20 px-4 text-sm font-medium outline-none focus:border-primary transition-colors" />
                </div>

                <RangeSelector
                  label="Mais ou menos quanto tem nessa conta hoje? (totalmente opcional!)"
                  value={accRange}
                  onChange={setAccRange}
                  options={[
                    { label: "Até R$ 1.000", value: "ate-1k" },
                    { label: "R$ 1k – R$ 5k", value: "1k-5k" },
                    { label: "R$ 5k – R$ 15k", value: "5k-15k" },
                    { label: "R$ 15k ou mais", value: "15k+" },
                  ]}
                />
                <p className="text-xs text-muted-foreground text-center -mt-2">
                  Não precisa ser o valor exato — uma faixa já ajuda o app 😊
                </p>

                <PrimaryBtn onClick={() => saveAccount(false)} disabled={!accName.trim()} loading={saving}>
                  Criar minha conta 🏦 <span className="text-xs opacity-70 font-normal">+20 pts</span>
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveAccount(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 3: Cartão de crédito ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary text-center mb-2 uppercase tracking-wide">📍 Aqui no app → Aba Contas → Cartões</p>
                <PhoneMock highlight="cards">
                  <div className="px-3 py-2 bg-primary/5">
                    <p className="text-[9px] text-muted-foreground">Aba Contas →</p>
                    <p className="text-sm font-black">Meus Cartões</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)", "0 0 0 4px rgba(124,58,237,0.3)", "0 0 0 0 rgba(124,58,237,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-16 rounded-xl p-2.5 flex flex-col justify-between"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#4c1d95)" }}>
                      <div className="flex justify-between items-start">
                        <CreditCard className="size-3.5 text-white/70" />
                        <span className="text-[9px] text-white/60 font-semibold">CRÉDITO</span>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/60">Fatura atual</p>
                        <p className="text-xs font-black text-white">R$ 0,00</p>
                      </div>
                    </motion.div>
                    <div className="h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center px-2">
                      <span className="text-[9px] text-amber-700 font-semibold">💳 Botão "Pagar fatura" aparece aqui</span>
                    </div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="💳" title="Você usa cartão de crédito?"
                  desc="Se sim, o app acompanha seus gastos no cartão separado do saldo da conta. Toda vez que você gastar no cartão, registra aqui. Na virada do mês, aparece um botão para pagar a fatura." />

                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5">
                  <p className="text-sm text-blue-700 font-medium">
                    💡 <strong>Conta</strong> = dinheiro que você já tem.<br />
                    <strong>Cartão</strong> = dinheiro que você ainda vai pagar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[{ v: true, label: "✅ Sim, uso cartão" }, { v: false, label: "❌ Não uso cartão" }].map(o => (
                    <button key={String(o.v)} onClick={() => setHasCard(o.v)}
                      className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${hasCard === o.v ? "border-primary bg-primary/8 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {hasCard === true && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Qual é o nome do seu cartão?</p>
                        <input value={cardName} onChange={e => setCardName(e.target.value)}
                          placeholder="ex: Nubank, Itaú Platinum, C6..."
                          className="w-full h-11 rounded-2xl border border-border/60 bg-muted/20 px-4 text-sm font-medium outline-none focus:border-primary transition-colors" />
                      </div>
                      <RangeSelector
                        label="Qual é o limite do cartão? (opcional — só pra estimar)"
                        value={cardLimit}
                        onChange={setCardLimit}
                        options={[
                          { label: "Até R$ 2.000",   value: "ate-2k" },
                          { label: "R$ 2k – R$ 5k",  value: "2k-5k" },
                          { label: "R$ 5k – R$ 10k", value: "5k-10k" },
                          { label: "R$ 10k ou mais", value: "10k+" },
                        ]}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        🔒 Não pedimos número do cartão nem dados do banco. Isso fica só aqui!
                      </p>
                    </motion.div>
                  )}
                  {hasCard === false && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-muted/40 rounded-2xl px-4 py-3 text-sm text-muted-foreground text-center">
                      Tudo bem! Se um dia quiser adicionar, é só ir na aba Contas 😊
                    </motion.div>
                  )}
                </AnimatePresence>

                <PrimaryBtn
                  onClick={() => saveCard(false)}
                  disabled={hasCard === null || (hasCard === true && !cardName.trim())}
                  loading={saving}>
                  {hasCard === false
                    ? "Continuar sem cartão →"
                    : <> Adicionar cartão 💳 <span className="text-xs opacity-70 font-normal">+20 pts</span> </>}
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveCard(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 4: O botão + ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary text-center mb-2 uppercase tracking-wide">📍 Esse botão aqui embaixo</p>
                <PhoneMock highlight="add">
                  <div className="px-3 py-2 bg-primary/5">
                    <p className="text-sm font-black">Lançar transação</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-8 rounded-xl bg-green-100 border-2 border-green-400 flex items-center justify-center">
                        <span className="text-[10px] font-black text-green-700">💚 Entrou dinheiro</span>
                      </div>
                      <div className="h-8 rounded-xl bg-red-100 border-2 border-red-300 flex items-center justify-center">
                        <span className="text-[10px] font-black text-red-700">🔴 Saiu dinheiro</span>
                      </div>
                    </div>
                    <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center px-3">
                      <span className="text-[9px] text-muted-foreground">👆 Toca na categoria → digita o valor → salvo!</span>
                    </div>
                    <div className="h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-black text-primary">✅ Pronto em menos de 10 segundos</span>
                    </div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="➕" title="O coração do app: o botão +"
                  desc="Sempre que gastar ou receber dinheiro, você usa esse botão roxo no centro da tela. Simples assim — menos de 10 segundos por lançamento!" />

                <div className="space-y-2">
                  {[
                    ["💚", "Aba verde → dinheiro que entrou (salário, renda autônoma, Pix recebido...)"],
                    ["🔴", "Aba vermelha → dinheiro que saiu (compra, conta, transferência...)"],
                    ["📅", "Dá pra registrar datas passadas também — não precisa ser agora"],
                  ].map(([e, t]) => (
                    <div key={t} className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-2.5">
                      <span className="text-xl mt-0.5">{e}</span>
                      <span className="text-sm leading-snug">{t}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-muted-foreground bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
                  💡 Nas próximas etapas você vai usar esse botão pela primeira vez, com a gente guiando!
                </p>

                <PrimaryBtn onClick={() => advance(4)}>
                  Entendi! Vamos continuar →
                </PrimaryBtn>
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 5: Renda ── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-green-50/60 p-4">
                <p className="text-[10px] font-bold text-green-700 text-center mb-2 uppercase tracking-wide">📍 Botão + → aba verde</p>
                <PhoneMock highlight="add">
                  <div className="px-3 py-2 bg-green-50">
                    <p className="text-[9px] text-muted-foreground">Botão + →</p>
                    <p className="text-sm font-black">💚 Entrou dinheiro</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="h-8 rounded-xl bg-green-100 border-2 border-green-400 flex items-center justify-center">
                      <span className="text-[10px] font-black text-green-700">💚 Aba VERDE — selecionada</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {["💼","💻","🏘️","💰"].map(e => (
                        <div key={e} className="h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-base">{e}</div>
                      ))}
                    </div>
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(22,163,74,0)", "0 0 0 4px rgba(22,163,74,0.3)", "0 0 0 0 rgba(22,163,74,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-8 rounded-xl bg-green-500 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">✅ Salvar renda</span>
                    </motion.div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="💚" title="De onde vem seu dinheiro?"
                  desc="Vamos registrar sua principal entrada de renda do mês. Isso ajuda o app a calcular quanto você tem livre para gastar — a famosa &quot;grana disponível&quot;." />

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Qual é o tipo da sua renda principal?</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {incomeCategories.map(c => (
                      <button key={c.id} onClick={() => setIncCat(c.id)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-semibold transition-all ${incCat === c.id ? "border-green-400 bg-green-50 text-green-700" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                        <span className="text-xl">{c.emoji}</span>{c.id}
                      </button>
                    ))}
                  </div>
                </div>

                <RangeSelector
                  label="Mais ou menos quanto você costuma receber por mês? (opcional)"
                  value={incRange}
                  onChange={setIncRange}
                  options={[
                    { label: "Até R$ 2.000",   value: "ate-2k" },
                    { label: "R$ 2k – R$ 5k",  value: "2k-5k" },
                    { label: "R$ 5k – R$ 10k", value: "5k-10k" },
                    { label: "R$ 10k ou mais", value: "10k+" },
                  ]}
                />
                <p className="text-xs text-muted-foreground text-center -mt-2">
                  🔒 Só você vê isso. Uma estimativa já ajuda bastante!
                </p>

                <PrimaryBtn onClick={() => saveIncome(false)} disabled={!incRange} loading={saving}>
                  Registrar renda 💚 <span className="text-xs opacity-70 font-normal">+20 pts</span>
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveIncome(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 6: Gasto ── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-red-50/50 p-4">
                <p className="text-[10px] font-bold text-red-600 text-center mb-2 uppercase tracking-wide">📍 Botão + → aba vermelha</p>
                <PhoneMock highlight="add">
                  <div className="px-3 py-2 bg-red-50/80">
                    <p className="text-[9px] text-muted-foreground">Botão + →</p>
                    <p className="text-sm font-black">🔴 Saiu dinheiro</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="h-8 rounded-xl bg-red-100 border-2 border-red-400 flex items-center justify-center">
                      <span className="text-[10px] font-black text-red-700">🔴 Aba VERMELHA — selecionada</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {["🍔","🛒","🚗","🏠","💊","🐾"].map(e => (
                        <div key={e} className="h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-base">{e}</div>
                      ))}
                    </div>
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(239,68,68,0)", "0 0 0 4px rgba(239,68,68,0.3)", "0 0 0 0 rgba(239,68,68,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-7 rounded-xl bg-red-500 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">✅ Salvar gasto</span>
                    </motion.div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="🔴" title="Vamos registrar um gasto?"
                  desc="Pensa em algo que você gastou hoje ou essa semana. Pode ser qualquer coisa — um café, gasolina, mercado. Não precisa ser exato, pode ser uma estimativa!" />

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Que tipo de gasto foi?</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {expenseCategories.map(c => (
                      <button key={c.id} onClick={() => setExpCat(c.id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-xs font-semibold transition-all ${expCat === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                        <span className="text-xl">{c.emoji}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <RangeSelector
                  label="Quanto foi mais ou menos? (opcional)"
                  value={expRange}
                  onChange={setExpRange}
                  options={[
                    { label: "Menos de R$ 50",   value: "ate-50" },
                    { label: "R$ 50 – R$ 200",   value: "50-200" },
                    { label: "R$ 200 – R$ 500",  value: "200-500" },
                    { label: "R$ 500 ou mais",   value: "500+" },
                  ]}
                />

                <PrimaryBtn onClick={() => saveExpense(false)} disabled={!expRange} loading={saving}>
                  Registrar gasto 🔴 <span className="text-xs opacity-70 font-normal">+10 pts</span>
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveExpense(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 7: Limite de gastos ── */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary text-center mb-2 uppercase tracking-wide">📍 Aba Planejar → Meu Limite</p>
                <PhoneMock highlight="plan">
                  <div className="px-3 py-2 bg-primary/5">
                    <p className="text-[9px] text-muted-foreground">Aba Planejar →</p>
                    <p className="text-sm font-black">🎯 Meu Limite</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    {[{ emoji: "🍔", label: "Comida", pct: 70, color: "#F97316" }, { emoji: "🚗", label: "Transporte", pct: 35, color: "#3B82F6" }].map(c => (
                      <div key={c.label} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] font-semibold">
                          <span>{c.emoji} {c.label}</span>
                          <span style={{ color: c.color }}>{c.pct}% usado</span>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)", "0 0 0 4px rgba(124,58,237,0.3)", "0 0 0 0 rgba(124,58,237,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-7 rounded-xl border-2 border-primary/40 bg-primary/8 flex items-center justify-center">
                      <span className="text-[9px] font-black text-primary">+ Definir teto de gastos</span>
                    </motion.div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="🎯" title="Defina um teto de gastos"
                  desc='Na aba Planejar você diz: "quero gastar no máximo R$ 500 por mês com comida". O app mostra uma barrinha e te avisa quando estiver chegando no limite — sem sustos no fim do mês!' />

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Em qual área você quer controlar primeiro?</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {budgetCategories.map(c => (
                      <button key={c.id} onClick={() => setBudCat(c.id)}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl border-2 text-[10px] font-semibold transition-all ${budCat === c.id ? "border-primary bg-primary/8 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                        <span className="text-lg">{c.emoji}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <RangeSelector
                  label={`Quanto quer gastar por mês com ${budCatLabel}?`}
                  value={budRange}
                  onChange={setBudRange}
                  options={[
                    { label: "Até R$ 300",      value: "ate-300" },
                    { label: "R$ 300 – R$ 800", value: "300-800" },
                    { label: "R$ 800 – R$ 2k",  value: "800-2k" },
                    { label: "R$ 2k ou mais",   value: "2k+" },
                  ]}
                />

                <PrimaryBtn onClick={() => saveBudget(false)} disabled={!budRange} loading={saving}>
                  Definir meu teto 🎯 <span className="text-xs opacity-70 font-normal">+40 pts</span>
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveBudget(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 8: Meta / Sonho ── */}
          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} className="bg-card rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-amber-50/50 p-4">
                <p className="text-[10px] font-bold text-amber-700 text-center mb-2 uppercase tracking-wide">📍 Aba Início → Minhas Metas</p>
                <PhoneMock highlight="home">
                  <div className="px-3 py-2 bg-amber-50/60">
                    <p className="text-[9px] text-muted-foreground">Aba Início →</p>
                    <p className="text-sm font-black">✨ Minha Meta</p>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(245,158,11,0)", "0 0 0 4px rgba(245,158,11,0.3)", "0 0 0 0 rgba(245,158,11,0)"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-14 rounded-xl border-2 border-amber-300 bg-amber-50 p-2 flex flex-col justify-between">
                      <div className="flex justify-between text-[9px] font-semibold text-amber-700">
                        <span>✈️ Viagem dos sonhos</span><span>0%</span>
                      </div>
                      <div className="h-1.5 bg-amber-100 rounded-full">
                        <div className="h-full w-0 rounded-full bg-amber-400" />
                      </div>
                      <span className="text-[8px] text-amber-600">Guarde um pouquinho por mês 🚀</span>
                    </motion.div>
                    <div className="h-7 rounded-xl bg-muted/30 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground">+ Criar nova meta</span>
                    </div>
                  </div>
                </PhoneMock>
              </div>

              <div className="p-5 space-y-4">
                <BackBtn onClick={goBack} />
                <StepTitle emoji="✨" title="Qual é o seu sonho?"
                  desc="Tem algo que você quer comprar, guardar ou realizar? O app calcula quanto você precisa guardar por mês pra chegar lá — e vai mostrando o progresso!" />

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">O que você quer conquistar?</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {goalOptions.map(({ emoji, label }) => (
                      <button key={label} onClick={() => setGoalName(label)}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl border-2 text-[10px] font-semibold transition-all ${goalName === label ? "border-amber-400 bg-amber-50 text-amber-700" : "border-border/50 bg-muted/30 text-muted-foreground"}`}>
                        <span className="text-xl">{emoji}</span>{label}
                      </button>
                    ))}
                  </div>
                  <input value={goalName} onChange={e => setGoalName(e.target.value)}
                    placeholder="ou escreva o seu sonho aqui..."
                    className="w-full h-10 rounded-2xl border border-border/60 bg-muted/20 px-4 text-sm outline-none focus:border-primary transition-colors mt-2" />
                </div>

                <RangeSelector
                  label="Quanto custa esse sonho? (mais ou menos está ótimo!)"
                  value={goalRange}
                  onChange={setGoalRange}
                  options={[
                    { label: "Até R$ 2.000",    value: "ate-2k" },
                    { label: "R$ 2k – R$ 10k",  value: "2k-10k" },
                    { label: "R$ 10k – R$ 50k", value: "10k-50k" },
                    { label: "R$ 50k ou mais",  value: "50k+" },
                  ]}
                />

                <PrimaryBtn onClick={() => saveGoal(false)} disabled={!goalName.trim() || !goalRange} loading={saving}>
                  Criar minha meta ✨ <span className="text-xs opacity-70 font-normal">+50 pts</span>
                </PrimaryBtn>
                <SkipBtn onSkip={() => saveGoal(true)} />
              </div>
            </motion.div>
          )}

          {/* ── ETAPA 9: Celebração ── */}
          {step === 9 && (
            <motion.div key="s9" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-3xl shadow-xl overflow-hidden">
              <div className="p-5 space-y-4">

                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }} className="text-center space-y-2">
                  <div className="text-7xl">🏆</div>
                  <h2 className="text-2xl font-black">Tudo pronto, {userName}!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você acabou de dar o primeiro passo para nunca mais chegar no fim do mês sem saber onde o dinheiro foi!
                  </p>
                </motion.div>

                <div className="rounded-2xl p-4 text-center space-y-1"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <p className="text-4xl font-black text-primary">{earned + STEP_POINTS[9]} pts</p>
                  <p className="text-xs text-muted-foreground">ganhos agora mesmo ⭐</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Lembrando onde fica cada coisa:</p>
                  {[
                    ["➕", "Botão + (centro)", "pra registrar qualquer gasto ou renda"],
                    ["💳", "Aba Contas", "saldo das contas e fatura do cartão"],
                    ["📋", "Aba Planejar", "seus limites por categoria"],
                    ["🏠", "Aba Início", "score, missões semanais e metas"],
                  ].map(([e, local, desc]) => (
                    <div key={local} className="flex items-start gap-2.5 bg-muted/40 rounded-xl px-3 py-2.5">
                      <span className="text-base mt-0.5">{e}</span>
                      <div>
                        <span className="text-xs font-black text-foreground">{local}</span>
                        <span className="text-xs text-muted-foreground"> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <PrimaryBtn onClick={finish}>
                  Entrar no app agora 🚀 <span className="text-xs opacity-70 font-normal">+50 pts</span>
                </PrimaryBtn>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
