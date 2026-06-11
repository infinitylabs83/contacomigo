"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ArrowLeftRight, Building2, CreditCard,
  Target, Scale, RefreshCw, ClipboardList, BarChart3,
  Upload, Settings, Shield, ChevronLeft, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  { href: "/dashboard",     label: "Início",            icon: LayoutDashboard },
  { href: "/transactions",  label: "Gastos e entradas", icon: ArrowLeftRight },
  { href: "/accounts",      label: "Minhas contas",     icon: Building2 },
  { href: "/cards",         label: "Cartões",            icon: CreditCard },
  { href: "/budgets",       label: "Meu limite",         icon: Scale },
  { href: "/goals",         label: "Meus sonhos",        icon: Target },
  { href: "/debts",         label: "O que devo",         icon: Scale },
  { href: "/subscriptions", label: "Assino todo mês",    icon: RefreshCw },
  { href: "/plan",          label: "O que fazer",        icon: ClipboardList },
  { href: "/reports",       label: "Como fui",           icon: BarChart3 },
  { href: "/import",        label: "Importar extrato",   icon: Upload },
]

const bottomItems = [
  { href: "/settings", label: "Configurações", icon: Settings },
  { href: "/privacy",  label: "Privacidade",   icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 text-sm font-black text-white">
          C
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Conta Comigo</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t py-4 px-2">
        <ul className="space-y-0.5">
          {bottomItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-2 w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}
