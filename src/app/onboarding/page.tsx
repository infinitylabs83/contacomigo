"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, CheckCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

const goals = [
  { id: "relief", label: "Sair do aperto", icon: "💪" },
  { id: "organize", label: "Organizar gastos", icon: "📋" },
  { id: "debts", label: "Pagar dívidas", icon: "💳" },
  { id: "emergency", label: "Criar reserva de emergência", icon: "🛡️" },
  { id: "card", label: "Controlar cartão", icon: "💰" },
  { id: "goal", label: "Juntar dinheiro para uma meta", icon: "🎯" },
  { id: "understand", label: "Entender para onde o dinheiro vai", icon: "🔍" },
]

const startMethods = [
  { id: "manual", label: "Lançar manualmente", icon: "✏️", desc: "Eu mesmo vou adicionar as transações" },
  { id: "import", label: "Importar planilha/CSV/OFX", icon: "📂", desc: "Tenho extratos para importar" },
  { id: "demo", label: "Usar dados de exemplo", icon: "👀", desc: "Quero explorar o app primeiro" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    goal: "", income: "", payDay: "", usesCard: "", hasDebts: "", startMethod: "",
  })

  const totalSteps = 6
  const progress = ((step + 1) / totalSteps) * 100

  const next = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1)
    else router.push("/dashboard")
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const steps = [
    {
      title: "Qual seu principal objetivo?",
      content: (
        <div className="grid grid-cols-1 gap-2">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => { setData({ ...data, goal: g.id }); setTimeout(next, 300) }}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:border-primary hover:bg-primary/5 ${data.goal === g.id ? "border-primary bg-primary/10" : "border-border"}`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="font-medium text-sm">{g.label}</span>
              {data.goal === g.id && <CheckCircle className="size-4 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Qual sua renda mensal aproximada?",
      content: (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
            <Input
              type="number" placeholder="5000" className="pl-10 text-lg h-12"
              value={data.income} onChange={(e) => setData({ ...data, income: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Não precisa ser exato. Você pode ajustar depois.</p>
          <Button className="w-full gap-2" onClick={next} disabled={!data.income}>
            Continuar <ArrowRight className="size-4" />
          </Button>
        </div>
      ),
    },
    {
      title: "Qual dia você costuma receber?",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {[1, 5, 10, 15, 20, 25, 30].map((day) => (
              <button
                key={day}
                onClick={() => { setData({ ...data, payDay: String(day) }); setTimeout(next, 300) }}
                className={`h-12 rounded-xl font-semibold text-sm transition-all ${data.payDay === String(day) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Você usa cartão de crédito?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[{ id: "yes", label: "Sim", icon: "💳" }, { id: "no", label: "Não", icon: "👌" }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setData({ ...data, usesCard: opt.id }); setTimeout(next, 300) }}
              className={`flex flex-col items-center gap-3 p-8 rounded-2xl border transition-all hover:border-primary hover:bg-primary/5 ${data.usesCard === opt.id ? "border-primary bg-primary/10" : "border-border"}`}
            >
              <span className="text-4xl">{opt.icon}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Você tem dívidas?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[{ id: "yes", label: "Sim", icon: "😬" }, { id: "no", label: "Não", icon: "😊" }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setData({ ...data, hasDebts: opt.id }); setTimeout(next, 300) }}
              className={`flex flex-col items-center gap-3 p-8 rounded-2xl border transition-all hover:border-primary hover:bg-primary/5 ${data.hasDebts === opt.id ? "border-primary bg-primary/10" : "border-border"}`}
            >
              <span className="text-4xl">{opt.icon}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Como deseja começar?",
      content: (
        <div className="space-y-3">
          {startMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => { setData({ ...data, startMethod: m.id }); setTimeout(next, 300) }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-primary hover:bg-primary/5 ${data.startMethod === m.id ? "border-primary bg-primary/10" : "border-border"}`}
            >
              <span className="text-3xl">{m.icon}</span>
              <div>
                <p className="font-semibold text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              {data.startMethod === m.id && <CheckCircle className="size-4 text-primary ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      ),
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{step + 1} de {totalSteps}</p>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-bold">{currentStep.title}</h2>
                {currentStep.content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <Button variant="ghost" size="sm" className="w-full gap-2" onClick={back}>
            <ArrowLeft className="size-4" />Voltar
          </Button>
        )}
      </div>
    </div>
  )
}
