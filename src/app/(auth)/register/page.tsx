"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

// ─── Quiz data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "pain_point",
    emoji: "😰",
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
    key: "income_range",
    emoji: "💰",
    question: "Quanto você ganha por mês?",
    subtitle: "Isso nos ajuda a personalizar dicas para você",
    options: [
      { value: "up_2k",    emoji: "🌱", label: "Até R$ 2.000" },
      { value: "2k_5k",    emoji: "🌿", label: "R$ 2.000 – R$ 5.000" },
      { value: "5k_10k",   emoji: "🌳", label: "R$ 5.000 – R$ 10.000" },
      { value: "above_10k",emoji: "🚀", label: "Acima de R$ 10.000" },
    ],
  },
  {
    key: "uses_credit_card",
    emoji: "💳",
    question: "Você usa cartão de crédito?",
    subtitle: "Vamos te ajudar a controlar a fatura certinho",
    options: [
      { value: "main",       emoji: "💯", label: "Sim, é meu principal meio de pagamento" },
      { value: "sometimes",  emoji: "🔄", label: "Uso às vezes" },
      { value: "avoid",      emoji: "🚫", label: "Evito, prefiro débito ou Pix" },
      { value: "stopping",   emoji: "✂️", label: "Tenho mas estou tentando parar" },
    ],
  },
  {
    key: "main_goal",
    emoji: "🎯",
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState(0)   // 0-3 = quiz, 4 = form
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

  const totalSteps = STEPS.length + 1 // 4 quiz + 1 form
  const progress = Math.round(((step + 1) / totalSteps) * 100)

  function pick(key: string, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }))
    goNext()
  }

  function goNext() {
    setDir(1)
    setStep((s) => s + 1)
  }
  function goBack() {
    setDir(-1)
    setStep((s) => s - 1)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return }
    setLoading(true)
    setError("")
    try {
      const supabase = createClient()

      // 1. Create auth user with quiz answers in metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
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

      // 2. Save lead with quiz data (public insert, no auth needed)
      await supabase.from("leads").upsert({
        email,
        whatsapp,
        source: "register_wizard",
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

  const handleDemo = () => {
    document.cookie = "demo_mode=true; path=/; max-age=86400"
    router.push("/dashboard")
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-6 px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
        >
          <CheckCircle className="size-10 text-green-600" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold">Conta criada! 🎉</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Enviamos um link de confirmação para <strong>{email}</strong>.<br />
            Verifique sua caixa de entrada (e o spam).
          </p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 h-11 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Ir para o login
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Progress bar ────────────────────────────────────────────────────────────
  const progressBar = (
    <div className="w-full max-w-md mb-6 px-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Passo {step + 1} de {totalSteps}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )

  // ── Quiz step ───────────────────────────────────────────────────────────────
  if (step < STEPS.length) {
    const q = STEPS[step]
    return (
      <div className="w-full max-w-md flex flex-col items-center px-4">
        {progressBar}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={SLIDE}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{q.emoji}</div>
              <h2 className="text-xl font-bold leading-snug">{q.question}</h2>
              <p className="text-muted-foreground text-sm mt-1">{q.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => pick(q.key, opt.value)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{opt.label}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                <ArrowLeft className="size-3" /> Voltar
              </button>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-8">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    )
  }

  // ── Form step ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md flex flex-col items-center px-4">
      {progressBar}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key="form"
          custom={dir}
          variants={SLIDE}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-xl font-bold">Quase lá! Crie sua conta</h2>
            <p className="text-muted-foreground text-sm mt-1">Só mais 4 campos e você começa</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" placeholder="João Silva" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" type="tel" placeholder="(11) 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2 h-11 text-base font-semibold" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Criar minha conta grátis
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao criar sua conta você concorda com nossos{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Termos e Privacidade</Link>.
            </p>
          </form>

          <div className="flex items-center justify-between mt-4">
            <button onClick={goBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-3" /> Voltar
            </button>
            <p className="text-xs text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
