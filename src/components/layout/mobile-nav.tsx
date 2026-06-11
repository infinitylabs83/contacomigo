"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Wallet, Building2, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const LEFT_NAV = [
  { href: "/dashboard",    label: "Início",        icon: Home      },
  { href: "/transactions", label: "Moviment.",     icon: Wallet    },
]
const RIGHT_NAV = [
  { href: "/accounts",     label: "Contas",        icon: Building2 },
  { href: "/plan",         label: "Planejar",      icon: Target    },
]

export function MobileNav() {
  const pathname = usePathname()

  const openLancar = () => {
    window.dispatchEvent(new CustomEvent("quick-add-open"))
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t">
      <ul className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {LEFT_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href} className="flex-1">
              <Link href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", active && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}

        {/* Center: LANÇAR — dispatches event */}
        <li className="flex-1 flex justify-center">
          <button onClick={openLancar} className="flex flex-col items-center -mt-5">
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
            >
              <span className="text-white text-2xl font-black leading-none">+</span>
            </motion.div>
            <span className="text-xs font-semibold text-primary mt-1">Lançar</span>
          </button>
        </li>

        {RIGHT_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href} className="flex-1">
              <Link href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", active && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
