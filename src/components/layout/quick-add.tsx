"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DEMO_CARDS } from "@/lib/demo-data"

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

const ACCOUNTS = [
  { id: "acc-nubank",  emoji: "🟣", label: "Nubank" },
  { id: "acc-itau",    emoji: "🟠", label: "Itaú" },
  { id: "acc-wallet",  emoji: "👛", label: "Carteira" },
  { id: "acc-other",   emoji: "🏦", label: "Outro" },
]

type Mode      = "expense" | "income"
type Step      = "type" | "category" | "describe" | "amount"
type PayMethod = "cash" | "credit"
type Cat       = typeof EXPENSE_CATS[0]

export function QuickAdd() {
  const [open, setOpen]               = useState(false)
  const [step, setStep]               = useState<Step>("type")
  const [mode, setMode]               = useState<Mode>("expense")
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null)
  const [amount, setAmount]           = useState("")
  const [description, setDescription] = useState("")
  const [account, setAccount]         = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [done, setDone]               = useState(false)
  const [payMethod, setPayMethod]     = useState<PayMethod>("cash")
  const [creditCardId, setCreditCardId] = useState(DEMO_CARDS[0]?.id ?? "")
  const [installments, setInstallments] = useState(1)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const reset = () => {
    setStep("type"); setMode("expense"); setSelectedCat(null)
    setAmount(""); setDescription(""); setAccount("")
    setShowDetails(false); setDone(false)
    setPayMethod("cash"); setInstallments(1)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => { if (mounted.current) reset() }, 300)
  }

  useEffect(() => {
    const handler = () => { reset(); setOpen(true) }
    window.addEventListener("quick-add-open", handler)
    return () => window.removeEventListener("quick-add-open", handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategory = (cat: Cat) => {
    setSelectedCat(cat)
    setDescription("")
    // "Outros" → pede descrição primeiro
    if (cat.id === "cat-other" || cat.id === "cat-other-in") {
      setStep("describe")
    } else {
      setStep("amount")
    }
  }

  const handleConfirm = () => {
    if (!amount || parseFloat(amount.replace(",", ".")) <= 0) return
    setDone(true)
    setTimeout(handleClose, 1600)
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
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-full">
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
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                      <span className="text-5xl">🔴</span>
                      <div className="text-center">
                        <p className="font-black text-lg text-red-600 dark:text-red-400">Gastei</p>
                        <p className="text-xs text-muted-foreground">saiu dinheiro</p>
                      </div>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => { setMode("income"); setStep("category") }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                      <span className="text-5xl">💚</span>
                      <div className="text-center">
                        <p className="font-black text-lg text-green-600 dark:text-green-400">Recebi</p>
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
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${mode === "expense" ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"}`}>
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
                        <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 w-full">
                          {cat.hint}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </>

              /* ── STEP: DESCRIBE (Outros) ── */
              ) : step === "describe" ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={() => setStep("category")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      ← {selectedCat?.emoji} {selectedCat?.label}
                    </button>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-black mb-1">O que foi isso?</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Uma palavra já basta — vai aparecer no histórico e nos relatórios.
                      </p>
                      <Input
                        autoFocus
                        placeholder={mode === "expense" ? "ex: flanelinha, gorjeta, banca de jornal..." : "ex: vaquinha, presente recebido..."}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
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
                        {([
                          { id: "cash"   as PayMethod, icon: "💸", label: "À vista",    sub: "débito, PIX ou dinheiro" },
                          { id: "credit" as PayMethod, icon: "💳", label: "No crédito", sub: "vai pra fatura" },
                        ]).map(opt => (
                          <button key={opt.id} onClick={() => setPayMethod(opt.id)}
                            className={`flex flex-col items-start gap-0.5 p-3 rounded-2xl border-2 text-left transition-all ${
                              payMethod === opt.id
                                ? "border-primary bg-primary/8 text-primary"
                                : "border-border/60 bg-muted/30 text-muted-foreground"
                            }`}>
                            <span className="text-base leading-none mb-0.5">{opt.icon}</span>
                            <p className="text-xs font-bold">{opt.label}</p>
                            <p className="text-[10px] opacity-70 leading-tight">{opt.sub}</p>
                          </button>
                        ))}
                      </div>
                      {payMethod === "credit" && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2">
                            {DEMO_CARDS.map(card => (
                              <button key={card.id} onClick={() => setCreditCardId(card.id)}
                                className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                                  creditCardId === card.id
                                    ? "border-primary bg-primary/8 text-primary"
                                    : "border-border/60 bg-muted/30 text-muted-foreground"
                                }`}>{card.name}</button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Parcelado em</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {[1,2,3,6,12].map(n => (
                                <button key={n} onClick={() => setInstallments(n)}
                                  className={`w-9 h-8 rounded-xl border-2 text-xs font-bold transition-all ${
                                    installments === n
                                      ? "border-primary bg-primary/8 text-primary"
                                      : "border-border/60 bg-muted/30 text-muted-foreground"
                                  }`}>{n === 1 ? "1x" : `${n}x`}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
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
                        {/* Description — only show if not "Outros" (already filled) */}
                        {selectedCat?.id !== "cat-other" && selectedCat?.id !== "cat-other-in" && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                              {mode === "expense" ? "O que foi isso?" : "De onde veio?"}
                            </p>
                            <Input
                              placeholder={mode === "expense" ? "ex: almoço com a família..." : "ex: pagamento do cliente X..."}
                              value={description} onChange={e => setDescription(e.target.value)}
                              className="rounded-xl text-sm"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                            {mode === "expense" ? "Saiu de qual conta?" : "Entrou em qual conta?"}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {ACCOUNTS.map(acc => (
                              <button key={acc.id} onClick={() => setAccount(account === acc.id ? "" : acc.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                  account === acc.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-muted/50 text-muted-foreground"
                                }`}>
                                <span>{acc.emoji}</span>{acc.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={!amount}
                    className="w-full h-14 rounded-2xl text-white font-black text-base disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: mode === "expense" ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "linear-gradient(135deg,#059669,#047857)" }}>
                    {mode === "expense"
                      ? payMethod === "credit" ? "✓ Lançar no crédito 💳" : "✓ Registrar gasto"
                      : "✓ Anotar entrada"}
                    <span className="text-xs opacity-70 font-normal">+{pts}pts</span>
                  </motion.button>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
