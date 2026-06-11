"use client"

import Link from "next/link"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

interface HeaderProps {
  title?: string
}

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#7c3aed"/>
      <path d="M20 10 A8 8 0 1 0 20 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M22 13.5 A4.5 4.5 0 1 0 22 18.5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoIcon />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-muted-foreground font-medium">Olá, Karol 👋</span>
            <span className="font-black text-sm tracking-tight">Conta Comigo</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />
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
