"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import {
  CheckCircle, X, ChevronDown, ChevronUp,
  ArrowRight, Check, Shield, Smartphone, TrendingUp, Gift, Zap,
} from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { cn } from "@/lib/utils"

/* ─── Logo ─────────────────────────────────────────── */
function Logo({ className }: { className?: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#7c3aed"/>
      <path d="M20 10 A8 8 0 1 0 20 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M22 13.5 A4.5 4.5 0 1 0 22 18.5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

/* ─── FadeIn ────────────────────────────────────────── */
function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ─── Phone mockup ─────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[270px]">
      <div className="absolute inset-0 scale-110 blur-3xl rounded-full bg-violet-400/30 pointer-events-none" />
      <div className="relative rounded-[2.5rem] border-[3px] border-white/20 bg-[#1a0533] shadow-2xl overflow-hidden">
        <div className="mx-auto mt-2 w-20 h-5 rounded-full bg-black/60" />
        <div className="px-3 pb-4 pt-2 space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-white/50 text-[9px]">Olá, Karol 👋</span>
            <div className="w-5 h-5 rounded-full bg-violet-500/60 flex items-center justify-center">
              <span className="text-[7px] text-white font-bold">K</span>
            </div>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            <p className="text-white/60 text-[8px] mb-0.5">Dinheiro livre este mês</p>
            <p className="text-white text-lg font-black leading-none">R$ 842</p>
            <p className="text-white/50 text-[7px] mt-0.5">você pode gastar isso com segurança ✓</p>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {[["Entrou","7.500"],["Saiu","3.810"],["Cartão","2.848"]].map(([l,v])=>(
                <div key={l} className="bg-white/10 rounded-lg p-1 text-center">
                  <p className="text-white/50 text-[6px]">{l}</p>
                  <p className="text-white text-[8px] font-bold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-2 space-y-1">
            <p className="text-white/40 text-[7px] uppercase tracking-wide">Hoje</p>
            {[["🍔 iFood","- R$ 32,90","card"],["💼 Salário","+ R$ 7.500","income"]].map(([t,v,type])=>(
              <div key={String(t)} className="flex items-center justify-between bg-white/5 rounded-lg p-1.5">
                <span className="text-[7px] text-white/70">{t}</span>
                <span className={cn("text-[7px] font-bold", type === "income" ? "text-green-400" : "text-white/70")}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-500/20 p-2 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[7px]">Saúde financeira</p>
              <p className="text-amber-300 text-base font-black leading-none">78</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white font-bold">🔥 7 dias</p>
              <p className="text-[6px] text-white/50">de streak</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mb-2 w-16 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

/* ─── Email capture ─────────────────────────────────── */
function EmailCapture({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("")
  return (
    <form onSubmit={e => { e.preventDefault(); if (email) window.location.href = `/register?email=${encodeURIComponent(email)}` }}
      className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className={cn(
          "flex-1 h-12 px-4 rounded-2xl text-sm border-2 outline-none transition-colors",
          dark
            ? "bg-white/15 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
            : "bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
        )}
      />
      <button type="submit"
        className="h-12 px-6 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0"
        style={{ background: dark ? "rgba(255,255,255,0.25)" : "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        Garantir acesso grátis <ArrowRight className="size-4" />
      </button>
    </form>
  )
}

/* ─── FAQ ───────────────────────────────────────────── */
const faqs = [
  { q: "É de graça mesmo? Tem pegadinha?",
    a: "Durante o lançamento, sim — quem se cadastrar agora tem acesso grátis para sempre. Sem cartão, sem cobrança futura para você. Após o encerramento do lançamento, novos usuários pagarão R$ 69,90 uma única vez." },
  { q: "Precisa conectar minha conta bancária?",
    a: "Não! Você registra os gastos manualmente em menos de 10 segundos. Optamos por não conectar ao banco porque muita gente tem medo — e funciona muito bem assim." },
  { q: "É difícil de usar?",
    a: "É o app de finanças mais simples que você vai usar. Toque em Lançar, escolha a categoria (com exemplos pra cada uma), digit o valor. Pronto. A tela inicial já mostra quanto você pode gastar hoje." },
  { q: "O que acontece com quem entrou grátis no lançamento?",
    a: "Nada muda. Seu acesso é vitalício e gratuito. Quando o lançamento encerrar, só bloquearemos novos cadastros gratuitos — quem já está dentro fica." },
  { q: "Meus dados são seguros?",
    a: "Sim. Usamos criptografia, autenticação segura e seguimos a LGPD. Seus dados financeiros são privados e nunca serão vendidos ou compartilhados." },
  { q: "Funciona no celular?",
    a: "O Conta Comigo é um PWA — funciona no navegador do celular igual a um app nativo, sem precisar baixar nada. Também funciona no computador." },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border rounded-2xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-muted/40 transition-colors">
            {faq.q}
            {open === i ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── PAGE ─────────────────────────────────────────── */
export default function LandingPage() {
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const prev = document.documentElement.classList.contains("dark") ? "dark" : "light"
    document.documentElement.classList.remove("dark")
    return () => { if (prev === "dark") document.documentElement.classList.add("dark") }
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#faf9f7", color: "#111827" }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(250,249,247,0.85)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-lg tracking-tight">Conta Comigo</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
            <a href="#faq" className="hover:text-foreground transition-colors">Dúvidas</a>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">Entrar</ButtonLink>
            <ButtonLink href="/register" size="sm"
              className="border-0 text-white shadow-sm shadow-primary/30 rounded-xl"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              Acesso grátis
            </ButtonLink>
          </div>
        </div>
      </nav>

      {/* URGENCY BANNER */}
      <div className="text-white text-center text-sm py-2.5 font-semibold" style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}>
        🎁 Lançamento: cadastre-se agora e tenha acesso grátis para sempre · <a href="/register" className="underline underline-offset-2 opacity-80 hover:opacity-100">Garantir o meu →</a>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Zap className="size-3" /> Lançamento · Acesso grátis agora
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight">
            Para o seu dinheiro,{" "}
            <span style={{ color: "#7c3aed" }}>pode contar comigo.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed">
            Sabe exatamente <strong className="text-foreground">quanto pode gastar hoje</strong>, registra qualquer despesa em 2 toques e ainda tem missões pra te manter nos trilhos. Sem planilha, sem banco, sem ansiedade.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <EmailCapture />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {[
              "Sem cartão de crédito",
              "Acesso grátis no lançamento",
              "Funciona no celular",
            ].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-green-500" /> {t}
              </span>
            ))}
          </motion.div>

        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-end">
          <PhoneMockup />
        </motion.div>
      </section>

      {/* DORES */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Você se identifica?</h2>
            <p className="text-muted-foreground text-lg">Se sim, o Conta Comigo foi feito pra você.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "😬", title: '"Chego no fim do mês no zero"',
                body: "Você ganhou, você gastou — mas não sabe com o quê. A sensação é de dinheiro desaparecendo sem deixar rastro.",
                color: "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30" },
              { emoji: "📊", title: '"Odeio planilha, nunca mantenho"',
                body: "Já tentou 3 planilhas, 2 apps e um caderninho. Funciona por 2 semanas e abandona. Porque é chato demais.",
                color: "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30" },
              { emoji: "😰", title: '"App de banco me dá ansiedade"',
                body: "Abrir o extrato é um evento emocional. Você adia, adia, e quando vê já é tarde. Mas não precisa ser assim.",
                color: "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30" },
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={cn("rounded-3xl border p-6 h-full", d.color)}>
                  <div className="text-4xl mb-4">{d.emoji}</div>
                  <h3 className="font-bold text-base mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-10">
            <p className="text-muted-foreground text-sm">
              O Conta Comigo resolve os três.{" "}
              <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: "#7c3aed" }}>
                Cadastre-se grátis →
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#7c3aed" }}>Simples assim</span>
          <h2 className="text-3xl font-black mt-2 mb-3">3 passos. Sem complicação.</h2>
          <p className="text-muted-foreground text-lg">Do zero à clareza financeira em menos de 5 minutos.</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
          {[
            { n: "1", icon: "📱", title: "Informe sua renda",
              body: "Cadastre quanto você ganha no mês. Leva 2 minutos. O app já calcula quanto é seu.",
              color: "bg-primary/10 text-primary" },
            { n: "2", icon: "⚡", title: "Toque em Lançar — 8 segundos",
              body: "Botão central roxo → categoria com exemplos → valor. Feito. Moradia, Pet, Impostos, tudo tem lugar.",
              color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
            { n: "3", icon: "🎯", title: "Veja quanto pode gastar",
              body: "A tela inicial mostra seu dinheiro livre do mês. Gráfico diário, expectativa vs realidade, tudo automático.",
              color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="text-center space-y-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto", s.color)}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Passo {s.n}</div>
                  <h3 className="font-bold text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* COMPARAÇÃO */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Por que não o app do banco?</h2>
            <p className="text-muted-foreground text-lg">Seu app bancário mostra o passado. O Conta Comigo cuida do futuro.</p>
          </FadeIn>
          <FadeIn>
            <div className="rounded-3xl border bg-card overflow-hidden shadow-lg">
              <div className="grid grid-cols-3 bg-muted/60 border-b">
                <div className="p-4 text-sm text-muted-foreground">Funcionalidade</div>
                <div className="p-4 text-sm font-bold text-center border-x border-border">App do banco / Planilha</div>
                <div className="p-4 text-sm font-bold text-center" style={{ color: "#7c3aed" }}>Conta Comigo ✦</div>
              </div>
              {[
                ["Diz quanto pode gastar hoje", false, true],
                ["Lançamento em menos de 10s com categorias claras", false, true],
                ["Gráfico por dia com navegação semanal", false, true],
                ["Expectativa vs realidade por categoria", false, true],
                ["Assinaturas e contas organizadas automaticamente", false, true],
                ["Gamificado (score, missões, pontos)", false, true],
                ["Não precisa conectar conta bancária", false, true],
                ["Alertas de fatura vencendo", false, true],
              ].map(([feat, bank, nexo], i) => (
                <div key={i} className={cn("grid grid-cols-3 items-center border-b last:border-0", i % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                  <div className="p-4 text-sm">{feat as string}</div>
                  <div className="p-4 text-center border-x border-border">
                    {bank === true ? <CheckCircle className="size-4 text-green-500 mx-auto" /> : <X className="size-4 text-red-400 mx-auto" />}
                  </div>
                  <div className="p-4 text-center">
                    {nexo ? <CheckCircle className="size-4 mx-auto" style={{ color: "#7c3aed" }} /> : <X className="size-4 text-red-400 mx-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* GAMIFICAÇÃO */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-widest">Gamificação</span>
            <h2 className="text-3xl font-black mt-2 mb-4">Finança virou jogo.<br />E você vai querer jogar.</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Cada gasto registrado, cada meta batida e cada semana no azul te dá pontos, sobe seu nível e completa missões. É viciante — e esse é o ponto.
            </p>
            <div className="space-y-4">
              {[
                { icon: "🏆", title: "Score de saúde financeira 0–100", desc: "Seu número pessoal. Sobe quando você organiza, cai quando estoura o orçamento." },
                { icon: "🔥", title: "Streak de dias consecutivos", desc: "Quanto mais dias você registra gastos, maior o streak. Igual ao Duolingo." },
                { icon: "⚡", title: "Missões semanais com recompensa", desc: '"Registre 5 gastos essa semana" → +50 pontos. Simples e motivador.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-2xl mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="flex justify-center">
            <div className="rounded-3xl p-6 text-white max-w-xs w-full shadow-xl"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Sua pontuação</p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-black">78</span>
                <span className="text-white/60 mb-2">/100</span>
              </div>
              <div className="bg-white/20 rounded-2xl h-2 mb-1">
                <div className="bg-white rounded-2xl h-full" style={{ width: "78%" }} />
              </div>
              <p className="text-white/70 text-xs mb-5">220 pts para o nível Consciente 🧠</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[["🔥 Streak","7 dias"],["⚡ Pontos","1.280"],["🎯 Missões","2/3"],["🏅 Nível","Organizado"]].map(([k,v])=>(
                  <div key={String(k)} className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-white/70">{k}</p>
                    <p className="text-sm font-bold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-sm">📝</span>
                <div className="flex-1">
                  <p className="text-xs font-medium">Registre 5 gastos esta semana</p>
                  <div className="bg-white/20 rounded-full h-1 mt-1">
                    <div className="bg-white rounded-full h-1" style={{ width: "60%" }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-white/80">3/5</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="bg-muted/40 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Preço honesto. Sem mensalidade.</h2>
            <p className="text-muted-foreground text-lg">Pague uma vez. Use para sempre.</p>
          </FadeIn>

          {/* Launch free banner */}
          <FadeIn delay={0.1}>
            <div className="rounded-3xl p-7 text-white text-center mb-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-10 -left-6 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-4">
                  <Gift className="size-4" /> Período de lançamento
                </div>
                <h3 className="text-3xl font-black mb-2">Agora é grátis para sempre</h3>
                <p className="text-white/75 text-base mb-6 max-w-sm mx-auto">
                  Quem se cadastrar durante o lançamento garante acesso vitalício gratuito. Sem cartão, sem cobrança, sem pegadinha.
                </p>
                <EmailCapture dark />
                <p className="text-white/50 text-xs mt-3">
                  Após o lançamento, novos usuários pagarão R$ 69,90 — uma única vez.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Future price card */}
          <FadeIn delay={0.2}>
            <div className="rounded-3xl border bg-card p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Após o lançamento</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xl text-muted-foreground line-through">R$ 189,90</span>
                    <span className="text-4xl font-black">R$ 69,90</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">pagamento único · acesso vitalício</p>
                </div>
                <span className="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                  -63% off lançamento
                </span>
              </div>
              <ul className="space-y-2.5 mb-5">
                {[
                  "Lançar gastos em 8 segundos com categorias inteligentes",
                  "Gráfico diário + evolução mensal",
                  "Expectativa vs realidade por categoria",
                  "Contas, cartões, dívidas e assinaturas organizados",
                  "Sonhos, limites e próximos vencimentos",
                  "Gamificação: score, missões, streak, pontos",
                  "Acesso vitalício — pague uma vez, use para sempre",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="size-4 shrink-0 mt-0.5" style={{ color: "#7c3aed" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-center text-muted-foreground bg-muted/50 rounded-2xl p-3">
                🎁 <strong>Mas se você está lendo isso agora</strong>, ainda dá tempo de entrar de graça.{" "}
                <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: "#7c3aed" }}>
                  Garantir acesso grátis →
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Dúvidas frequentes</h2>
            <p className="text-muted-foreground">Tire suas dúvidas antes de começar.</p>
          </FadeIn>
          <FAQ />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Chega de aperto financeiro</p>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                Seu dinheiro estava esperando<br />você prestar atenção nele.
              </h2>
              <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
                Cadastre agora e garanta acesso grátis para sempre. Sem cartão. Sem compromisso. Só você e seu dinheiro finalmente se entendendo.
              </p>
              <div className="flex justify-center mb-4">
                <EmailCapture dark />
              </div>
              <p className="text-white/50 text-sm mt-2 flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-1"><Shield className="size-3.5" /> Seguro e privado</span>
                <span className="flex items-center gap-1"><Smartphone className="size-3.5" /> Funciona no celular</span>
                <span className="flex items-center gap-1"><TrendingUp className="size-3.5" /> Resultado em 2 semanas</span>
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold">Conta Comigo</span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Criar conta</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Conta Comigo · Feito com 💜 no Brasil</p>
        </div>
      </footer>
    </div>
  )
}
