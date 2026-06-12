"use client"

import { useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle, X, ChevronDown, ChevronUp,
  ArrowRight, Check, Shield, Smartphone, TrendingUp, Gift, Zap,
} from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { createClient } from "@/lib/supabase/client"

// Cores fixas — nunca mudam com dark mode
const C = {
  bg:       "#faf9f7",
  white:    "#ffffff",
  text:     "#111827",
  muted:    "#6b7280",
  border:   "#e5e7eb",
  section:  "#f3f4f6",
  primary:  "#7c3aed",
  primaryD: "#6d28d9",
}

/* ─── Logo ──────────────────────────────────────────────────────────────── */
function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill={C.primary}/>
      <path d="M20 10 A8 8 0 1 0 20 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M22 13.5 A4.5 4.5 0 1 0 22 18.5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

/* ─── FadeIn ─────────────────────────────────────────────────────────────── */
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

/* ─── Phone mockup ───────────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[220px] sm:w-[260px]">
      <div className="absolute inset-0 scale-110 blur-3xl rounded-full pointer-events-none" style={{ background: "rgba(139,92,246,0.25)" }} />
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl" style={{ border: "3px solid rgba(255,255,255,0.2)", background: "#1a0533" }}>
        <div className="mx-auto mt-2 w-20 h-5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }} />
        <div className="px-3 pb-4 pt-2 space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>Olá, Karol 👋</span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.6)" }}>
              <span className="text-[7px] text-white font-bold">K</span>
            </div>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            <p className="text-[8px] mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Dinheiro livre este mês</p>
            <p className="text-white text-lg font-black leading-none">R$ 842</p>
            <p className="text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>você pode gastar isso com segurança ✓</p>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {[["Entrou","7.500"],["Saiu","3.810"],["Cartão","2.848"]].map(([l,v])=>(
                <div key={l} className="rounded-lg p-1 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</p>
                  <p className="text-white text-[8px] font-bold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-2 space-y-1" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>Hoje</p>
            {[["🍔 iFood","- R$ 32,90",false],["💼 Salário","+ R$ 7.500",true]].map(([t,v,inc])=>(
              <div key={String(t)} className="flex items-center justify-between rounded-lg p-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.7)" }}>{t}</span>
                <span className="text-[7px] font-bold" style={{ color: inc ? "#4ade80" : "rgba(255,255,255,0.7)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,rgba(251,191,36,0.2),rgba(249,115,22,0.2))" }}>
            <div>
              <p className="text-[7px]" style={{ color: "rgba(255,255,255,0.6)" }}>Saúde financeira</p>
              <p className="text-base font-black leading-none" style={{ color: "#fcd34d" }}>78</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white font-bold">🔥 7 dias</p>
              <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.5)" }}>de streak</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mb-2 w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
      </div>
    </div>
  )
}

/* ─── Email capture ──────────────────────────────────────────────────────── */
function EmailCapture({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("")
  return (
    <form onSubmit={e => { e.preventDefault(); if (email) window.location.href = `/register?email=${encodeURIComponent(email)}` }}
      className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        style={{
          flex: 1, height: 48, padding: "0 16px", borderRadius: 16, fontSize: 15,
          border: dark ? "2px solid rgba(255,255,255,0.25)" : `2px solid ${C.border}`,
          background: dark ? "rgba(255,255,255,0.15)" : C.white,
          color: dark ? "#fff" : C.text,
          outline: "none",
        }}
      />
      <button type="submit"
        style={{
          height: 48, padding: "0 24px", borderRadius: 16, border: "none", cursor: "pointer",
          background: dark ? "rgba(255,255,255,0.25)" : `linear-gradient(135deg,${C.primary},${C.primaryD})`,
          color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
        }}>
        Garantir acesso grátis <ArrowRight size={16} />
      </button>
    </form>
  )
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
const faqs = [
  { q: "É de graça mesmo? Tem pegadinha?",
    a: "Durante o lançamento, sim — quem se cadastrar agora tem acesso grátis para sempre. Sem cartão, sem cobrança futura para você. Após o encerramento do lançamento, novos usuários pagarão R$ 69,90 uma única vez." },
  { q: "Precisa conectar minha conta bancária?",
    a: "Não! Você registra os gastos manualmente em menos de 10 segundos. Optamos por não conectar ao banco porque muita gente tem medo — e funciona muito bem assim." },
  { q: "É difícil de usar?",
    a: "É o app de finanças mais simples que você vai usar. Toque em Lançar, escolha a categoria, digite o valor. Pronto. A tela inicial já mostra quanto você pode gastar hoje." },
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
        <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold transition-colors"
            style={{ fontSize: 15, color: C.text, background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = C.section)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {faq.q}
            {open === i
              ? <ChevronUp size={16} style={{ color: C.muted, flexShrink: 0 }} />
              : <ChevronDown size={16} style={{ color: C.muted, flexShrink: 0 }} />}
          </button>
          {open === i && (
            <div className="px-5 pb-4 leading-relaxed" style={{ fontSize: 14, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter()
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  useEffect(() => {
    // Força modo claro
    const html = document.documentElement
    const hadDark = html.classList.contains("dark")
    html.classList.remove("dark")
    // Detecta sessão ativa
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setSessionEmail(data.user.email)
    })
    return () => { if (hadDark) html.classList.add("dark") }
  }, [])

  async function handleSignOut() {
    await createClient().auth.signOut()
    setSessionEmail(null)
    router.refresh()
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.bg, color: C.text }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(250,249,247,0.9)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-bold text-lg tracking-tight" style={{ color: C.text }}>Conta Comigo</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: C.muted }}>
            <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#precos" className="hover:text-gray-900 transition-colors">Preços</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">Dúvidas</a>
          </div>
          <div className="flex items-center gap-2">
            {sessionEmail ? (
              <>
                <span className="hidden sm:block text-xs max-w-[140px] truncate" style={{ color: C.muted }}>{sessionEmail}</span>
                <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryD})` }}>
                  Ir para o app
                </Link>
                <button onClick={handleSignOut}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                  style={{ color: "#dc2626", border: `1px solid #fca5a5` }}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: C.muted }}>Entrar</Link>
                <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryD})` }}>
                  Acesso grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* BANNER */}
      <div className="text-white text-center py-2.5 font-semibold text-sm px-4"
        style={{ background: `linear-gradient(90deg,${C.primary},${C.primaryD})` }}>
        🎁 Lançamento: cadastre-se agora e tenha acesso grátis para sempre ·{" "}
        <a href="/register" className="underline underline-offset-2 opacity-80 hover:opacity-100">Garantir o meu →</a>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(124,58,237,0.1)", color: C.primary, border: `1px solid rgba(124,58,237,0.2)` }}>
              <Zap size={12} /> Lançamento · Acesso grátis agora
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-black leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(2rem,6vw,3.5rem)", color: C.text }}>
            Para o seu dinheiro,{" "}
            <span style={{ color: C.primary }}>pode contar comigo.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 17, color: C.muted, lineHeight: 1.7 }}>
            Sabe exatamente <strong style={{ color: C.text }}>quanto pode gastar hoje</strong>, registra qualquer despesa em 2 toques e ainda tem missões pra te manter nos trilhos. Sem planilha, sem banco, sem ansiedade.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <EmailCapture />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-x-5 gap-y-2" style={{ fontSize: 14, color: C.muted }}>
            {["Sem cartão de crédito", "Acesso grátis no lançamento", "Funciona no celular"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={14} style={{ color: "#16a34a" }} /> {t}
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
      <section className="py-16" style={{ background: C.section }}>
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: C.text }}>Você se identifica?</h2>
            <p style={{ color: C.muted, fontSize: 17 }}>Se sim, o Conta Comigo foi feito pra você.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { emoji: "😬", title: '"Chego no fim do mês no zero"',
                body: "Você ganhou, você gastou — mas não sabe com o quê. A sensação é de dinheiro desaparecendo sem deixar rastro.",
                bg: "#fef2f2", border: "#fecaca" },
              { emoji: "📊", title: '"Odeio planilha, nunca mantenho"',
                body: "Já tentou 3 planilhas, 2 apps e um caderninho. Funciona por 2 semanas e abandona. Porque é chato demais.",
                bg: "#fffbeb", border: "#fde68a" },
              { emoji: "😰", title: '"App de banco me dá ansiedade"',
                body: "Abrir o extrato é um evento emocional. Você adia, adia, e quando vê já é tarde. Mas não precisa ser assim.",
                bg: "#eff6ff", border: "#bfdbfe" },
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-3xl p-6 h-full" style={{ background: d.bg, border: `1px solid ${d.border}` }}>
                  <div className="text-4xl mb-4">{d.emoji}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: C.text }}>{d.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{d.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-8">
            <p style={{ fontSize: 14, color: C.muted }}>
              O Conta Comigo resolve os três.{" "}
              <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: C.primary }}>
                Cadastre-se grátis →
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-16 max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: C.primary }}>Simples assim</span>
          <h2 className="text-3xl font-black mt-2 mb-3" style={{ color: C.text }}>3 passos. Sem complicação.</h2>
          <p style={{ color: C.muted, fontSize: 17 }}>Do zero à clareza financeira em menos de 5 minutos.</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "1", icon: "📱", title: "Informe sua renda",
              body: "Cadastre quanto você ganha no mês. Leva 2 minutos. O app já calcula quanto é seu.",
              iconBg: "rgba(124,58,237,0.1)", iconColor: C.primary },
            { n: "2", icon: "⚡", title: "Toque em Lançar — 8 segundos",
              body: "Botão central roxo → categoria com exemplos → valor. Feito. Moradia, Pet, Impostos, tudo tem lugar.",
              iconBg: "#fef3c7", iconColor: "#92400e" },
            { n: "3", icon: "🎯", title: "Veja quanto pode gastar",
              body: "A tela inicial mostra seu dinheiro livre do mês. Gráfico diário, expectativa vs realidade, tudo automático.",
              iconBg: "#dcfce7", iconColor: "#166534" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto"
                  style={{ background: s.iconBg }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>Passo {s.n}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: C.text }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted }}>{s.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* COMPARAÇÃO */}
      <section className="py-16" style={{ background: C.section }}>
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: C.text }}>Por que não o app do banco?</h2>
            <p style={{ color: C.muted, fontSize: 17 }}>Seu app bancário mostra o passado. O Conta Comigo cuida do futuro.</p>
          </FadeIn>
          <FadeIn>
            <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: `1px solid ${C.border}`, background: C.white }}>
              <div className="grid grid-cols-3" style={{ background: C.section, borderBottom: `1px solid ${C.border}` }}>
                <div className="p-4 text-sm" style={{ color: C.muted }}>Funcionalidade</div>
                <div className="p-4 text-sm font-bold text-center" style={{ color: C.text, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>App do banco / Planilha</div>
                <div className="p-4 text-sm font-bold text-center" style={{ color: C.primary }}>Conta Comigo ✦</div>
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
                <div key={i} className="grid grid-cols-3 items-center" style={{ borderBottom: i < 7 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? C.white : "#fafafa" }}>
                  <div className="p-3 text-sm" style={{ color: C.text }}>{feat as string}</div>
                  <div className="p-3 text-center" style={{ borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
                    {bank ? <CheckCircle size={16} style={{ color: "#16a34a", margin: "auto" }} /> : <X size={16} style={{ color: "#ef4444", margin: "auto" }} />}
                  </div>
                  <div className="p-3 text-center">
                    {nexo ? <CheckCircle size={16} style={{ color: C.primary, margin: "auto" }} /> : <X size={16} style={{ color: "#ef4444", margin: "auto" }} />}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* GAMIFICAÇÃO */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#f59e0b" }}>Gamificação</span>
            <h2 className="text-3xl font-black mt-2 mb-4" style={{ color: C.text }}>Finança virou jogo.<br />E você vai querer jogar.</h2>
            <p className="mb-6" style={{ color: C.muted, lineHeight: 1.7 }}>
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
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{item.title}</p>
                    <p className="text-sm" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="flex justify-center">
            <div className="rounded-3xl p-6 text-white max-w-xs w-full shadow-xl"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Sua pontuação</p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-black">78</span>
                <span className="mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>/100</span>
              </div>
              <div className="rounded-2xl h-2 mb-1" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div className="bg-white rounded-2xl h-full" style={{ width: "78%" }} />
              </div>
              <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>220 pts para o nível Consciente 🧠</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[["🔥 Streak","7 dias"],["⚡ Pontos","1.280"],["🎯 Missões","2/3"],["🏅 Nível","Organizado"]].map(([k,v])=>(
                  <div key={String(k)} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{k}</p>
                    <p className="text-sm font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.15)" }}>
                <span className="text-sm">📝</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">Registre 5 gastos esta semana</p>
                  <div className="rounded-full h-1 mt-1" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <div className="bg-white rounded-full h-1" style={{ width: "60%" }} />
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>3/5</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-16" style={{ background: C.section }}>
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: C.text }}>Preço honesto. Sem mensalidade.</h2>
            <p style={{ color: C.muted, fontSize: 17 }}>Pague uma vez. Use para sempre.</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl p-7 text-white text-center mb-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg,${C.primary},#5b21b6)` }}>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="absolute -bottom-10 -left-6 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4"
                  style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Gift size={16} /> Período de lançamento
                </div>
                <h3 className="text-3xl font-black mb-2">Agora é grátis para sempre</h3>
                <p className="text-base mb-6 max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Quem se cadastrar durante o lançamento garante acesso vitalício gratuito. Sem cartão, sem cobrança, sem pegadinha.
                </p>
                <div className="flex justify-center">
                  <EmailCapture dark />
                </div>
                <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Após o lançamento, novos usuários pagarão R$ 69,90 — uma única vez.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="rounded-3xl p-7" style={{ border: `1px solid ${C.border}`, background: C.white }}>
              <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: C.muted }}>Após o lançamento</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xl line-through" style={{ color: C.muted }}>R$ 189,90</span>
                    <span className="text-4xl font-black" style={{ color: C.text }}>R$ 69,90</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>pagamento único · acesso vitalício</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: "#fef2f2", color: "#dc2626" }}>
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
                  <li key={f} className="flex items-start gap-2.5" style={{ fontSize: 14 }}>
                    <CheckCircle size={16} style={{ color: C.primary, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: C.text }}>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-center rounded-2xl p-3" style={{ color: C.muted, background: C.section }}>
                🎁 <strong style={{ color: C.text }}>Mas se você está lendo isso agora</strong>, ainda dá tempo de entrar de graça.{" "}
                <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: C.primary }}>
                  Garantir acesso grátis →
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: C.text }}>Dúvidas frequentes</h2>
            <p style={{ color: C.muted }}>Tire suas dúvidas antes de começar.</p>
          </FadeIn>
          <FAQ />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${C.primary},#5b21b6)` }}>
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>Chega de aperto financeiro</p>
              <h2 className="font-black mb-4 leading-tight" style={{ fontSize: "clamp(1.6rem,4vw,2.5rem)" }}>
                Seu dinheiro estava esperando<br />você prestar atenção nele.
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
                Cadastre agora e garanta acesso grátis para sempre. Sem cartão. Sem compromisso.
              </p>
              <div className="flex justify-center mb-4">
                <EmailCapture dark />
              </div>
              <p className="text-sm mt-2 flex items-center justify-center gap-4 flex-wrap" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span className="flex items-center gap-1"><Shield size={14} /> Seguro e privado</span>
                <span className="flex items-center gap-1"><Smartphone size={14} /> Funciona no celular</span>
                <span className="flex items-center gap-1"><TrendingUp size={14} /> Resultado em 2 semanas</span>
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="py-10" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold" style={{ color: C.text }}>Conta Comigo</span>
          </Link>
          <div className="flex gap-6 text-sm" style={{ color: C.muted }}>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacidade</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-gray-900 transition-colors">Criar conta</Link>
          </div>
          <p className="text-xs" style={{ color: C.muted }}>© {new Date().getFullYear()} Conta Comigo · Feito com 💜 no Brasil</p>
        </div>
      </footer>
    </div>
  )
}
