"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const C = {
  bg:      "#faf9f7",
  white:   "#ffffff",
  text:    "#111827",
  muted:   "#6b7280",
  border:  "#e5e7eb",
  primary: "#7c3aed",
  primaryL:"rgba(124,58,237,0.08)",
  section: "#f3f4f6",
}

const STEPS = [
  {
    key: "pain_point", emoji: "😰",
    question: "Qual é sua maior dor com dinheiro hoje?",
    subtitle: "Seja honesto — ninguém vai te julgar aqui",
    options: [
      { value: "no_control",   emoji: "🌀", label: "Chego no fim do mês sem saber pra onde foi" },
      { value: "debt",         emoji: "💳", label: "Tenho dívidas que parecem não diminuir" },
      { value: "no_savings",   emoji: "🎯", label: "Quero guardar dinheiro mas não consigo" },
      { value: "disorganized", emoji: "📊", label: "Só quero organizar tudo num lugar" },
    ],
  },
  {
    key: "income_range", emoji: "💰",
    question: "Quanto você ganha por mês?",
    subtitle: "Isso nos ajuda a personalizar dicas para você",
    options: [
      { value: "up_2k",     emoji: "🌱", label: "Até R$ 2.000" },
      { value: "2k_5k",     emoji: "🌿", label: "R$ 2.000 – R$ 5.000" },
      { value: "5k_10k",    emoji: "🌳", label: "R$ 5.000 – R$ 10.000" },
      { value: "above_10k", emoji: "🚀", label: "Acima de R$ 10.000" },
    ],
  },
  {
    key: "uses_credit_card", emoji: "💳",
    question: "Você usa cartão de crédito?",
    subtitle: "Vamos te ajudar a controlar a fatura certinho",
    options: [
      { value: "main",      emoji: "💯", label: "Sim, é meu principal meio de pagamento" },
      { value: "sometimes", emoji: "🔄", label: "Uso às vezes" },
      { value: "avoid",     emoji: "🚫", label: "Evito, prefiro débito ou Pix" },
      { value: "stopping",  emoji: "✂️", label: "Tenho mas estou tentando parar" },
    ],
  },
  {
    key: "main_goal", emoji: "🎯",
    question: "Qual é seu objetivo nos próximos 3 meses?",
    subtitle: "Vamos montar um plano personalizado para você",
    options: [
      { value: "stop_negative", emoji: "🛑", label: "Parar de entrar no vermelho" },
      { value: "pay_debt",      emoji: "🔓", label: "Quitar uma dívida específica" },
      { value: "save_goal",     emoji: "✈️", label: "Juntar para uma meta (viagem, casa...)" },
      { value: "understand",    emoji: "🔍", label: "Só entender minha vida financeira" },
    ],
  },
]

type Answers = Record<string, string>

const SLIDE = {
  initial: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir: number) => ({ x: dir * -60, opacity: 0 }),
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 16px", borderRadius: 14, fontSize: 16,
  border: `2px solid ${C.border}`, background: C.white, color: C.text,
  outline: "none", boxSizing: "border-box",
}
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: C.text,
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState(0)
  const [dir, setDir]           = useState(1)
  const [answers, setAnswers]   = useState<Answers>({})
  const [name, setName]         = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState(false)

  const totalSteps = STEPS.length + 1
  const progress = Math.round(((step + 1) / totalSteps) * 100)

  function pick(key: string, value: string) {
    setAnswers(a => ({ ...a, [key]: value }))
    goNext()
  }
  function goNext() { setDir(1);  setStep(s => s + 1) }
  function goBack() { setDir(-1); setStep(s => s - 1) }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return }
    setLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            full_name: name,
            pain_point: answers.pain_point,
            income_range: answers.income_range,
            uses_credit_card_raw: answers.uses_credit_card,
            main_goal: answers.main_goal,
          },
        },
      })
      if (signUpError) throw signUpError
      await supabase.from("leads").upsert({
        email, whatsapp, source: "register_wizard",
        pain_point: answers.pain_point,
        income_range: answers.income_range,
        uses_credit_card: answers.uses_credit_card,
        main_goal: answers.main_goal,
      }, { onConflict: "email" })
      setSuccess(true)
    } catch {
      setError("Não foi possível criar a conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // ── Tela de sucesso ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-6 px-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "#dcfce7" }}>
          <CheckCircle className="size-10" style={{ color: "#16a34a" }} />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold" style={{ color: C.text }}>Conta criada! 🎉</h2>
          <p className="mt-2 text-sm" style={{ color: C.muted }}>
            Enviamos um link de confirmação para <strong style={{ color: C.text }}>{email}</strong>.<br />
            Verifique sua caixa de entrada (e o spam).
          </p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl h-12 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg,${C.primary},#6d28d9)` }}>
            Ir para o login
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Barra de progresso ───────────────────────────────────────────────────────
  const progressBar = (
    <div className="w-full max-w-md mb-6 px-1">
      <div className="flex items-center justify-between mb-2" style={{ fontSize: 12, color: C.muted }}>
        <span>Passo {step + 1} de {totalSteps}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: C.section }}>
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${C.primary},#a855f7)` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }} />
      </div>
    </div>
  )

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (step < STEPS.length) {
    const q = STEPS[step]
    return (
      <div className="w-full max-w-md flex flex-col items-center px-4">
        {progressBar}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={SLIDE}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.25 }} className="w-full">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{q.emoji}</div>
              <h2 className="text-xl font-bold leading-snug" style={{ color: C.text }}>{q.question}</h2>
              <p className="text-sm mt-1" style={{ color: C.muted }}>{q.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map(opt => (
                <button key={opt.value} onClick={() => pick(q.key, opt.value)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{ border: `2px solid ${C.border}`, background: C.white, cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.primary; (e.currentTarget as HTMLElement).style.background = C.primaryL }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border;   (e.currentTarget as HTMLElement).style.background = C.white }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: C.text }}>{opt.label}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-1 mt-4 transition-colors"
                style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>
                <ArrowLeft size={12} /> Voltar
              </button>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs mt-8" style={{ color: C.muted }}>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium" style={{ color: C.primary }}>Entrar</Link>
        </p>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md flex flex-col items-center px-4">
      {progressBar}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key="form" custom={dir} variants={SLIDE}
          initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.25 }} className="w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-xl font-bold" style={{ color: C.text }}>Quase lá! Crie sua conta</h2>
            <p className="text-sm mt-1" style={{ color: C.muted }}>Só mais 4 campos e você começa</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="name" style={labelStyle}>Seu nome</label>
              <input id="name" type="text" placeholder="João Silva" value={name}
                onChange={e => setName(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label htmlFor="whatsapp" style={labelStyle}>WhatsApp <span style={{ fontWeight: 400, color: C.muted }}>(opcional)</span></label>
              <input id="whatsapp" type="tel" placeholder="(11) 99999-9999" value={whatsapp}
                onChange={e => setWhatsapp(formatWhatsApp(e.target.value))}
                style={inputStyle} inputMode="numeric" />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>E-mail</label>
              <input id="email" type="email" placeholder="seu@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required style={inputStyle}
                autoComplete="email" inputMode="email" />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <input id="password" type={showPw ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: 48 }} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex" }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", borderRadius: 10, padding: "10px 14px" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2"
              style={{ height: 52, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: `linear-gradient(135deg,${C.primary},#6d28d9)`,
                color: "#fff", fontWeight: 700, fontSize: 16, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Criar minha conta grátis
            </button>

            <p style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
              Ao criar sua conta você concorda com nossos{" "}
              <Link href="/privacy" style={{ color: C.primary, textDecoration: "underline" }}>Termos e Privacidade</Link>.
            </p>
          </form>

          <div className="flex items-center justify-between mt-4">
            <button onClick={goBack}
              className="flex items-center gap-1"
              style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={12} /> Voltar
            </button>
            <p style={{ fontSize: 12, color: C.muted }}>
              Já tem conta?{" "}
              <Link href="/login" className="font-medium" style={{ color: C.primary }}>Entrar</Link>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
