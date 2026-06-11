"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Wallet, Building2, Target, Settings, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"

const NAV_LEFT = [
  { href: "/dashboard",    label: "Início",         icon: Home    },
  { href: "/transactions", label: "Movimentações",  icon: Wallet  },
]
const NAV_RIGHT = [
  { href: "/accounts",     label: "Contas",         icon: Building2 },
  { href: "/plan",         label: "Planejar",       icon: Target    },
]

export function TopNav() {
  const pathname = usePathname()

  const openLancar = () => {
    window.dispatchEvent(new CustomEvent("quick-add-open"))
  }

  return (
    <header className="hidden lg:flex h-16 border-b bg-card items-center justify-between px-6 sticky top-0 z-50 gap-2">
      {/* Left: logo + greeting */}
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 min-w-[190px]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <rect width="32" height="32" rx="9" fill="#7c3aed"/>
          <path d="M20 10 A8 8 0 1 0 20 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M22 13.5 A4.5 4.5 0 1 0 22 18.5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] text-muted-foreground font-medium">Olá, Karol 👋</span>
          <span className="font-black text-[15px] tracking-tight">Conta Comigo</span>
        </div>
      </Link>

      {/* Center nav: 2 left + LANÇAR + 2 right */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {NAV_LEFT.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[15px] font-semibold transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}

        {/* LANÇAR — center action, opens sheet */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openLancar}
          className="flex items-center gap-2 mx-3 px-6 py-2.5 rounded-xl font-black text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <span className="text-base leading-none">+</span>
          Lançar
        </motion.button>

        {NAV_RIGHT.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[15px] font-semibold transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Right: icons */}
      <div className="flex items-center gap-1 shrink-0 min-w-[140px] justify-end">
        <ThemeToggle />
        <Link href="/settings">
          <Button variant="ghost" size="icon-sm" aria-label="Configurações">
            <Settings className="size-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon-sm" aria-label="Notificações">
          <Bell className="size-4" />
        </Button>
        <Link href="/profile">
          <Button variant="ghost" size="icon-sm" aria-label="Perfil">
            <User className="size-4" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
