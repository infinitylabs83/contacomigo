"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const C = {
  bg:      "#faf9f7",
  white:   "#ffffff",
  text:    "#111827",
  muted:   "#6b7280",
  border:  "#e5e7eb",
  primary: "#7c3aed",
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 16px", borderRadius: 14, fontSize: 16,
  border: `2px solid ${C.border}`, background: C.white, color: C.text,
  outline: "none", boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: C.text,
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  // Se veio de ?logout=1, faz o sign out primeiro
  useEffect(() => {
    if (searchParams.get("logout") === "1") {
      createClient().auth.signOut()
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      document.cookie = "demo_mode=; path=/; max-age=0"
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("E-mail ou senha incorretos. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      {/* Card */}
      <div className="rounded-3xl p-8 shadow-xl" style={{ background: C.white, border: `1px solid ${C.border}` }}>
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1" style={{ color: C.text }}>Bem-vindo de volta 👋</h1>
          <p className="text-sm" style={{ color: C.muted }}>Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="email" style={labelStyle}>E-mail</label>
            <input
              id="email" type="email" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" inputMode="email"
              style={inputStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" style={labelStyle}>Senha</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: C.primary, textDecoration: "none" }}>
                Esqueceu a senha?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="password" type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex" }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", borderRadius: 10, padding: "10px 14px", margin: 0 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2"
            style={{
              height: 52, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: `linear-gradient(135deg,${C.primary},#6d28d9)`,
              color: "#fff", fontWeight: 700, fontSize: 16, opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            Entrar
          </button>
        </form>

        <p className="text-center mt-5" style={{ fontSize: 14, color: C.muted }}>
          Não tem conta?{" "}
          <Link href="/register" className="font-semibold" style={{ color: C.primary }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
