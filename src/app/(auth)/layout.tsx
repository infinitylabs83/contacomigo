"use client"

import { useEffect } from "react"
import Link from "next/link"

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#7c3aed"/>
      <path d="M20 10 A8 8 0 1 0 20 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M22 13.5 A4.5 4.5 0 1 0 22 18.5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains("dark")
    html.classList.remove("dark")
    return () => { if (hadDark) html.classList.add("dark") }
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f7", color: "#111827" }}>
      <header className="p-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logo />
          <span className="font-bold text-lg" style={{ color: "#111827" }}>Conta Comigo</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-6 text-center text-xs" style={{ color: "#6b7280" }}>
        © {new Date().getFullYear()} Conta Comigo ·{" "}
        <Link href="/privacy" className="hover:underline" style={{ color: "#6b7280" }}>Privacidade</Link>
      </footer>
    </div>
  )
}
