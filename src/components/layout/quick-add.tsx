"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const EXPENSE_CATS = [
  { id: "cat-food",      emoji: "🍔", label: "Comida",      hint: "iFood, restaurante, lanche, padaria",             color: "#F97316" },
  { id: "cat-market",    emoji: "🛒", label: "Mercado",     hint: "supermercado, feira, açougue, hortifruti",         color: "#84CC16" },
  { id: "cat-transport", emoji: "🚗", label: "Transporte",  hint: "Uber, gasolina, ônibus, pedágio, estacionamento",  color: "#3B82F6" },
  { id: "cat-housing",   emoji: "🏠", label: "Moradia",     hint: "aluguel, condomínio, luz, água, gás, IPTU",        color: "#6B7280" },
  { id: "cat-health",    emoji: "💊", label: "Saúde",       hint: "farmácia, médico, dentista, plano, exame",         color: "#EF4444" },
  { id: "cat-pet",       emoji: "🐾", label: "Pet",         hint: "ração, banho e tosa, vet, petshop, vacina",        color: "#F59E0B" },
  { id: "cat-leisure",   emoji: "🎮", label: "Lazer",       hint: "cinema, festa, bar, show, viagem, presente",       color: "#EC4899" },
  { id: "cat-subs",      emoji: "📱", label: "Assinatura",  hint: "Netflix, Spotify, academia, internet, clube",      color: "#0EA5E9" },
  { id: "cat-education", emoji: "📚", label: "Estudo",      hint: "curso, livro, escola, faculdade, material",        color: "#8B5CF6" },
  { id: "cat-tax",       emoji: "📄", label: "Impostos",    hint: "IPVA, IR, multa, taxa, cartório, ITBI",            color: "#14B8A6" },
  { id: "cat-other",     emoji: "💸", label: "Outros",      hint: "toque aqui e descreva o que foi",                  color: "#9CA3AF" },
]

const INCOME_CATS = [
  { id: "cat-salary",        emoji: "💼", label: "Salário",    hint: "salário mensal, 13º, férias",               color: "#10B981" },
  { id: "cat-freelance",     emoji: "💻", label: "Freela",     hint: "projeto avulso, consultoria, bico",         color: "#6366F1" },
  { id: "cat-rent-in",       emoji: "🏘️", label: "Aluguel",    hint: "aluguel recebido de imóvel",                color: "#F97316" },
  { id: "cat-investment",    emoji: "📈", label: "Rendimento", hint: "rendimento de poupança, CDB, fundo",        color: "#0EA5E9" },
  { id: "cat-dividends",     emoji: "📊", label: "Dividendos", hint: "dividendos de ações, FIIs",                 color: "#8B5CF6" },
  { id: "cat-sale",          emoji: "🤝", label: "Venda",      hint: "venda de bem, produto ou serviço",          color: "#EC4899" },
  { id: "cat-pension",       emoji: "👶", label: "Pensão",     hint: "pensão alimentícia recebida",               color: "#F59E0B" },
  { id: "cat-reimbursement", emoji: "🔄", label: "Reembolso",  hint: "reembolso de empresa, estorno, devolução",  color: "#84CC16" },
  { id: "cat-gift",          emoji: "🎁", label: "Presente",   hint: "dinheiro de presente, mesada",              color: "#14B8A6" },
  { id: "cat-other-in",      emoji: "💰", label: "Outros",     hint: "toque aqui e descreva o que foi",           color: "#9CA3AF" },
]

type Mode      = "expense" | "income"
type Step      = "type" | "category" | "describe" | "amount"
type PayMethod = "cash" | "credit"
type Cat       = typeof EXPENSE_CATS[0]

interface RealAccount { id: string; name: string; icon: string; color: string }
interface RealCard    { id: string; name: string }

export function QuickAdd() {
  const [open, setOpen]               = useState(false)
  const [step, setStep]               = useState<Step>("type")
  const [mode, setMode]               = useState<Mode>("expense")
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null)
  const [amount, setAmount]           = useState("")
  const [description, setDescription] = useState("")
  const [accountId, setAccountId]     = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [done, setDone]               = useState(false)
  const [payMethod, setPayMethod]     = useState<PayMethod>("cash")
  const [creditCardId, setCreditCardId] = useState("")
  const [installments, setInstallments] = useState(1)
  const [isRecurring, setIsRecurring]  = useState(false)
  const [saveError, setSaveError]     = useState("")
  const [saving, setSaving]           = useState(false)
  const [accounts, setAccounts]       = useState<RealAccount[]>([])
  const [cards, setCards]             = useState<RealCard[]>([])
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Load accounts and cards when component mounts
  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("accounts").select("id, name, icon, color").eq("is_active", true).order("created_at"),
      supabase.from("credit_cards").select("id, name").eq("is_active", true).order("created_at"),
    ]).then(([accRes, cardRes]) => {
      if (!mounted.current) return
      const accs = accRes.data ?? []
      const cds  = cardRes.data ?? []
      setAccounts(accs)
      setCards(cds)
      if (accs.length > 0) setAccountId(accs[0].id)
      if (cds.length > 0) setCreditCardId(cds[0].id)
    })
  }, [])

  const reset = () => {
    setStep("type"); setMode("expense"); setSelectedCat(null)
    setAmount(""); setDescription(""); setShowDetails(false)
    setDone(false); setSaving(false); setIsRecurring(false); setSaveError("")
    setPayMethod("cash"); setInstallments(1)
    if (accounts.length > 0) setAccountId(accounts[0].id)
    if (cards.length > 0) setCreditCardId(cards[0].id)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => { if (mounted.current) reset() }, 300)
  }

  useEffect(() => {
    const handler = () => { reset(); setOpen(true) }
    window.addEventListener("quick-add-open", handler)
    return () => window.removeEventListener("quick-add-open", handler)
  }, [accounts, cards]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategory = (cat: Cat) => {
    setSelectedCat(cat)
    setDescription("")
    // Assinatura auto-marca como recorrente
    setIsRecurring(cat.id === "cat-subs")
    // Assinatura e "Outros" pedem descrição (nome do serviço ou do gasto)
    if (cat.id === "cat-other" || cat.id === "cat-other-in" || cat.id === "cat-subs") {
      setStep("describe")
    } else {
      setStep("amount")
    }
  }

  const handleConfirm = async () => {
    const parsed = parseFloat(amount.replace(",", "."))
    if (!parsed || parsed <= 0) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const today = new Date().toISOString().split("T")[0]
      const label = description.trim() || selectedCat?.label || (mode === "expense" ? "Gasto" : "Receita")

      // Ensure we have an account — create default wallet if none
      let resolvedAccountId = accountId
      if (!resolvedAccountId) {
        const { data: newAcc } = await supabase
          .from("accounts")
          .insert({ user_id: user.id, name: "Carteira", type: "wallet", color: "#7c3aed", icon: "wallet", initial_balance: 0, current_balance: 0 })
          .select("id").single()
        if (newAcc) {
          resolvedAccountId = newAcc.id
          setAccountId(newAcc.id)
          setAccounts(prev => [...prev, { id: newAcc.id, name: "Carteira", icon: "wallet", color: "#7c3aed" }])
        }
      }

      const transaction: Record<string, unknown> = {
        user_id:             user.id,
        type:                mode,
        description:         label,
        amount:              parsed,
        date:                today,
        account_id:          resolvedAccountId,
        status:              "confirmed",
        notes:               selectedCat ? `${selectedCat.emoji}|${selectedCat.label}` : null,
        tags:                [],
        is_recurring:        isRecurring,
        is_installment:      payMethod === "credit" && installments > 1,
        installment_total:   payMethod === "credit" ? installments : null,
        installment_current: payMethod === "credit" ? 1 : null,
      }

      if (payMethod === "credit" && creditCardId) {
        transaction.card_id = creditCardId
      }

      const { error } = await supabase.from("transactions").insert(transaction)

      if (error) {
        setSaveError(`Erro: ${error.message || error.details || "falha ao salvar"}`)
        setSaving(false)
        return
      }

      window.dispatchEvent(new CustomEvent("transaction-added"))

      if (mounted.current) {
        setDone(true)
        setTimeout(handleClose, 1600)
      }
    } catch {
      setSaving(false)
    }
  }

  const cats = mode === "expense" ? EXPENSE_CATS : INCOME_CATS
  const pts  = mode === "income" ? 20 : 10

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-w-lg mx-auto"
            style={{ maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="p-6 pb-10">

              {/* ── DONE ── */}
              {done ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: mode === "income" ? "#10B981" : "#7c3aed" }}>
                    <Check className="size-10 text-white" />
                  </motion.div>
                  <p className="text-xl font-black">{mode === "income" ? "Anotado! 🎉" : payMethod === "credit" ? "Na fatura! 💳" : "Registrado! 👊"}</p>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-4 py-2 rounded-full">
                    <span className="text-amber-500 font-black">+{pts} pontos</span>
                    <span className="text-amber-400">ganhos agora</span>
                    <span>⭐</span>
                  </div>
                </motion.div>

              /* ── STEP: TYPE ── */
              ) : step === "type" ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black">O que aconteceu?</h3>
                      <p className="text-sm text-muted-foreground">Dinheiro entrou ou saiu?</p>
                    </div>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => { setMode("expense"); setStep("category") }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2"
                      style={{ borderColor: "#fca5a5", background: "#fef2f2" }}>
                      <span className="text-5xl">🔴</span>
                      <div className="text-center">
                        <p className="font-black text-lg" style={{ color: "#dc2626" }}>Gastei</p>
                        <p className="text-xs text-muted-foreground">saiu dinheiro</p>
                      </div>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => { setMode("income"); setStep("category") }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2"
                      style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                      <span className="text-5xl">💚</span>
                      <div className="text-center">
                        <p className="font-black text-lg" style={{ color: "#16a34a" }}>Recebi</p>
                        <p className="text-xs text-muted-foreground">entrou dinheiro</p>
                      </div>
                    </motion.button>
                  </div>
                </>

              /* ── STEP: CATEGORY ── */
              ) : step === "category" ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: mode === "expense" ? "#fef2f2" : "#f0fdf4", color: mode === "expense" ? "#dc2626" : "#16a34a" }}>
                        {mode === "expense" ? "🔴 Gastei" : "💚 Recebi"}
                      </span>
                      <h3 className="text-lg font-black mt-1">Com o quê?</h3>
                    </div>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {cats.map((cat) => (
                      <motion.button key={cat.id} whileTap={{ scale: 0.92 }}
                        onClick={() => handleCategory(cat)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-left transition-colors"
                        style={{ background: `${cat.color}15`, border: `1.5px solid ${cat.color}30` }}
                      >
                        <span className="text-2xl">{cat.emoji}</span>
                        <span className="text-xs font-bold text-center leading-tight w-full">{cat.label}</span>
                        <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 w-full">{cat.hint}</span>
                      </motion.button>
                    ))}
                  </div>
                </>

              /* ── STEP: DESCRIBE ── */
              ) : step === "describe" ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={() => setStep("category")} className="flex items-center gap-2 text-sm text-muted-foreground">
                      ← {selectedCat?.emoji} {selectedCat?.label}
                    </button>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-black mb-1">O que foi isso?</p>
                      <p className="text-sm text-muted-foreground mb-4">Uma palavra já basta.</p>
                      <Input autoFocus
                        placeholder={
                          selectedCat?.id === "cat-subs" ? "ex: Netflix, Spotify, academia..." :
                          mode === "expense" ? "ex: almoço, farmácia, presente..." :
                          "ex: vaquinha, presente recebido..."
                        }
                        value={description} onChange={e => setDescription(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && description.trim()) setStep("amount") }}
                        className="rounded-2xl text-base h-12 border-2 focus-visible:border-primary"
                      />
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { if (description.trim()) setStep("amount") }}
                      disabled={!description.trim()}
                      className="w-full h-12 rounded-2xl text-white font-black text-sm disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                    >
                      Continuar →
                    </motion.button>
                  </div>
                </>

              /* ── STEP: AMOUNT ── */
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={() => setStep(selectedCat?.id === "cat-other" || selectedCat?.id === "cat-other-in" ? "describe" : "category")}
                      className="flex items-center gap-2 text-sm text-muted-foreground">
                      ← {selectedCat?.emoji} {selectedCat?.id === "cat-other" || selectedCat?.id === "cat-other-in" ? description : selectedCat?.label}
                    </button>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <X className="size-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    {mode === "expense" ? "Quanto você gastou?" : "Quanto entrou?"}
                  </p>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                    <Input autoFocus inputMode="decimal" placeholder="0,00" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleConfirm() }}
                      className="pl-10 text-2xl font-black h-14 rounded-2xl border-2 focus-visible:border-primary"
                    />
                  </div>

                  {/* Payment method — expense only */}
                  {mode === "expense" && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Como vai pagar?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["cash", "credit"] as PayMethod[]).map(opt => (
                          <button key={opt} onClick={() => setPayMethod(opt)}
                            className={`flex flex-col items-start gap-0.5 p-3 rounded-2xl border-2 text-left transition-all ${
                              payMethod === opt ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                            }`}>
                            <span className="text-base leading-none mb-0.5">{opt === "cash" ? "💸" : "💳"}</span>
                            <p className="text-xs font-bold">{opt === "cash" ? "À vista" : "No crédito"}</p>
                            <p className="text-[10px] opacity-70 leading-tight">{opt === "cash" ? "débito, PIX ou dinheiro" : "vai pra fatura"}</p>
                          </button>
                        ))}
                      </div>

                      {payMethod === "credit" && cards.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {cards.map(card => (
                              <button key={card.id} onClick={() => setCreditCardId(card.id)}
                                className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                                  creditCardId === card.id ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                                }`}>{card.name}</button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Parcelado em</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {[1,2,3,6,12].map(n => (
                                <button key={n} onClick={() => setInstallments(n)}
                                  className={`w-9 h-8 rounded-xl border-2 text-xs font-bold transition-all ${
                                    installments === n ? "border-primary bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                                  }`}>{n === 1 ? "1x" : `${n}x`}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badge informativo quando é assinatura */}
                  {isRecurring && (
                    <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-2xl px-3 py-2 mb-3">
                      <span className="text-base">🔁</span>
                      <p className="text-xs font-semibold text-primary">Vai aparecer em "Assino todo mês" automaticamente</p>
                    </div>
                  )}

                  {/* Optional details */}
                  <button onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 hover:text-foreground">
                    {showDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    {showDetails ? "Esconder detalhes" : "+ Adicionar detalhes (opcional)"}
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4 space-y-3">
                        {selectedCat?.id !== "cat-other" && selectedCat?.id !== "cat-other-in" && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                              {mode === "expense" ? "O que foi isso?" : "De onde veio?"}
                            </p>
                            <Input placeholder={mode === "expense" ? "ex: almoço com a família..." : "ex: pagamento do cliente X..."}
                              value={description} onChange={e => setDescription(e.target.value)}
                              className="rounded-xl text-sm" />
                          </div>
                        )}
                        {accounts.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                              {mode === "expense" ? "Saiu de qual conta?" : "Entrou em qual conta?"}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {accounts.map(acc => (
                                <button key={acc.id} onClick={() => setAccountId(accountId === acc.id ? "" : acc.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    accountId === acc.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground"
                                  }`}>
                                  {acc.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {saveError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                      ⚠️ {saveError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!amount || saving}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    style={{ background: mode === "expense" ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "linear-gradient(135deg,#059669,#047857)" }}>
                    {saving ? "Salvando..." : mode === "expense"
                      ? payMethod === "credit" ? "✓ Lançar no crédito 💳" : "✓ Registrar gasto"
                      : "✓ Anotar entrada"}
                    {!saving && <span className="text-xs opacity-70 font-normal">+{pts}pts</span>}
                  </button>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
